---
purpose: "Complete worker instance architecture - routing, aggregation, BFF pattern, instance coordination, partial failures"
audience: "humans, future migration engineers"
status: "future"
timeline: "Year 2+ (multi-instance federation)"
keywords: ["worker", "instance", "routing", "aggregation", "BFF", "federation", "multi-instance", "partial-failure"]
dependencies: ["future-plans/federation.md", "future-plans/trpc.md"]
size: "comprehensive"
created: "2025-11-17"
---

# Worker Instances: Multi-Instance Architecture

## Overview

**Status: Year 2+ (Multi-Instance Federation)**

This document contains complete patterns for **future multi-instance deployment**. **MVP uses single hub instance only.**

Worker instances enable departments/events to have isolated deployments they control, while sharing central auth and user profiles.

---

## The Three Tiers

### 1. Hub Instance (BFF + Central Authority)

**Responsibilities:**
- Single source of user authentication (AuthSCH OAuth)
- User profile storage (single profile per user, globally)
- Basic profile data visible across federation
- Central policy/permissions management
- **Frontend routing (determines where to send requests)**
- **Response aggregation (combines results from multiple instances)**

**What it does NOT do:**
- Store detailed data (groups, memberships, evaluations)
- Enforce instance-specific policies (each instance does its own)
- Know about internal structures of worker instances

**Tech:** Same as worker (NestJS + Prisma), but runs as the BFF layer

### 2. Worker Instances (Per Department/Event)

**Responsibilities:**
- Manage their own groups, memberships, evaluations
- Validate user permissions against their own policies
- Store isolated data (no leakage to other instances)
- Provide tRPC endpoints for BFF to call
- Run the same Docker image as hub (feature flags determine behavior)

**What they do NOT do:**
- Manage user authentication (hub does via BFF)
- Know about other instances
- Store user profiles (hub is authority)

**Setup:**
- Each instance gets unique database
- Each instance knows its own realm ID
- Each instance has its own auth provider (can be Okta, Azure AD, custom, etc.)

### 3. Frontend (Unified)

**One website (pek.com)**, not worker1.pek.com, worker2.pek.com, etc.

**Client only calls BFF via serverFn**, never directly to instances. BFF transparently routes and combines.

---

## Communication Flow: MVP vs Worker

### MVP (Single Hub Instance)

```
Client serverFn call
  ↓
BFF (hub)
  ├─ jwtGuard: Validate JWT
  ├─ Routing: Determine instance (only hub exists)
  ├─ Call local service (no network call, DI injection)
  ├─ Service queries Prisma (hub database)
  └─ Return result
  ↓
Client receives response
```

**Key point:** No remote calls. Everything is local. Same code, simpler execution.

### Worker (Multiple Instances)

```
Client serverFn call
  ↓
BFF (hub)
  ├─ jwtGuard: Validate JWT
  ├─ Routing: Determine instances (hub + worker1 + worker2)
  ├─ For each instance:
  │   ├─ Make tRPC call to instance
  │   ├─ Instance validates JWT (knows BFF is trusted)
  │   ├─ Instance queries own database
  │   └─ Return result
  ├─ Combine responses (filter, merge, etc.)
  └─ Return combined result
  ↓
Client receives response
```

**Key point:** Same serverFn code. Only BFF's routing middleware changes.

## Request Routing with Policy Hints

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

## Worker Middleware Stack

### Multiple Instances, tRPC Routing

```
Request comes in
  ↓
1️⃣ jwtGuard (same as MVP)
   └─ Extract JWT from httpOnly cookie
   └─ Validate JWT signature
   └─ Decode JWT → user info
   └─ Inject user into context
  ↓
2️⃣ routingMiddleware (NEW for worker)
   └─ Determine which instances user has access to
   └─ For each instance:
   │   ├─ Fetch instance JWT from cache (or refresh)
   │   ├─ Call worker function (e.g., tRPC procedure)
   │   ├─ Worker calls: authGuard → service (on remote instance)
   │   └─ Collect response (success or error)
   └─ Categorize responses:
       ├─ allResponses (everything)
       ├─ successResponses (✅ worked)
       ├─ unauthResponses (403 Forbidden)
       └─ errorResponses (❌ failed)
  ↓
Handler
  └─ Receives categorized responses
  └─ Combines/filters results
  └─ Return combined result
```

### Worker Stack Code

```typescript
export const getGroupFn = createServerFn({ method: 'GET' })
  .inputValidator(GroupFindSchema)
  .middleware([
    jwtGuard(),           // 1. Validate JWT
    routingMiddleware(    // 2. Route to instances
      async (instance, { data, context }) => {
        // Worker: Calls tRPC procedure on instance
        // Instance internally runs: authGuard → service
        return instance.trpc.group.findOne.query(data);
      },
      instanceRouter
    ),
  ])
  .handler(async ({ data, context: { responses } }) => {
    // 3. Handler combines results
    return responses.successResponses[0]?.data;
  });
```

### routingMiddleware (Worker)

**Runs in:** Worker only

**Responsibilities:**
- Get instances user has access to
- Call worker for each instance
- Collect and categorize responses
- Handle partial failures gracefully

**Does NOT:**
- Check permissions (instances do)
- Know business logic (worker does)
- Modify response data (handler does)

**Code:**
```typescript
export const routingMiddleware = <T>(
  worker: (instance: Instance, params: any) => Promise<T>,
  instanceRouter: InstanceRouter
) => async (req, context) => {
  const instances = await instanceRouter.getInstancesForUser(context.user);
  
  const results = {
    allResponses: [],
    successResponses: [],
    unauthResponses: [],
    errorResponses: [],
  };
  
  await Promise.all(
    instances.map(async (instance) => {
      try {
        const response = await worker(instance, { 
          data: req.data, 
          context 
        });
        results.allResponses.push({ instance: instance.id, data: response });
        results.successResponses.push({ instance: instance.id, data: response });
      } catch (error) {
        results.allResponses.push({ instance: instance.id, error });
        
        if (error.status === 403) {
          results.unauthResponses.push({ instance: instance.id, error });
        } else {
          results.errorResponses.push({ instance: instance.id, error });
        }
      }
    })
  );
  
  context.responses = results;
};
```

## Service Injection & tRPC Patterns

### Worker: Service Injection + tRPC

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

**How realm filtering works in worker:**
1. Routing middleware calls remote instance
2. Remote instance's Prisma client is scoped to its realm
3. Service queries with scoped Prisma
4. Result: Realm isolation across instances

## Routing & Aggregation

**serverFn** (in worker instance) is the BFF. Its job:
1. **Route**: Determine which instances to call
2. **Call**: Execute worker on each instance (via tRPC or DI)
3. **Combine**: Aggregate results into meaningful response

### Stage 1: Routing (Determine Instances)

```typescript
// Get instances for this user
const instances = await instanceRouter.getInstancesForUser(context.user);
// Returns: ['hub', 'worker-acme', 'worker-conf']

// Filter by task
const relevantInstances = instances.filter(instance => 
  canAccessResource(instance, requiredScope)
);
```

**Instance Discovery Options:**

```
Option A: Federation Table (Recommended)
  Instance: user_realm mapping
  └─ Query: SELECT instance FROM user_realms WHERE userId = user
  └─ Result: ['hub', 'worker-acme']

Option B: Policy Snapshot Cache (Worker Only)
  Already cached from login
  └─ Redis: session:${jwt} → { instances: [...] }
  └─ No query needed (instant)

Option C: Instance Registry (Static)
  Hardcoded or env var: ALL_INSTANCES = ['hub', 'worker-acme', ...]
  └─ Try all; let each instance return 403 if user not member
  └─ Simplest but slower
```

**MVP uses Option C** (only one instance). **Worker instance should use Option B** (cache from login).

### Stage 2: Call Worker

Worker is a function that calls the actual business logic:

```typescript
type Worker<T> = (
  instance: Instance,
  params: { data: RequestData; context: any }
) => Promise<T>;
```

**Worker Examples:**

#### Direct Service Call (MVP)

```typescript
const getGroupWorker = async (instance, { data, context }) => {
  // MVP: instance is undefined (local)
  const groupService = context.injector.resolve(GroupService);
  return groupService.findOne(data.id);
};
```

#### tRPC Remote Call (Worker Instance)

```typescript
const getGroupWorker = async (instance, { data, context }) => {
  // Worker Instance: instance is remote
  const client = getTRPCClientForInstance(instance, context.jwt);
  return client.group.findOne.query({ id: data.id });
};
```

#### tRPC Procedure (Reusable)

```typescript
// Procedure is just typed business logic
export const groupProcedures = {
  findOne: procedure
    .input(z.object({ id: z.string() }))
    .middleware([authGuard(['GROUP_VIEW'])])
    .query(async ({ input, ctx: { groupService } }) => {
      return groupService.findOne(input.id);
    }),
};

// Worker can call procedure directly (MVP) or via tRPC (worker instance)
const getGroupWorker = async (instance, { data, context }) => {
  if (instance === undefined) {
    // MVP: call procedure directly
    return groupProcedures.findOne.query({
      input: data,
      ctx: { groupService: context.groupService }
    });
  } else {
    // Worker instance: call via tRPC
    return instance.trpc.group.findOne.query(data);
  }
};
```

### Stage 3: Combine Responses

**Response Categorization:**

```typescript
const responses = {
  allResponses: Response[],          // Everything (success + error)
  successResponses: SuccessResponse[], // ✅ Worked
  unauthResponses: ErrorResponse[],   // 403 Forbidden
  errorResponses: ErrorResponse[],    // ❌ Other errors
};
```

**Combination Strategies:**

#### Strategy 1: Return First Success

**Use case**: Single resource (get group, update profile)

```typescript
.handler(async ({ data, context: { responses } }) => {
  if (responses.successResponses.length > 0) {
    return responses.successResponses[0].data;
  }
  
  if (responses.unauthResponses.length > 0) {
    throw new ForbiddenError('Access denied on all instances');
  }
  
  throw new Error('Failed to fetch from any instance');
});
```

#### Strategy 2: Merge All Successes

**Use case**: Search (aggregate from all instances)

```typescript
.handler(async ({ data, context: { responses } }) => {
  const results = responses.successResponses.flatMap(r => r.data);
  
  if (results.length === 0 && responses.allResponses.length > 0) {
    throw new Error('No results and errors occurred');
  }
  
  return results;
});
```

#### Strategy 3: Require All or Fail

**Use case**: User profile (critical data must come from hub)

```typescript
.handler(async ({ data, context: { responses } }) => {
  const hubResponse = responses.successResponses
    .find(r => r.instance === 'hub');

  if (!hubResponse) {
    throw new Error('Hub instance required');
  }

  return hubResponse.data;
});
```

#### Strategy 4: Partial Failure OK

**Use case**: Dashboard (show what we can, warn about unavailable instances)

```typescript
.handler(async ({ data, context: { responses } }) => {
  return {
    data: responses.successResponses.map(r => r.data).flat(),
    warnings: responses.errorResponses.map(r => 
      `${r.instance} unavailable: ${r.error.message}`
    ),
    unavailableInstances: responses.errorResponses.map(r => r.instance),
  };
});
```

---

## Example: Search Groups

### Detailed Flow

```
User searches: searchGroups("engineering")
  ↓
serverFn receives request
  ├─ jwtGuard: ✅ JWT valid
  └─ routingMiddleware executes:
      ├─ instanceRouter.getInstancesForUser()
      │  └─ Returns: [hub, worker-acme]
      │
      ├─ Call worker on hub:
      │  ├─ Hub auth guard: ✅ User has permission
      │  ├─ Hub service: Find groups matching "engineering"
      │  └─ Success: [Group1 {name: "engineering", realm: hub}]
      │
      ├─ Call worker on worker-acme:
      │  ├─ Worker instance auth guard: ✅ User has permission
      │  ├─ Worker instance service: Find groups matching "engineering"
      │  └─ Success: [Group2 {name: "engineering", realm: worker-acme}]
      │
      └─ Collect responses:
         responses = {
           successResponses: [
             { instance: 'hub', data: [Group1] },
             { instance: 'worker-acme', data: [Group2] }
           ],
           unauthResponses: [],
           errorResponses: []
         }
  ↓
Handler combines:
  ├─ Merge all success data
  ├─ Result: [Group1, Group2]
  └─ Return to client
  ↓
Client receives: [Group1, Group2]
```

### Example: Cross-Realm Search (Partial Results)

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

---

## Handling Failures

### Partial Failure: One Instance Down

```
serverFn calls:
  ├─ hub: ✅ Success [Groups...]
  ├─ worker-acme: ❌ Timeout
  └─ worker-conf: ✅ Success [Groups...]

routingMiddleware collects:
  {
    successResponses: [hub, worker-conf],
    errorResponses: [worker-acme]
  }

Handler decides:
  if (successResponses.length > 0) {
    // Merge and return what we got, maybe warn
    return {
      data: successResponses.flatMap(r => r.data),
      warnings: ["worker-acme unavailable"]
    }
  }
```

### Auth Failure: User Not in Instance

```
serverFn calls:
  ├─ hub: ✅ Success
  ├─ worker-acme: ❌ 403 Forbidden (user not member)
  └─ worker-conf: ✅ Success

routingMiddleware collects:
  {
    successResponses: [hub, worker-conf],
    unauthResponses: [worker-acme]
  }

Handler decides:
  // Treating 403 as "this instance isn't relevant"
  return successResponses.flatMap(r => r.data);
```

### All Failed

```
serverFn calls:
  ├─ hub: ❌ Timeout
  ├─ worker-acme: ❌ Database down
  └─ worker-conf: ❌ Timeout

routingMiddleware collects:
  {
    successResponses: [],
    errorResponses: [all three]
  }

Handler decides:
  throw new Error('All instances failed');
```

---

## Caching at BFF Level

### Request Deduplication

If two clients make same request simultaneously:

```typescript
// Cache key: hash of (userId, operation, params)
const cacheKey = hashFn(`${user.id}:searchGroups:engineering`);

if (cache.has(cacheKey)) {
  return cache.get(cacheKey); // Return cached result
}

// Execute (calls all instances)
const result = await executeSearch(...);

// Cache for 30 seconds
cache.set(cacheKey, result, 30000);

return result;
```

**Benefit**: Reduces redundant calls to instances.

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
---

## Timeout & Retry Strategy

```typescript
const callInstanceWithRetry = async (instance, worker, retries = 2) => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await Promise.race([
        worker(instance),
        timeout(5000) // 5 second timeout
      ]);
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        await delay(1000 * (i + 1)); // Exponential backoff
      }
    }
  }
  
  throw lastError;
};
```

---

## Why BFF?

1. **Single point of routing** - Frontend doesn't need to know about instances
2. **Transparent scaling** - Add instances without frontend changes
3. **Centralized auth** - All auth goes through hub
4. **Response aggregation** - Smart combining (search across all instances, but show only what user can see)
5. **Error resilience** - If one instance is down, BFF can return partial results

---

## MVP Implication

In MVP (single hub instance), this architecture still applies:

- Hub instance **is also** the BFF (same Docker container)
- Routes to "local" service (via DI, no network call)
- No worker instances yet, but code path is identical
- When we add worker instances, we don't rewrite MVP code—we just activate the routing

---

## Routing Checklist (When Worker Instances Launch)

- [ ] instanceRouter correctly determines user's instances
- [ ] Worker accepts `(instance, { data, context })`
- [ ] Response categorization matches use case
- [ ] Handler has logic for partial failures
- [ ] Timeout handling implemented (don't wait forever)
- [ ] No sensitive data leakage in error messages
- [ ] Request deduplication (optional but recommended)
- [ ] Redis caching enabled for instance discovery
- [ ] Feature flags control routing behavior
- [ ] Monitoring/logging for cross-instance calls

---

**Created**: 2025-11-17 (for future worker instance rollout)
