---
file: architecture/01-auth-system.md
purpose: "Complete JWT flow, policy snapshots, Redis caching strategy; how MVP and worker-instance auth differs"
triggers: ["implementing auth", "designing login flow", "debugging permissions", "scaling to worker-instance"]
keywords: ["JWT", "auth", "policy", "snapshot", "caching", "x-policy-hint", "redis", "mfa", "oauth"]
dependencies: ["architecture/00-federation-model.md", "database/01-policy-system.md"]
urgency: "critical"
size: "2500 words"
status: "active"
created: "2025-10-20"
updated: "2025-10-20"




---

# Auth System: JWT, Policy Snapshots, Caching

## Overview

Authentication in pek-infinity works in layers:

1. **Global JWT**: httpOnly cookie, issued by hub on login, valid everywhere
2. **Policy Snapshot**: Cached list of user's permissions per instance
3. **x-policy-hint header**: Optimization hint when calling instance APIs
4. **Auth Guard**: Per-instance validation against policies

This design allows:
- **MVP**: Fast, simple, all local
- **Worker**: Scales to multiple instances with minimal auth overhead

## Step 1: Login Flow

### User initiates login

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

### MVP Login (Single Instance)

```
1. Frontend → AuthSCH → Callback to hub
2. Hub validates code, creates user profile
3. Hub generates JWT (not short-lived yet)
4. Hub SKIPS calling other instances (doesn't exist)
5. JWT cached in-memory or Redis
6. Frontend redirected to dashboard
```

**Key**: Same code path. In MVP, the "query other instances" step finds zero instances.

## Step 2: Request Routing with Policy Hints

### User makes API request

```
1. Frontend calls serverFn: getGroup({ id: "abc" })
   - Global JWT is in httpOnly cookie (automatic)

2. BFF receives request
   - jwtGuard extracts JWT from cookie
   - routingMiddleware checks cache:
     cache["session:${jwt}"] → Get list of instances
   
   If cache expired:
     - Call each instance's /auth/issue again (refresh)
     - Update cache
   
3. For each instance:
   - BFF needs to call instance.getGroup({ id: "abc" })
   - BFF looks up instance JWT from cache: "worker-acme:jwt"
   - BFF gets policy hints from cache: ["GOD in engineering"]
   - BFF calls instance API with:
     {
       jwt: "short-lived instance JWT",
       x-policy-hint: "GOD in engineering"
     }

4. Instance receives request
   - Auth guard validates JWT
   - Auth guard uses x-policy-hint to optimize:
     SELECT statements FROM policies WHERE name IN ('GOD in engineering')
     ↓ (faster than full policy lookup)
   - Auth guard checks: Does 'GOD in engineering' grant access to GROUP:abc?
   - If yes, call service; if no, return 403

5. BFF combines responses
   - Collects results: [success from worker-acme, 403 from worker-conference]
   - Returns first successful result (or error if all fail)

6. Frontend receives response
```

### MVP Request (Single Instance)

```
1. Frontend calls serverFn with JWT
2. BFF jwtGuard extracts JWT
3. routingMiddleware finds zero other instances (only hub)
4. BFF calls local service (no network, DI injection)
5. Service queries local Prisma database
6. Response returned
```

**Key**: Same middleware stack. Worker just has network calls; MVP has DI calls.

## Step 3: Policy Snapshot Details

### What's in a policy snapshot?

```typescript
interface PolicySnapshot {
  userId: string;
  instanceId: string;
  policies: string[];  // ["GOD in engineering", "Manager in ml-team"]
  statements: Statement[];
  expiresAt: Date;
  issuedAt: Date;
}

interface Statement {
  policyName: string;
  resource: string;  // "GROUP:engineering", "USER:alice"
  permissions: {
    viewMembers: boolean;
    editMembers: boolean;
    viewGroup: boolean;
    editGroupProfile: boolean;
    moveGroupOwner: boolean;
    viewScores: boolean;
    editScores: boolean;
    evaluateScores: boolean;
    viewBasicProfile: boolean;
    viewFullProfile: boolean;
    editProfile: boolean;
  }
}
```

### Why snapshots?

1. **Performance**: Auth checks are O(1) hash lookup instead of database query
2. **Simplicity**: BFF doesn't need to understand each instance's permission model
3. **Delegation**: Instance issues snapshot; instance validates signature later
4. **Eventual consistency**: Policy changes take effect on snapshot expiry (acceptable)

## Step 4: MVP vs Worker Differences

### Cache Location

| Aspect | MVP | Worker |
|--------|-----|-----------|
| Cache backend | In-memory (Node.js) | Redis (shared across BFF instances) |
| Cache key | `session:${jwt}` | `session:${jwt}` (same) |
| TTL | JWT lifetime (24h) | Snapshot lifetime (5min) + JWT (24h) |

### Instance Calls

| Aspect | MVP | Worker |
|--------|-----|-----------|
| How BFF calls instance | DI injection to local service | tRPC HTTP call |
| x-policy-hint sent? | No (local call) | Yes (optimization) |
| Error handling | Service throws | HTTP error response |
| Network overhead | None | ~10-50ms per call |

### Auth Guard Behavior

| Aspect | MVP | Worker |
|--------|-----|-----------|
| Where it runs | BFF middleware | Instance middleware + BFF |
| JWT validation | Local secret | Shared secret (BFF public key) |
| Policy validation | Local database query | Snapshot + hint lookup |

## Step 5: Redis Caching Strategy (Worker)

### Cache Structure

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

### Cache Refresh Trigger

1. **On expiry**: Snapshot expires, next request calls `/auth/issue` again
2. **On logout**: Clear all keys for this user
3. **On policy change** (optional): Webhook from instance invalidates cache (but eventual consistency is acceptable)

### Multi-Instance Coordination

```
User logs in:
1. Hub generates global JWT
2. BFF calls all instances in parallel:
   - Instance A: /auth/issue → returns snapshot A
   - Instance B: /auth/issue → returns snapshot B
3. BFF caches both:
   - "pek:session:${jwt}:hub" → snapshot for hub
   - "pek:session:${jwt}:worker-acme" → snapshot for worker-acme
4. User makes request to both instances:
   - Redis fetch: ~1ms per snapshot
   - No /auth/issue call needed until expiry
```

## Common Auth Flows: Examples

### Example 1: View a Group (Permission Granted)

```
Request: getGroup({ id: "engineering" })
BFF Flow:
  1. jwtGuard: ✅ JWT valid
  2. routingMiddleware: Find worker-acme has this group
  3. Fetch cache: policies = ["Manager in ml-team"]
  4. Call worker-acme with hint: x-policy-hint: Manager in ml-team
Instance Flow:
  5. Auth guard: ✅ JWT signed by BFF, valid
  6. Parse hint: Manager in ml-team
  7. Query: SELECT permissions WHERE policy="Manager in ml-team" AND resource="GROUP:engineering"
  8. ✅ viewGroup = true
  9. Service: getGroup("engineering")
  10. Return group data
Response:
  ✅ Frontend shows group
```

### Example 2: Edit a Group (Permission Denied)

```
Request: updateGroup({ id: "conference", data: {...} })
BFF Flow:
  1. jwtGuard: ✅ JWT valid
  2. routingMiddleware: Find worker-conference has this group
  3. Fetch cache: policies = ["Participant"]
  4. Call worker-conference with hint: x-policy-hint: Participant
Instance Flow:
  5. Auth guard: ✅ JWT valid
  6. Parse hint: Participant
  7. Query: SELECT permissions WHERE policy="Participant" AND resource="GROUP:conference"
  8. ❌ editGroupProfile = false
  9. Return 403 Forbidden
Response:
  ❌ Frontend shows "You don't have permission"
```

### Example 3: Cross-Realm Search (Partial Results)

```
Request: searchGroups("engineering")
BFF Flow:
  1. jwtGuard: ✅ JWT valid
  2. routingMiddleware: User has access to [hub, worker-acme, worker-conference]
  3. Call all three in parallel with hints
Responses:
  - hub: [Group1, Group2] (user can view)
  - worker-acme: [Group3, Group4, Group5] (user can view)
  - worker-conference: [] (user has no groups)
  - [error: 403] from some other instance (user not member)
BFF Combining:
  4. Filter successful responses: [Group1, Group2, Group3, Group4, Group5]
  5. Return combined list
Frontend:
  ✅ Shows 5 groups
```

## Gotchas & Common Mistakes

### ❌ Gotcha 1: Auth in Handler, Not Middleware

**Wrong:**
```typescript
.handler(async ({ data, context: { user } }) => {
  if (!user.hasPermission('GROUP_VIEW')) {  // ❌ Too late!
    throw new Error('Forbidden');
  }
  return service.getGroup(data.id);
});
```

**Right:**
```typescript
.middleware([authGuard(['GROUP_VIEW'])])  // ✅ Checks before handler
.handler(async ({ data, context: { user } }) => {
  // Permission already validated
  return service.getGroup(data.id);
});
```

**Why**: If auth is in handler, a bug could skip the check. Middleware is always executed.

### ❌ Gotcha 2: Cache Stale After Policy Change

**Problem**: Admin adds user to a group. User's cached policy doesn't include new group until snapshot expires.

**Acceptable?** Yes. 5-minute eventual consistency is fine for most cases.

**If you need immediate effect**: Implement webhook—instance notifies BFF of policy changes, BFF clears cache entry.

### ❌ Gotcha 3: x-policy-hint Bypass

**Not a real issue, but commonly misunderstood:**
- Hint is just a performance optimization
- Instance still validates JWT
- Instance still checks permissions (hint doesn't grant, only hints)
- If BFF sends false hint, instance returns 403 (user doesn't actually have policy)

## Testing Auth

### Unit Test: Auth Guard

```typescript
describe('AuthGuard', () => {
  it('should reject missing JWT', async () => {
    const request = { headers: {} };
    expect(() => authGuard()(request)).toThrow('Unauthorized');
  });

  it('should accept valid JWT', async () => {
    const jwt = generateTestJWT({ userId: 'alice' });
    const request = { headers: { authorization: `Bearer ${jwt}` } };
    expect(authGuard()(request)).toBeDefined();
  });
});
```

### Integration Test: Permission Check

```typescript
describe('Group permissions', () => {
  it('should allow GOD to edit group', async () => {
    const user = createUserWithPolicy('GOD in engineering');
    const result = await updateGroup(user, 'engineering', {...});
    expect(result).toBeDefined();
  });

  it('should deny non-GOD from editing group', async () => {
    const user = createUserWithPolicy('Member');
    expect(() => updateGroup(user, 'engineering', {...})).toThrow(403);
  });
});
```

## Next Steps

- `architecture/03-middleware-layering.md` - How auth middleware stacks
- `database/01-policy-system.md` - Policy model details
- `rules/01-auth-enforcement.md` - Where auth checks must happen
- `implementation/03-auth-guards.md` - How to implement auth middleware

---

**Last updated**: 2025-10-20
