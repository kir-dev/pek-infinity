---
purpose: "Complete tRPC patterns for future worker-instance implementation - procedures, middleware, validation, error handling, testing"
audience: "humans, future migration engineers"
status: "future"
timeline: "Year 2+ (worker instances)"
keywords: ["tRPC", "procedure", "middleware", "validation", "context", "query", "mutation", "router", "worker"]
dependencies: ["architecture/02-service-patterns.md", "rules/01-auth-enforcement.md"]
size: "comprehensive"
created: "2025-11-17"
---

# tRPC Procedures: Complete Implementation Guide

## Overview

**Status: Worker-only (Year 2+)**

This document contains complete tRPC patterns for **future multi-instance federation**. **MVP uses serverFn + local service calls only.**

tRPC procedures are the reusable business logic layer called via HTTP when worker instances exist. They handle:
- Input validation (Zod)
- Authentication & authorization (middleware)
- Service layer calls
- Error handling
- Cross-instance communication

**Future Procedures called by:**
1. **serverFn** (MVP): Calls services directly via DI (no tRPC)
2. **tRPC client** (Worker): HTTP calls to remote instances

---

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

  update: procedure
    .input(GroupUpdateSchema)
    .middleware([
      authGuard([SCOPE.GROUP_EDIT])
    ])
    .mutation(async ({ input, ctx: { groupService, user } }) => {
      const { id, ...updateData } = input;
      return groupService.update(id, updateData);
    }),

  delete: procedure
    .input(z.object({ id: z.cuid() }))
    .middleware([
      authGuard([SCOPE.GROUP_DELETE])
    ])
    .mutation(async ({ input, ctx: { groupService } }) => {
      return groupService.delete(input.id);
    }),
};

// ✅ PATTERN: Router aggregates procedures
export const groupRouter = router({
  group: router(groupProcedures),
});
```

---

## Input Validation with Zod

**Rule:** Every procedure's input MUST have Zod schema that satisfies Prisma type.

```typescript
// ✅ GOOD: Schema satisfies Prisma type
export const GroupFindSchema = z.object({
  id: z.cuid(),
}) satisfies z.ZodType<{ id: string }>;

export const GroupCreateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string(),
  purpose: z.enum(Prisma.$Enums.GroupPurpose),
  isCommunity: z.boolean(),
  isResort: z.boolean(),
  isTaskForce: z.boolean(),
  hasTransitiveMembership: z.boolean(),
}) satisfies z.ZodType<Omit<Prisma.GroupCreateInput, 'isArchived'>>;

// ❌ BAD: Missing satisfies, types can drift
export const BadGroupSchema = z.object({
  id: z.string(),  // Should be cuid()
  name: z.string(),
});
```

**Where to put schemas:**
- Domain-specific: `src/domains/{domain}/types/{domain}.schema.ts`
- Shared: `src/types/` (auth, pagination, etc.)

---

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

// ❌ WRONG: Auth after other middleware
export const badProcedure = procedure
  .input(inputSchema)
  .middleware([customMiddleware, authGuard([SCOPE.VIEW])])
  .query(async ({ input, ctx }) => {
    // customMiddleware ran before auth!
    // What if it tries to access ctx.user? Undefined!
  });

// ❌ WRONG: No auth at all
export const insecureProcedure = procedure
  .input(inputSchema)
  .query(async ({ input, ctx }) => {
    // Anyone can access this!
    return service.fetch(input.id);
  });
```

**Middleware execution flow:**
```
Input → Validation (Zod) → Middleware 1 → Middleware 2 → Handler
                            (authGuard)   (custom)
```

---

## Context Injection

Context is injected by middleware. Handlers receive it in `ctx` parameter.

```typescript
// ✅ PATTERN: Middleware injects context
export const authGuard = (requiredScopes: string[]) =>
  middleware(async ({ ctx, next }) => {
    const user = await validateJWT(ctx.headers.authorization);
    const policies = await checkPolicies(user, requiredScopes);
    
    if (!policies.allowed) {
      throw new Error('Unauthorized');
    }
    
    // Inject into context
    return next({
      ctx: {
        ...ctx,
        user,      // ← Now available to handler
        policies,  // ← Now available to handler
      },
    });
  });

// Handler receives injected context
export const findOne = procedure
  .input(GroupFindSchema)
  .middleware([authGuard([SCOPE.GROUP_VIEW])])
  .query(async ({ input, ctx: { user, policies, groupService } }) => {
    // user, policies, groupService all available
    console.log(`User ${user.id} fetching group ${input.id}`);
    return groupService.findOne(input.id);
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

---

## Query vs Mutation vs Subscription

```typescript
// Query: Read-only, safe to call multiple times (idempotent)
export const getGroupProcedures = {
  findOne: procedure
    .input(GroupFindSchema)
    .query(async ({ input, ctx }) => {
      // No side effects
      return ctx.groupService.findOne(input.id);
    }),

  findMany: procedure
    .input(PaginationSchema)
    .query(async ({ input, ctx }) => {
      // No side effects
      return ctx.groupService.findMany(input.skip, input.take);
    }),
};

// Mutation: Write operations, side effects allowed
export const updateGroupProcedures = {
  create: procedure
    .input(GroupCreateSchema)
    .mutation(async ({ input, ctx }) => {
      // Creates data, has side effects
      return ctx.groupService.create(input);
    }),

  update: procedure
    .input(GroupUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      // Modifies data, has side effects
      return ctx.groupService.update(input.id, input);
    }),
};

// Subscription: Real-time updates (rare, future feature)
// Skip for MVP
```

---

## Error Handling

```typescript
// ✅ PATTERN: Let errors bubble, middleware catches
export const createGroupProcedure = procedure
  .input(GroupCreateSchema)
  .middleware([authGuard([SCOPE.GROUP_CREATE])])
  .mutation(async ({ input, ctx }) => {
    try {
      return await ctx.groupService.create(input);
    } catch (error) {
      if (error.code === 'P2002') {
        // Prisma unique constraint violation
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Group name already exists',
        });
      }
      // Let other errors bubble
      throw error;
    }
  });

// ❌ BAD: Swallowing errors
export const badProcedure = procedure
  .input(GroupCreateSchema)
  .mutation(async ({ input, ctx }) => {
    try {
      return await ctx.groupService.create(input);
    } catch (error) {
      console.log('Error:', error);
      return null;  // Don't do this! Client has no idea what failed
    }
  });
```

**Error response format (standardized):**
```typescript
{
  code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'CONFLICT' | 'INTERNAL_SERVER_ERROR',
  message: 'User-friendly message',
}
```

---

## Real Examples

### Example 1: Search Groups

```typescript
export const groupSearchProcedure = procedure
  .input(z.object({
    q: z.string().min(1),
    parentId: z.cuid().optional(),
    limit: z.number().min(1).max(100).default(20),
  }))
  .middleware([authGuard([SCOPE.GROUP_VIEW])])
  .query(async ({ input, ctx }) => {
    // Search across groups user has access to
    const groups = await ctx.groupService.search({
      query: input.q,
      parentId: input.parentId,
      limit: input.limit,
    });
    
    return {
      results: groups,
      count: groups.length,
    };
  });
```

### Example 2: Batch Update with Validation

```typescript
export const batchUpdateGroupsProcedure = procedure
  .input(z.object({
    updates: z.array(GroupUpdateSchema).min(1).max(50),
  }))
  .middleware([authGuard([SCOPE.GROUP_EDIT])])
  .mutation(async ({ input, ctx }) => {
    const results = await Promise.allSettled(
      input.updates.map(update => 
        ctx.groupService.update(update.id, update)
      )
    );
    
    return {
      succeeded: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      errors: results
        .map((r, i) => r.status === 'rejected' ? { index: i, error: r.reason } : null)
        .filter(Boolean),
    };
  });
```

### Example 3: Create with Cascading Logic

```typescript
export const createGroupWithCascadeProcedure = procedure
  .input(z.object({
    name: z.string().min(1),
    parentId: z.cuid().optional(),
    // ... other fields
  }))
  .middleware([authGuard([SCOPE.GROUP_CREATE])])
  .mutation(async ({ input, ctx }) => {
    const { parentId, ...groupData } = input;
    
    // Validate parent if provided
    if (parentId) {
      const parent = await ctx.groupService.findOne(parentId);
      if (!parent) throw new TRPCError({ code: 'NOT_FOUND', message: 'Parent group not found' });
      if (parent.isArchived) throw new TRPCError({ code: 'CONFLICT', message: 'Cannot create under archived parent' });
    }
    
    // Create group
    const newGroup = await ctx.groupService.create({
      ...groupData,
      parentId,
    });
    
    // Cascade escalation to parent managers
    if (parentId) {
      await ctx.groupService.cascadeEscalation(parentId, newGroup.id, ctx.user.id);
    }
    
    return newGroup;
  });
```

---

## Router Aggregation

```typescript
// Organize procedures into logical groups
export const groupProcedures = {
  // Reads
  findOne: procedure.input(...).query(...),
  findMany: procedure.input(...).query(...),
  search: procedure.input(...).query(...),
  
  // Writes
  create: procedure.input(...).mutation(...),
  update: procedure.input(...).mutation(...),
  delete: procedure.input(...).mutation(...),
};

// Router exposes them as group.findOne, group.create, etc.
export const groupRouter = router({
  group: router({
    ...groupProcedures,
  }),
});
```

---

## Testing Procedures

```typescript
import { describe, it, expect, vi } from 'vitest';
import { groupProcedures } from './group.procedures';

describe('Group Procedures', () => {
  it('findOne should return group', async () => {
    const mockGroupService = {
      findOne: vi.fn().mockResolvedValue({ id: '123', name: 'Engineering' }),
    };
    
    const ctx = { groupService: mockGroupService };
    const result = await groupProcedures.findOne._def.meta.query({
      input: { id: '123' },
      ctx,
    });
    
    expect(result.name).toBe('Engineering');
    expect(mockGroupService.findOne).toHaveBeenCalledWith('123');
  });
  
  it('create should fail without auth', async () => {
    // middleware should throw before reaching handler
    expect(() => {
      // Mock auth failing
    }).toThrow('Unauthorized');
  });
});
```

---

## Common Gotchas

**❌ Mistake 1: Middleware order wrong**
```typescript
// Auth runs AFTER logging middleware — logging has no user!
.middleware([loggingMiddleware, authGuard])
```

**✅ Fix:** Auth first
```typescript
.middleware([authGuard, loggingMiddleware])
```

**❌ Mistake 2: Service call outside middleware**
```typescript
// Calling service without checking auth first
.query(async ({ input, ctx }) => {
  const result = await ctx.groupService.findOne(input.id);  // What if user isn't authorized?
})
```

**✅ Fix:** Auth middleware validates first
```typescript
.middleware([authGuard([SCOPE.GROUP_VIEW])])
.query(async ({ input, ctx }) => {
  // Auth passed, safe to call service
  return ctx.groupService.findOne(input.id);
})
```

**❌ Mistake 3: Missing Zod validation**
```typescript
.input(z.any())  // Accepts anything!
```

**✅ Fix:** Strict validation
```typescript
.input(z.object({ id: z.cuid() }))
```

---

## PR Checklist (When Worker Instances Launch)

- [ ] Procedure has input validation (Zod schema)
- [ ] Schema satisfies Prisma type (if database input)
- [ ] Middleware order: auth FIRST
- [ ] authGuard has required SCOPE
- [ ] Handler calls service (not database directly)
- [ ] Error handling with TRPCError codes
- [ ] Tests cover happy path + error cases
- [ ] Tests mock external dependencies
- [ ] No side effects in query procedures
- [ ] No direct database access (use service)
- [ ] Context injection verified (user, services available)
- [ ] Router aggregates procedures logically

---

**Created**: 2025-11-17 (for future worker instance rollout)
