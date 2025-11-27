---
purpose: "Complete tRPC patterns for future worker-instance implementation - procedures, middleware, validation"
triggers: ["implementing federation", "api design", "worker implementation"]
keywords: ["federation", "trpc", "api", "communication", "procedure", "middleware"]
importance: "future"
size: "1500 words"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# tRPC Layer

**Status: Worker-only (Year 2+)**

This document contains complete tRPC patterns for **future multi-instance federation**. **MVP uses serverFn + local service calls only.**

tRPC procedures are the reusable business logic layer called via HTTP when worker instances exist. They handle:
- Input validation (Zod)
- Authentication & authorization (middleware)
- Service layer calls
- Error handling
- Cross-instance communication

## Core Pattern: Complete Example

```typescript
import { procedure, router } from '@trpc/server';
import { z } from 'zod';
import { injectable, inject } from 'tsyringe';
import { GroupService } from './group.service';
import { authGuard } from '@/middleware/auth.guard';
import { SCOPE } from '@/middleware/scopes';

// ✅ PATTERN: Procedure with full middleware stack
export const groupProcedures = {
  findOne: procedure
    .input(z.object({ id: z.cuid() }))
    .middleware([
      authGuard([SCOPE.GROUP_VIEW])  // Auth FIRST
    ])
    .query(async ({ input, ctx: { groupService, user } }) => {
      // ctx is injected by middleware
      // groupService is available (injected)
      return groupService.findOne(input.id);
    }),

  create: procedure
    .input(GroupCreateSchema)
    .middleware([
      authGuard([SCOPE.GROUP_CREATE])
    ])
    .mutation(async ({ input, ctx: { groupService, user } }) => {
      return groupService.create(input);
    }),
};

// ✅ PATTERN: Router aggregates procedures
export const groupRouter = router({
  group: router(groupProcedures),
});
```

## Input Validation with Zod

**Rule:** Every procedure's input MUST have Zod schema that satisfies Prisma type.

```typescript
// ✅ GOOD: Schema satisfies Prisma type
export const GroupFindSchema = z.object({
  id: z.cuid(),
}) satisfies z.ZodType<{ id: string }>;
```

## Middleware Order: CRITICAL

**Order matters. Auth MUST run before handler.**

```typescript
// ✅ CORRECT: Auth → Handler
export const goodProcedure = procedure
  .input(inputSchema)
  .middleware([authGuard([SCOPE.VIEW])])  // Runs FIRST
  .query(async ({ input, ctx }) => {
    // Auth already passed, safe to access ctx.user
    return service.fetch(input.id);
  });
```

## Context Injection

Context is injected by middleware. Handlers receive it in `ctx` parameter.

```typescript
// ✅ PATTERN: Middleware injects context
export const authGuard = (requiredScopes: string[]) =>
  middleware(async ({ ctx, next }) => {
    const user = await validateJWT(ctx.headers.authorization);
    // ... validate ...
    return next({
      ctx: {
        ...ctx,
        user,      // ← Now available to handler
      },
    });
  });
```

**What should be in ctx:**
- `user` (from auth middleware)
- `policies` (from auth middleware)
- `prisma` (injected in MVP)
- `groupService`, `userService`, etc. (DI-injected services)

**What should NOT be in ctx:**
- Business logic (belongs in service)
- Formatting (belongs in hook's select)
- Routing decisions (belongs in serverFn handler)
