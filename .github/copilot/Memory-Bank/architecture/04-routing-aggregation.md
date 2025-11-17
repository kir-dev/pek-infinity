---
file: architecture/04-routing-aggregation.md
purpose: "Routing stub - see future-plans/worker-instances.md for complete BFF routing and aggregation patterns"
triggers: ["implementing serverFn", "designing aggregation logic", "handling cross-instance searches"]
keywords: ["routing", "aggregation", "combining", "partial-failure", "federation", "multi-instance", "future"]
dependencies: ["future-plans/worker-instances.md", "future-plans/federation.md"]
urgency: "low"
size: "100 words"
status: "stub"
updated: "2025-11-17"




---

# Routing & Aggregation: Worker-Only Feature (Future)

## Status

**Worker-only (Year 2+)** - Multi-instance routing and aggregation. **MVP uses single hub instance with trivial routing.**

## For Complete Documentation

See **`future-plans/worker-instances.md`** for:
- Complete routing and aggregation patterns
- Instance discovery strategies
- Response combining strategies
- Handling partial failures
- Caching and timeout strategies
- Real-world examples

## Quick Overview

In worker instances, **serverFn** acts as BFF:
1. **Route**: Determine which instances to call
2. **Call**: Execute worker on each instance (via tRPC or DI)
3. **Combine**: Aggregate results

## MVP Pattern (Current)

```typescript
// MVP: Local service call only
.handler(async ({ context: { injector } }) => {
  const service = injector.resolve(GroupService);
  return service.findOne(id);  // Direct, no routing
});
```

## Worker Pattern (Future)

```typescript
// Worker: Route to multiple instances, combine results
.middleware([routingMiddleware(procedure)])
.handler(async ({ context: { responses } }) => {
  // Return first success or merge all
  return responses.successResponses[0]?.data;
});
```

## Response Strategies (Future)

| Use Case | Strategy |
|----------|----------|
| Single resource | Return first success |
| Search/list | Merge all successes |
| Critical data | Require hub success |
| Dashboard | Partial results OK (with warnings) |

---

**For complete details**: `future-plans/worker-instances.md`

**Last updated**: 2025-11-17
