---
file: gotchas/02-performance-gotchas.md
purpose: "Understand performance traps at scale: N+1 queries, cascading O(n²), caching issues"
triggers: ["performance review", "database profiling", "scaling to 1000+ users"]
keywords: ["performance", "N+1", "query", "cascading", "O(n)", "slow", "bottleneck", "scale"]
dependencies: ["implementation/03-auth-guards.md", "reference/01-er-diagram.md"]
urgency: "medium"
size: "1200 words"
sections: ["intro", "gotcha-1-n-plus-one", "gotcha-2-cascading-queries", "gotcha-3-policy-snapshot-size", "gotcha-4-serial-trpc", "gotcha-5-redis-invalidation", "profiling-checklist"]
status: "active"




---

# Performance Gotchas: N+1, Cascading, Caching

## Introduction

These problems don't show up at 100 users. They show up at 10,000 users and cause page load times to explode.

---

## Gotcha 1: N+1 Queries (Nested Loads)

### The Problem

```typescript
// ❌ SLOW: N+1 query pattern
export const getGroupWithMembersHandler = async (groupId: string) => {
  // Query 1: Get group
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  // Query 2: Get all memberships for this group
  const memberships = await prisma.membership.findMany({
    where: { groupId },
  });

  // Query 3-N: For each membership, get user details
  const members = await Promise.all(
    memberships.map(m => 
      prisma.user.findUnique({ where: { id: m.userId } })
    )
  );
  
  // N+2 queries total!
  // With 100 members: 102 database round trips!

  return {
    group,
    members,
  };
};
```

**At scale:**
- 10 users request groups with 100 members each
- 10 × 102 = **1,020 database queries** in seconds!
- Database connection pool exhausted
- Page load: 45+ seconds 🐢

### The Right Way

```typescript
// ✅ FAST: Join query (single round trip)
export const getGroupWithMembersHandler = async (groupId: string, realmId: string) => {
  // Single query with join
  const group = await prisma.group.findUnique({
    where: { id_realmId: { id: groupId, realmId } },
    include: {
      memberships: {
        include: {
          user: true,  // ← Join, not separate query
        },
      },
    },
  });

  if (!group) throw new Error('Group not found');

  return {
    group,
    members: group.memberships.map(m => m.user),
  };
};

// Result: 1 database query!
// With 100 members: 1 query, same data!
// Page load: 100ms ⚡
```

### Detection

```typescript
// Enable query logging to spot N+1
const prisma = new PrismaClient({
  log: ['query'],
});

// Run your function, count queries
// If queries = 1 + number of results → N+1 detected!
```

---

## Gotcha 2: Cascading Queries (Policy Escalation)

### The Problem

```typescript
// ❌ SLOW: Cascading policy assignment on group creation
export const createGroupService = async (
  input: GroupCreateInput,
  realmId: string,
) => {
  const group = await prisma.group.create({
    data: { ...input, realmId },
  });

  // When group created, parent managers get escalation rights
  if (group.parentId) {
    const parent = await prisma.group.findUnique({
      where: { id: group.parentId },
    });

    // Get all managers of parent
    const parentManagers = await prisma.membership.findMany({
      where: { 
        groupId: parent.id,
        policies: { some: { canManageGroup: true } },
      },
      include: { user: true },
    });

    // For each manager, add escalation statement
    // This might be 50-200 managers!
    await Promise.all(
      parentManagers.map(m =>
        prisma.policyAssignment.create({
          data: {
            userId: m.userId,
            policyId: escalationPolicy.id,
            assignedBy: 'system',
          },
        })
      )
    );
  }

  return group;
};

// Creating 1 group = 50 policy assignments!
// Creating 100 groups = 5,000 assignments
// With cascading: 100 × 100 nested groups = 10,000+ queries!
```

**At scale:**
- Create event (group hierarchy)
- 100 groups created, each triggering cascading assignments
- **O(n²) or worse!**
- Database transaction locks entire table for 10+ seconds
- Other users get "locked" errors

### The Right Way

```typescript
// ✅ FAST: Batch policy assignments in single transaction
export const createGroupService = async (
  input: GroupCreateInput,
  realmId: string,
) => {
  return prisma.$transaction(async (tx) => {
    // Create group
    const group = await tx.group.create({
      data: { ...input, realmId },
    });

    // Get parent managers (if parent exists)
    if (group.parentId) {
      const parentManagers = await tx.user.findMany({
        where: {
          memberships: {
            some: {
              groupId: group.parentId,
              policies: { some: { canManageGroup: true } },
            },
          },
        },
        select: { id: true },
      });

      // Batch insert all assignments at once
      if (parentManagers.length > 0) {
        await tx.policyAssignment.createMany({
          data: parentManagers.map(m => ({
            userId: m.id,
            policyId: escalationPolicy.id,
            assignedBy: 'system',
          })),
        });
      }
    }

    return group;
  });
};

// Single transaction, batch operations
// Creating 100 groups = ~300 total queries (not 5,000+)
```

---

## Gotcha 3: Policy Snapshot Too Large

### The Problem

```typescript
// ❌ BLOAT: Storing entire policy hierarchy in JWT
const policySnapshot = {
  userId: 'u1',
  realm: 'cloud',
  policies: [
    // ... 500 policies for this user across 20+ groups
    // Each policy has: statements, permissions, scope, escalations
    // Total: 50KB+ JSON object
  ],
};

const token = jwt.sign(policySnapshot, secret);
// Token becomes 60KB+ string!

// Problem 1: JWT in Authorization header
// Headers can max 8KB (varies by server)
// Token rejected!

// Problem 2: Sent with every request
// 10,000 concurrent users × 60KB = 600MB+ bandwidth per request
// CDN costs spike

// Problem 3: Redis caching
// 100,000 users × 60KB = 6GB Redis memory
// Cache thrashing, evictions, misses
```

### The Right Way

```typescript
// ✅ EFFICIENT: Store snapshot hash, cache full snapshot in Redis
const policySnapshot = {
  userId: 'u1',
  realm: 'cloud',
  policies: [...],  // Full 50KB snapshot
};

// Generate hash
const snapshotHash = sha256(JSON.stringify(policySnapshot));

// JWT contains only hash
const token = jwt.sign(
  { userId: 'u1', realm: 'cloud', snapshotHash },
  secret
);
// Token now 500 bytes instead of 60KB!

// Cache full snapshot in Redis
await redis.set(
  `policy:${snapshotHash}`,
  JSON.stringify(policySnapshot),
  'EX', 3600  // 1 hour expiry
);

// Request flow:
// 1. Auth middleware validates token signature
// 2. Extract snapshotHash from token
// 3. Fetch full snapshot from Redis (1ms hit)
// 4. Pass to downstream handlers

// Benefits:
// - JWT small (500 bytes)
// - Redis cache hit 99% of time
// - Can invalidate snapshot on policy change
// - Can pre-warm cache on login
```

---

## Gotcha 4: Serial tRPC Calls

### The Problem

```typescript
// ❌ SLOW: Serial tRPC calls
export const getGroupDashboardFn = createServerFn()
  .middleware(authGuard)
  .handler(async ({ context }) => {
    const { realmId } = context;

    // Call 1: Get group
    const group = await t.createCaller(context).getGroup(groupId);

    // Call 2: Wait for group, then get members
    const members = await t.createCaller(context).getGroupMembers(groupId);

    // Call 3: Wait for members, then get policies
    const policies = await t.createCaller(context).getGroupPolicies(groupId);

    // Call 4: Wait for policies, then get evaluations
    const evals = await t.createCaller(context).getGroupEvaluations(groupId);

    // Serial: All wait for previous to complete
    // Total time: t1 + t2 + t3 + t4 (if each is 100ms = 400ms!)

    return { group, members, policies, evals };
  });
```

**Impact:**
- 4 tRPC calls, each 100ms
- Serial execution: 400ms total
- User stares at spinner for half a second

### The Right Way

```typescript
// ✅ FAST: Parallel tRPC calls
export const getGroupDashboardFn = createServerFn()
  .middleware(authGuard)
  .handler(async ({ context }) => {
    const { realmId } = context;
    const caller = t.createCaller(context);

    // All calls in parallel
    const [group, members, policies, evals] = await Promise.all([
      caller.getGroup(groupId),
      caller.getGroupMembers(groupId),
      caller.getGroupPolicies(groupId),
      caller.getGroupEvaluations(groupId),
    ]);

    // Parallel: All run concurrently
    // Total time: max(t1, t2, t3, t4) (if each is 100ms = 100ms!)
    // 4x faster!

    return { group, members, policies, evals };
  });
```

---

## Gotcha 5: Redis Invalidation

### The Problem

```typescript
// ❌ WRONG: Policy snapshot never invalidated
export const editGroupPoliciesFn = createServerFn()
  .middleware(authGuard)
  .handler(async ({ context }) => {
    const { userId, realmId } = context;

    // Update policies in database
    await updateGroupPolicies(groupId, newPolicies);

    // But Redis still has old snapshot!
    // User continues using old policies for 1 hour (cache TTL)
    // Authorization checks fail silently
    // Result: User can't access resources they should (or can access they shouldn't)
  });
```

### The Right Way

```typescript
// ✅ CORRECT: Invalidate cache on change
export const editGroupPoliciesFn = createServerFn()
  .middleware(authGuard)
  .handler(async ({ context }) => {
    const { userId, realmId } = context;

    // Update policies in database
    await updateGroupPolicies(groupId, newPolicies);

    // Invalidate all affected users' policy snapshots
    const affectedUsers = await prisma.membership.findMany({
      where: { groupId },
      select: { userId: true },
    });

    // Delete old snapshots from Redis
    // Next time they make a request, new snapshot is generated
    await Promise.all(
      affectedUsers.map(u =>
        redis.del(`policy:${u.userId}:*`)  // All snapshots for user
      )
    );

    return { success: true };
  });

// Better: Use pub/sub to notify instances
export const publishPolicyInvalidation = (userId: string, realmId: string) => {
  // Broadcast to all servers
  redis.publish(`policy-invalidation:${userId}`, JSON.stringify({ realmId }));
};

// On each server:
redis.subscribe(`policy-invalidation:*`, (message) => {
  // Drop cache entry immediately
  const { userId, realmId } = JSON.parse(message);
  redis.del(`policy:${userId}:${realmId}`);
});
```

---

## Profiling Checklist

When performance is slow:

**Database**
- [ ] Run `EXPLAIN` on slow queries
- [ ] Check for missing indexes (WHERE clauses)
- [ ] Spot N+1 pattern (query count = result count + 1)
- [ ] Look for implicit joins without include/join

**Application**
- [ ] Enable Prisma query logging
- [ ] Profile with DevTools (Chrome)
- [ ] Measure database round-trip time
- [ ] Spot serial awaits (should be Promise.all)

**Redis**
- [ ] Check cache hit rate (`INFO stats`)
- [ ] Verify snapshot invalidation on updates
- [ ] Look for hot keys (one key accessed 1000x/sec)
- [ ] Check memory usage (growing unbounded = leak)

**Example Profile**
```bash
# Enable Prisma logging
export DEBUG=prisma:* npm run dev

# Watch queries scroll by
# If you see same query repeated 100 times → N+1
# If query takes 5s with 1000 users → missing index
```

