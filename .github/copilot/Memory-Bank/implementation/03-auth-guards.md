---
file: implementation/03-auth-guards.md
purpose: "jwtGuard and authGuard implementation, policy validation, statement scoping, error responses, testing"
triggers: ["implementing auth middleware", "debugging permission issues", "code review for auth"]
keywords: ["auth", "guard", "middleware", "JWT", "policy", "scope", "permission", "error"]
dependencies: ["architecture/01-auth-system.md", "database/01-policy-system.md", "rules/01-auth-enforcement.md"]
urgency: "critical"
size: "1800 words"
template: true
sections: ["jwt-guard", "auth-guard", "policy-validation", "statement-scoping", "error-responses", "caching", "real-examples", "testing", "gotchas", "checklist"]
status: "active"




---

# Auth Guards: Implementation Template

## jwtGuard: Extract & Validate JWT

jwtGuard is simple: extract JWT from httpOnly cookie, verify signature, inject user.

```typescript
import { middleware } from '@trpc/server';
import { TRPCError } from '@trpc/server';
import jwt from 'jsonwebtoken';

// ✅ PATTERN: Simple JWT validation
export const jwtGuard = middleware(async ({ ctx, next }) => {
  // 1. Extract JWT from httpOnly cookie
  const token = ctx.cookies.get('auth-token');
  
  if (!token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No authentication token',
    });
  }
  
  // 2. Verify signature (public key comes from auth provider)
  let user;
  try {
    user = jwt.verify(token, process.env.JWT_PUBLIC_KEY) as {
      id: string;
      email: string;
      name: string;
    };
  } catch (error) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    });
  }
  
  // 3. Inject user into context
  return next({
    ctx: {
      ...ctx,
      user,  // Now available to auth guard and handlers
    },
  });
});

// ❌ BAD: jwtGuard doing too much
export const badJwtGuard = middleware(async ({ ctx, next }) => {
  const user = extractUser(ctx.token);
  
  // Don't check policies here!
  const userRole = await getUserRole(user.id);
  if (!['admin', 'manager'].includes(userRole)) {
    throw new Error('Not authorized');  // This is authGuard's job!
  }
  
  return next({ ctx: { ...ctx, user, userRole } });
});
```

**jwtGuard ONLY:**
- ✅ Extract JWT
- ✅ Verify signature
- ✅ Inject user claims

**NOT:**
- ❌ Check policies
- ❌ Check roles
- ❌ Check scopes
- ❌ Access database

---

## authGuard: Check Permissions

authGuard checks if user has required scope + validates policy statements.

```typescript
import { middleware } from '@trpc/server';
import { inject, injectable } from 'tsyringe';
import { PolicyService } from '@/domains/policy/policy.service';
import { SCOPE } from '@/middleware/scopes';

export interface AuthGuardConfig {
  requiredScopes: string[];
  resourceId?: string;  // Optional: check specific resource
}

// ✅ PATTERN: authGuard with policy validation
export const authGuard = (requiredScopes: string[]) =>
  middleware(async ({ ctx, next }) => {
    // 1. Check user exists (from jwtGuard)
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }
    
    // 2. Query policies for this user
    const policyAssignments = await ctx.prisma.policyAssignment.findMany({
      where: { userId: ctx.user.id },
      include: {
        policy: {
          include: {
            statements: true,
          },
        },
      },
    });
    
    if (policyAssignments.length === 0) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'User has no permissions',
      });
    }
    
    // 3. Collect all statements from all policies
    const allStatements = policyAssignments
      .flatMap(pa => pa.policy.statements);
    
    // 4. Check if ANY statement grants required scope
    const hasAccess = requiredScopes.some(requiredScope => {
      return allStatements.some(stmt => {
        // Parse scope name from enum or static map
        const scopePermissions = parseScopeToPermissions(requiredScope);
        
        // Check if statement has required permissions
        return scopePermissions.every(perm => stmt[perm]);
      });
    });
    
    if (!hasAccess) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `User lacks required permissions: ${requiredScopes.join(', ')}`,
      });
    }
    
    // 5. Inject policies into context for later reference
    return next({
      ctx: {
        ...ctx,
        policies: allStatements,  // Available to handler
      },
    });
  });
```

---

## Scope Mapping

Scopes map to statement fields.

```typescript
// Define scope -> permissions mapping
export const SCOPE_PERMISSIONS: Record<string, (keyof Statement)[]> = {
  'GROUP_VIEW': ['viewGroup'],
  'GROUP_EDIT': ['editGroupProfile'],
  'GROUP_EDIT_MEMBERS': ['editMembers'],
  'GROUP_VIEW_MEMBERS': ['viewMembers'],
  'GROUP_MOVE_OWNER': ['moveGroupOwner'],
  'SCORES_VIEW': ['viewScores'],
  'SCORES_EDIT': ['editScores'],
  'SCORES_EVALUATE': ['evaluateScores'],
  'USER_VIEW_BASIC': ['viewBasicProfile'],
  'USER_VIEW_FULL': ['viewFullProfile'],
  'USER_EDIT': ['editProfile'],
};

export function parseScopeToPermissions(scope: string): (keyof Statement)[] {
  const perms = SCOPE_PERMISSIONS[scope];
  if (!perms) {
    throw new Error(`Unknown scope: ${scope}`);
  }
  return perms;
}
```

---

## Statement Scoping (Resource Restrictions)

Statements can be scoped to specific groups or users.

```typescript
// ❌ BAD: Check scope without considering resource restrictions
export const badAuthGuard = middleware(async ({ ctx, next }) => {
  const statements = await getStatements(ctx.user.id);
  const hasViewScope = statements.some(s => s.viewGroup);
  
  if (!hasViewScope) throw new Error('Forbidden');
  
  // But wait! User might only have viewGroup for ONE specific group!
  return next({ ctx: { ...ctx, canViewGroup: true } });
});

// ✅ GOOD: Check scope AND resource restrictions
export const goodAuthGuard = (requiredScopes: string[], resourceId?: string) =>
  middleware(async ({ ctx, next }) => {
    const statements = await getStatements(ctx.user.id);
    
    const hasAccess = statements.some(stmt => {
      // 1. Check if statement grants required scope
      const scopeMatch = requiredScopes.every(scope =>
        parseScopeToPermissions(scope).every(perm => stmt[perm])
      );
      
      if (!scopeMatch) return false;
      
      // 2. Check if statement applies to this resource
      if (resourceId && stmt.groupIdRestrict && stmt.groupIdRestrict !== resourceId) {
        return false;  // Statement is for a different group
      }
      
      return true;
    });
    
    if (!hasAccess) throw new TRPCError({ code: 'FORBIDDEN' });
    
    return next({
      ctx: {
        ...ctx,
        allowedResources: statements
          .filter(s => s.groupIdRestrict)
          .map(s => s.groupIdRestrict),
      },
    });
  });
```

---

## Error Responses

```typescript
// ✅ PATTERN: Consistent error codes
export const authGuard = (requiredScopes: string[]) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',      // 401
        message: 'Authentication required',
      });
    }
    
    const policies = await getPolicies(ctx.user.id);
    
    if (policies.length === 0) {
      throw new TRPCError({
        code: 'FORBIDDEN',         // 403
        message: 'User has no permissions assigned',
      });
    }
    
    const hasAccess = checkAccess(policies, requiredScopes);
    
    if (!hasAccess) {
      throw new TRPCError({
        code: 'FORBIDDEN',         // 403
        message: `Insufficient permissions. Required: ${requiredScopes.join(', ')}`,
      });
    }
    
    return next({ ctx: { ...ctx, policies } });
  });

// Error code meanings:
// UNAUTHORIZED (401) - No valid JWT token
// FORBIDDEN (403) - Valid token but insufficient permissions
// NOT_FOUND (404) - Resource doesn't exist
// INTERNAL_SERVER_ERROR (500) - Server problem
```

---

## Policy Caching (Enterprise)

In enterprise, policy checks are expensive. Cache them.

```typescript
// ✅ PATTERN: Cache policies with TTL
const policyCache = new Map<string, { policies: any[], expiresAt: number }>();

export const authGuardWithCache = (requiredScopes: string[]) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    
    // 1. Check cache first
    const cached = policyCache.get(ctx.user.id);
    let policies;
    
    if (cached && cached.expiresAt > Date.now()) {
      policies = cached.policies;
    } else {
      // 2. Query from database
      policies = await getPoliciesFromDB(ctx.user.id);
      
      // 3. Cache for 5 minutes
      policyCache.set(ctx.user.id, {
        policies,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });
    }
    
    // 4. Check access
    const hasAccess = checkAccess(policies, requiredScopes);
    if (!hasAccess) throw new TRPCError({ code: 'FORBIDDEN' });
    
    return next({ ctx: { ...ctx, policies } });
  });

// On policy change, invalidate cache
export function invalidatePolicyCache(userId: string) {
  policyCache.delete(userId);
}
```

---

## Real Examples

### Example 1: Simple View Permission

```typescript
export const getGroupProcedure = procedure
  .input(z.object({ id: z.cuid() }))
  .middleware([authGuard([SCOPE.GROUP_VIEW])])
  .query(async ({ input, ctx }) => {
    // authGuard already checked: user has GROUP_VIEW permission
    return ctx.groupService.findOne(input.id);
  });
```

### Example 2: Edit with Resource Restriction

```typescript
export const updateGroupProcedure = procedure
  .input(GroupUpdateSchema)
  .middleware([
    authGuard([SCOPE.GROUP_EDIT], ({ input }) => input.id),  // Check edit on specific group
  ])
  .mutation(async ({ input, ctx }) => {
    // authGuard checked: user can edit THIS specific group
    const { id, ...updateData } = input;
    return ctx.groupService.update(id, updateData);
  });
```

### Example 3: Multiple Required Scopes

```typescript
export const setScoresProcedure = procedure
  .input(ScoresUpdateSchema)
  .middleware([
    authGuard([SCOPE.SCORES_EDIT, SCOPE.GROUP_EDIT_MEMBERS]),  // Need both
  ])
  .mutation(async ({ input, ctx }) => {
    // authGuard checked: user has BOTH permissions
    return ctx.scoreService.update(input.id, input.scores);
  });
```

### Example 4: Cascading Permission Check

```typescript
export const deleteSubgroupProcedure = procedure
  .input(z.object({ parentId: z.cuid(), subgroupId: z.cuid() }))
  .middleware([
    authGuard([SCOPE.GROUP_MOVE_OWNER]),  // Check parent permission
  ])
  .mutation(async ({ input, ctx }) => {
    // authGuard checked: user has moveGroupOwner on parent
    // (which allows removing child managers)
    return ctx.groupService.delete(input.subgroupId);
  });
```

---

## Testing Auth Guards

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let mockContext;
  
  beforeEach(() => {
    mockContext = {
      user: { id: 'user123', email: 'user@example.com' },
      prisma: {
        policyAssignment: {
          findMany: vi.fn(),
        },
      },
    };
  });
  
  it('should pass with required scope', async () => {
    mockContext.prisma.policyAssignment.findMany.mockResolvedValue([
      {
        policy: {
          statements: [
            { viewGroup: true, groupIdRestrict: null },
          ],
        },
      },
    ]);
    
    const guard = authGuard([SCOPE.GROUP_VIEW]);
    const next = vi.fn();
    
    await guard({ ctx: mockContext, next });
    
    expect(next).toHaveBeenCalled();
  });
  
  it('should fail without required scope', async () => {
    mockContext.prisma.policyAssignment.findMany.mockResolvedValue([
      {
        policy: {
          statements: [
            { viewGroup: false, editGroup: false },
          ],
        },
      },
    ]);
    
    const guard = authGuard([SCOPE.GROUP_EDIT]);
    
    expect(() => guard({ ctx: mockContext, next: () => {} }))
      .toThrow('Insufficient permissions');
  });
  
  it('should respect resource restrictions', async () => {
    mockContext.prisma.policyAssignment.findMany.mockResolvedValue([
      {
        policy: {
          statements: [
            { viewGroup: true, groupIdRestrict: 'group-abc' },  // Only for this group
          ],
        },
      },
    ]);
    
    const guard = authGuard([SCOPE.GROUP_VIEW], 'group-xyz');  // Different group
    
    expect(() => guard({ ctx: mockContext, next: () => {} }))
      .toThrow('Insufficient permissions');
  });
});
```

---

## Common Gotchas

**❌ Mistake 1: authGuard checking JWT validity**
```typescript
export const badGuard = middleware(async ({ ctx, next }) => {
  const token = ctx.token;
  if (!isValidJWT(token)) throw new Error('Invalid token');  // jwtGuard already did this!
  // ...
});
```

**✅ Fix:** Assume jwtGuard ran first
```typescript
export const goodGuard = middleware(async ({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });  // jwtGuard failed
  // Now check policies
});
```

**❌ Mistake 2: Ignoring resource restrictions**
```typescript
// User has viewGroup for group-abc only, but we're checking group-xyz
const hasAccess = statements.some(s => s.viewGroup);  // Ignores groupIdRestrict!
```

**✅ Fix:** Check both scope AND resource
```typescript
const hasAccess = statements.some(s =>
  s.viewGroup && (!s.groupIdRestrict || s.groupIdRestrict === requestedGroupId)
);
```

**❌ Mistake 3: Multiple scopes with OR logic**
```typescript
// Needs BOTH permissions
const hasAccess = requiredScopes.some(scope => hasScope(scope));  // This is OR!
```

**✅ Fix:** Use AND logic if all required
```typescript
const hasAccess = requiredScopes.every(scope => hasScope(scope));  // This is AND
```

---

## PR Checklist

- [ ] authGuard runs AFTER jwtGuard
- [ ] Checks for ctx.user (from jwtGuard)
- [ ] Queries policies from database
- [ ] Handles no policies (user has no access)
- [ ] Checks required scopes against statements
- [ ] Respects resource restrictions (groupIdRestrict, userIdRestrict)
- [ ] Error codes are correct (UNAUTHORIZED vs FORBIDDEN)
- [ ] Error messages are user-friendly
- [ ] Injects policies into context for handler use
- [ ] Tests cover: success, missing scope, resource restriction, no policies
- [ ] Cache invalidation logic (if caching)
- [ ] No hardcoded scopes (use constants)

