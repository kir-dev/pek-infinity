---
file: architecture/04-routing-aggregation.md
purpose: "How serverFn routing determines instances and combines responses; handling partial failures"
triggers: ["implementing serverFn", "designing aggregation logic", "handling cross-instance searches"]
keywords: ["routing", "aggregation", "combining", "partial-failure", "federation", "multi-instance"]
dependencies: ["architecture/00-federation-model.md", "architecture/03-middleware-layering.md"]
urgency: "high"
size: "1500 words"
status: "active"
created: "2025-10-20"




---

# Routing & Aggregation: serverFn Combines Results

## Overview

**serverFn** (in enterprise) is the BFF. Its job:
1. **Route**: Determine which instances to call
2. **Call**: Execute worker on each instance (via tRPC or DI)
3. **Combine**: Aggregate results into meaningful response

In MVP, routing is trivial (only one instance). In enterprise, routing is intelligent.

## Stage 1: Routing (Determine Instances)

### How It Works

```typescript
// Get instances for this user
const instances = await instanceRouter.getInstancesForUser(context.user);
// Returns: ['cloud', 'enterprise-acme', 'enterprise-conf']

// Filter by task
const relevantInstances = instances.filter(instance => 
  canAccessResource(instance, requiredScope)
);
```

### Instance Discovery

**Where does instanceRouter know user's instances?**

```
Option A: Federation Table (Recommended)
  Instance: user_realm mapping
  └─ Query: SELECT instance FROM user_realms WHERE userId = user
  └─ Result: ['cloud', 'enterprise-acme']

Option B: Policy Snapshot Cache (Enterprise Only)
  Already cached from login
  └─ Redis: session:${jwt} → { instances: [...] }
  └─ No query needed (instant)

Option C: Instance Registry (Static)
  Hardcoded or env var: ALL_INSTANCES = ['cloud', 'enterprise-acme', ...]
  └─ Try all; let each instance return 403 if user not member
  └─ Simplest but slower
```

**MVP uses Option C** (only one instance). **Enterprise should use Option B** (cache from login).

## Stage 2: Call Worker

### Worker Definition

Worker is a function that calls the actual business logic:

```typescript
type Worker<T> = (
  instance: Instance,
  params: { data: RequestData; context: any }
) => Promise<T>;
```

### Worker Examples

#### Example 1: Direct Service Call (MVP)

```typescript
const getGroupWorker = async (instance, { data, context }) => {
  // MVP: instance is undefined (local)
  const groupService = context.injector.resolve(GroupService);
  return groupService.findOne(data.id);
};
```

#### Example 2: tRPC Remote Call (Enterprise)

```typescript
const getGroupWorker = async (instance, { data, context }) => {
  // Enterprise: instance is remote
  const client = getTRPCClientForInstance(instance, context.jwt);
  return client.group.findOne.query({ id: data.id });
};
```

#### Example 3: tRPC Procedure (Reusable)

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

// Worker can call procedure directly (MVP) or via tRPC (enterprise)
const getGroupWorker = async (instance, { data, context }) => {
  if (instance === undefined) {
    // MVP: call procedure directly
    return groupProcedures.findOne.query({
      input: data,
      ctx: { groupService: context.groupService }
    });
  } else {
    // Enterprise: call via tRPC
    return instance.trpc.group.findOne.query(data);
  }
};
```

## Stage 3: Combine Responses

### Response Categorization

Routing middleware collects responses into categories:

```typescript
const responses = {
  allResponses: Response[],          // Everything (success + error)
  successResponses: SuccessResponse[], // ✅ Worked
  unauthResponses: ErrorResponse[],   // 403 Forbidden
  errorResponses: ErrorResponse[],    // ❌ Other errors
};
```

### Combination Strategies

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

**Use case**: User profile (critical data must come from cloud)

```typescript
.handler(async ({ data, context: { responses } }) => {
  const cloudResponse = responses.successResponses
    .find(r => r.instance === 'cloud');
  
  if (!cloudResponse) {
    throw new Error('Cloud instance required');
  }
  
  return cloudResponse.data;
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

## Example: Search Groups

### Detailed Flow

```
User searches: searchGroups("engineering")
  ↓
serverFn receives request
  ├─ jwtGuard: ✅ JWT valid
  └─ routingMiddleware executes:
      ├─ instanceRouter.getInstancesForUser()
      │  └─ Returns: [cloud, enterprise-acme]
      │
      ├─ Call worker on cloud:
      │  ├─ Cloud auth guard: ✅ User has permission
      │  ├─ Cloud service: Find groups matching "engineering"
      │  └─ Success: [Group1 {name: "engineering", realm: cloud}]
      │
      ├─ Call worker on enterprise-acme:
      │  ├─ Enterprise auth guard: ✅ User has permission
      │  ├─ Enterprise service: Find groups matching "engineering"
      │  └─ Success: [Group2 {name: "engineering", realm: enterprise-acme}]
      │
      └─ Collect responses:
         responses = {
           successResponses: [
             { instance: 'cloud', data: [Group1] },
             { instance: 'enterprise-acme', data: [Group2] }
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

## Handling Failures

### Partial Failure: One Instance Down

```
serverFn calls:
  ├─ cloud: ✅ Success [Groups...]
  ├─ enterprise-acme: ❌ Timeout
  └─ enterprise-conf: ✅ Success [Groups...]

routingMiddleware collects:
  {
    successResponses: [cloud, enterprise-conf],
    errorResponses: [enterprise-acme]
  }

Handler decides:
  if (successResponses.length > 0) {
    // Merge and return what we got, maybe warn
    return {
      data: successResponses.flatMap(r => r.data),
      warnings: ["enterprise-acme unavailable"]
    }
  }
```

### Auth Failure: User Not in Instance

```
serverFn calls:
  ├─ cloud: ✅ Success
  ├─ enterprise-acme: ❌ 403 Forbidden (user not member)
  └─ enterprise-conf: ✅ Success

routingMiddleware collects:
  {
    successResponses: [cloud, enterprise-conf],
    unauthResponses: [enterprise-acme]
  }

Handler decides:
  // Treating 403 as "this instance isn't relevant"
  return successResponses.flatMap(r => r.data);
```

### All Failed

```
serverFn calls:
  ├─ cloud: ❌ Timeout
  ├─ enterprise-acme: ❌ Database down
  └─ enterprise-conf: ❌ Timeout

routingMiddleware collects:
  {
    successResponses: [],
    errorResponses: [all three]
  }

Handler decides:
  throw new Error('All instances failed');
```

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

## Routing Checklist

- [ ] instanceRouter correctly determines user's instances
- [ ] Worker accepts `(instance, { data, context })`
- [ ] Response categorization matches use case
- [ ] Handler has logic for partial failures
- [ ] Timeout handling implemented (don't wait forever)
- [ ] No sensitive data leakage in error messages
- [ ] Request deduplication (optional but recommended)

## Next Steps

- `database/00-realm-model.md` - How realms are stored
- `implementation/02-serverfn-routing.md` - Routing template code
- `gotchas/01-migration-blockers.md` - What breaks with routing

---

**Last updated**: 2025-10-20
