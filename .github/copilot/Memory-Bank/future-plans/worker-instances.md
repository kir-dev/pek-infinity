---
file: future-plans/worker-instances.md
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

---

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
