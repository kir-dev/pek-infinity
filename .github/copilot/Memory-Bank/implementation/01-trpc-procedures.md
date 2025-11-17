---
file: implementation/01-trpc-procedures.md
purpose: "tRPC stub - future worker-only feature, see future-plans/trpc.md for complete documentation"
triggers: ["implementing new domain", "adding new procedure", "code review for procedures"]
keywords: ["tRPC", "procedure", "validation", "middleware", "context", "query", "mutation", "router", "future", "worker"]
dependencies: ["future-plans/trpc.md", "architecture/02-service-patterns.md"]
urgency: "low"
size: "100 words"
template: false
status: "stub"
updated: "2025-11-17"




---

# tRPC Procedures: Worker-Only Feature (Future)

## Status

**Worker-only (Year 2+)** - This pattern is for future multi-instance federation. **MVP uses serverFn + local service calls only.**

## For Complete Documentation

See `future-plans/trpc.md` for:
- Complete procedure patterns with full examples
- Input validation with Zod
- Middleware order and context injection
- Query vs Mutation patterns
- Error handling strategies
- Real-world examples
- Testing patterns
- Common gotchas
- PR checklist

## Quick Pattern (Reference)

```typescript
// Future pattern when worker instances exist
export const groupProcedures = {
  findOne: procedure
    .input(z.object({ id: z.cuid() }))
    .middleware([authGuard([SCOPE.GROUP_VIEW])])
    .query(async ({ input, ctx: { groupService } }) => {
      return groupService.findOne(input.id);
    }),
};
```

## MVP Alternative

In MVP, use serverFn + local service calls:

```typescript
// See implementation/02-serverfn-routing.md for current MVP pattern
export const findGroup = createServerFn({ method: 'GET' })
  .inputValidator(httpSchema({ params: GroupFindOneSchema }))
  .middleware([authGuard([SCOPE.GROUP_VIEW])])
  .handler(async ({ context: { prisma }, data }) => {
    return prisma.group.findUnique({ where: { id: data.params.id } });
  });
```

---

**For implementation details, see**: `future-plans/trpc.md`

**Last updated**: 2025-11-17

