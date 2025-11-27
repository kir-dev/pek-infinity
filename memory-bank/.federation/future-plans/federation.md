---
purpose: "Complete federation model - hub/worker relationships, realm concept, instance coordination, user profile management"
audience: "humans, future migration engineers"
status: "future"
timeline: "Year 2+ (multi-instance federation)"
keywords: ["federation", "hub", "worker", "realm", "instance", "coordination", "profiles"]
dependencies: ["future-plans/worker-instances.md", "future-plans/trpc.md"]
size: "comprehensive"
created: "2025-11-17"
---

# Federation Model: Hub + Worker Instances

## The Problem We're Solving

SchönHerz (and similar organizations) have a contradiction:
- **Need centralization**: Single identity system, unified user profiles, central auth
- **Need decentralization**: Departments/events need isolated deployments they control, with their own data

Monolithic SaaS doesn't work. Neither does fully federated (everyone managing their own instance).

We need a hybrid.

---

## Solution: Hub Instance + Worker Instances + BFF Router

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│              Unified Frontend (pek.com)             │
│          (TanStack Start, serverFn only)            │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │   BFF (Backend-for-Front)  │
        │  (Hub instance, routes)    │
        │                            │
        │  - Determines instances    │
        │  - Orchestrates calls      │
        │  - Combines responses      │
        └────────┬──────────┬────────┘
                 │          │
        ┌────────▼──┐   ┌───▼────────────┐
        │   Hub     │   │   Worker       │
        │ Instance  │   │   Instances    │
        │           │   │                │
        │ - Auth    │   │ - Per dept/    │
        │ - Profiles│   │   event        │
        │ - Central │   │ - Isolated     │
        │   data    │   │   data         │
        └───────────┘   └────────────────┘
```

---

## Key Concept: "Realm"

A **realm** is either hub or a worker instance. Each realm:
- Has unique ID (e.g., "hub", "worker-acme-corp", "worker-conference-2025")
- Has own database (or hub has master database with realm_id filtering)
- Owns certain data (groups, memberships, evaluations)
- Has isolation boundary (data in one realm doesn't leak to another)

**Realms are NOT federated automatically.** A user exists in hub's user table. They may have memberships in hub realm + worker realm A. Crossing realm boundaries requires explicit routing.

---

## What About User Profiles?

**Hub stores all user profiles.** Why?

- Users have ONE identity across federation
- Easier for users (don't manage separate profiles per instance)
- Central place for privacy settings
- Reduces data consistency problems

**But:** Users have different permissions per instance. User A sees User B's full profile in worker realm A, but only basic profile in hub realm (if policies don't grant access).

---

## Federation in Practice: Example Scenarios

### Scenario 1: User Alice logs into pek.com

1. Frontend redirects to AuthSCH (OAuth)
2. AuthSCH redirects back to hub with OAuth token
3. Hub creates/updates Alice's user profile (hub realm)
4. BFF checks: Does Alice have memberships in other instances?
   - Query: `SELECT instances FROM federation WHERE userId = alice`
   - Returns: [hub, worker-acme, worker-conference]
5. BFF caches this (Redis in worker, in-memory in MVP)
6. Alice is now logged in, can use full frontend

#### Federated Login Flow (Detailed)

```
1. Frontend redirects to AuthSCH (OAuth provider)
   GET https://auth.sch.bme.hu/oauth/...

2. AuthSCH redirects back to hub BFF with code
   GET https://pek.com/callback?code=xxx

3. BFF exchanges code for user info
   - Create/update User profile in hub database
   - Generate long-lived JWT (24h or configurable)
   - Set JWT as httpOnly cookie
   
4. BFF queries: "What instances does this user belong to?"
   - Call each instance's /auth/issue endpoint (or query federation table)
   - Each instance returns:
     {
       jwt: "short-lived JWT for this instance (5min)",
       policies: ["GOD in engineering", "Manager in ml-team"],
       statements: [
         { resource: "GROUP:engineering", canView: true, canEdit: true, ... },
         { resource: "GROUP:ml-team", canView: true, canEdit: false, ... }
       ]
     }
   
5. BFF caches in Redis (or in-memory for MVP)
   Key: "session:${globalJWT}" 
   Value: {
     userId: "alice",
     instances: {
       "hub": {
         jwt: "...",
         policies: [...],
         statements: [...]
       },
       "worker-acme": {
         jwt: "...",
         policies: [...],
         statements: [...]
       }
     }
   }

6. Frontend receives redirect to dashboard
   httpOnly cookie is set; frontend never sees JWT
```

#### Policy Snapshot Caching

**Cache Structure:**
```
Redis key: "pek:session:${globalJWT}:${instanceId}"
Redis value: {
  userId: "alice",
  policies: ["GOD in engineering", "Manager"],
  statements: [...],
  expiresAt: 1700000900,
  refreshedAt: 1700000100
}
TTL: 5 minutes (or custom per instance)
```

**Cache Refresh Trigger:**
1. **On expiry**: Snapshot expires, next request calls `/auth/issue` again
2. **On logout**: Clear all keys for this user
3. **On policy change** (optional): Webhook from instance invalidates cache (but eventual consistency is acceptable)

### Scenario 2: Alice searches for groups

1. Frontend calls `searchGroups("engineering")`
2. BFF routes to all instances Alice has access to (hub, worker-acme, worker-conference)
3. Each instance searches its own database, filters by Alice's permissions
4. BFF combines results:
   - Hub: 2 groups (Alice is member)
   - Worker-acme: 5 groups (Alice can view)
   - Worker-conference: 0 groups (Alice not member)
5. Frontend shows combined 7 groups

### Scenario 3: Alice edits a group in worker-acme

1. Frontend calls `updateGroup(id, data)`
2. BFF determines instance (worker-acme)
3. BFF calls worker-acme's tRPC endpoint with Alice's JWT
4. Worker-acme validates JWT (trusts hub)
5. Worker-acme checks Alice's permissions (is she GOD on this group?)
6. If yes, update; if no, return 403
7. Response returned to frontend

---

## Common Gotchas

### ❌ Gotcha 1: Frontend calls instances directly
- **Wrong**: Frontend has URL to worker1.pek.com, calls REST API
- **Right**: Frontend always calls BFF; BFF routes to instances

### ❌ Gotcha 2: Services know which realm they're in
- **Wrong**: `GroupService.findMany(realm: 'worker-acme')`
- **Right**: Services don't know realm; BFF handles realm routing

### ❌ Gotcha 3: Data from one realm visible in another
- **Wrong**: Query returns groups from all realms
- **Right**: Every query filters by realmId

### ❌ Gotcha 4: User profiles scattered across instances
- **Wrong**: Worker-acme stores Alice's profile in their database
- **Right**: Only hub stores user profiles; instances only store group/membership data

---

## Instance Discovery & Registration

### Instance Registry

Central place to track all deployed instances:

```typescript
interface InstanceRegistry {
  id: string;              // 'worker-acme'
  url: string;             // 'https://worker-acme.pek.com'
  realm: string;           // 'worker-acme'
  status: 'active' | 'maintenance' | 'down';
  healthCheckUrl: string;
  version: string;
  deployedAt: Date;
  capabilities: string[];  // ['groups', 'evaluations', 'memberships']
}
```

### User → Instance Mapping (Federation Table)

Tracks which users have access to which instances:

```typescript
interface UserRealm {
  userId: string;
  realmId: string;
  roles: string[];          // ['member', 'admin']
  joinedAt: Date;
  lastAccessedAt: Date;
}
```

**Query pattern:**
```sql
-- Get all instances for user
SELECT realmId FROM user_realms WHERE userId = 'alice'

-- Get all users in instance
SELECT userId FROM user_realms WHERE realmId = 'worker-acme'
```

---

## Feature Flags for Federation

Control rollout and behavior:

```typescript
interface FeatureFlags {
  ENABLE_MULTI_INSTANCE: boolean;      // Enable worker routing
  ENABLE_TRPC_FEDERATION: boolean;     // Use tRPC for remote calls
  ENABLE_REDIS_CACHE: boolean;         // Cache instance discovery
  ENABLE_POLICY_SNAPSHOTS: boolean;    // Cache policies in Redis
  MAX_INSTANCES_PER_USER: number;      // Limit for performance
  REQUEST_TIMEOUT_MS: number;          // Per-instance timeout
  RETRY_ATTEMPTS: number;              // Retry failed instance calls
}
```

**Usage in code:**

```typescript
if (featureFlags.ENABLE_MULTI_INSTANCE) {
  // Route to multiple instances
  instances = await instanceRouter.getInstancesForUser(user);
} else {
  // MVP: Only hub
  instances = ['hub'];
}
```

---

## Migration Path: MVP → Worker

### No Breaking Changes

```
MVP serverFn:
.middleware([jwtGuard, authGuard(['GROUP_VIEW'])])
.handler(async ({ context: { injector } }) => {
  const svc = injector.resolve(GroupService);
  return svc.findOne(id);
})

Worker serverFn (same code, different middleware):
.middleware([jwtGuard, routingMiddleware(procedure)])
.handler(async ({ context: { responses } }) => {
  return responses.successResponses[0]?.data;
})

Service:
async findOne(id: string) { ... }  // ← UNCHANGED
```

### What Changes

| Component | MVP | Worker | Effort |
|-----------|-----|-----------|--------|
| Middleware | jwtGuard + authGuard | jwtGuard + routingMiddleware | Medium |
| Handler | Local service call | Response combining | Low |
| Service | N/A | N/A | None |
| Database | realmId filtering | realmId filtering | None |
| Schema | Same | Same | None |

---

## Rollback Plan

**If worker rollout goes wrong:**

1. Keep MVP running (it's unchanged)
2. Disable worker instances
3. Route users back to MVP
4. Debug worker layer
5. Re-enable when fixed

No data loss, no breaking changes.

---

## Security Considerations

### Inter-Instance Authentication

**Challenge**: Worker instances must trust hub's JWT, but verify it's valid.

**Solution**: Shared secret or public key verification

```typescript
// Worker instance validates JWT from hub
export const validateHubJWT = (jwt: string) => {
  const decoded = verify(jwt, HUB_PUBLIC_KEY);
  
  if (decoded.issuer !== 'hub.pek.com') {
    throw new Error('Invalid issuer');
  }
  
  return decoded;
};
```

### Data Leakage Prevention

**Rule**: Each instance ONLY returns data from its own realm.

```typescript
// ✅ CORRECT: Filter by realmId
const groups = await prisma.group.findMany({
  where: {
    realmId: CURRENT_REALM_ID,  // Enforced at query level
    // ... other filters
  }
});

// ❌ WRONG: No realm filter
const groups = await prisma.group.findMany({
  where: {
    // ... filters
    // Missing realmId! Could leak data from other instances
  }
});
```

### Instance Impersonation

**Challenge**: Malicious actor tries to impersonate an instance.

**Mitigation**: Instance registry with TLS certificates

```typescript
// BFF verifies instance identity
export const verifyInstanceIdentity = (instance: Instance) => {
  const registryEntry = instanceRegistry.get(instance.id);
  
  if (!registryEntry) {
    throw new Error('Instance not registered');
  }
  
  if (instance.url !== registryEntry.url) {
    throw new Error('URL mismatch');
  }
  
  // Verify TLS certificate matches registry
  // ...
};
```

---

## Monitoring & Observability

### Key Metrics

```typescript
interface FederationMetrics {
  // Per-instance
  instanceHealth: Record<string, 'up' | 'down' | 'degraded'>;
  instanceLatency: Record<string, number>;  // p50, p95, p99
  instanceErrorRate: Record<string, number>;
  
  // Cross-instance
  multiInstanceRequestRate: number;
  averageInstancesPerRequest: number;
  partialFailureRate: number;
  
  // Caching
  cacheHitRate: number;
  cacheMissRate: number;
}
```

### Logging Pattern

```typescript
logger.info('Multi-instance request', {
  userId: user.id,
  operation: 'searchGroups',
  instances: ['hub', 'worker-acme'],
  results: {
    hub: { success: true, count: 2, latency: 45 },
    'worker-acme': { success: true, count: 5, latency: 120 }
  },
  totalLatency: 150,
  combinedCount: 7
});
```

---

## Performance Optimization

### Parallel Calls

Call all instances simultaneously, don't wait serially:

```typescript
// ✅ CORRECT: Parallel
const results = await Promise.allSettled(
  instances.map(instance => worker(instance, { data, context }))
);

// ❌ WRONG: Serial (slow!)
const results = [];
for (const instance of instances) {
  results.push(await worker(instance, { data, context }));
}
```

### Smart Routing

Don't call instances that can't have relevant data:

```typescript
// Example: Getting a specific group by ID
// Group ID encodes realm: `group_hub_xyz` or `group_worker-acme_xyz`

const realmId = extractRealmFromId(groupId);
const relevantInstances = instances.filter(i => i.realmId === realmId);

// Only call 1 instance instead of all 3
```

### Connection Pooling

Reuse HTTP connections to instances:

```typescript
const instanceClients = new Map<string, TRPCClient>();

const getClient = (instance: Instance) => {
  if (!instanceClients.has(instance.id)) {
    instanceClients.set(instance.id, createTRPCClient({
      url: instance.url,
      keepAlive: true,
      maxSockets: 50
    }));
  }
  return instanceClients.get(instance.id);
};
```

---

## Checklist: Worker Federation Ready

- [ ] Instance registry implemented
- [ ] User → realm mapping (federation table)
- [ ] Feature flags for gradual rollout
- [ ] JWT validation across instances
- [ ] Realm filtering enforced in all queries
- [ ] Response aggregation strategies defined
- [ ] Timeout & retry logic implemented
- [ ] Monitoring/logging for cross-instance calls
- [ ] Security review completed
- [ ] Performance benchmarks met
- [ ] Rollback plan documented and tested

---

**Created**: 2025-11-17 (for future multi-instance federation)
