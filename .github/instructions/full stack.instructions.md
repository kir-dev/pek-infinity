---
applyTo: '**/full-stack/**'
---
# AI Agent Instructions for pek-infinity

## Project Overview

**pek-infinity** is a full-stack TanStack Start application organized by domain-driven design (DDD) rather than technology-layered folders. This is a TypeScript/React project using TanStack Start (SSR-capable full-stack framework), React Query, tRPC, Prisma, and Zod. The project is located in the pek-infinity/full-stack directory.

Action: Use `PLAN.md` as the authoritative reference for architecture decisions and migration steps. This file is a concise, actionable cheat-sheet that references `PLAN.md` for detailed rationale and the migration checklist.

---

## Architecture Overview

### Core Pattern: Service → Hook (Formatter) → Component

**Data Flow**:
```
Prisma Service (backend/)
  ↓ (via createServerFn with tRPC middleware)
React Query Hook (hooks/)
  ↓ (select + transform)
React Component (components/)
```

### Domain Structure

```
src/domains/{domain}/
├── index.ts              # Public API exports
├── __test__/             # Domain-specific tests (.spec.ts)
├── backend/
│   ├── {domain}.service.ts    # Database operations via createServerFn
│   └── {domain}.guard.ts      # Auth middleware (if needed)
├── components/
│   ├── {feature}.tsx          # React components (kebab-case)
│   └── storybook/             # Storybook stories
├── hooks/
│   └── use{Feature}.ts        # React Query hooks with formatting
└── types/
    ├── {domain}.types.ts      # TS types
    └── {domain}.schema.ts     # Zod validation schemas
```

---

## Architecture Decision: Why Domain-Driven Design?

From PLAN.md: We're moving away from **technology-layered architecture** (`src/hooks/`, `src/components/`, `src/services/`) to **domain-driven organization** because:

1. **Colocation** - Related code (service, hook, component, types, tests) stays together → easier to reason about, easier to refactor
2. **Boundaries** - Each domain is a self-contained unit with its own `index.ts` API surface
3. **Scalability** - Domains can be worked on independently without import path conflicts
4. **Clear Auth Model** - "One Service Per Collection" makes permission checks explicit and centralized
5. **Prevents Permission Bugs** - Multiple services per table = multiple permission check points = easier to miss one

**Phase 2 Migration**: Legacy code in `src/hooks/` or `src/components/` should be moved into domains, not modified in place.

---

## Critical Conventions: Do This, Not That

### 1. One Service Per Database Collection

**DO THIS** ✅
```typescript
// src/domains/group/backend/group.service.ts
export const GroupService = {
  findById: createServerFn({ method: 'GET' })
    .inputValidator(GroupFindOneSchema)
    .middleware([authGuard([SCOPE.GROUP_VIEW])])
    .handler(async ({ context: { prisma }, data: { id } }) => {
      return prisma.group.findUnique({ where: { id } });
    }),

  findAll: createServerFn({ method: 'GET' })
    .inputValidator(z.object({}))
    .middleware([authGuard([SCOPE.GROUP_LIST])])
    .handler(async ({ context: { prisma } }) => {
      return prisma.group.findMany();
    }),
};
```

**NOT THIS** ❌
```typescript
// WRONG: Multiple services for the same table
export const GroupListService = { findAll: ... };
export const GroupDetailService = { findById: ... };

// Why? Different auth checks for same collection = permission bugs
// Multiple permission enforcement points = gaps and inconsistencies
```

**Decision Tree**:
- Multiple **queries** on same collection? → Add more functions to same service
- Multiple **collections**? → Create separate service
- Related operations across collections (e.g., group + members)? → Create separate services, coordinate in hooks/components

---

### 2. Formatting Happens in Hooks, Not Anywhere Else

**Principle**: Hooks are the boundary between raw data (service) and UI consumption (component). Formatting here ensures:
- Single source of truth for display logic
- Testable transformation logic
- Easy to reuse formatted data across multiple components
- Cache-aware (formatting runs once, result is cached with query)

**DO THIS** ✅
```typescript
// src/domains/group/hooks/useGroup.ts
export const groupQueryOptions = (params = {}) =>
  queryOptions({
    queryKey: ['group', params],
    queryFn: async ({ signal }) =>
      await useServerFn(GroupService.findById)({ signal, data: params }),
  });

export function useGroup(params = {}) {
  return useQuery({
    ...groupQueryOptions(params),
    select: (data) => ({
      ...data,
      displayName: formatGroupName(data.name),     // ✅ HERE
      memberCount: data.members?.length ?? 0,      // ✅ HERE
      lastActive: formatDate(data.updatedAt),      // ✅ HERE
      isActive: data.status === 'ACTIVE',          // ✅ HERE
    }),
  });
}

// Component receives fully formatted data
export function GroupCard() {
  const group = useGroup({ id: '123' });
  return <h2>{group.data?.displayName}</h2>;  // Already formatted!
}
```

**NOT THIS** ❌
```typescript
// WRONG: Formatting in component
export function GroupCard({ group }) {
  const displayName = formatGroupName(group.name);     // ❌ Scattered logic
  const memberCount = group.members?.length ?? 0;      // ❌ Repeated everywhere
  const lastActive = formatDate(group.updatedAt);      // ❌ Hard to maintain
  return <h2>{displayName}</h2>;
}

// WRONG: Formatting in service
export const GroupService = {
  findById: createServerFn({ method: 'GET' })
    .handler(async ({ context: { prisma }, data: { id } }) => {
      const group = await prisma.group.findUnique({ where: { id } });
      return {
        ...group,
        displayName: formatGroupName(group.name),  // ❌ Service shouldn't format
      };
    }),
};
```

**Why?**
- Formatting in components: Same logic duplicated everywhere, hard to change, scattered business logic
- Formatting in service: Mixes business logic with presentation, breaks SSR, formatting isn't reusable via queryOptions

---

### 3. Type Safety: Zod Satisfies Prisma

**Principle**: Zod schemas must `satisfy` Prisma types to prevent type drift between ORM and validation layer.

**DO THIS** ✅
```typescript
// src/domains/group/types/group.schema.ts
export const GroupSchema = z.object({
  id: z.cuid(),
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  createdAt: z.date(),
  updatedAt: z.date(),
  // ... other fields
}) satisfies z.ZodType<Prisma.Group>;

export type Group = z.infer<typeof GroupSchema>;
export const GroupFindOneSchema = GroupSchema.pick({ id: true });
```

**NOT THIS** ❌
```typescript
// WRONG: Schema doesn't match Prisma type
export const GroupSchema = z.object({
  id: z.string(),        // ❌ Prisma uses cuid()
  name: z.string(),
  description: z.string(), // ❌ Prisma has nullable
  status: z.string(),    // ❌ Prisma uses enum
});

// Result: Type mismatches, validation passes but database operations fail
```

**Type File Organization**:
- **Domain types**: `src/domains/{domain}/types/{domain}.schema.ts`
- **Global types**: `src/types/` (auth, common schemas)
- **Inline types**: Hook-specific types can stay in hook file
- **Never**: Type files scattered across multiple locations in same domain

---

### 4. Auth Guards: Middleware Chain, Not Components

**Principle**: All permission checks happen in services. Components never perform auth logic.

**DO THIS** ✅
```typescript
// src/domains/group/backend/group.service.ts
export const GroupService = {
  findById: createServerFn({ method: 'GET' })
    .inputValidator(GroupFindOneSchema)
    .middleware([authGuard([SCOPE.GROUP_VIEW])])  // ✅ Auth at service entry
    .handler(async ({ context: { prisma }, data: { id } }) => {
      return prisma.group.findUnique({ where: { id } });
    }),
};

// src/domains/group/hooks/useGroup.ts
export function useGroup(id: string) {
  return useQuery({
    queryFn: async () => 
      await useServerFn(GroupService.findById)({ data: { id } }),
  });
}

// src/domains/group/components/group-card.tsx
export function GroupCard({ id }: { id: string }) {
  const { data, isLoading, error } = useGroup(id);
  
  if (error) return <Error message="Permission denied" />;  // ✅ Component handles result
  if (isLoading) return <Skeleton />;
  return <Card>{data?.displayName}</Card>;
}
```

**NOT THIS** ❌
```typescript
// WRONG: Permission checks in component
export function GroupCard({ id }: { id: string }) {
  const { user } = useAuth();
  
  if (!user?.scopes?.includes('GROUP_VIEW')) {  // ❌ Wrong layer
    return <Error />;
  }
  
  const { data } = useGroup(id);
  return <Card>{data?.displayName}</Card>;
}

// Why? Inconsistent auth checks, client-side auth is bypassable, logic scattered
```

**Auth Files**:
- `src/domains/auth/backend/auth.guard.ts` - Auth middleware
- `src/middleware/scopes.ts` - Scope definitions
- `src/middleware/inject-service.ts` - DI pattern

---

### 5. Naming: Clear Conventions

**DO THIS** ✅
```
Components:     group-card.tsx          (kebab-case, describes UI element)
Hooks:          useGroup.ts             (camelCase, starts with "use")
Services:       group.service.ts        (descriptive, ends with .service)
Types:          group.schema.ts         (domain + purpose)
Tests:          group.spec.ts           (feature + .spec)
```

**NOT THIS** ❌
```
GroupCard.tsx               (PascalCase - not consistent)
use-group.ts                (kebab-case for hooks - hard to find)
groupService.ts             (no .service extension)
GroupSchema.ts              (PascalCase - inconsistent)
group-test.ts               (wrong test suffix)
```

---

## Patterns by Scenario

### Adding a New Domain Feature

1. **Create structure**:
   ```bash
   src/domains/{domain}/
   ├── index.ts
   ├── __test__/
   ├── backend/
   │   └── {domain}.service.ts
   ├── components/
   ├── hooks/
   └── types/
       └── {domain}.schema.ts
   ```

2. **Start with types** (Zod schema satisfying Prisma type)
3. **Add service** (createServerFn with auth guards)
4. **Add hook** (queryOptions + useQuery with select for formatting)
5. **Add components** (consume formatted hook data)
6. **Add tests** in `__test__/`
7. **Export from index.ts**

### Modifying an Existing Service

1. Update Zod schema FIRST (ensures type safety)
2. Update service handler logic
3. Update hook's `select` if formatting changed
4. Update components if API contract changed
5. Update tests
6. Run: `npm run test && npm run lint && npm run format`

### Testing Strategy

- **Unit Tests**: Colocated with source (`src/domains/{domain}/__test__/`)
- **Integration Tests**: `test/` directory for cross-domain concerns
- **Examples**:
  - `test/services/group.service.spec.ts` - Service logic
  - `test/middleware/di-integration.spec.ts` - Middleware patterns

---

## Build, Test & Development

### Key Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run start        # Run production build
npm run test         # Run tests with Vitest
npm run lint         # Lint with Biome
npm run format       # Format with Biome
npm run check        # Full Biome check (lint + format verify)
npm run storybook    # Dev Storybook (port 6006)
```

Package scripts verification: I inspected `package.json` and confirmed the scripts listed above exist. If you add references to other scripts in this file, update `package.json` and include a placeholder script in the repo to avoid CI failures.

### Key Dependencies

| Package | Purpose |
|---------|---------|
| `@tanstack/react-start` | Full-stack SSR framework |
| `@tanstack/react-query` | Data fetching + caching |
| `zod` | Type-safe validation (must satisfy Prisma types) |
| `prisma` | Database ORM |
| `biome` | Linting + formatting (non-configurable) |
| `vitest` | Testing framework |

---

## Decision Points & Escalation

### When to Ask for Help

**Ask for architectural review if**:
- A feature spans 3+ domains (possible design smell)
- You're unsure about where code belongs
- Multiple domains need to coordinate complex logic
- You're tempted to create top-level utilities (consider domain-level instead)

**Ask for design review if**:
- A service handles operations on 2+ unrelated database collections
- A hook's select is more than 20-30 lines
- You need circular dependencies between domains
- Auth guards become more complex than role checks

---

## Gotchas & Important Notes

1. **Phase 1-2 Transition**: Legacy `src/hooks/` and `src/components/` still exist. When modifying them, prefer moving into domains rather than modifying in place.

2. **Prisma Schema Alignment**: If Zod schema doesn't satisfy Prisma type, types drift. This causes silent bugs.

3. **Middleware Order Matters**: Auth guards must run BEFORE database operations. Order in `.middleware([...])` is significant.

4. **One Service Per Collection**: Multiple services for same table = multiple permission check points = security bugs. Use different hooks instead.

5. **Formatting ONLY in Hooks**: Don't scatter formatting logic across components or services. It belongs in the hook's `select` function.

6. **Tests Colocation**: Domain tests in `src/domains/{domain}/__test__/`, integration tests in `/test/`. Not scattered randomly.

7. **SSR Considerations**: Use `isServer` checks for node-only operations (file I/O, env vars, secrets). TanStack Start runs code on both client and server.

8. **Import Paths**: Use absolute imports via tsconfig: `@/domains/group/hooks/useGroup` not `../../domains/...`

---

## Reference Examples

- **Reference Domain**: `src/domains/auth/` - Complete, well-structured domain
- **Service Pattern**: `src/domains/auth/backend/auth.service.ts`
- **Hook Pattern**: Look for examples in other domains' `hooks/` folders
- **Testing**: `test/middleware/di-integration.spec.ts` for DI patterns
- **Architecture Rationale**: `PLAN.md` for all decision explanations

---

## Questions?

1. **Architecture unclear**: Read `PLAN.md` sections on that pattern
2. **How to structure code**: Look at `src/domains/auth/` structure
3. **Why a rule exists**: Check `PLAN.md` decision framework
4. **Edge cases**: Ask in PR review or escalate to team
