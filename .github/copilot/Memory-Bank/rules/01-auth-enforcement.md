---
file: rules/01-auth-enforcement.md
purpose: "MUST: Auth checks in middleware, not handlers. Error handling, response codes, middleware order critical"
triggers: ["code review for auth", "implementing permission check", "debugging permission bypass"]
keywords: ["auth", "middleware", "enforcement", "handler", "layer", "401", "403"]
dependencies: ["implementation/03-auth-guards.md", "architecture/01-auth-system.md"]
urgency: "critical"
enforcement: "must-follow"
size: "1500 words"
sections: ["the-rule", "why-it-matters", "middleware-order", "error-codes", "bad-examples", "good-examples", "testing", "checklist"]
status: "active"




---

# Rule: Auth Checks in Middleware, Not Handlers

## The Rule (Absolute)

**All permission checks MUST happen in middleware, BEFORE handler code runs.**

```typescript
// ❌ FORBIDDEN: Auth in handler
export const updateGroupProcedure = procedure
  .input(GroupUpdateSchema)
  .query(async ({ input, ctx }) => {
    // Permission check in handler = can be bypassed!
    if (!ctx.user.isAdmin) {
      throw new Error('Not admin');
    }
    return ctx.groupService.update(input.id, input.data);
  });

// ✅ REQUIRED: Auth in middleware
export const updateGroupProcedure = procedure
  .input(GroupUpdateSchema)
  .middleware([authGuard([SCOPE.GROUP_EDIT])])  // ← Auth runs first
  .mutation(async ({ input, ctx }) => {
    // If we reach here, auth already passed
    return ctx.groupService.update(input.id, input.data);
  });
```

---

## Why It Matters

**Handler auth = Security bug**

Middleware executes BEFORE handler. If auth is in handler:

1. **Handler gets invoked** (wasting resources)
2. **Variables are computed** (side effects)
3. **Database queries run** (before permission check!)
4. **Then permission is checked** (too late)

**Attack vector:**
```typescript
// ❌ VULNERABLE
export const deleteGroupProcedure = procedure
  .input(z.object({ id: z.cuid() }))
  .query(async ({ input, ctx }) => {
    // Resource accessed BEFORE auth check
    const group = await ctx.groupService.findOne(input.id);
    
    // Auth checked AFTER loading data
    if (!ctx.user.isAdmin) {
      throw new Error('Forbidden');
    }
    
    // Delete happens
    return ctx.groupService.delete(input.id);
  });

// Exploit:
// 1. Call with groupId of secret group
// 2. Permission check fails, error thrown
// 3. But data was already loaded into memory, maybe leaked via timing
// 4. Or database logs might have record
```

**Better:**
```typescript
// ✅ SECURE
export const deleteGroupProcedure = procedure
  .input(z.object({ id: z.cuid() }))
  .middleware([authGuard([SCOPE.GROUP_DELETE])])  // Auth runs FIRST
  .mutation(async ({ input, ctx }) => {
    // Only if auth passed do we access resource
    return ctx.groupService.delete(input.id);
  });
```

---

## Middleware Order is CRITICAL

Order of middleware matters. Auth must run first.

```typescript
// ❌ BAD ORDER: Logging before auth
export const badProcedure = procedure
  .input(inputSchema)
  .middleware([
    loggingMiddleware,   // Runs first - but user not authenticated yet!
    authGuard([SCOPE.VIEW]),
  ])
  .query(async ({ input, ctx }) => {
    // loggingMiddleware has no ctx.user!
    return service.fetch(input.id);
  });

// ✅ GOOD ORDER: Auth first
export const goodProcedure = procedure
  .input(inputSchema)
  .middleware([
    authGuard([SCOPE.VIEW]),  // Runs first - validates user
    loggingMiddleware,   // Now has ctx.user available
  ])
  .query(async ({ input, ctx }) => {
    return service.fetch(input.id);
  });
```

**Middleware execution:**
```
Input → Validation (Zod) → Middleware 1 → Middleware 2 → Handler
                          (authGuard)    (logging)
```

---

## Error Codes & Response Standards

```typescript
// ✅ CORRECT ERROR CODES
export const authGuard = (requiredScopes: string[]) =>
  middleware(async ({ ctx, next }) => {
    // No JWT token
    if (!ctx.token) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',  // 401
        message: 'Authentication required',
      });
    }
    
    // Invalid JWT signature
    if (!isValidJWT(ctx.token)) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',  // 401
        message: 'Invalid token',
      });
    }
    
    // Valid JWT but no permissions
    const policies = await getPolicies(ctx.user.id);
    if (policies.length === 0) {
      throw new TRPCError({
        code: 'FORBIDDEN',     // 403
        message: 'User has no permissions',
      });
    }
    
    // Valid JWT, has policies but not required scope
    const hasAccess = checkAccess(policies, requiredScopes);
    if (!hasAccess) {
      throw new TRPCError({
        code: 'FORBIDDEN',     // 403
        message: `Insufficient permissions. Required: ${requiredScopes.join(', ')}`,
      });
    }
    
    return next({ ctx: { ...ctx, policies } });
  });
```

**Error code meanings:**
- `UNAUTHORIZED` (401): No valid authentication (missing/invalid JWT)
- `FORBIDDEN` (403): Authenticated but insufficient permissions
- `NOT_FOUND` (404): Resource doesn't exist (use for 403 if secret resource)
- `INTERNAL_SERVER_ERROR` (500): Server problem

---

## Real Bad Examples

### Example 1: Auth in Handler

```typescript
// ❌ BAD
export const updateGroupProcedure = procedure
  .input(GroupUpdateSchema)
  .mutation(async ({ input, ctx }) => {
    // Permission check happens INSIDE handler!
    const user = await ctx.prisma.user.findUnique({ where: { id: ctx.user.id } });
    if (user.role !== 'admin') {
      throw new Error('Not admin');
    }
    
    return ctx.groupService.update(input.id, input.data);
  });
```

**Problems:**
- User lookup happens before permission check
- Wasted database query
- Handler code visible to unauthorized users (timing attacks)

**Fix:**
```typescript
// ✅ GOOD
export const updateGroupProcedure = procedure
  .input(GroupUpdateSchema)
  .middleware([authGuard([SCOPE.GROUP_EDIT])])
  .mutation(async ({ input, ctx }) => {
    // If we're here, auth passed
    return ctx.groupService.update(input.id, input.data);
  });
```

### Example 2: Wrong Error Response

```typescript
// ❌ BAD: Using 500 for permission denial
export const authGuard = middleware(async ({ ctx, next }) => {
  const hasAccess = checkAccess(ctx.policies, requiredScopes);
  if (!hasAccess) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',  // Wrong! This is a 500
      message: 'Error checking permissions',
    });
  }
  return next({ ctx });
});

// Client thinks: "Server is broken, let me retry"
// Should think: "I don't have permission"
```

**Fix:**
```typescript
// ✅ GOOD
throw new TRPCError({
  code: 'FORBIDDEN',  // Correct: 403
  message: 'Insufficient permissions',
});
```

### Example 3: Bypassing Auth with Try-Catch

```typescript
// ❌ BAD: Swallowing auth errors
export const badProcedure = procedure
  .input(inputSchema)
  .middleware([authGuard([SCOPE.VIEW])])
  .query(async ({ input, ctx }) => {
    try {
      return ctx.service.fetch(input.id);
    } catch (error) {
      // If auth error is caught here, it's handled by handler logic
      // This shouldn't happen with proper middleware
      return null;
    }
  });
```

**Fix:**
```typescript
// ✅ GOOD: Let middleware auth errors propagate
export const goodProcedure = procedure
  .input(inputSchema)
  .middleware([authGuard([SCOPE.VIEW])])
  .query(async ({ input, ctx }) => {
    // authGuard errors propagate naturally
    return ctx.service.fetch(input.id);
  });
```

---

## Test Cases

```typescript
describe('Auth Enforcement', () => {
  it('should reject request without JWT', async () => {
    const ctx = { token: null };
    
    expect(() => authGuard([SCOPE.VIEW])({ ctx, next: () => {} }))
      .toThrow(TRPCError);
  });
  
  it('should return 401 for invalid JWT', async () => {
    const ctx = { token: 'invalid' };
    
    expect(() => authGuard([SCOPE.VIEW])({ ctx, next: () => {} }))
      .toThrow(error => error.code === 'UNAUTHORIZED');
  });
  
  it('should return 403 for insufficient permissions', async () => {
    const ctx = {
      user: { id: 'user123' },
      prisma: {
        policyAssignment: {
          findMany: vi.fn().mockResolvedValue([
            { policy: { statements: [{ viewGroup: false }] } },
          ]),
        },
      },
    };
    
    expect(() => authGuard([SCOPE.GROUP_EDIT])({ ctx, next: () => {} }))
      .toThrow(error => error.code === 'FORBIDDEN');
  });
  
  it('should allow request with required scope', async () => {
    const ctx = {
      user: { id: 'user123' },
      policies: [{ viewGroup: true, groupIdRestrict: null }],
    };
    const next = vi.fn().mockResolvedValue({});
    
    await authGuard([SCOPE.GROUP_VIEW])({ ctx, next });
    
    expect(next).toHaveBeenCalled();
  });
});
```

---

## PR Checklist

When reviewing PRs:

- [ ] All permission checks are in `.middleware([...])` not `.handler()`
- [ ] Middleware order: auth FIRST, then other middleware
- [ ] Uses `authGuard([SCOPE.XXX])` not custom permission checks
- [ ] Error code is `UNAUTHORIZED` (401) or `FORBIDDEN` (403), not 500
- [ ] No try-catch swallowing auth errors in handler
- [ ] No database queries before auth check
- [ ] No side effects before auth check
- [ ] Tests verify auth failure prevents handler execution
- [ ] Tests verify correct error codes (401 vs 403)
- [ ] No hardcoded role checks (use SCOPE constants)
- [ ] Logging middleware runs AFTER auth (if present)
- [ ] Error messages don't leak sensitive info (use generic message)

