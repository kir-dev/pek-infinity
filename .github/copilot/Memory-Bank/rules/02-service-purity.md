---
file: rules/02-service-purity.md
purpose: "MUST: Services realm-agnostic for MVP + worker-instance reuse"
triggers: ["implementing service", "code review for service", "adding realm parameter"]
keywords: ["service", "purity", "realm-agnostic", "DI", "reusable", "MVP", "worker-instance"]
dependencies: ["architecture/02-service-patterns.md", "decisions/03-why-services-are-realm-agnostic.md"]
urgency: "critical"
enforcement: "must-follow"
size: "1500 words"
sections: ["the-rule", "why-it-matters", "what-services-do", "where-realm-comes-from", "bad-examples", "good-examples", "mvp-vs-worker-instance", "testing", "checklist"]
status: "active"
mvp-scope: "current"
phase: "MVP 1.0"
created: "2025-11-17"
updated: "2025-11-17"
---

# Rule: Services are Realm-Agnostic

## The Rule (Absolute)

**Services MUST NOT know about realms. They don't accept `realmId` parameter.**

```typescript
// ❌ FORBIDDEN: Service accepts realm
@injectable()
export class GroupService {
  async findOne(id: string, realm: string) {  // ← realm parameter!
    return this.prisma.group.findUnique({
      where: { id_realmId: { id, realmId: realm } },
    });
  }
}

// ✅ REQUIRED: Service is realm-agnostic
@injectable()
export class GroupService {
  async findOne(id: string) {  // ← No realm parameter
    return this.prisma.group.findUnique({
      where: { id },  // But... wait, how do we filter by realm?
    });
  }
}
```

**Wait, that looks wrong!** Where does realmId come from?

**Answer:** The caller (procedure/serverFn) is responsible for enforcing realm.

---

## Why It Matters

### Reason 1: Same Code Works MVP + Worker Instance

**MVP:**
- Service called directly via DI
- Caller (procedure) already validated user has access to this realm
- Database query runs within that context

**Worker Instance:**
- Same service code
- Called via tRPC client from BFF
- Caller (routing middleware) determined which instance to call
- BFF has already ensured user/instance match

**If service knows realm:**
```typescript
// ❌ Breaks in worker instance
@injectable()
export class GroupService {
  async findOne(id: string, realm: string) {
    // Service is now TIED to realm concept
    // Can't reuse in instance X if someone tries to pass instance Y's realm
    // Becomes instance-specific, not reusable
  }
}

// ✅ Works in both
@injectable()
export class GroupService {
  async findOne(id: string) {
    // No realm knowledge, just pure logic
    // Works whether called from MVP or worker instance
  }
}
```

### Reason 2: Separation of Concerns

**Service layer:** "Given this ID, fetch the data"
**Procedure layer:** "User asking for this ID in THIS realm - is it allowed?"

Mixing them breaks layering:

```typescript
// ❌ BAD: Service enforces access control
@injectable()
export class GroupService {
  async findOne(id: string, realm: string, userId: string) {
    // Now service checks:
    // - Realm match
    // - User permissions (?)
    // - Business logic
    // Too many responsibilities!
  }
}

// ✅ GOOD: Clear separation
@injectable()
export class GroupService {
  // Service just does: find group by ID
  async findOne(id: string) {
    return this.prisma.group.findUnique({ where: { id } });
  }
}

// Procedure does: check permission, call service
export const findOneProcedure = procedure
  .middleware([authGuard([SCOPE.GROUP_VIEW])])
  .query(async ({ input, ctx: { groupService } }) => {
    // Permission already checked
    return groupService.findOne(input.id);
  });
```

### Reason 3: Testability

Services tested in isolation, without needing realm setup:

```typescript
// ✅ GOOD: Easy to test
describe('GroupService', () => {
  it('should find group by ID', async () => {
    const groupService = new GroupService(mockPrisma);
    const result = await groupService.findOne('group-123');
    
    expect(result.id).toBe('group-123');
  });
});

// ❌ BAD: Realm parameter required in test
describe('GroupService', () => {
  it('should find group by ID in realm', async () => {
    const groupService = new GroupService(mockPrisma);
    const result = await groupService.findOne('group-123', 'hub');  // Extra param
    
    // Test now aware of realm concept
    // What if realm is wrong? Test is fragile
  });
});
```

---

## What Services Actually Do

**Services:**
- ✅ Query/insert/update database
- ✅ Business logic (calculations, validations)
- ✅ Coordinate with other services
- ❌ NOT: Know about realms
- ❌ NOT: Know about user permissions
- ❌ NOT: Know about authentication
- ❌ NOT: Know about HTTP/RPC (they're just functions)

```typescript
// ✅ GOOD: Pure business logic
@injectable()
export class GroupService {
  constructor(@inject(PrismaService) private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.group.findUnique({ where: { id } });
  }

  async create(data: GroupCreateInput) {
    // Business logic: validate parent exists if specified
    if (data.parentId) {
      const parent = await this.findOne(data.parentId);
      if (!parent) throw new Error('Parent not found');
    }
    
    return this.prisma.group.create({ data });
  }

  async cascadeEscalation(groupId: string, parentId: string, userId: string) {
    // Business logic: add escalation statements to parent managers
    const parentManagers = await this.findParentManagers(parentId);
    
    for (const manager of parentManagers) {
      await this.addEscalationStatement(manager.id, groupId, userId);
    }
  }
}
```

---

## Where Does realmId Come From?

**Realm is injected by the CALLER, not the service.**

```typescript
// The realm "context" belongs to middleware, not service

// 1. Middleware determines realm from user
export const jwtGuard = middleware(async ({ ctx, next }) => {
  const user = verifyJWT(ctx.token);
  // Figure out which realm(s) this user has access to
  const instances = await getInstancesForUser(user);
  
  return next({
    ctx: {
      ...ctx,
      user,
      instances,  // ← Realm context injected here
    },
  });
});

// 2. Procedure uses realm to determine query
export const getGroupProcedure = procedure
  .middleware([jwtGuard])
  .query(async ({ input, ctx: { instances } }) => {
    // instances determined by middleware
    // procedure decides which instance to call
    // service just fetches
    return instances[0].groupService.findOne(input.id);  // No realm param!
  });

// 3. Routing middleware maps service to correct instance
export const routingMiddleware = middleware(async ({ ctx, next }) => {
  const instances = ctx.instances;  // From jwtGuard
  
  const results = await Promise.all(
    instances.map(instance =>
      instance.groupService.findOne(input.id)  // Service called on right instance
    )
  );
  
  return next({ ctx: { ...ctx, results } });
});
```

---

## Real Bad Examples

### Example 1: Service with Realm Parameter

```typescript
// ❌ BAD: Realm-aware service
@injectable()
export class GroupService {
  constructor(@inject(PrismaService) private prisma: PrismaService) {}

  async findOne(id: string, realmId: string) {  // ← realm in service!
    return this.prisma.group.findUnique({
      where: { id_realmId: { id, realmId } },
    });
  }
}

// Problem: Can't call without realm
const group = await groupService.findOne('group-123', 'hub');

// Problem: Testing needs realm setup
// Problem: Can't reuse in different realm contexts
```

**Fix:**
```typescript
// ✅ GOOD: Realm-agnostic service
@injectable()
export class GroupService {
  constructor(@inject(PrismaService) private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.group.findUnique({ where: { id } });
  }
}

// Procedure enforces realm
export const getGroupProcedure = procedure
  .input(z.object({ id: z.cuid() }))
  .middleware([authGuard])  // Auth validates user can see this realm
  .query(async ({ input, ctx: { groupService } }) => {
    // Only reached if user authorized for this realm
    return groupService.findOne(input.id);
  });
```

### Example 2: Service Querying by Realm

```typescript
// ❌ BAD: Service knows realm
@injectable()
export class GroupService {
  async findByNameInRealm(name: string, realmId: string) {
    return this.prisma.group.findFirst({
      where: { name, realmId },  // Service enforcing realm
    });
  }
}

// Breaks abstraction - service shouldn't know it's realm-scoped
```

**Fix:**
```typescript
// ✅ GOOD: Generic query, realm enforced by caller
@injectable()
export class GroupService {
  async findByName(name: string) {
    return this.prisma.group.findFirst({
      where: { name },  // Just find by name
    });
  }
}

// Caller (procedure) ensures only groups from allowed realm are searched
export const searchGroupsProcedure = procedure
  .middleware([authGuard])
  .query(async ({ input: { query }, ctx: { groupService, user } }) => {
    const results = await groupService.findByName(query);
    
    // Filter to only realms user has access to
    // (or better: query already scoped by routing middleware)
    return results;
  });
```

---

## MVP vs Worker Instance: Same Service Code

```typescript
// Service (never changes between MVP and worker instance)
@injectable()
export class GroupService {
  async findOne(id: string) {
    return this.prisma.group.findUnique({ where: { id } });
  }
}

// ============================================

// MVP: Called directly via procedure
export const getGroupFn = createServerFn()
  .middleware([jwtGuard, routingMiddleware(
    async (instance, { data }) => {
      // MVP: instance is local
      const groupService = container.get(GroupService);
      return groupService.findOne(data.id);
    }
  )])
  .handler(...);

// ============================================

// Worker Instance: Called via tRPC from BFF
export const getGroupFn = createServerFn()
  .middleware([jwtGuard, routingMiddleware(
    async (instance, { data }) => {
      // Worker Instance: instance is remote
      const trpcClient = getTRPCClient(instance.url);
      return trpcClient.group.findOne.query(data);
    }
  )])
  .handler(...);

// ============================================

// Service code is IDENTICAL in both
// Same GroupService used by both MVP and worker instance
```

---

## Testing Services

```typescript
describe('GroupService', () => {
  let groupService: GroupService;
  let mockPrisma: any;
  
  beforeEach(() => {
    mockPrisma = {
      group: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
      },
    };
    groupService = new GroupService(mockPrisma);
  });
  
  it('should find group by ID', async () => {
    mockPrisma.group.findUnique.mockResolvedValue({
      id: '123',
      name: 'Engineering',
    });
    
    const result = await groupService.findOne('123');  // ← No realm param!
    
    expect(result.name).toBe('Engineering');
  });
  
  it('should throw if parent not found on create', async () => {
    mockPrisma.group.findUnique.mockResolvedValue(null);  // Parent doesn't exist
    
    await expect(
      groupService.create({ name: 'Child', parentId: 'nonexistent' })
    ).rejects.toThrow('Parent not found');
  });
});
```

---

## PR Checklist

When reviewing PRs:

- [ ] Service methods have NO `realmId` parameter
- [ ] Service methods have NO `userId` parameter (unless business logic needs it)
- [ ] Service methods are pure business logic
- [ ] Service doesn't import auth middleware
- [ ] Service doesn't check permissions
- [ ] Realm filtering happens in procedure middleware, not service
- [ ] Service can be tested with just mocked Prisma
- [ ] Same service code would work MVP + worker instance
- [ ] No hardcoded realm values in service
- [ ] Circular service dependencies avoided
