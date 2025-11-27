---
purpose: "Comprehensive architectural decisions index - why we built it this way, key tradeoffs, migration timelines"
audience: "humans, architects, new team members, future engineers"
status: "active"
keywords: ["architecture", "decisions", "big-picture", "overview", "philosophy", "tradeoffs"]
size: "comprehensive"
created: "2025-11-17"
updated: "2025-11-17"
---

# Big Picture Index: Architectural Decisions & Patterns

## Purpose

This document provides a **comprehensive overview** of key architectural decisions, their rationale, tradeoffs, and how they fit together. It's designed for humans who need to understand the "why" behind the system.

---

## Core Philosophy

### 1. Worker-Ready from Day 1

**Decision**: Build MVP with multi-instance architecture in mind, even though MVP is single-instance.

**Why:**
- Avoids painful rewrite later
- Service layer stays pure (no realm awareness)
- Database has realmId from start
- Middleware abstraction allows swapping local → remote calls

**Tradeoff:**
- ✅ Future-proof, scalable
- ❌ Slight complexity overhead in MVP (realmId filtering when only one realm exists)

**Timeline:**
- **MVP (Q1 2025)**: Single hub instance, local DI calls
- **Worker (Q2-Q3 2025)**: Multi-instance, tRPC federation

---

### 2. Domain-Driven Design (DDD)

**Decision**: Organize code by domain (`src/domains/group/`), not by technology layer (`src/services/`, `src/components/`).

**Why:**
- **Colocation**: Related code (service, hook, component, types, tests) stays together
- **Boundaries**: Each domain is self-contained with clear public API
- **Scalability**: Domains can be worked on independently
- **Clear Auth Model**: "One Service Per Collection" makes permission checks explicit

**Tradeoff:**
- ✅ Easier to reason about, refactor, and scale
- ❌ Requires discipline (don't scatter utilities everywhere)

**Files:**
- `implementation/04-domain-structure.md` (current MVP pattern)

---

### 3. Service Layer Purity

**Decision**: Services are realm-agnostic, auth-agnostic, routing-agnostic.

**Why:**
- **Testability**: Mock Prisma, test in isolation
- **Reusability**: Same service works in MVP (local) and Worker (remote)
- **Single Responsibility**: Service = business logic only

**Tradeoff:**
- ✅ Clean separation of concerns
- ❌ Requires middleware to inject context (realm, user, policies)

**Pattern:**
```typescript
// ✅ CORRECT: Pure service
@injectable()
export class GroupService {
  async findOne(id: string) {  // ← No realm, no auth
    return this.prisma.group.findUnique({ where: { id } });
  }
}

// ❌ WRONG: Service knows about realm
async findOne(id: string, realmId: string) { ... }
```

**Files:**
- `architecture/02-service-patterns.md` (current MVP pattern)
- `rules/02-service-purity.md` (enforcement rules)

---

### 4. Auth in Middleware, Not Handlers

**Decision**: All permission checks happen in middleware, before handler code runs.

**Why:**
- **Security**: Handler never executes without auth passing
- **Consistency**: One place to audit auth checks
- **Performance**: No wasted work if auth fails

**Tradeoff:**
- ✅ Secure by design
- ❌ Requires middleware order discipline (auth FIRST)

**Pattern:**
```typescript
// ✅ CORRECT: Auth in middleware
export const updateGroup = procedure
  .middleware([authGuard([SCOPE.GROUP_EDIT])])  // ← Auth FIRST
  .mutation(async ({ input, ctx }) => {
    // Auth passed; safe to proceed
    return ctx.groupService.update(input.id, input);
  });

// ❌ WRONG: Auth in handler
export const updateGroup = procedure
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user.isAdmin) throw new Error('Forbidden');  // ← Too late!
    return ctx.groupService.update(input.id, input);
  });
```

**Files:**
- `rules/01-auth-enforcement.md` (enforcement rules)
- `implementation/03-auth-guards.md` (current MVP pattern)

---

### 5. Realm Isolation

**Decision**: Every database query filters by `realmId`.

**Why:**
- **Data Isolation**: Workers don't see each other's data
- **Security**: Prevents cross-realm leakage
- **Federation-Ready**: MVP uses "hub" realm; Worker adds more realms

**Tradeoff:**
- ✅ Strong isolation guarantees
- ❌ Every query must include realmId filter (easily forgotten)

**Pattern:**
```typescript
// ✅ CORRECT: Filter by realmId
const groups = await prisma.group.findMany({
  where: {
    realmId: CURRENT_REALM_ID,  // ← Always present
    isArchived: false
  }
});

// ❌ WRONG: Missing realmId
const groups = await prisma.group.findMany({
  where: { isArchived: false }  // ← Data leakage!
});
```

**Files:**
- `database/00-realm-model.md` (current MVP implementation)
- `rules/00-realm-isolation.md` (enforcement rules)

---

### 6. Policy Hierarchy & Cascading

**Decision**: Permissions cascade from parent groups to children, controlled by policy statements.

**Why:**
- **Flexibility**: GOD role on parent auto-escalates to VIEW on children
- **Granularity**: Override defaults with explicit policies
- **Audit Trail**: PolicyAssignment table tracks who granted what

**Tradeoff:**
- ✅ Rich permission model, minimal manual assignment
- ❌ Cascade logic can be complex to reason about

**Pattern:**
```typescript
// When creating child group, cascade parent policies
export const createGroupProcedure = procedure
  .middleware([authGuard([SCOPE.GROUP_CREATE])])
  .mutation(async ({ input, ctx }) => {
    const newGroup = await ctx.groupService.create(input);
    
    // Cascade escalation to parent managers
    if (input.parentId) {
      await ctx.policyService.cascadeEscalation(
        input.parentId,
        newGroup.id,
        ctx.user.id
      );
    }
    
    return newGroup;
  });
```

**Files:**
- `database/01-policy-system.md` (current MVP implementation)
- `database/02-group-hierarchy.md` (current MVP implementation)

---

### 7. Formatting in Hooks, Not Services or Components

**Decision**: Data transformation happens in React Query hook's `select` function.

**Why:**
- **Single Source of Truth**: One place for display logic
- **Testability**: Hooks are testable, formatting logic is isolated
- **Cache-Aware**: Formatting runs once, result is cached

**Tradeoff:**
- ✅ Consistent formatting, no duplication
- ❌ Hooks slightly more complex (not just pass-through)

**Pattern:**
```typescript
// ✅ CORRECT: Formatting in hook
export function useGroup(id: string) {
  return useQuery({
    queryKey: ['group', id],
    queryFn: async () => await groupService.findOne(id),
    select: (data) => ({
      ...data,
      displayName: formatGroupName(data.name),     // ← Format HERE
      memberCount: data.members?.length ?? 0,      // ← Calculate HERE
      isActive: data.status === 'ACTIVE',          // ← Transform HERE
    }),
  });
}

// Component receives formatted data
export function GroupCard() {
  const { data } = useGroup('123');
  return <h2>{data?.displayName}</h2>;  // ← Already formatted!
}
```

**Files:**
- Current MVP pattern (not in memory bank yet, to be documented)

---

### 8. Zod Satisfies Prisma

**Decision**: All Zod schemas must `satisfies` their corresponding Prisma types.

**Why:**
- **Type Safety**: Prevents drift between validation and database
- **Early Errors**: Compilation fails if types don't match
- **Documentation**: Schema IS the contract

**Tradeoff:**
- ✅ Strong guarantees, caught at build time
- ❌ Requires discipline (easy to forget `satisfies`)

**Pattern:**
```typescript
// ✅ CORRECT: Schema satisfies Prisma type
export const GroupSchema = z.object({
  id: z.cuid(),
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
}) satisfies z.ZodType<Prisma.Group>;  // ← Type-checked!

// ❌ WRONG: No satisfies
export const GroupSchema = z.object({
  id: z.string(),  // ← Should be cuid()
  name: z.string(),
});
```

**Files:**
- `rules/03-schema-validation.md` (enforcement rules)

---

## Migration Timeline: MVP → Worker

### Phase 1: MVP (Q1 2025) - 3 months

**Scope:**
- Single hub instance
- Central auth (AuthSCH)
- User profiles, groups, evaluations
- Policies and hierarchical permissions
- Web frontend (TanStack Start, serverFn only)

**What's Prepared (But Not Used):**
- Realm model (set to 'hub')
- realmId filtering (enforced in all queries)
- tRPC procedures (alongside serverFn, unused)
- Service abstraction (realm-agnostic)

**Deliverables:**
- [ ] Auth system (JWT, policies, guards)
- [ ] Service layer (Services, procedures)
- [ ] Frontend (serverFn, hooks, components)
- [ ] Full test coverage
- [ ] Hub instance live

---

### Phase 2: Worker Instances (Q2-Q3 2025) - 6 months

**Scope:**
- Multi-instance federation
- tRPC client for remote calls
- routingMiddleware for BFF
- Redis caching
- Instance registry

**What Changes:**
- Middleware: `jwtGuard + authGuard` → `jwtGuard + routingMiddleware`
- Handler: Local service call → Response combining
- Infrastructure: Add Redis, instance registry

**What Stays Same:**
- Service code (unchanged!)
- Policy logic (unchanged!)
- Frontend code (unchanged!)
- Prisma schema structure (no breaking changes)

**Deliverables:**
- [ ] Redis setup
- [ ] routingMiddleware implementation
- [ ] tRPC client for cross-instance calls
- [ ] Instance registry
- [ ] Federation table (user → instances)
- [ ] Multi-instance tests
- [ ] First worker instances live

---

## Key Tradeoffs Summary

| Decision | Benefit | Cost | Worth It? |
|----------|---------|------|-----------|
| Worker-ready MVP | Future-proof | Slight complexity | ✅ Yes (prevents rewrite) |
| Domain-driven | Colocation, boundaries | Discipline required | ✅ Yes (scales better) |
| Service purity | Testable, reusable | Middleware injection needed | ✅ Yes (cleaner code) |
| Auth in middleware | Secure by design | Order discipline | ✅ Yes (security critical) |
| Realm isolation | Strong isolation | Every query needs filter | ✅ Yes (prevents leakage) |
| Policy cascading | Flexible permissions | Complex reasoning | ✅ Yes (reduces manual work) |
| Formatting in hooks | Single source of truth | Slightly complex hooks | ✅ Yes (no duplication) |
| Zod satisfies Prisma | Type safety | Extra boilerplate | ✅ Yes (catches errors early) |

---

## Anti-Patterns to Avoid

### 1. Service Knows About Realm

**Why Wrong:**
- Can't reuse MVP→Worker
- Proliferation of realm awareness
- Harder to test

**Fix:** Services accept no realm parameter. Middleware handles realm context.

---

### 2. Missing realmId Filter

**Why Wrong:**
- Data leakage across instances
- Security hole

**Fix:** Every query MUST filter by realmId. Use linter or test to enforce.

---

### 3. Auth Check in Handler

**Why Wrong:**
- Handler executes before auth
- Security vulnerability

**Fix:** Auth MUST be in middleware, before handler.

---

### 4. Parent Validation Missing

**Why Wrong:**
- Can create groups under archived parents
- Orphaned groups if parent deleted

**Fix:** Validate parent exists and isn't archived before creating child.

---

### 5. Type Drift (Zod vs Prisma)

**Why Wrong:**
- Validation passes but database fails
- Silent bugs

**Fix:** Use `satisfies z.ZodType<PrismaType>` on all schemas.

---

## Common Questions

### Q: Why not REST instead of tRPC?

**A:** REST adds boilerplate (OpenAPI, manual types, endpoint versioning). tRPC gives end-to-end type safety with zero overhead. See `rejected/00-rest-endpoints-in-mvp.md` for full reasoning.

---

### Q: Why not have services know their realm?

**A:** Services need to work in MVP (local DI) and Worker (remote tRPC). Realm awareness breaks reusability. See `rejected/01-service-realm-awareness.md`.

---

### Q: Why format in hooks instead of services?

**A:** Services are backend-only, formatting is presentation logic. Hooks bridge the gap, provide single source of truth, and leverage React Query cache.

---

### Q: Why cascade policies automatically?

**A:** Manual assignment doesn't scale (hundreds of groups). Cascading reduces admin burden while maintaining flexibility via explicit policies.

---

### Q: Can I skip realmId filtering in MVP?

**A:** No. MVP is single-realm, but filtering by realmId establishes the habit and prepares for Worker instances. It's a few extra characters per query.

---

## Further Reading

### Current MVP Patterns
- `architecture/` - System design
- `database/` - Schema and models
- `implementation/` - Copy-paste templates
- `rules/` - Enforcement checklist

### Future Worker Patterns
- `future-plans/trpc.md` - tRPC procedures and middleware
- `future-plans/worker-instances.md` - Multi-instance routing and aggregation
- `future-plans/federation.md` - Hub/worker relationships and coordination

### Decision History
- `decisions/00-mvp-vs-worker-instance.md` - Feature matrix and timeline
- `rejected/` - Alternatives we considered and why we rejected them

### Learn from Mistakes
- `gotchas/00-common-mistakes.md` - Patterns agents often violate
- `gotchas/01-migration-blockers.md` - What breaks if rules violated
- `gotchas/02-performance-gotchas.md` - Optimization warnings

---

**Last updated**: 2025-11-17
