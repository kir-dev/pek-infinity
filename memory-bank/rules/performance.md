---
purpose: "MUST: Prevent N+1, cascading queries, and serial awaits. Performance is a feature."
triggers: ["code review", "database design", "implementing list endpoint", "policy logic"]
keywords: ["performance", "N+1", "query", "cascade", "optimization", "redis", "caching"]
importance: "critical"
size: "1500 words"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Rule: Performance First (N+1, Cascading, Caching)

## The Rule (Absolute)

**Performance is not an afterthought. You MUST avoid N+1 queries, cascading writes, and serial awaits.**

## 1. N+1 Queries (Nested Loads)

**Problem:** Loading a list of items, then fetching related data for *each* item in a loop.
**Result:** 100 items = 101 database queries.

```typescript
// ❌ SLOW: N+1 query pattern
const group = await prisma.group.findUnique({ where: { id } });
const memberships = await prisma.membership.findMany({ where: { groupId: id } });

// Query inside loop!
const members = await Promise.all(
  memberships.map(m => prisma.user.findUnique({ where: { id: m.userId } }))
);
```

**✅ Solution: Use `include` or `select` (Joins)**

```typescript
// ✅ FAST: Single query with join
const group = await prisma.group.findUnique({
  where: { id },
  include: {
    memberships: {
      include: { user: true } // Join user table
    }
  }
});
```

## 2. Cascading Queries (Policy Escalation)

**Problem:** Triggering individual writes for every child item when a parent changes.
**Result:** Creating a group triggers 500 individual policy updates. O(n²) complexity.

```typescript
// ❌ SLOW: Loop and create
for (const manager of parentManagers) {
  await prisma.policyAssignment.create({ ... });
}
```

**✅ Solution: Batch Operations (`createMany`)**

```typescript
// ✅ FAST: Single batch insert
await prisma.policyAssignment.createMany({
  data: parentManagers.map(m => ({ ... }))
});
```

## 3. Serial Awaits

**Problem:** Awaiting independent async operations one by one.
**Result:** Total time = sum of all durations.

```typescript
// ❌ SLOW: Serial execution
const group = await getGroup(id);
const policies = await getPolicies(id); // Waits for group
const stats = await getStats(id);       // Waits for policies
```

**✅ Solution: `Promise.all`**

```typescript
// ✅ FAST: Parallel execution
const [group, policies, stats] = await Promise.all([
  getGroup(id),
  getPolicies(id),
  getStats(id)
]);
```

## 4. Policy Snapshot Bloat

**Problem:** Storing full policy tree in JWT.
**Result:** 60KB headers, rejected requests, massive bandwidth usage.

**✅ Solution: Store Hash in JWT, Snapshot in Redis**
- JWT: `{ userId: 'u1', snapshotHash: 'abc123...' }`
- Redis: `policy:abc123...` -> Full JSON
- Middleware fetches from Redis (1ms).

## 5. Redis Invalidation

**Problem:** Updating DB but not clearing cache.
**Result:** User sees old permissions for 1 hour.

**✅ Solution: Invalidate on Write**
- When updating policies, calculate affected users.
- `redis.del(\`policy:${userId}:*\`)`
- Use Pub/Sub for multi-instance invalidation.
