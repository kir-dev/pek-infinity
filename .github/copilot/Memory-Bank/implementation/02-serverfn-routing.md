---
file: implementation/02-serverfn-routing.md
purpose: "serverFn as BFF routing layer, jwtGuard, routingMiddleware pattern, response combining, standardized httpSchema input validation, MVP vs worker-instance"
triggers: ["implementing serverFn endpoint", "designing routing layer", "combining multi-instance responses", "setting up input validation"]
keywords: ["serverFn", "routing", "BFF", "jwtGuard", "routingMiddleware", "response-combining", "aggregation", "httpSchema", "input validation"]
dependencies: ["architecture/04-routing-aggregation.md", "architecture/01-auth-system.md", "implementation/01-trpc-procedures.md"]
urgency: "critical"
size: "2000 words"
template: true
sections: ["core-pattern", "input-validation", "jwt-guard", "routing-middleware", "response-combining", "mvp-vs-worker-instance", "real-examples", "error-handling", "performance", "gotchas", "checklist"]
status: "active"
created: "2025-10-20"
updated: "2025-10-24"

---

# serverFn Routing: Implementation Template

## Core Pattern

serverFn is the BFF (Backend-for-Frontend) layer. It:
1. **Validates JWT** (jwtGuard)
2. **Routes request** to one or more instances (routingMiddleware)
3. **Combines responses** (handler)

```typescript
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { httpSchema } from '@/utils/zod-extra';
import { jwtGuard } from '@/middleware/jwt.guard';
import { routingMiddleware } from '@/middleware/routing.middleware';
import { groupProcedures } from '@/domains/group/group.procedures';

// ✅ PATTERN: serverFn with standardized httpSchema input validation
export const getGroupFn = createServerFn({ method: 'GET' })
  .inputValidator(httpSchema({ params: { id: z.cuid() } }))
  .middleware([
    jwtGuard,  // Validates JWT, injects user
    routingMiddleware(
      // Worker function: what to call on each instance
      async (instance, { data, context }) => {
        return instance.call('group.findOne', data.params);
      }
    ),
  ])
  .handler(async ({ data, context: { responses } }) => {
    // data = { params: { id: '123' }, body: {...}, page: {...} }
    
    if (responses.successResponses.length > 0) {
      return responses.successResponses[0].data;
    }
    
    if (responses.unauthResponses.length === responses.allResponses.length) {
      throw new Error('Unauthorized on all instances');
    }
    
    throw new Error('Failed to fetch from any instance');
  });
```

**Client usage:**
```typescript
const { data } = useQuery({
  queryFn: async () => await useServerFn(getGroupFn)({ data: { params: { id: '123' } } }),
});
```

---

## Input Validation: Standardized httpSchema

**ALWAYS use `httpSchema` for serverFn inputValidators** - never direct Zod objects.

`httpSchema` provides consistent HTTP structure with optional `body`, `params`, and `pagination`:

```typescript
import { httpSchema } from '@/utils/zod-extra';

// ✅ Simple params
.inputValidator(httpSchema({ params: { id: z.cuid() } }))

// ✅ Body + params  
.inputValidator(httpSchema({ 
  params: { userId: z.cuid() },
  body: { name: z.string(), email: z.string().email() }
}))

// ✅ With pagination
.inputValidator(httpSchema({ 
  params: { groupId: z.cuid() },
  pagination: true 
}))

// ✅ Body only
.inputValidator(httpSchema({ body: UserCreateSchema }))
```

**Handler receives structured data:**
```typescript
.handler(async ({ data }) => {
  // data.params.id - URL parameters
  // data.body.name - Request body  
  // data.page.skip/take - Pagination (if enabled)
})
```

**Why httpSchema?**
- **Consistency**: All endpoints follow HTTP conventions
- **Future-proof**: Easy to add pagination, query params, headers
- **Type safety**: Structured access prevents typos
- **Extensible**: Can add new HTTP properties without breaking existing code

---

## jwtGuard: Simple JWT Validation

jwtGuard does ONE thing: validate the JWT in the httpOnly cookie and extract user.

```typescript
// ✅ PATTERN: jwtGuard
export const jwtGuard = middleware(async ({ ctx, next }) => {
  const token = extractJWTFromCookie(ctx.cookies);
  
  if (!token) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'No JWT token' });
  }
  
  let user;
  try {
    user = verifyJWT(token);  // Verify signature, extract user
  } catch (error) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid token' });
  }
  
  // Inject user into context
  return next({
    ctx: {
      ...ctx,
      user,  // Now available to routing middleware and handler
    },
  });
});

// ❌ BAD: jwtGuard checking auth
export const badJwtGuard = middleware(async ({ ctx, next }) => {
  const user = verifyJWT(ctx.token);
  
  // Don't do permission checks here!
  const policies = await checkUserPolicies(user);  // Wrong layer!
  if (!policies.has('ADMIN')) {
    throw new Error('Not admin');  // This belongs in authGuard
  }
  
  return next({ ctx: { ...ctx, user } });
});
```

**jwtGuard responsibilities:**
- ✅ Extract JWT from httpOnly cookie
- ✅ Verify JWT signature
- ✅ Extract user claims
- ❌ NOT: Check permissions (that's authGuard in instance)

---

## routingMiddleware: The Router

routingMiddleware determines which instances to call and categorizes responses.

```typescript
// ✅ PATTERN: routingMiddleware
export const routingMiddleware = <T>(
  worker: (instance: Instance, params: { data: T; context: any }) => Promise<any>
) =>
  middleware(async ({ ctx, next }) => {
    const instanceRouter = new InstanceRouter();
    const instances = await instanceRouter.getInstancesForUser(ctx.user);
    
    if (instances.length === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User has no accessible instances',
      });
    }
    
    // Call worker on each instance
    const responses = {
      allResponses: [] as any[],
      successResponses: [] as any[],
      unauthResponses: [] as any[],
      errorResponses: [] as any[],
      networkErrorResponses: [] as any[],
    };
    
    await Promise.allSettled(
      instances.map(async (instance) => {
        try {
          const result = await worker(instance, { data: ctx.requestData, context: ctx });
          
          responses.allResponses.push({
            instance: instance.id,
            data: result,
            status: 'success',
          });
          responses.successResponses.push({
            instance: instance.id,
            data: result,
          });
        } catch (error) {
          responses.allResponses.push({
            instance: instance.id,
            error,
            status: 'error',
          });
          
          if (error.code === 'UNAUTHORIZED' || error.status === 403) {
            responses.unauthResponses.push({
              instance: instance.id,
              error,
            });
          } else if (error.code === 'ECONNREFUSED' || error.code === 'TIMEOUT') {
            responses.networkErrorResponses.push({
              instance: instance.id,
              error,
            });
          } else {
            responses.errorResponses.push({
              instance: instance.id,
              error,
            });
          }
        }
      })
    );
    
    return next({
      ctx: {
        ...ctx,
        responses,  // ← Available to handler
      },
    });
  });
```

**Response categories:**
- `allResponses`: All results (success + errors)
- `successResponses`: Successful calls only
- `unauthResponses`: 403/Unauthorized
- `errorResponses`: Application errors
- `networkErrorResponses`: Connection failures

---

## Response Combining Strategies

The handler receives categorized responses and decides how to combine them.

### Strategy 1: First Success

```typescript
export const getGroupFn = createServerFn({ method: 'GET' })
  .inputValidator(GroupFindSchema)
  .middleware([jwtGuard, routingMiddleware(groupWorker)])
  .handler(async ({ context: { responses } }) => {
    // Return first successful result
    if (responses.successResponses.length > 0) {
      return responses.successResponses[0].data;
    }
    
    throw new Error('Failed to fetch from any instance');
  });
```

### Strategy 2: Merge All Results (Search)

```typescript
export const searchGroupsFn = createServerFn({ method: 'GET' })
  .inputValidator(httpSchema({ params: { q: z.string() } }))
  .middleware([
    jwtGuard,
    routingMiddleware(async (instance, { data }) => {
      return instance.call('group.search', data.params);
    }),
  ])
  .handler(async ({ data, context: { responses } }) => {
    const allResults = responses.successResponses
      .flatMap(r => r.data.results || [])
      .filter(r => r !== null);
    
    // Deduplicate if same group exists on multiple instances
    const unique = Array.from(new Map(allResults.map(r => [r.id, r])).values());
    
    return {
      results: unique.slice(0, 20),
      total: unique.length,
      queriedInstances: responses.successResponses.length,
    };
  });
```

### Strategy 3: Partial Success Acceptable

```typescript
export const getGroupDetailsFn = createServerFn({ method: 'GET' })
  .inputValidator(GroupFindSchema)
  .middleware([jwtGuard, routingMiddleware(detailsWorker)])
  .handler(async ({ context: { responses } }) => {
    // If at least one instance has data, return it
    if (responses.successResponses.length > 0) {
      return responses.successResponses[0].data;
    }
    
    // If all failures are auth-related, fail with 403
    if (responses.unauthResponses.length === responses.allResponses.length) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    
    // Otherwise, fail with generic error
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
  });
```

### Strategy 4: Require All Success

```typescript
export const publishGroupsFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ ids: z.array(z.cuid()) }))
  .middleware([jwtGuard, routingMiddleware(publishWorker)])
  .handler(async ({ context: { responses } }) => {
    const targetCount = responses.allResponses.length;
    const successCount = responses.successResponses.length;
    
    if (successCount !== targetCount) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed on ${targetCount - successCount}/${targetCount} instances`,
      });
    }
    
    return { published: true };
  });
```

---

## MVP vs Worker Instance: Same Code

**In MVP:**
- routingMiddleware returns single instance (this BFF instance)
- Worker calls procedure directly via DI

**In Worker Instance:**
- routingMiddleware returns multiple instances
- Worker makes tRPC client calls via HTTP

**Same serverFn code works for both!**

```typescript
// MVP: routingMiddleware calls procedures directly
async function mvpWorker(instance, { data }) {
  // instance is local, resolve procedure via DI
  const injector = container.resolve(InstanceContainer);
  const procedure = injector.resolve(groupProcedures.findOne);
  return procedure._def.query({ input: data, ctx });
}

// Worker Instance: routingMiddleware calls tRPC client
async function workerInstanceWorker(instance, { data }) {
  // instance is remote, call via tRPC client
  const client = getTRPCClient(instance.url, { headers: { authorization: `Bearer ${jwt}` } });
  return client.group.findOne.query(data);
}

// serverFn stays the same!
export const getGroupFn = createServerFn()
  .middleware([jwtGuard, routingMiddleware(isWorkerInstance ? workerInstanceWorker : mvpWorker)])
  .handler(async ({ context: { responses } }) => {
    return responses.successResponses[0]?.data;
  });
```

---

## Error Handling in Handlers

```typescript
// ✅ PATTERN: Handle each error category appropriately
export const robustFn = createServerFn()
  .middleware([jwtGuard, routingMiddleware(worker)])
  .handler(async ({ context: { responses } }) => {
    // Check for auth failures
    if (responses.unauthResponses.length > 0 && responses.successResponses.length === 0) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'No instances grant access to this resource',
      });
    }
    
    // Check for network failures
    if (responses.networkErrorResponses.length > 0) {
      console.warn(`Network failures: ${responses.networkErrorResponses.length} instances unreachable`);
    }
    
    // Return whatever we got
    if (responses.successResponses.length > 0) {
      return responses.successResponses[0].data;
    }
    
    // Detailed error for debugging
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `All instances failed: ${responses.errorResponses.map(r => r.error.message).join(', ')}`,
    });
  });
```

---

## Real Examples

### Example 1: Simple Read (First Success)

```typescript
export const getGroupFn = createServerFn({ method: 'GET' })
  .inputValidator(httpSchema({ params: { id: z.cuid() } }))
  .middleware([
    jwtGuard,
    routingMiddleware(async (instance, { data }) => {
      return instance.call('group.findOne', data.params);
    }),
  ])
  .handler(async ({ context: { responses } }) => {
    if (responses.successResponses.length > 0) {
      return responses.successResponses[0].data;
    }
    throw new Error('Group not found on any instance');
  });
```

### Example 2: Search (Merge All)

```typescript
export const searchGroupsFn = createServerFn({ method: 'GET' })
  .inputValidator(httpSchema({ params: { q: z.string() } }))
  .middleware([
    jwtGuard,
    routingMiddleware(async (instance, { data }) => {
      return instance.call('group.search', data.params);
    }),
  ])
  .handler(async ({ data, context: { responses } }) => {
    const allResults = responses.successResponses
      .flatMap(r => r.data.results || [])
      .filter(r => r !== null);
    
    // Deduplicate if same group exists on multiple instances
    const unique = Array.from(new Map(allResults.map(r => [r.id, r])).values());
    
    return {
      results: unique.slice(0, 20),
      total: unique.length,
      queriedInstances: responses.successResponses.length,
    };
  });
```

### Example 3: Create (Validate Permission)

```typescript
export const createGroupFn = createServerFn({ method: 'POST' })
  .inputValidator(httpSchema({ body: GroupCreateSchema }))
  .middleware([
    jwtGuard,
    routingMiddleware(async (instance, { data, context }) => {
      // Determine which instance to create on
      // (user selects instance in UI, or default to first)
      return instance.call('group.create', data.body);
    }),
  ])
  .handler(async ({ data, context: { responses, user } }) => {
    if (responses.successResponses.length > 0) {
      console.log(`User ${user.id} created group via ${responses.successResponses[0].instance}`);
      return responses.successResponses[0].data;
    }
    
    if (responses.unauthResponses.length > 0) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to create groups' });
    }
    
    throw new Error('Creation failed on all instances');
  });
```

---

## Performance Considerations

```typescript
// ⚠️ GOTCHA 1: Serial calls are slow
export const slowSearch = createServerFn()
  .middleware([
    jwtGuard,
    routingMiddleware(async (instance, { data }) => {
      // This waits for all instances sequentially!
      const results1 = await instance1.call(...);
      const results2 = await instance2.call(...);
      const results3 = await instance3.call(...);
      return [results1, results2, results3];
    }),
  ])
  .handler(...);

// ✅ FIX: Use Promise.all (or allSettled for partial failures)
export const fastSearch = createServerFn()
  .middleware([
    jwtGuard,
    routingMiddleware(async (instances, { data }) => {
      return Promise.allSettled(
        instances.map(i => i.call('search', data))
      );
    }),
  ])
  .handler(...);
```

---

## Common Gotchas

**❌ Mistake 1: Auth checks in handler**
```typescript
.handler(async ({ context: { user, responses } }) => {
  // Checking auth here means jwtGuard didn't fail?
  if (!user.isAdmin) throw new Error('Not admin');  // Wrong!
})
```

**✅ Fix:** Use authGuard in procedure (instance-level), not serverFn

**❌ Mistake 2: Not handling partial failures**
```typescript
.handler(async ({ context: { responses } }) => {
  // If one instance fails, entire operation fails
  return responses.successResponses[0].data;  // What if no success?
})
```

**✅ Fix:** Categorize and decide how to handle each
```typescript
if (responses.successResponses.length > 0) return ...;
if (responses.networkErrorResponses.length > 0) retry();
if (responses.unauthResponses.length > 0) throw 403;
```

**❌ Mistake 3: Combining results incorrectly for search**
```typescript
// Duplicate results from multiple instances
const results = responses.successResponses.map(r => r.data);
```

**✅ Fix:** Deduplicate
```typescript
const unique = Array.from(new Map(
  responses.successResponses
    .flatMap(r => r.data.results)
    .map(r => [r.id, r])
).values());
```

---

## PR Checklist

- [ ] jwtGuard runs first (not authGuard)
- [ ] routingMiddleware determines instances correctly
- [ ] Worker function passes to routingMiddleware
- [ ] Response combining strategy documented in handler
- [ ] Error handling covers: success, auth, network, app errors
- [ ] No auth logic in serverFn handler (belongs in procedure middleware)
- [ ] No formatting in handler (belongs in hook's select)
- [ ] Parallel calls use Promise.all/allSettled
- [ ] Partial failures handled appropriately
- [ ] Tests cover: success, partial success, total failure
- [ ] Comment explains combining strategy
- [ ] Same code works MVP → Worker Instance (confirmed mentally or in tests)
