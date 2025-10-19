---
file: architecture/02-service-patterns.md
purpose: "Why services are realm-agnostic, how they fit MVP and enterprise, DI pattern"
triggers: ["implementing service layer", "code review of services", "understanding separation of concerns"]
keywords: ["service", "business logic", "DI", "realm-agnostic", "pure", "testable"]
dependencies: ["architecture/00-federation-model.md", "architecture/03-middleware-layering.md"]
urgency: "critical"
size: "2000 words"
status: "active"
created: "2025-10-20"
updated: "2025-10-20"




---

# Service Patterns: Realm-Agnostic Business Logic

## Core Principle: Services Don't Know Realm

Services contain pure business logic. They:
- Query database (accept query parameters only)
- Transform data
- Validate business rules
- Return results

Services **do NOT**:
- Know which realm they're in
- Filter by realm (caller does)
- Perform auth checks (middleware does)
- Know if they're called from MVP or enterprise

This separation is critical because it allows:
- **Same service code to run in MVP and enterprise**
- **Services to be tested in isolation**
- **Easy composability (services can call services)**

## Why? The Problem with Realm-Aware Services

### ❌ Wrong Approach: Service Accepts Realm

```typescript
@injectable()
export class GroupService {
  constructor(@inject(PrismaService) private prisma: PrismaService) {}

  async findOne(id: string, realm: string) {
    // ❌ Service now knows about realms
    return this.prisma.group.findUnique({
      where: { id_realmId: { id, realmId: realm } }
    });
  }
}
```

**Problems:**
1. **Not reusable across realms**: This service is now tied to a specific realm concept
2. **Harder to test**: Every test must mock realm parameter
3. **Tight coupling**: Service is coupled to realm routing logic
4. **Breaks composition**: If ServiceA calls ServiceB, who passes realm?

### ✅ Right Approach: Service is Realm-Agnostic

```typescript
@injectable()
export class GroupService {
  constructor(@inject(PrismaService) private prisma: PrismaService) {}

  async findOne(id: string) {
    // ✅ Pure business logic, no realm awareness
    return this.prisma.group.findUnique({ where: { id } });
  }

  async findAll(filters?: { parentId?: string }) {
    // ✅ Only accepts business-level filters
    return this.prisma.group.findMany({
      where: filters
    });
  }

  async create(data: GroupCreateInput) {
    // ✅ No realm parameter
    return this.prisma.group.create({ data });
  }

  async update(id: string, data: GroupUpdateInput) {
    return this.prisma.group.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.group.delete({ where: { id } });
  }
}
```

**Benefits:**
1. **Same code in MVP and enterprise**
2. **Easy to test** (inject Prisma mock)
3. **Composable** (services call services naturally)
4. **Decoupled** (service doesn't care about routing layer)

## How Realm Filtering Actually Happens

Realm filtering happens in **TWO layers**:

### Layer 1: Database (Prisma)

When the database is queried, the query must include realm filtering:

```typescript
// ✅ Correct: Realm filter added by caller (not service)
const user = requiredContext; // Context includes realm
const groups = await groupService.findAll({ realmId: user.realm });

// ❌ Wrong (and this won't even compile with proper Prisma)
const groups = await prisma.group.findMany(); // Missing realmId!
```

### Layer 2: Middleware (Injection)

The request context injects realm information:

```typescript
// Middleware determines realm
const realm = determineRealmFromRequest(request);

// Middleware injects context
context.realm = realm;
context.prisma = prisma;

// Middleware calls service
const result = await groupService.findAll(filters);
```

**Result**: The Prisma client itself is configured or filtered by realm at the middleware layer, not the service layer.

## DI Pattern with Realm Support

### MVP: Direct Service Injection

```typescript
export const getGroupFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string() }))
  .middleware([authGuard(['GROUP_VIEW'])])
  .handler(async ({ data, context: { injector } }) => {
    // ✅ Injector resolves service
    const groupService = injector.resolve(GroupService);
    
    // ✅ Service called without realm (already scoped by database)
    return groupService.findOne(data.id);
  });
```

**How realm filtering works in MVP:**
1. Middleware creates Prisma client scoped to cloud realm
2. Injects Prisma into GroupService constructor
3. Service queries with scoped Prisma (all queries already filtered)
4. Result: No realm leakage

### Enterprise: Service Injection + tRPC

```typescript
// tRPC procedure (reusable)
export const groupProcedures = {
  findOne: procedure
    .input(z.object({ id: z.string() }))
    .middleware([authGuard(['GROUP_VIEW'])])
    .query(async ({ input, ctx: { injector } }) => {
      // ✅ Same pattern as MVP
      const groupService = injector.resolve(GroupService);
      return groupService.findOne(input.id);
    }),
};

// serverFn (BFF routing)
export const getGroupFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string() }))
  .middleware([jwtGuard, routingMiddleware(groupProcedures.findOne)])
  .handler(async ({ data, context: { responses } }) => {
    // ✅ Handler combines responses
    return responses.successResponses[0]?.data;
  });
```

**How realm filtering works in enterprise:**
1. Routing middleware calls remote instance
2. Remote instance's Prisma client is scoped to its realm
3. Service queries with scoped Prisma
4. Result: Realm isolation across instances

## Testing Services in Isolation

Because services are realm-agnostic, testing is simple:

```typescript
describe('GroupService', () => {
  let service: GroupService;
  let prisma: PrismaService;

  beforeEach(() => {
    // Mock Prisma
    prisma = createMockPrisma();
    
    // Create service with mock
    service = new GroupService(prisma);
  });

  it('should create a group', async () => {
    // ✅ No realm mock needed
    const result = await service.create({
      name: 'Engineering',
      description: 'Eng team',
      // ...
    });
    
    expect(result.name).toBe('Engineering');
  });

  it('should find a group', async () => {
    // ✅ No realm mock needed
    const result = await service.findOne('group-123');
    
    expect(result.id).toBe('group-123');
  });
});
```

## Common Mistakes with Services

### ❌ Mistake 1: Service Calls Another Service Without Realm

```typescript
// ❌ Wrong: GroupService calls MembershipService
async function createMembership(userId: string, groupId: string) {
  const group = await groupService.findOne(groupId);
  // ❌ No realm parameter, but groupService needs realm!
  
  const membership = await membershipService.create({ userId, groupId });
  return membership;
}
```

**Fix**: Services call services with full context (including realm):

```typescript
// ✅ Correct: Both services accept what they need
async function createMembership(userId: string, groupId: string) {
  const group = await groupService.findOne(groupId);
  const membership = await membershipService.create({ userId, groupId });
  return membership;
}
// Caller ensures Prisma is scoped correctly
```

### ❌ Mistake 2: Service Has Side Effects

```typescript
// ❌ Wrong: Service does more than query
async function findOne(id: string) {
  const group = await prisma.group.findUnique({ where: { id } });
  
  // ❌ Logging to external system (side effect)
  await analytics.track('group_viewed', { id });
  
  // ❌ Calling external API
  await slack.notifyGroupViewed(group);
  
  return group;
}
```

**Fix**: Services are pure; side effects happen in middleware or controllers:

```typescript
// ✅ Correct: Service only queries
async function findOne(id: string) {
  return prisma.group.findUnique({ where: { id } });
}

// ✅ Side effects in procedure/serverFn
export const getGroupFn = createServerFn()
  .handler(async ({ data, context }) => {
    const group = await groupService.findOne(data.id);
    
    // ✅ Side effects here
    await analytics.track('group_viewed', { id: data.id });
    
    return group;
  });
```

### ❌ Mistake 3: Service Has Auth Logic

```typescript
// ❌ Wrong: Service checks permissions
async function updateGroup(id: string, data: GroupUpdateInput) {
  const group = await prisma.group.findUnique({ where: { id } });
  
  // ❌ Auth check in service
  if (!user.hasPermission('GROUP_EDIT')) {
    throw new Error('Forbidden');
  }
  
  return prisma.group.update({ where: { id }, data });
}
```

**Fix**: Auth in middleware, business logic in service:

```typescript
// ✅ Correct: Auth in middleware
export const updateGroupFn = createServerFn()
  .middleware([authGuard(['GROUP_EDIT'])])  // ✅ Auth here
  .handler(async ({ data, context }) => {
    // ✅ Service only does business logic
    return groupService.update(data.id, data);
  });

async function updateGroup(id: string, data: GroupUpdateInput) {
  // ✅ No auth check
  return prisma.group.update({ where: { id }, data });
}
```

## Service Method Naming

Follow REST-like naming for consistency:

| Operation | Method | Example |
|-----------|--------|---------|
| Retrieve one | `findOne` | `groupService.findOne(id)` |
| Retrieve many | `findMany` or `list` | `groupService.findMany(filters)` |
| Create | `create` | `groupService.create(data)` |
| Update | `update` | `groupService.update(id, data)` |
| Delete | `delete` | `groupService.delete(id)` |
| Custom query | `findByX` | `groupService.findByParent(parentId)` |

## Service Layer Checklist

Before submitting a service PR:

- [ ] Service has zero realm awareness (no realm parameter)
- [ ] Service has zero auth logic (no permission checks)
- [ ] Service has zero side effects (no external API calls, logging)
- [ ] Service is tested in isolation (no middleware mocks)
- [ ] Service methods follow naming conventions
- [ ] Service only accepts business-level parameters
- [ ] Service is injectable (decorated with @injectable())
- [ ] All methods are public (no private helper logic in handler)

## Next Steps

- `implementation/00-service-layer.md` - Copy-paste service template
- `architecture/03-middleware-layering.md` - How middleware wraps services
- `rules/02-service-layer-purity.md` - Enforcement rules

---

**Last updated**: 2025-10-20
