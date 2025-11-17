---
file: architecture/03-middleware-layering.md
purpose: "Middleware stack differences between MVP and worker-instance; order matters, guard responsibilities"
triggers: ["implementing middleware", "debugging auth failures", "adding new guard", "scaling to worker-instance"]
keywords: ["middleware", "guard", "stack", "order", "jwtGuard", "authGuard", "routing"]
dependencies: ["architecture/01-auth-system.md", "architecture/02-service-patterns.md"]
urgency: "critical"
size: "1500 words"
status: "active"
created: "2025-10-20"
mvp-scope: "future"
phase: "Phase 1+ (Q2 2026+)"
created: "2025-10-20"
updated: "2025-11-17"
---

# Middleware Layering: MVP vs Worker Instance

## Core Principle: Middleware Order is Critical

Middleware executes in the order it's declared. **Order mistakes = security holes.**

```typescript
// ✅ CORRECT ORDER
.middleware([jwtGuard, authGuard, routingMiddleware])

// ❌ WRONG: Auth after routing (routing could bypass auth)
.middleware([routingMiddleware, jwtGuard, authGuard])

// ❌ WRONG: Routing before auth (could route before JWT validation)
.middleware([authGuard, routingMiddleware, jwtGuard])
```

## MVP Middleware Stack

### Single Instance, Local DI

```
Request comes in
  ↓
1️⃣ jwtGuard
   └─ Extract JWT from httpOnly cookie
   └─ Validate JWT signature
   └─ Decode JWT → user info
   └─ If invalid → 401 Unauthorized
   └─ Inject user into context
  ↓
2️⃣ authGuard (MVP specific)
   └─ Check user permissions against local policies
   └─ Query: SELECT statements WHERE userId=user AND scope IN (required_scopes)
   └─ If no permission → 403 Forbidden
   └─ Inject scopes into context
  ↓
3️⃣ localServiceMiddleware (MVP specific)
   └─ Resolve service via DI (tsyringe)
   └─ Inject Prisma (scoped to hub realm)
   └─ Inject service into context
  ↓
Handler
  └─ Call service method
  └─ Service uses injected Prisma (realm-filtered)
  └─ Return result
```

### MVP Stack Code

```typescript
export const getGroupFn = createServerFn({ method: 'GET' })
  .inputValidator(GroupFindSchema)
  .middleware([
    jwtGuard(),           // 1. Validate JWT
    authGuard(['GROUP_VIEW']),  // 2. Check permissions
  ])
  .handler(async ({ data, context: { injector } }) => {
    // 3. Handler (implicit: injector resolves service)
    const groupService = injector.resolve(GroupService);
    return groupService.findOne(data.id);
  });
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

## Guard Responsibilities

### jwtGuard

**Runs in:** MVP + Worker (same)

**Responsibilities:**
- Extract JWT from httpOnly cookie
- Validate JWT signature (using shared secret or hub's public key)
- Decode JWT claims (userId, issuedAt, expiresAt)
- Check expiry
- Inject `user` into context

**Does NOT:**
- Check permissions
- Know about realms
- Determine routing

**Code:**
```typescript
export const jwtGuard = () => async (req, context) => {
  const token = req.cookies.get('pek_auth');
  
  if (!token) throw new UnauthorizedError('Missing JWT');
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    context.user = {
      id: payload.userId,
      issuedAt: payload.iat,
      expiresAt: payload.exp,
    };
  } catch (error) {
    throw new UnauthorizedError('Invalid JWT');
  }
};
```

### authGuard (MVP)

**Runs in:** MVP only (instances have their own authGuard in worker instance)

**Responsibilities:**
- Check user has required permissions
- Query policy statements
- Verify scope covers requested action
- Return 403 if missing permission

**Does NOT:**
- Know about realms (Prisma is pre-filtered)
- Route requests
- Know about other instances

**Code:**
```typescript
export const authGuard = (requiredScopes: Scope[]) => 
  async (req, context) => {
    const user = context.user;
    
    // Query local policies (realm already filtered by Prisma)
    const statements = await prisma.statement.findMany({
      where: {
        policy: {
          PolicyAssignment: {
            some: { userId: user.id }
          }
        }
      }
    });
    
    // Check if any statement grants required scope
    const hasPermission = requiredScopes.some(scope => 
      statements.some(stmt => stmt[scope] === true)
    );
    
    if (!hasPermission) throw new ForbiddenError('Insufficient permissions');
    
    context.scopes = requiredScopes;
  };
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

## Middleware Order: Why It Matters

### ❌ Bad: jwtGuard AFTER authGuard

```typescript
.middleware([
  authGuard(['GROUP_VIEW']),  // ❌ Check permission
  jwtGuard(),                 // ❌ Validate JWT (too late!)
])
```

**Problem**: authGuard runs before JWT is validated. If JWT is garbage, authGuard might crash or bypass auth.

### ❌ Bad: Routing BEFORE jwtGuard

```typescript
.middleware([
  routingMiddleware(...),  // ❌ Route to instances
  jwtGuard(),              // ❌ Validate JWT (too late!)
])
```

**Problem**: Routing might send invalid JWT to instances. Instances reject, but we've already wasted time routing.

### ❌ Bad: authGuard AFTER routingMiddleware

```typescript
.middleware([
  jwtGuard(),
  routingMiddleware(...),  // ❌ Route to instances (includes calling authGuard on them)
  authGuard(['GROUP_VIEW']),  // ❌ Local auth check (after routing done?)
])
```

**Problem**: Order is nonsensical. Routing calls instances which do auth; why auth again after routing?

## Common Gotchas

### ❌ Gotcha 1: Missing jwtGuard

```typescript
.middleware([
  authGuard(['GROUP_VIEW']),  // ❌ No jwtGuard!
])
```

**Problem**: No user in context. authGuard crashes with undefined error.

### ❌ Gotcha 2: authGuard in Worker serverFn

```typescript
// Worker serverFn
.middleware([
  jwtGuard(),
  authGuard(['GROUP_VIEW']),  // ❌ Wrong! Auth is per-instance
  routingMiddleware(...),
])
```

**Problem**: authGuard checks hub instance permissions, not instance-specific permissions. Worker instance should only check on instances themselves.

### ❌ Gotcha 3: No error handling in routingMiddleware

```typescript
routingMiddleware(
  async (instance, params) => {
    // ❌ No try-catch
    return instance.trpc.group.findOne.query(params);
  }
)
```

**Problem**: If one instance fails, entire request fails. Should collect partial results.

## Response Categorization Examples

### Search for Groups (Some Instances Grant Access)

```typescript
// Middleware collects:
results = {
  allResponses: [
    { instance: 'hub', data: [Group1, Group2] },
    { instance: 'worker-acme', data: [Group3, Group4] },
    { instance: 'worker-conf', error: ForbiddenError }
  ],
  successResponses: [
    { instance: 'hub', data: [Group1, Group2] },
    { instance: 'worker-acme', data: [Group3, Group4] }
  ],
  unauthResponses: [
    { instance: 'worker-conf', error: ForbiddenError }
  ],
  errorResponses: []
}

// Handler combines:
const allGroups = results.successResponses
  .flatMap(r => r.data);
// Result: [Group1, Group2, Group3, Group4]
```

### Search (One Instance Down)

```typescript
results = {
  allResponses: [
    { instance: 'hub', data: [...] },
    { instance: 'worker-acme', error: TimeoutError }
  ],
  successResponses: [
    { instance: 'hub', data: [...] }
  ],
  unauthResponses: [],
  errorResponses: [
    { instance: 'worker-acme', error: TimeoutError }
  ]
}

// Handler:
if (results.successResponses.length > 0) {
  return results.successResponses[0].data; // Return hub results
}
if (results.errorResponses.length > 0) {
  throw new Error('Some instances unavailable');
}
```

## Testing Middleware

### Unit Test: jwtGuard

```typescript
it('should reject expired JWT', async () => {
  const expiredToken = jwt.sign({ userId: 'alice' }, secret, { expiresIn: '0s' });
  const req = { cookies: { get: () => expiredToken } };
  
  expect(() => jwtGuard()(req, {})).toThrow('Invalid JWT');
});
```

### Unit Test: Middleware Order

```typescript
it('should validate JWT before checking auth', async () => {
  const req = { cookies: { get: () => null } }; // No JWT
  const context = {};
  
  expect(() => jwtGuard()(req, context)).toThrow('Missing JWT');
  // authGuard never runs because jwtGuard threw first
});
```

## Middleware Checklist

- [ ] jwtGuard is FIRST in middleware array
- [ ] authGuard (if MVP) or routingMiddleware (if worker instance) is SECOND
- [ ] Services/handlers only run after middleware passes
- [ ] All guards have try-catch for proper error responses
- [ ] Middleware doesn't modify request data (only adds to context)
- [ ] Middleware doesn't know about business logic

## Next Steps

- `architecture/04-routing-aggregation.md` - How serverFn combines responses
- `implementation/03-auth-guards.md` - Auth guard implementation templates
- `rules/01-auth-enforcement.md` - Where auth checks must happen

---

**Last updated**: 2025-10-20
