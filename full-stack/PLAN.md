# Code Organization Standards - PLAN.md

## Overview
This document outlines the finalized code organization standards for our full-stack TanStack Start project. We're migrating from separate frontend/backend architecture to domain-driven organization, eliminating top-level technology grouping (no more `src/hooks/`, `src/components/`, etc.).

## Core Principles
- **Domain-Driven Design**: Organize by business domains, not technology layers
- **Colocation**: Keep related code together (hooks with components, tests with source)
- **One Service Per DB Document**: Each database collection has exactly one service to avoid auth complexity
- **Full-Stack Architecture**: TanStack Start enables shared code between client and server

## Directory Structure
```
src/
  domains/
    {domain}/
      index.ts                    # Public API exports
      __test__/                   # Domain-specific tests
        {feature}.spec.ts
      backend/                    # Server-side logic
        {domain}.service.ts       # DI service (one per DB document)
        {domain}.controller.ts    # Optional: REST endpoints
        {domain}.router.ts        # Optional: tRPC procedures
      components/                 # React components
        {feature}.tsx
        storybook/               # Storybook stories
          {feature}.stories.tsx
      hooks/                     # React hooks (data fetching, state)
        use{feature}.ts
      types/                     # TypeScript types
        {domain}.types.ts
        {domain}.schema.ts       # Zod schemas
  routes/                        # TanStack Router routes
  middleware/                    # Global middleware
  integrations/                  # Third-party integrations
  lib/                          # Shared utilities
  utils/                        # Project utilities
```

## Decision Framework

### Formatting Strategy: Hooks Handle Formatting (Option A)
**Decision**: Hooks are responsible for data transformation and formatting.

**Rationale**:
- Hooks are the natural boundary between raw data and UI consumption
- Keeps formatting logic close to data fetching
- Avoids additional abstraction layers for simple cases
- Consistent with React Query patterns

**Implementation**:
```typescript
// domains/group/group.service.ts
export const GroupSchema = z.object({
  id: z.cuid(),
  name: z.string().min(1),
  description: z.string(),
  // ... other fields
}) satisfies z.ZodType<Prisma.Group>;
export type Group = z.infer<typeof GroupSchema>;

export const GroupFindOneSchema = GroupSchema.pick({ id: true });


// domains/group/backend/group.service.ts
export const GroupService = {
  findById: createServerFn({ method: 'GET' })
    .inputValidator(GroupFindOneSchema)
    .middleware([authGuard([SCOPE.GROUP_VIEW])])
    .handler(async ({ context: { prisma }, data: { id } }) => {
      return prisma.group.findUnique({ where: { id } });
    }),
};

// domains/group/hooks/useGroup.ts
export const groupQueryOptions = (
  params: z.infer<typeof GroupFindOneSchema> = {},
  search: Record<string, unknown> = {}
) =>
  queryOptions({
    queryKey: ['group', params, search],
    queryFn: async ({ signal }) =>
      await useServerFn(GroupService.findById)({
        signal,
        data: params,
      }),
  });

export function useGroup(
  params: z.infer<typeof GroupFindOneSchema> = {},
  search: Record<string, unknown> = {}
) {
  return useQuery({
    ...groupQueryOptions(params, search),
    select: (data) => ({
      ...data,
      displayName: formatGroupName(data.name),
      memberCount: data.description.length,
      lastActivity: formatDate(data.updatedAt),
    }),
  });
}

// domains/group/components/group-card.tsx
export function GroupCard({ id }: { id: string }) {
  const group = useGroup({ id });

  if (group.isLoading) return <Skeleton />;
  if (error && !group.data) return <Error />;

  return (
    <Card>
      <h2>{group.data?.displayName}</h2>
      <p>{group.data?.memberCount} members</p>
      <time>{group.data?.lastActivity}</time>
    </Card>
  );
}
```

**Key Points**:
- `groupQueryOptions` defines raw data fetching (cached by React Query)
- `useGroup` hook adds formatting/transformation on top of query
- Components consume the formatted data from the hook
- Service is colocated in domain's `backend/` folder
- Types are colocated in domain's `types/` folder

### Service Pattern Selection
**Status**: Future task - not yet designed. Will be addressed after initial domain migration is complete.

### Type Cohabitation Rules
- **Domain Types**: Live in `domains/{domain}/` close to DB calls.
- **Global Types**: In `src/types/` (auth, common schemas)
- **Hook-Specific Types**: Inline or in hook file
- **Schema Types**: zod/v4, colocated with domain types, must satisfy prisma types.
- **API Types**: Using zod .extend, .omit, .pick

### Test Placement Strategy
- **Colocation**: Tests live with source code (`.spec.ts`, `.spec-e2e.ts`)
- **Mocks**: Domain-specific mocks in domain `__test__/` folders
- **Integration Tests**: In workspace root `/test` for cross-domain concerns

## Migration Checklist

### Phase 1: Documentation & Standards
- [ ] Create ORGANIZATION.md
- [ ] Create DECISION_FRAMEWORK.md
- [ ] Create MIGRATION_CHECKLIST.md
- [ ] Finalize PLAN.md (this document)
- [ ] Audit existing codebase for inconsistencies

### Phase 2: Domain Restructuring
- [ ] Move `src/components/` to respective domains
- [ ] Move `src/hooks/` to respective domains
- [ ] Consolidate domain-specific types
- [ ] Update imports across codebase
- [ ] Migrate services to DI pattern

### Phase 3: Future - Service Pattern Standardization
- [ ] Design service pattern selection framework
- [ ] Convert inline API services to standardized pattern
- [ ] Update route handlers

### Phase 4: Testing & Validation
- [ ] Move tests to domain `__test__/` folders
- [ ] Update test imports
- [ ] Run full test suite
- [ ] Validate build and deployment

## Implementation Notes

### Auth & Guards
- Global concepts, not domain-specific
- Implement as middleware or route guards
- Services handle permission checks internally

### Membership Domain
- First-class domain, not a join concept
- Own service, components, hooks
- Handles group-user relationships

### Data Flow Pattern
```
Service → Hook (with formatting) → Component
```

### File Naming Conventions
- Services: `{domain}.service.ts`
- Hooks: `use{feature}.ts`
- Components: `{feature}.tsx`
- Types: `{domain}.types.ts`
- Tests: `{feature}.spec.ts`

## Next Steps
1. Review and approve this PLAN.md
2. Begin Phase 1 documentation creation
3. Schedule Phase 2 domain restructuring
4. Plan service pattern migrations

## Open Questions
- Should we maintain any top-level component libraries?
- How to handle shared UI components across domains?
- Migration timeline and team coordination strategy?
