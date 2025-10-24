---
file: gotchas/01-migration-blockers.md
purpose: "Understand what breaks MVP→Worker Instance migration if done wrong"
triggers: ["scaling planning", "code review before release", "architectural decision"]
keywords: ["migration", "blocker", "scale", "worker-instance", "impossible", "refactor", "debt"]
dependencies: ["gotchas/00-common-mistakes.md", "decisions/00-mvp-vs-worker-instance.md"]
urgency: "high"
size: "1500 words"
sections: ["intro", "blocker-1-service-realm-aware", "blocker-2-data-leakage", "blocker-3-auth-in-handler", "blocker-4-hardcoded-endpoints", "blocker-5-monolithic-policy", "blocker-6-circular-deps", "prevention-checklist"]
status: "active"




---

# Migration Blockers: MVP→Worker Instance

## Introduction

**These architectural mistakes make MVP→Worker Instance scaling impossible without massive refactoring.**

Mistakes in Gotchas/00 are bugs. Mistakes here are **architectural debt that compounds**. Found late, they cost weeks of rework.

---

## Blocker 1: Service Realm-Aware

### The Problem

```typescript
// ❌ BLOCKER: Service baked for MVP realm
@injectable()
export class GroupService {
  async findAll(realmId: string) {  // ← Service expects realm
    // All business logic hardcoded for this shape
    // Can't be called from worker instance without major refactoring
    return this.prisma.group.findMany({ where: { realmId } });
  }
}

// MVP works great:
const hubGroups = await groupService.findAll('hub');

// Worker instance scaling time: "Let's reuse this service"
// But service architecture is MVP-specific:
// - Takes realmId as parameter
// - All callers must know and pass realm
// - Can't inject realm centrally
```

### Why It's a Blocker

**Scaling impact:**
1. Every service call must accept realmId
2. Realm knowledge spreads to 100+ call sites
3. Testing becomes realm-aware everywhere
4. Worker instance code can't cleanly separate hub concerns

**Refactoring cost:** 5-10 days to rebuild service layer

### The Right Way (From Start)

```typescript
// ✅ CORRECT: Service realm-agnostic from day 1
@injectable()
export class GroupService {
  constructor(
    private readonly prisma: PrismaService,
    @inject('REALM_ID') private readonly realmId: string,  // Injected!
  ) {}

  async findAll() {  // ← No realmId param!
    return this.prisma.group.findMany({
      where: { realmId: this.realmId },  // Uses injected realm
    });
  }
}

// MVP: Hub realm injected
const hubModule = {
  providers: [
    GroupService,
    { provide: 'REALM_ID', useValue: 'hub' },
  ],
};

// Worker Instance: Worker realm injected
const workerModule = {
  providers: [
    GroupService,
    { provide: 'REALM_ID', useValue: workerRealmId },  // Different realm
  ],
};

// Same service, different realms! No refactoring needed!
```

---

## Blocker 2: Data Leakage (No Composite Keys)

### The Problem

```typescript
// ❌ BLOCKER: Single-key lookups don't isolate realms
model Group {
  id String @id  // ← Only id, no realmId in key!
  name String
  realmId String
}

// MVP: Works fine (only one realm)
const group = await prisma.group.findUnique({
  where: { id: 'g1' },
});

// Worker instance scaling: Multiple realms with overlapping IDs
// Two instances generate ids independently
const group1 = await prisma.group.create({ data: { id: 'g1', realmId: 'hub' } });
const group2 = await prisma.group.create({ data: { id: 'g1', realmId: 'worker-1' } });
// ↑ Database accepts both (different realms)

// But queries don't enforce realm:
const found = await prisma.group.findUnique({ where: { id: 'g1' } });
// Returns: group1 or group2? Indeterminate!
// ← DATA CORRUPTION!
```

### Why It's a Blocker

**Data migration nightmare:**
1. Can't add realmId to composite key after 1M records exist
2. Must migrate all foreign keys (groupId → groupId + realmId)
3. Must rewrite 100+ queries
4. Downtime required

**Refactoring cost:** 2-3 weeks of careful migration + testing

### The Right Way (From Start)

```typescript
// ✅ CORRECT: Composite key from day 1
model Group {
  id String
  realmId String
  name String

  @@id([id, realmId])  // ← Composite primary key
  @@unique([id, realmId])  // Force uniqueness per realm
}

model Membership {
  id String
  groupId String
  groupRealmId String  // ← Must include realm!
  userId String
  userRealmId String   // ← Must include realm!
  realmId String

  @@foreign([groupId, groupRealmId], references: [id, realmId], onDelete: CASCADE)
  @@foreign([userId, userRealmId], references: [id, realmId], onDelete: CASCADE)
}

// Queries force realm isolation:
const group = await prisma.group.findUnique({
  where: { id_realmId: { id: 'g1', realmId: 'hub' } },
});
// ← Must specify realm, no ambiguity!
```

---

## Blocker 3: Auth in Handler

### The Problem

```typescript
// ❌ BLOCKER: Auth scattered in 100 handlers
export const updateGroupFn = createServerFn()
  .handler(async ({ context }) => {
    // Check auth here
    if (!context.userId) throw new Error('Unauthorized');
    // ...
  });

export const deleteGroupFn = createServerFn()
  .handler(async ({ context }) => {
    // Check auth again
    if (!context.userId) throw new Error('Unauthorized');
    // ...
  });

// 100 more handlers with same check...
// Someone maintains it, finds all 100, updates them all to new schema

// Later: Worker instance needs different auth provider
// Now you need to update 100+ handlers for new auth logic
// Risk: Miss one, security hole!
```

### Why It's a Blocker

**Security/scaling nightmare:**
1. Auth logic change requires 100+ file edits
2. Easy to miss one handler (security hole)
3. Can't test auth centrally
4. Worker instance provider can't override MVP provider

**Refactoring cost:** 1-2 weeks of risky changes

### The Right Way (From Start)

```typescript
// ✅ CORRECT: Auth in middleware, reusable
const authGuard = t.middleware(async (opts) => {
  const { context } = opts;
  if (!context.userId) {
    throw new AppError('Unauthorized', 401);
  }
  return opts.next({
    ctx: { ...context, verified: true },
  });
});

// Every procedure uses same middleware:
export const updateGroupProcedure = t.procedure
  .use(authGuard)  // ← Centralized
  .mutation(async ({ ctx, input }) => {
    // Auth already verified by middleware
    // Handler only needs business logic
  });

// Change auth logic once: all procedures update automatically!
// Worker instance provider: create new workerAuthGuard, apply to worker procedures
```

---

## Blocker 4: Hardcoded Endpoints/Realms

### The Problem

```typescript
// ❌ BLOCKER: Hardcoded hub endpoint
const HUB_API = 'https://api.pek.com';

@injectable()
export class UserService {
  async fetchUserProfile(userId: string) {
    return fetch(`${HUB_API}/users/${userId}`);
  }
}

// Works for MVP, but worker instance can't use this service:
// - Always calls hub endpoint
// - Can't point to worker instance
// - Requires complete service rewrite
```

### Why It's a Blocker

**Scaling constraint:** Service bound to one deployment.

### The Right Way (From Start)

```typescript
// ✅ CORRECT: Endpoint injected
@injectable()
export class UserService {
  constructor(
    @inject('API_URL') private readonly apiUrl: string,
  ) {}

  async fetchUserProfile(userId: string) {
    return fetch(`${this.apiUrl}/users/${userId}`);
  }
}

// MVP: Hub endpoint
const hubModule = {
  providers: [
    UserService,
    { provide: 'API_URL', useValue: 'https://api.pek.com' },
  ],
};

// Worker Instance: Worker endpoint
const workerModule = {
  providers: [
    UserService,
    { provide: 'API_URL', useValue: workerApiUrl },
  ],
};

// Same service code, different deployments!
```

---

## Blocker 5: Monolithic Policy System

### The Problem

```typescript
// ❌ BLOCKER: Policy logic monolithic (MVP-only)
export class PolicyService {
  async getUserPolicies(userId: string, realmId: string) {
    // Business logic hardcoded for hub realm rules
    // - Specific statement types (SIMONYI_ELNOK, BOARD_MEMBER, etc)
    // - Specific cascading rules
    // - Hardcoded policy hierarchy
    
    // Worker instance can't customize policies without changing code
    // Different departments have different policy structures
    // Result: Copy-paste code for each worker instance
  }
}

// Worker Instance Policy: Needs custom rules
// MVP Policy: Hardcoded hierarchy
// → Must fork service, maintain separately
// → Code duplication, bug propagation
```

### Why It's a Blocker

**Unmaintainable:** Each worker instance needs policy fork.

### The Right Way (From Start)

```typescript
// ✅ CORRECT: Extensible policy interface
interface PolicyResolver {
  getStatements(userId: string): Promise<Statement[]>;
  canAction(user: User, action: string): boolean;
}

@injectable()
export class PolicyService {
  constructor(
    @inject('POLICY_RESOLVER') private readonly resolver: PolicyResolver,
  ) {}

  async getUserPolicies(userId: string) {
    return this.resolver.getStatements(userId);
  }
}

// MVP: Hub policy resolver (hardcoded)
class HubPolicyResolver implements PolicyResolver {
  async getStatements(userId: string) {
    // Schönherz college policies
  }
}

// Worker Instance: Custom policy resolver
class CustomPolicyResolver implements PolicyResolver {
  async getStatements(userId: string) {
    // This worker instance's custom rules
  }
}

// Use dependency injection to swap providers
// Same service, different policies!
```

---

## Blocker 6: Circular Dependencies

### The Problem

```typescript
// ❌ BLOCKER: Circular service dependencies
// Service A depends on Service B
// Service B depends on Service A

@injectable()
export class GroupService {
  constructor(private membershipService: MembershipService) {}

  async create(group: Group) {
    await this.membershipService.addOwner(group.id, group.ownerId);
    // ...
  }
}

@injectable()
export class MembershipService {
  constructor(private groupService: GroupService) {}

  async addOwner(groupId: string, userId: string) {
    const group = await this.groupService.findOne(groupId);
    // ...
  }
}

// At scale, these cycles create:
// - Testing nightmares (can't mock cleanly)
// - Deployment issues (initialization order unclear)
// - Worker instance can't reuse without refactoring
```

### Why It's a Blocker

**Impossible to scale:** Can't split services across instances.

### The Right Way (From Start)

```typescript
// ✅ CORRECT: Unidirectional dependencies
// Always: Low-level → High-level
// Never: High-level → Low-level

// Level 1: Database/Prisma
// Level 2: Core services (don't depend on anything)
@injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async create(group: Group) {
    return this.prisma.group.create({ data: group });
  }
}

@injectable()
export class MembershipService {
  constructor(private readonly prisma: PrismaService) {}

  async addMember(groupId: string, userId: string) {
    return this.prisma.membership.create({
      data: { groupId, userId },
    });
  }
}

// Level 3: Composed services (depend on Level 2)
@injectable()
export class GroupManagementService {
  constructor(
    private readonly groupService: GroupService,
    private readonly membershipService: MembershipService,
  ) {}

  async createGroupWithOwner(group: Group, ownerId: string) {
    const newGroup = await this.groupService.create(group);
    await this.membershipService.addMember(newGroup.id, ownerId);
    return newGroup;
  }
}

// Clear hierarchy, no cycles, easy to test and deploy
```

---

## Prevention Checklist

**Before implementing a feature, verify:**

### Architecture
- [ ] Services don't accept realm parameter?
- [ ] Realm injected via DI, not passed?
- [ ] No hardcoded hub/MVP realm constants?
- [ ] No hardcoded endpoints?

### Database
- [ ] All realm-scoped models use composite keys?
- [ ] Foreign keys include realmId?
- [ ] Queries use id_realmId composite lookups?
- [ ] Cascading deletes configured?

### Security
- [ ] Auth in middleware, not handler?
- [ ] Middleware chain ordered correctly?
- [ ] No data leakage between realms?
- [ ] realmId filter on ALL queries?

### Testability
- [ ] Can services be tested without realm?
- [ ] No circular service dependencies?
- [ ] Policy system extensible (interface)?
- [ ] Auth provider swappable?

### Worker Instance Readiness
- [ ] Same code runs in hub + worker instance?
- [ ] Can DI module be overridden per deployment?
- [ ] No fork-and-modify for each instance?
- [ ] Scaling plan doesn't require refactoring?

---

## Red Flags During Code Review

If you see these, push back:

🚩 Service method has `realmId` parameter  
🚩 Query doesn't filter by realmId  
🚩 Auth check in handler instead of middleware  
🚩 Hardcoded realm/endpoint in service  
🚩 Monolithic if/else for different deployment types  
🚩 Service imports from another service (potential cycle)  
🚩 Policy logic hardcoded (not extensible)  

Each one is a future refactoring tax. Stop them early.
