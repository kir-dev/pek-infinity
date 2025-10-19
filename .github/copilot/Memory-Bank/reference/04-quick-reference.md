---
file: reference/04-quick-reference.md
purpose: "One-page summary, key commands, PR checklist, critical rules"
triggers: ["before submitting PR", "quick lookup", "first-time context"]
keywords: ["checklist", "summary", "reference", "quick", "rules"]
dependencies: ["all architecture/*", "all rules/*"]
urgency: "high"
size: "500 words"
status: "active"
created: "2025-10-20"




---

# Quick Reference: Checklist & Commands

## Key Rules (Non-Negotiable)

1. **Realm Isolation**: Every query filters by `realmId`
   ```bash
   grep -r "findMany\|findUnique" src/domains/ | grep -v realmId
   ```

2. **Auth in Middleware**: `jwtGuard` first, `authGuard` second
   ```typescript
   .middleware([jwtGuard, authGuard(['SCOPE'])])
   ```

3. **Service Purity**: Services don't know about realm/auth
   ```typescript
   async findOne(id: string) { ... }  // ← No realm parameter
   ```

4. **Parent Validation**: Parent group can't be archived
   ```typescript
   if (parent.isArchived) throw new Error('Parent archived');
   ```

5. **Zod Satisfies Prisma**: Schema types must match
   ```typescript
   const schema = z.object({...}) satisfies z.ZodType<Prisma.Model>
   ```

## PR Checklist

- [ ] Realm filtering on all queries
- [ ] Auth in middleware (not handler)
- [ ] Services tested in isolation
- [ ] Types: Zod satisfies Prisma
- [ ] No hardcoded realm IDs
- [ ] Cascading respects realm boundaries
- [ ] Tests cover happy + error paths
- [ ] No sensitive data in errors

## Quick Lookup

| Question | File |
|----------|------|
| Why cloud + enterprise? | `architecture/00-federation-model.md` |
| How does JWT work? | `architecture/01-auth-system.md` |
| How are services designed? | `architecture/02-service-patterns.md` |
| What's a realm? | `database/00-realm-model.md` |
| What's in MVP vs enterprise? | `decisions/00-mvp-vs-enterprise.md` |
| Service template? | `implementation/00-service-layer.md` |
| Common mistakes? | `gotchas/00-common-mistakes.md` |

## Common Commands

```bash
# Find queries without realm filter
grep -r "findMany\|findUnique" src/domains/ | grep -v realmId

# Format with Biome
npm run format

# Run tests
npm run test

# Check types
npm run check
```

## Domain Template

```
src/domains/{name}/
├── backend/
│   ├── {name}.service.ts      # Pure business logic
│   ├── {name}.procedures.ts   # tRPC (reusable)
│   └── {name}.guards.ts       # Auth middleware
├── components/
│   └── {feature}.tsx
├── hooks/
│   └── use{Feature}.ts
├── types/
│   └── {name}.schema.ts
├── __test__/
│   └── {name}.spec.ts
└── index.ts
```

## Middleware Order (CRITICAL)

```
1. jwtGuard          (validate JWT)
2. authGuard or     (check permissions)
   routingMiddleware (route to instances)
3. handler          (business logic)
```

**Wrong order = security hole.**

## Response Combining Strategies

| Use Case | Strategy |
|----------|----------|
| Single resource | Return first success |
| Search | Merge all successes |
| Critical data | Require cloud success |
| Optional data | Partial results OK |

## Feature: In MVP or Enterprise?

| Feature | Where |
|---------|-------|
| JWT + auth | MVP ✅ |
| Policies + cascading | MVP ✅ |
| Realm model | MVP ✅ |
| realmId filtering | MVP ✅ |
| Redis caching | Enterprise ✅ |
| tRPC client | Enterprise ✅ |
| Multi-instance routing | Enterprise ✅ |

## Testing Checklist

- [ ] Unit: Service in isolation
- [ ] Unit: Auth guard decisions
- [ ] Integration: Full middleware stack
- [ ] Integration: Realm isolation
- [ ] E2E: Frontend → backend flow

## Gotchas (Prevent These)

- ❌ Service accepts `realm` parameter
- ❌ Query without `realmId` filter
- ❌ Auth check in handler
- ❌ Hardcoded "cloud" realm
- ❌ Parent validation missing
- ❌ Cascading crosses realms
- ❌ Missing Zod validation

## Token Budget (Rough)

- Frontmatter scan: ~2KB
- Core architecture: ~20KB
- Full memory bank: ~100KB

Load what you need!

---

**Last updated**: 2025-10-20
