---
file: gotchas/00-common-mistakes.md
purpose: "Learn from mistakes: data leakage, permission bypass, orphaned objects, type mismatches"
triggers: ["code review", "debugging auth issues", "strange behavior after deploy"]
keywords: ["mistake", "bug", "gotcha", "leakage", "bypass", "debug", "common", "trap"]
dependencies: ["rules/00-realm-isolation.md", "rules/01-auth-enforcement.md", "rules/02-service-purity.md"]
urgency: "critical"
size: "2000 words"
sections: ["intro", "mistake-1-service-realm-param", "mistake-2-missing-realmid-filter", "mistake-3-auth-in-handler", "mistake-4-middleware-order", "mistake-5-hardcoded-hub", "mistake-6-type-drift", "mistake-7-serverfn-json-response", "debug-checklist"]
status: "active"
mvp-scope: "current"
phase: "MVP 1.0"
created: "2025-10-20"
updated: "2025-11-17"
---

# Common Mistakes: Gotchas & How to Avoid Them

## Introduction

These are **real mistakes** that break security, scalability, or reliability. Learn them now to avoid painful debugging later.

---

## Mistake 1: Service Accepts `realmId` Parameter

### The Mistake

```typescript
// ❌ WRONG: Service knows about realm
@injectable()
export class GroupService {
  async findOne(id: string, realmId: string) {  // ← realmId param!
    return this.prisma.group.findUnique({
      where: { id_realmId: { id, realmId } },
    });
  }

  async create(input: GroupCreateInput, realmId: string) {  // ← realmId param!
    return this.prisma.group.create({
      data: { ...input, realmId },
    });
  }
}

// Usage: Caller passes realm
const group = await groupService.findOne(groupId, realmId);
```

### Why It's Wrong

1. **Can't reuse MVP→Worker:** Service bound to realm awareness
2. **Caller must know realm:** Causes proliferation of realm awareness throughout code
3. **Harder to test:** Every test must mock realm parameter
4. **No centralized realm control:** Realm filtering scattered across service calls

### The Problem in Action

```typescript
// Scenario: MVP works, but worker instance needs separate realm instances
// New code tries to reuse service in worker instance realm handler:

// Worker instance server:
export const workerGroupProcedure = t.procedure
  .use(authGuard)  // ← Auth provides workerRealmId
  .input(GroupFetchSchema)
  .query(async ({ ctx, input }) => {
    // Service already baked in realm awareness for hub
    // But worker instance wants to use same service with workerRealmId

    // Problem: Service designed for MVP realm, not flexible
    const group = await groupService.findOne(input.id, ctx.realmId);
    // Service doesn't know it's meant for worker instance context
  });
```

### The Right Way

```typescript
// ✅ CORRECT: Service realm-agnostic, realm injected by caller
@injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {  // ← No realmId!
    return this.prisma.group.findUnique({
      where: { id },  // Caller filtered to this realm's data
    });
  }

  async create(input: GroupCreateInput) {  // ← No realmId!
    return this.prisma.group.create({
      data: input,  // realmId already in input by caller
    });
  }
}

// Usage in procedure: Realm injected by procedure/middleware
export const createGroupProcedure = t.procedure
  .use(authGuard)  // ← Validates user and realm
  .input(GroupCreateSchema)
  .mutation(async ({ ctx, input }) => {
    const { realmId } = ctx;  // ← From policy snapshot

    // Procedure combines realm with input before calling service
    const groupData = { ...input, realmId };

    // Service receives realm-scoped data, doesn't know about it
    const group = await groupService.create(groupData);

    return group;
  });
```

---

## Mistake 2: Missing `realmId` Filter in Query

### The Mistake

```typescript
// ❌ WRONG: Query doesn't filter by realm
@injectable()
export class GroupService {
  async findByName(name: string) {
    return this.prisma.group.findMany({
      where: { name },  // ← Missing realmId filter!
    });
  }
}

// Result: Returns groups from ALL realms!
const groups = await groupService.findByName('Engineering');
// Returns: [
//   { id: 'g1', name: 'Engineering', realmId: 'hub' },
//   { id: 'g2', name: 'Engineering', realmId: 'worker-1' },
//   { id: 'g3', name: 'Engineering', realmId: 'worker-2' },  ← DATA LEAKAGE!
// ]
```

### Why It's Wrong

**DATA LEAKAGE**: User in realm A sees data from realm B!

```typescript
// Security vulnerability:
// 1. User logs into hub realm
// 2. Searches for "IT" group
// 3. Gets results from worker realm (unauthorized!)
// 4. Can see member names, hierarchy, policies of other realm
```

### The Problem in Action

```typescript
// Scenario: User searches groups
export const searchGroupsFn = createServerFn()
  .middleware(authGuard)
  .handler(async ({ context }) => {
    const { realmId } = context;
    const query = getFormData().search;

    // Danger: Service doesn't filter by realm
    const groups = await groupService.findByName(query);

    // User gets groups from other realms!
    return groups;
  });
```

### The Right Way

```typescript
// ✅ CORRECT: Always filter by realm
@injectable()
export class GroupService {
  async findByName(name: string, realmId: string) {
    return this.prisma.group.findMany({
      where: {
        name,
        realmId,  // ← Explicit realm filter!
      },
    });
  }

  async findOne(id: string, realmId: string) {
    return this.prisma.group.findUnique({
      where: { id_realmId: { id, realmId } },  // ← Composite key!
    });
  }
}

// Usage: Realm passed explicitly
export const searchGroupsFn = createServerFn()
  .middleware(authGuard)
  .handler(async ({ context }) => {
    const { realmId } = context;
    const query = getFormData().search;

    // Service knows to filter by this realm only
    const groups = await groupService.findByName(query, realmId);

    return groups;
  });
```

---

## Mistake 3: Auth Check in Handler Instead of Middleware

### The Mistake

```typescript
// ❌ WRONG: Auth check in handler, not middleware
export const updateGroupFn = createServerFn()
  .handler(async ({ context }) => {
    const { userId } = context;
    const { groupId, data } = getFormData();

    // Auth check HERE (too late!)
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    // If user is not authorized, they get error here
    if (!group) {
      throw new Error('Group not found');
    }

    // But what if someone removed this check?
    // Or someone calls this function from another place?
    // ← PERMISSION BYPASS RISK!

    // Update happens
    return prisma.group.update({
      where: { id: groupId },
      data,
    });
  });
```

### Why It's Wrong

1. **Bypass risk:** Anyone removing this check (or calling handler directly) bypasses auth
2. **Scattered security:** Auth checks in 100 handlers instead of one middleware
3. **Human error:** Developer forgets auth check in new handler
4. **Hard to audit:** Can't find all auth checks easily

### The Problem in Action

```typescript
// Scenario: Someone refactors and forgets auth
export const updateGroupFn = createServerFn()
  .handler(async ({ context }) => {
    // ← Forgot to check context.userId!
    const { groupId, data } = getFormData();

    // Anyone can update any group!
    return prisma.group.update({
      where: { id: groupId },
      data,
    });
  });

// Malicious user sends: updateGroupFn({ groupId: 'rival-group', data: {...} })
// Success! They modified rival group!
```

### The Right Way

```typescript
// ✅ CORRECT: Auth in middleware, guaranteed
export const updateGroupFn = createServerFn()
  .middleware([authGuard])  // ← Auth BEFORE handler runs
  .handler(async ({ context }) => {
    // At this point, context.userId and context.realmId are GUARANTEED
    // If not authenticated, middleware already threw error
    const { userId, realmId } = context;
    const { groupId, data } = getFormData();

    // Handler only needs business logic, not auth
    const group = await prisma.group.findUnique({
      where: { id_realmId: { id: groupId, realmId } },
    });

    if (!group) {
      throw new Error('Group not found');
    }

    return prisma.group.update({
      where: { id_realmId: { id: groupId, realmId } },
      data,
    });
  });

// If middleware is removed, TypeScript type error!
// If auth fails, handler never runs!
```

---

## Mistake 4: Middleware in Wrong Order

### The Mistake

```typescript
// ❌ WRONG: Business logic before auth
export const deleteGroupFn = createServerFn()
  .middleware([routingMiddleware(groupWorker)])  // ← Business logic first
  .middleware([authGuard])  // ← Auth after!
  .handler(async ({ context }) => {
    // Routing happened before auth verification!
    // If auth fails, user already triggered routing logic
    return context.responses;
  });
```

### Why It's Wrong

1. **Auth bypass:** Business logic runs before auth verification
2. **Timing attacks:** User can detect if group exists by response time (before auth check)
3. **State changes:** Business logic might mutate state before auth fails

### The Right Way

```typescript
// ✅ CORRECT: Auth first, then business logic
export const deleteGroupFn = createServerFn()
  .middleware([authGuard])  // ← Auth FIRST (identity verification)
  .middleware([policyGuard(['canDeleteGroup'])])  // ← Permission SECOND
  .middleware([routingMiddleware(groupWorker)])  // ← Business logic LAST
  .handler(async ({ context }) => {
    // Only reached after all guards pass
    return context.responses;
  });

// Order matters:
// 1. authGuard: "Are you logged in?"
// 2. policyGuard: "Do you have permission?"
// 3. routingMiddleware: "Now do the thing"
```

---

## Mistake 5: Hardcoded "Hub" Realm

### The Mistake

```typescript
// ❌ WRONG: Hardcoded realm constant
const HUB_REALM = 'hub-instance-id';

@injectable()
export class UserService {
  async findUserProfile(userId: string) {
    // Always queries hub realm, can't work in worker instance!
    return this.prisma.user.findUnique({
      where: { id_realmId: { id: userId, realmId: HUB_REALM } },
    });
  }
}

// Worker instance tries to use this:
// Service only looks in hub realm, not worker realm!
// Result: "User not found" even though user exists in worker instance
```

### Why It's Wrong

**Won't scale:** Worker instances need their own realm context.

### The Right Way

```typescript
// ✅ CORRECT: Realm from context, not hardcoded
export const getUserProfileFn = createServerFn()
  .middleware(authGuard)
  .handler(async ({ context }) => {
    const { userId, realmId } = context;  // ← From auth

    const user = await userService.findOne(userId, realmId);

    return user;
  });

// Works in hub: realmId = 'hub-instance-id'
// Works in worker instance: realmId = 'worker-conf-2025'
// Same code, different realm context!
```

---

## Mistake 6: Type Drift (Schema ≠ Prisma)

### The Mistake

```typescript
// ❌ WRONG: No satisfies, schema drifts
export const GroupSchema = z.object({
  id: z.string(),  // ← Generic string
  name: z.string(),
  purpose: z.string(),  // ← Generic string, could be anything!
});

// Months later, Prisma schema updated
model Group {
  id String @id @default(cuid())
  name String
  purpose Enum('COMMITTEE', 'CIRCLE', 'PROJECT')  // ← Specific enum!
}

// Now schema allows invalid values
const invalidGroup = GroupSchema.parse({
  id: 'invalid',  // Doesn't match cuid format
  name: 'Team',
  purpose: 'FAKE_PURPOSE',  // Not in enum!
});

// Success locally, but fails at database layer!
// Silent type bug, hard to debug
```

### The Right Way

```typescript
// ✅ CORRECT: satisfies enforces alignment
export const GroupSchema = z.object({
  id: z.cuid(),
  name: z.string(),
  purpose: z.enum(Prisma.$Enums.GroupPurpose),
}) satisfies z.ZodType<Prisma.Group>;

// If Prisma schema changes and schema doesn't → COMPILER ERROR!
// Type safety guaranteed at compile time
```

---

## Mistake 7: serverFn Handler Returns Plain Object Instead of json()

### The Mistake

```typescript
// ❌ WRONG: Returns plain object
export const findById = createServerFn({ method: 'GET' })
  .middleware([authGuard([SCOPE.GROUP_VIEW]), injectService(GroupService)])
  .handler(async ({ context, data }) => {
    return context.service.findOne(data.params.id);  // ← Plain object!
  });

// In tests: undefined result, middleware chain broken
const result = await useServerFn(findById)({ data: { params: { id: '123' } } });
console.log(result);  // undefined!
```

### Why It's Wrong

TanStack Start's `createServerFn` expects handlers to return `Response` objects (via `json()`) for proper serialization and middleware chaining. Plain objects break the middleware chain and cause undefined results in tests and client calls.

### The Right Way

```typescript
// ✅ CORRECT: Always wrap with json()
export const findById = createServerFn({ method: 'GET' })
  .middleware([authGuard([SCOPE.GROUP_VIEW]), injectService(GroupService)])
  .handler(async ({ context, data }) => {
    return json(context.service.findOne(data.params.id));  // ← Response object!
  });

// Tests pass, middleware chain works
const result = await useServerFn(findById)({ data: { params: { id: '123' } } });
console.log(result);  // { data: {...} } ✅
```

### How to Debug

If e2e tests return `undefined` instead of expected data:
1. Check that ALL handlers return `json(result)` not just `result`
2. Verify middleware mocking includes both client and server definitions
3. Confirm service injection is working in test context

---

## Debug Checklist

When something looks wrong, check these in order:

### 🔒 Security (Unauthorized Access)

- [ ] Is `authGuard` middleware present?
- [ ] Is `authGuard` FIRST in middleware chain?
- [ ] Is `realmId` filter applied to ALL queries?
- [ ] Is composite key used (id_realmId)?
- [ ] Can user see data from other realms?

### 🔄 Data Integrity (Orphaned/Incorrect Objects)

- [ ] Is parent validation in place (rule 04)?
- [ ] Are cascading deletes configured in Prisma?
- [ ] Can deleted parent break children queries?
- [ ] Are foreign keys marked with onDelete: CASCADE?

### 📝 Type Safety (Silent Bugs)

- [ ] Does schema have `satisfies z.ZodType<PrismaType>`?
- [ ] Do all Zod field types match Prisma?
- [ ] Are enums using `Prisma.$Enums.XXX`?
- [ ] Do tests verify schema rejects invalid data?

### 🚀 Scalability (MVP→Worker Instance)

- [ ] Does service accept realm parameter?
- [ ] Is realm injected by caller, not service?
- [ ] Can same service code work in multiple realms?
- [ ] Are hardcoded realm values removed?

### 🐌 Performance (N+1, Cascading)

- [ ] Are queries using `findMany` when `findOne` exists?
- [ ] Is cascading policy update O(n) or O(n²)?
- [ ] Are tRPC calls serial or parallel?
- [ ] Is Redis caching policy snapshots?

### 🧪 API/Testing (Middleware Chain)

- [ ] Do ALL serverFn handlers return `json(result)` not plain objects?
- [ ] Are middleware mocks complete (client + server definitions)?
- [ ] Is service injection working in test context?
- [ ] Do e2e tests call controllers, not just services?

---

## Example: Debugging Permission Denied Error

```typescript
// User reports: "I can't edit my group!"

// Step 1: Check auth middleware
const updateGroupFn = createServerFn()
  .middleware(authGuard)  // ✅ Present
  .middleware(policyGuard(['canEditGroup']))  // ✅ Present
  .handler(...)

// Step 2: Check realm filter
const group = await prisma.group.findUnique({
  where: { id_realmId: { id: groupId, realmId: context.realmId } }
});
// ✅ Uses composite key

// Step 3: Check policy snapshot
console.log('User policy:', context.policy);
console.log('User realm:', context.realmId);

// ← Aha! realmId mismatch! User's policy is from hub realm,
// but they're trying to edit group in worker instance realm
// Fix: Auth provider must return correct realmId for worker instance
```
