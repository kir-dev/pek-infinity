---
file: reference/00-request-flows.md
purpose: "Visual reference: request flows, auth flows, policy cascade, error handling paths"
triggers: ["understanding request lifecycle", "tracing bug through system", "architectural review"]
keywords: ["flow", "diagram", "sequence", "request", "auth", "policy", "cascade", "response"]
dependencies: ["architecture/01-auth-system.md", "architecture/02-service-patterns.md"]
urgency: "medium"
size: "1200 words"
sections: ["mvp-request-flow", "worker-instance-request-flow", "auth-flow", "policy-cascade-flow", "error-handling"]
status: "active"




---

# Reference: Request Flows & Diagrams

## MVP Request Flow (Single Hub Instance)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MVP REQUEST FLOW                                  │
│                 (Hub Instance, Single Realm)                       │
└─────────────────────────────────────────────────────────────────────┘

User Browser                 TanStack Start              Hub Backend
    │                              │                          │
    │  1. Click "View Groups"      │                          │
    ├─────────────────────────────>│                          │
    │                              │  2. Call serverFn        │
    │                              ├─────────────────────────>│
    │                              │  (getGroupsFn)           │
    │                              │                          │
    │                              │  3. authGuard middleware  │
    │                              │  - Verify JWT            │
    │                              │  - Check policy snapshot  │
    │                              │  - Extract context       │
    │                              │  {userId, realmId, ...}  │
    │                              │                          │
    │                              │  4. policyGuard          │
    │                              │  - Verify permission     │
    │                              │  (canViewGroups)         │
    │                              │                          │
    │                              │  5. Call tRPC procedure  │
    │                              │  (getGroupsProcedure)    │
    │                              │                          │
    │                              │  6. Service layer        │
    │                              │  await groupService      │
    │                              │    .findAll()            │
    │                              │                          │
    │                              │  7. Prisma query         │
    │                              ├────────────────────────>│
    │                              │  findMany({              │
    │                              │    where: {              │
    │                              │      realmId: 'hub'    │
    │                              │    }                     │
    │                              │  })                      │
    │                              │                          │
    │                              │ <────────────────────────┤
    │                              │  8. Database response    │
    │                              │  [groups...]             │
    │                              │                          │
    │                              │  9. Serialize response   │
    │ <─────────────────────────────│  JSON { data: [...] }   │
    │ 10. Render groups list       │                          │
    │                              │                          │

Legend:
- Middleware runs FIRST (auth, policy)
- Service layer (realm-agnostic, receives realm from context)
- Database query includes realmId filter
- Response serialized and sent to client
```

---

## Worker Request Flow (Multiple Instances)

```
┌─────────────────────────────────────────────────────────────────────┐
│              Worker REQUEST FLOW                                 │
│           (Hub BFF → Worker Instance)                          │
└─────────────────────────────────────────────────────────────────────┘

User Browser              Hub BFF              Worker Instance
    │                       │                          │
    │  1. Request group     │                          │
    ├──────────────────────>│                          │
    │                       │  2. authGuard           │
    │                       │  (validate hub JWT)   │
    │                       │                          │
    │                       │  3. Determine realm     │
    │                       │  (from policy snapshot) │
    │                       │  realm = 'ent-conf-25' │
    │                       │                          │
    │                       │  4. Fetch policy from   │
    │                       │  Redis cache            │
    │                       │  {policy, permissions}  │
    │                       │                          │
    │                       │  5. Call worker API │
    │                       ├─────────────────────────>│
    │                       │  tRPC getGroupsFn       │
    │                       │  + x-policy-hint header │
    │                       │  (cached permissions)   │
    │                       │                          │
    │                       │  6. Worker validates│
    │                       │  policy hint            │
    │                       │  (quick check)          │
    │                       │  realm = 'ent-conf-25' │
    │                       │                          │
    │                       │  7. Query worker DB │
    │                       │  where realmId =        │
    │                       │    'ent-conf-25'        │
    │                       │                          │
    │                       │ <─────────────────────────
    │                       │  8. Worker response │
    │                       │  {groups, metadata}     │
    │                       │                          │
    │  <──────────────────────                         │
    │  9. Hub combines    │                          │
    │  (federation view)    │                          │
    │  + other realms' data │                          │

Legend:
- Hub BFF acts as reverse proxy
- Policy snapshot cached in Redis
- Worker gets policy hint (optimization)
- Worker queries own realm
- Hub combines multiple realm responses for federated view
```

---

## Authentication Flow (Login & Policy Snapshot)

```
┌─────────────────────────────────────────────────────────────────────┐
│                   AUTH FLOW (Login)                                  │
│         JWT Generation → Policy Snapshot → Redis Cache              │
└─────────────────────────────────────────────────────────────────────┘

User Browser              AuthSCH OAuth       Hub Backend              Redis
    │                         │                    │                      │
    │  1. Login button        │                    │                      │
    ├────────────────────────>│                    │                      │
    │                         │  2. AuthSCH login  │                      │
    │                         │  (Google-like)     │                      │
    │                         │  │                 │                      │
    │                         └─>│ redirect        │                      │
    │ <────────────────────────────────────────────│                      │
    │  3. User logs in at AuthSCH, redirects back  │                      │
    │                                              │                      │
    ├──────────────────────────────────────────────>                      │
    │  4. Callback with authToken                 │                      │
    │                                              │                      │
    │                                 5. Generate  │                      │
    │                                 JWT with:    │                      │
    │                                 - userId     │                      │
    │                                 - realmId    │                      │
    │                                 - snapshotId │                      │
    │                                              │                      │
    │                                 6. Calculate│                      │
    │                                 policy       │                      │
    │                                 snapshot:    │                      │
    │                                 - all        │                      │
    │                                   policies   │                      │
    │                                 - statements │                      │
    │                                 - cascading  │                      │
    │                                              ├─────────────────────>│
    │                                              │ 7. Cache snapshot   │
    │                                              │ key: snapshotHash   │
    │                                              │ ttl: 3600 (1 hour)  │
    │ <──────────────────────────────────────────────                    │
    │  8. JWT token (snapshotHash inside)         │                      │
    │                                              │                      │
    │  9. Store in memory/secure cookie           │                      │
    │                                              │                      │
    │  10. Next request with Authorization header │                      │
    ├──────────────────────────────────────────────>                      │
    │  Bearer JWT                                  │                      │
    │                                              │                      │
    │                      11. authGuard middleware │                      │
    │                      - Verify JWT signature   │                      │
    │                      - Extract snapshotId    │                      │
    │                      - GET from Redis        │────────────────────>│
    │                      │                        │ 12. Fetch snapshot │
    │                      │ <──────────────────────                      │
    │                      │ 13. Return policies    │                      │
    │                      │                        │                      │
    │                      - Attach to context     │                      │
    │ <──────────────────────                       │                      │
    │  14. Response (with fresh data)              │                      │

Benefits:
- JWT small (snapshot hash, not full data)
- Redis cache hits 99% of time (1ms lookup)
- Policy snapshot calculated once per login
- Can invalidate individual snapshot if policies change
```

---

## Policy Cascade on Group Creation

```
┌─────────────────────────────────────────────────────────────────────┐
│           POLICY CASCADE FLOW (Group Creation)                       │
│    Parent Managers Get Escalation Statements                         │
└─────────────────────────────────────────────────────────────────────┘

Admin creates subgroup:
    │
    ├─ 1. POST /groups { name, parentId: 'parent-group' }
    │     authGuard ✓, policyGuard(canCreateGroup) ✓
    │
    ├─ 2. createGroupService.create()
    │
    ├─ 3. Validate parent exists & not archived ✓
    │
    ├─ 4. Create group in DB
    │     INSERT INTO groups (id, parentId, realmId)
    │     VALUES ('new-group', 'parent-group', 'realm1')
    │
    ├─ 5. Query parent's managers:
    │     SELECT DISTINCT u.id
    │     FROM users u
    │     JOIN memberships m ON m.userId = u.id
    │     JOIN policies p ON p.id = m.policyId
    │     WHERE m.groupId = 'parent-group'
    │       AND p.canManageGroup = true
    │     Result: [userId1, userId2, userId3]
    │
    ├─ 6. For each manager, add escalation statement:
    │     (Bulk insert for performance)
    │     INSERT INTO statements (policyId, canMoveGroup, escalatedFrom)
    │     VALUES
    │       (policy1, true, 'parent-group'),
    │       (policy2, true, 'parent-group'),
    │       (policy3, true, 'parent-group')
    │
    ├─ 7. Invalidate all manager policy snapshots:
    │     DEL policy:userId1:*, policy:userId2:*, policy:userId3:*
    │     (Redis: all keys matching pattern)
    │
    ├─ 8. Next time manager makes request:
    │     authGuard detects cache miss
    │     Recalculates policy snapshot (now includes canMoveGroup)
    │     Caches new snapshot for 1 hour
    │
    └─ Result: Parent managers can now moveGroupOwner without editMembers!

Time complexity:
- Get parent: O(1)
- Get managers: O(managers)
- Bulk insert: O(managers)
- Redis invalidate: O(managers)
- Total: O(n) where n = number of managers

Risk if done wrong:
- Missing realmId filter → data leakage
- Missing cache invalidation → stale permissions for 1 hour
- N+1 queries → timeout with large hierarchies
- Serial tRPC calls → slow cascade

Prevention:
✓ Composite key (groupId, realmId)
✓ Bulk insert (not loop + insert)
✓ Explicit Redis invalidation
✓ Parallel policy fetches (if needed)
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                   ERROR HANDLING FLOW                                │
│              Middleware Errors vs Handler Errors                     │
└─────────────────────────────────────────────────────────────────────┘

Request enters middleware chain:

   authGuard
      │
      ├─ No JWT?
      │  └─> throw AppError('Unauthorized', 401)
      │
      ├─ Invalid JWT?
      │  └─> throw AppError('Invalid token', 401)
      │
      ├─ JWT expired?
      │  └─> throw AppError('Token expired', 401)
      │
      └─ ✓ Valid JWT, extract context
            │
            └─> policyGuard(['canViewGroups'])
                   │
                   ├─ Policy snapshot missing?
                   │  └─> throw AppError('Policy check failed', 403)
                   │
                   ├─ User doesn't have permission?
                   │  └─> throw AppError('Insufficient permissions', 403)
                   │
                   └─ ✓ Permission granted
                         │
                         └─> Handler execution
                                │
                                ├─ Data not found?
                                │  └─> throw AppError('Group not found', 404)
                                │
                                ├─ Validation failed?
                                │  └─> throw AppError('Invalid input', 400)
                                │
                                ├─ Database error?
                                │  └─> throw AppError('Database error', 500)
                                │
                                └─ ✓ Success
                                      └─> return data

Response formatting:

Success (200):
{
  "data": { /* result */ },
  "meta": { "timestamp": "..." }
}

Client error (400, 401, 403, 404):
{
  "error": {
    "message": "Insufficient permissions",
    "code": "PERMISSION_DENIED",
    "status": 403
  }
}

Server error (500):
{
  "error": {
    "message": "Internal server error",
    "code": "INTERNAL_ERROR",
    "status": 500,
    "requestId": "req-xyz"  // for logging
  }
}

Key points:
- Middleware errors (401, 403) caught early, request never reaches handler
- Handler errors (400, 404, 500) caught, formatted consistently
- All errors logged with requestId for debugging
- No stack traces in response (security)
- Client receives structured error with actionable message
```

---

## Caching & Invalidation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│          CACHING & INVALIDATION FLOW                                 │
│         Policy Snapshots & Real-time Invalidation                    │
└─────────────────────────────────────────────────────────────────────┘

Policy Snapshot Lifecycle:

User logs in:
  │
  ├─ 1. Policy calculated (all permissions, cascading)
  ├─ 2. Hash policy snapshot
  ├─ 3. Store in Redis with 1-hour TTL
  └─ 4. JWT contains snapshot hash
       │
       ├─> Request 1: JWT valid, hash matches Redis
       │   └─> Hit: Use cached policy (1ms)
       │
       ├─> Request 2: JWT valid, hash matches Redis
       │   └─> Hit: Use cached policy (1ms)
       │
       └─> Request N: JWT valid, hash matches Redis
           └─> Hit: Use cached policy (1ms)

Policy changes (admin edits group policies):

  1. Admin: PATCH /groups/g1/policies { ... }
  
  2. policyService.update()
  
  3. Database updated
  
  4. Find all affected users:
     SELECT DISTINCT userId FROM memberships
     WHERE groupId = 'g1' OR groupId IN (
       SELECT id FROM groups WHERE parentId = 'g1'
     )
     Result: [userId1, userId2, ...]
  
  5. Invalidate snapshots:
     For each userId:
       DEL policy:${snapshotHash}:*
       (Pub/sub to other servers)
       PUBLISH policy-invalidation:${userId} 
         { realmId, timestamp }
  
  6. Next request from affected user:
     JWT has old snapshotHash
     Redis lookup: MISS (key deleted)
     Calculate new policy snapshot
     Store with new hash
     Update JWT (next response)
  
  7. All affected users now use new permissions

Real-time invalidation (pub/sub):

All servers subscribed to policy-invalidation channel:

Server 1:
  UPDATE policies SET ...
  PUBLISH policy-invalidation:user123

Server 2 (listening):
  On message:
    DELETE policy-user123 from local Redis
    Notify connected users: "please refresh"

Benefits:
- Users don't have to wait 1 hour for policy changes
- Changes propagate in <100ms across all servers
- Cache still hits 99% of time
- Clean separation of concerns
```
