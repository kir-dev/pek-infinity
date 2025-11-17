---
file: 00-SYNTHETIC-MEMORY.md
purpose: "Ultra-concise big picture: what this system is, core constraints, and where to look for details"
triggers: ["starting new task", "need context quickly", "lost in details", "first time in codebase"]
keywords: ["overview", "big picture", "synthetic", "summary", "quick start", "context"]
status: "active"
urgency: "critical"
size: "500 words"
created: 2025-11-17
mvp-scope: "reference"
phase: "All phases"
updated: "2025-11-17"
---

# Synthetic Memory: The Big Picture

## What This System Is

**PÉK Infinity** is a full-stack TanStack Start application for managing organizational structure, group memberships, and evaluations. It's built for organizations like SchönHerz that need:
- Centralized user identity and authentication
- Hierarchical group structures with flexible permissions
- Domain-driven code organization (not technology layers)

## Current Status: MVP (Single Hub Instance)

**We're building:** One central instance with all functionality
**We're preparing for:** Future federation with multiple worker instances (Year 2+)

### MVP Implementation Reality Check
- ✅ **Using Now:** TanStack Start + serverFn + local service calls
- ✅ **Using Now:** Realm model (all data has `realmId: 'hub'`)
- ✅ **Using Now:** DI pattern with tsyringe
- ❌ **NOT Using Yet:** tRPC remote calls (only documented for future)
- ❌ **NOT Using Yet:** Multiple instances or federation
- ❌ **NOT Using Yet:** BFF routing layer

**Critical:** Many memory bank files document **future architecture** (tRPC procedures, worker instances, federation routing). For MVP work, focus on `implementation/02-serverfn-routing.md` and domain patterns.

## Five Unbreakable Rules

1. **Realm Isolation:** Every database query MUST filter by `realmId` (even if it's always 'hub' in MVP)
2. **Auth in Middleware:** Permission checks happen in middleware, NEVER in handlers
3. **Service Purity:** Services are realm-agnostic (don't accept `realmId` as parameter)
4. **Schema Validation:** Zod schemas MUST satisfy Prisma types (use `satisfies z.ZodType<...>`)
5. **One Service Per Collection:** Each database collection has exactly ONE service class

## Core Data Flow

```
Service (backend/)
  ↓ (via createServerFn with auth middleware)
React Query Hook (hooks/)
  ↓ (select transforms/formats data)
React Component (components/)
```

## Domain Structure

```
src/domains/{domain}/
├── index.ts              # Public API
├── __test__/            # Colocated tests
├── backend/
│   └── {domain}.service.ts    # ONE service per DB collection
├── components/
│   └── {feature}.tsx          # kebab-case
├── hooks/
│   └── use{Feature}.ts        # Formatting happens HERE
└── types/
    └── {domain}.schema.ts     # Zod schemas
```

## Where to Look for What

### Implementing a Feature (MVP)
1. `implementation/00-service-layer.md` - Service template
2. `implementation/02-serverfn-routing.md` - MVP routing pattern ⭐
3. `implementation/04-domain-structure.md` - File organization
4. `rules/` - MUST follow before PR

### Understanding Architecture
1. `decisions/00-mvp-vs-worker-instance.md` - What's MVP vs future
2. `architecture/02-service-patterns.md` - Service design principles
3. `database/00-realm-model.md` - Why realmId exists everywhere

### Debugging Issues
1. `gotchas/00-common-mistakes.md` - Common bugs and fixes
2. `rules/00-realm-isolation.md` - Data leakage prevention
3. `rules/01-auth-enforcement.md` - Permission bypass prevention

### Future Federation (Year 2+)
1. `architecture/00-federation-model.md` - Hub + worker architecture
2. `implementation/01-trpc-procedures.md` - tRPC patterns (future)
3. `architecture/04-routing-aggregation.md` - BFF routing (future)

## Common Confusion Points

**"Why does everything have `realmId: 'hub'` if there's only one instance?"**
→ We're preparing the data model now so migration to federation is trivial later.

**"Why not put auth checks in the service?"**
→ Services must be reusable. Auth context varies (MVP vs worker vs admin). Middleware provides that context.

**"Where do I format data for the UI?"**
→ In hooks, using React Query's `select` option. NOT in services or components.

**"Do I need to implement tRPC procedures?"**
→ NO. For MVP, use serverFn. tRPC is documented for future federation only.

## Quick Decision Tree

**Adding a new database query?**
→ Check `rules/00-realm-isolation.md` → Add to existing service → Filter by realmId

**Adding a new domain?**
→ Follow `implementation/04-domain-structure.md` → Use service template from `implementation/00-service-layer.md`

**Seeing permission errors?**
→ Check `gotchas/00-common-mistakes.md` Mistake #3 → Move auth to middleware

**Confused about what's MVP vs future?**
→ Read `decisions/00-mvp-vs-worker-instance.md` feature matrix

## Remember

- **MVP uses serverFn, not tRPC** (despite what you'll read in some files)
- **All code must work with realm model** (even if realmId is always 'hub' now)
- **Formatting happens in hooks** (select function), nowhere else
- **Memory bank has many future-focused files** - check `mvp-scope` frontmatter field

---

For full navigation: See `README.md`
For rules checklist: See `reference/04-quick-reference.md`
