---
purpose: "MUST: Auth checks in middleware, not handlers. Error handling, response codes, middleware order critical"
triggers: ["code review for auth", "implementing permission check", "debugging permission bypass"]
keywords: ["auth", "middleware", "enforcement", "handler", "layer", "401", "403"]
importance: "critical"
size: "600 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





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

## Why It Matters

**Handler auth = Security bug**

Middleware executes BEFORE handler. If auth is in handler:

1. **Handler gets invoked** (wasting resources)
2. **Variables are computed** (side effects)
3. **Database queries run** (before permission check!)
4. **Then permission is checked** (too late)

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

## Error Codes & Response Standards

- `UNAUTHORIZED` (401): No valid authentication (missing/invalid JWT)
- `FORBIDDEN` (403): Authenticated but insufficient permissions
- `NOT_FOUND` (404): Resource doesn't exist (use for 403 if secret resource)
- `INTERNAL_SERVER_ERROR` (500): Server problem
