---
purpose: "MUST: Organize code by domain, not technology layer"
triggers: ["creating new feature", "organizing code", "file structure"]
keywords: ["domain", "DDD", "structure", "organization", "colocation"]
importance: "high"
size: "300 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Rule: Domain-Driven Design (DDD)

## The Rule

**Organize code by domain (`src/domains/group/`), not by technology layer (`src/services/`, `src/components/`).**

## Why It Matters

- **Colocation**: Related code (service, hook, component, types, tests) stays together
- **Boundaries**: Each domain is self-contained with clear public API
- **Scalability**: Domains can be worked on independently
- **Clear Auth Model**: "One Service Per Collection" makes permission checks explicit

## Structure

```
src/domains/group/
  ├── api/
  │   ├── group.service.ts
  │   ├── group.service.spec.ts
  │   └── group.procedures.ts
  ├── hooks/
  │   └── useGroups.ts
  ├── components/
  │   └── GroupCard.tsx
  └── types/
      └── group.types.ts
```

## Tradeoffs

- ✅ Easier to reason about, refactor, and scale
- ❌ Requires discipline (don't scatter utilities everywhere)

## Code Reference

See `full-stack/src/domains/` for examples of domain organization.
