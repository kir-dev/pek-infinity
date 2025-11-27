---
purpose: "GOTCHA: serverFn handlers must return json() wrapped responses"
triggers: ["serverFn returns undefined", "middleware chain breaks", "test failures"]
keywords: ["serverFn", "json", "Response", "TanStack", "handler"]
importance: "high"
size: "200 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Gotcha: serverFn Must Return json() Responses

## The Problem

TanStack Start's `createServerFn` expects handlers to return `Response` objects (via `json()`) for proper serialization and middleware chaining.

**Plain objects break the middleware chain and cause undefined results.**

## Wrong vs Right

```typescript
// ❌ WRONG: Returns plain object
.handler(async ({ context, data }) => {
  return context.service.findOne(data.params.id);  // Breaks!
})

// ✅ RIGHT: Wraps with json()
.handler(async ({ context, data }) => {
  return json(context.service.findOne(data.params.id));
})
```

## Why It Matters

- Middleware chain breaks
- Tests return undefined
- Client receives malformed responses
- Hard to debug (silent failures)

## Detection

If your serverFn tests are failing with undefined results, check if you're wrapping responses with `json()`.
