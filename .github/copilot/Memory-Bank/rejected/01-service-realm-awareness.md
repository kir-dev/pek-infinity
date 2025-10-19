---
file: rejected/01-service-realm-awareness.md
purpose: "Why services DON'T know realm (detailed rejection with consequences)"
triggers: ["service design decision", "code review", "scalability question"]
keywords: ["service", "realm", "parameter", "awareness", "injection", "DI", "coupling"]
dependencies: ["rules/02-service-purity.md", "gotchas/01-migration-blockers.md"]
urgency: "high"
size: "1000 words"
sections: ["decision", "rejected-approach", "why-rejected", "correct-approach", "comparison", "consequences"]
status: "active"




---

# Rejected: Services With Realm Awareness

## Decision Summary

**❌ REJECTED:** Services accept `realmId` as parameter  
**✅ APPROVED:** Services receive realm via dependency injection  

This is a fundamental design choice that affects scalability.

---

## The Rejected Approach

```typescript
// ❌ REJECTED: Service aware of realm parameter
@injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(realmId: string) {  // ← realmId param
    return this.prisma.group.findMany({
      where: { realmId },
    });
  }

  async create(input: GroupCreateInput, realmId: string) {  // ← realmId param
    return this.prisma.group.create({
      data: { ...input, realmId },
    });
  }

  async update(id: string, data: Partial<Group>, realmId: string) {  // ← realmId param
    return this.prisma.group.update({
      where: { id_realmId: { id, realmId } },
      data,
    });
  }
}

// Usage: Caller must provide realm
export const getGroupsProcedure = t.procedure
  .input(GetGroupsInput)
  .query(async ({ input, ctx }) => {
    const groups = await groupService.findAll(ctx.realmId);  // ← Explicit
    return groups;
  });
```

---

## Why This Approach Is Rejected

### 1. Realm Awareness Spreads Everywhere

```typescript
// ❌ PROBLEM: Every caller must know and pass realm
const userService = new UserService();
const groupService = new GroupService();
const membershipService = new MembershipService();

// Each call requires realm parameter:
await userService.findOne(userId, realmId);
await groupService.findOne(groupId, realmId);
await membershipService.findMany(groupId, realmId);

// Procedure layer:
export const dashboardProcedure = t.procedure
  .query(async ({ ctx }) => {
    const { realmId } = ctx;

    // Every service call requires realm
    const user = await userService.findOne(userId, realmId);
    const groups = await groupService.findMany(realmId);
    const memberships = await membershipService.findMany(groupId, realmId);

    return { user, groups, memberships };
  });

// Composite service:
@injectable()
export class GroupManagementService {
  async createWithOwner(
    groupInput: GroupCreateInput,
    ownerId: string,
    realmId: string,  // ← Must accept
  ) {
    const group = await this.groupService.create(groupInput, realmId);
    await this.membershipService.add(group.id, ownerId, realmId);  // ← Must pass
    return group;
  }
}

// Middleware/guards:
@injectable()
export class AuthService {
  async validateUserInRealm(userId: string, realmId: string) {
    const user = await this.userService.findOne(userId, realmId);
    // ...
  }
}

// Result: realmId parameter in 50+ places, none of which care about it
// Just passing it through mechanically
```

### 2. Can't Test Services in Isolation

```typescript
// ❌ Problem: Every test must mock realm
describe('GroupService', () => {
  let service: GroupService;

  beforeEach(() => {
    service = new GroupService(new PrismaService());
  });

  it('should create group', async () => {
    const group = await service.create(
      { name: 'Test' },
      'test-realm',  // ← Must provide realm
    );
    expect(group.name).toBe('Test');
  });

  it('should find group', async () => {
    const group = await service.findOne(groupId, 'test-realm');  // ← Repeated
    expect(group.name).toBe('Test');
  });

  // 50 tests, each manually passing 'test-realm'
  // If realm logic changes, update 50 tests!
});

// With injection: realm is implicit, tests cleaner
```

### 3. Can't Reuse Service Across Realms Easily

```typescript
// ❌ Problem: Cloud and enterprise need same service, different realms
// Cloud implementation:
const cloudModule = {
  providers: [
    GroupService,  // ← Same service
    // But how to inject realm?
  ],
};

// Enterprise implementation:
const enterpriseModule = {
  providers: [
    GroupService,  // ← Same service, different realm needed
    // But service takes realmId parameter, not configurable
  ],
};

// Solution: Pass realm in context, but where?
// Service doesn't read from context, it expects parameter
// Caller must know about both realms
// Can't transparently scale
```

### 4. Impossible to Enforce Realm in One Place

```typescript
// ❌ Problem: Realm checking scattered
export class GroupService {
  async create(input: GroupCreateInput, realmId: string) {
    // Service checks realm here
    if (!realmId) throw new Error('Realm required');
    // ...
  }
}

export class UserService {
  async findOne(userId: string, realmId: string) {
    // Service checks realm here too
    if (!realmId) throw new Error('Realm required');
    // ...
  }
}

// Procedure layer:
export const createGroupProcedure = t.procedure
  .query(async ({ ctx }) => {
    // And checks realm here
    if (!ctx.realmId) throw new Error('Realm required');

    await groupService.create(input, ctx.realmId);
  });

// Realm validation in 3 places
// If logic changes, update all 3
// Easy to miss one and create bug
// vs. one centralized enforcement point
```

### 5. Hidden Bugs with Realm Mixing

```typescript
// ❌ Risk: Accidentally mixing realms
@injectable()
export class ManagementService {
  async transferGroupOwnership(
    groupId: string,
    newOwnerId: string,
    adminRealmId: string,  // Admin realm
  ) {
    const group = await groupService.findOne(groupId, adminRealmId);
    
    // Bug: Forgot to check if newOwnerId is in same realm!
    const user = await userService.findOne(newOwnerId);  // ← Missing realm!
    // Could be user from different realm!

    await membershipService.update(group.id, user.id, adminRealmId);
    // Now user from realm A is member of group in realm B!
    // ← Data corruption!
  }
}

// With DI: Realm injected globally, can't mix
// Much harder to accidentally use wrong realm
```

---

## The Correct Approach

```typescript
// ✅ APPROVED: Services receive realm via dependency injection
@injectable()
export class GroupService {
  constructor(
    private readonly prisma: PrismaService,
    @inject('REALM_ID') private readonly realmId: string,  // ← Injected
  ) {}

  async findAll() {  // ← No parameter!
    return this.prisma.group.findMany({
      where: { realmId: this.realmId },  // Uses injected realm
    });
  }

  async create(input: GroupCreateInput) {  // ← No parameter!
    return this.prisma.group.create({
      data: { ...input, realmId: this.realmId },  // Uses injected realm
    });
  }

  async update(id: string, data: Partial<Group>) {  // ← No parameter!
    return this.prisma.group.update({
      where: { id_realmId: { id, realmId: this.realmId } },
      data,
    });
  }
}

// Usage: Realm implicit, from DI container
export const getGroupsProcedure = t.procedure
  .query(async ({ ctx }) => {
    // Service automatically uses ctx.realmId via DI
    const groups = await groupService.findAll();  // ← Clean!
    return groups;
  });

// Module configuration:
// MVP: Cloud realm
const cloudModule = {
  providers: [
    GroupService,
    { provide: 'REALM_ID', useValue: 'cloud' },
  ],
};

// Enterprise: Enterprise realm
const enterpriseModule = {
  providers: [
    GroupService,
    { provide: 'REALM_ID', useValue: enterpriseRealmId },  // Different value
  ],
};

// Same service code, different realm context!
// Zero changes to service implementation!
```

---

## Side-by-Side Comparison

| Aspect | With Parameter | With DI |
|--------|----------------|---------|
| **Service signature** | `findOne(id, realmId)` | `findOne(id)` |
| **Caller code** | `service.findOne(id, ctx.realmId)` | `service.findOne(id)` |
| **Realm enforcement** | Scattered (service, caller, guard) | Centralized (DI) |
| **Test setup** | `beforeEach() { realm = 'test' }` | `@inject` handles it |
| **Realm mixin risk** | High (easy to forget) | Low (can't happen) |
| **MVP→Enterprise** | Must refactor callers | Just swap DI module |
| **Number of changes for scale** | 50+ files | 1 config file |

---

## Consequences of Wrong Choice

### Choosing Parameter Approach
**At 100 developers:**
- Realm awareness in every service
- Hard to test (realm boilerplate in 1000 tests)
- Scaling takes weeks (realm in 100+ files)
- Easy to accidentally mix realms
- **Cost: 3-4 weeks rework**

### Choosing DI Approach (Correct)
**At 100 developers:**
- Services simple, focused
- Tests clean (realm in one place)
- Scaling is configuration change
- Can't mix realms by accident
- **Cost: 0 weeks rework**

---

## How DI Realm Injection Works

```typescript
// In TanStack Start middleware:
export const createMiddleware = (realmId: string) => {
  return (opts) => {
    // Create DI container for this request's realm
    const container = new DIContainer();
    container.register('REALM_ID', realmId);

    // Services resolve from container
    const groupService = container.resolve(GroupService);
    const userService = container.resolve(UserService);

    // All services share same realm context
    return opts.next({
      ctx: {
        ...opts.ctx,
        services: { groupService, userService },
      },
    });
  };
};

// In procedure:
export const getGroupsProcedure = t.procedure
  .query(async ({ ctx }) => {
    // Services already have realm from DI
    const groups = await ctx.services.groupService.findAll();
    return groups;
  });

// If realm changes (user logs out, switches instance):
// Just create new DI container with different realm!
```

---

## Summary

**Services with realm parameter:**
- ❌ Spreads realm awareness everywhere
- ❌ Hard to test
- ❌ Impossible to scale cleanly
- ❌ Risk of realm mixing bugs

**Services with realm injection:**
- ✅ Realm in one place (DI)
- ✅ Easy to test (realm implicit)
- ✅ Trivial to scale (config change)
- ✅ Can't mix realms (compiler prevents it)

**Decision:** Use dependency injection. No parameter.

