---
purpose: "MVP vs worker-instance scope summary - see future-plans/big-picture-index.md for comprehensive breakdown"
triggers: ["planning sprint", "estimating PR scope", "questioning feature scope"]
keywords: ["MVP", "worker-instance", "scope", "timeline", "feature", "rollout", "phase"]
dependencies: ["future-plans/big-picture-index.md"]
urgency: "high"
size: "300 words"
status: "active"
updated: "2025-11-17"




---

# Decision: MVP vs Worker Instance Scope

## For Complete Documentation

See **`future-plans/big-picture-index.md`** for comprehensive feature matrix, migration timeline, tradeoffs, and detailed planning.

## Quick Summary

**Key principle**: MVP code is worker-ready. We're not rewriting; we're enabling.

## MVP 1.0 (Q1 2025) - Single Hub Instance

**Building:**
- One hub instance, one database
- Central auth (AuthSCH), user profiles, groups, evaluations
- Policy hierarchy and cascading
- Web frontend (TanStack Start, serverFn)

**Preparing for (not implementing):**
- Realm model (set to 'hub')
- realmId filtering enforced
- Service abstraction (realm-agnostic)
- tRPC procedures defined (unused in MVP)

## Worker 1.1+ (Q2-Q3 2025) - Multi-Instance

**Adding:**
- Redis caching
- tRPC client for remote calls
- routingMiddleware for BFF
- Instance registry
- Federation table (user → instances)

**Unchanged:**
- Service code
- Policy logic
- Frontend code
- Prisma schema

## Feature Matrix (Quick Reference)

| Category | MVP | Worker |
|----------|-----|--------|
| **Auth & Data** |
| JWT, policies, realm model | ✅ | ✅ |
| Redis caching | ❌ | ✅ |
| Policy snapshots | ❌ | ✅ |
| **Routing** |
| serverFn + local DI | ✅ | ✅ |
| tRPC client calls | ❌ | ✅ |
| routingMiddleware | ❌ | ✅ |
| **Infrastructure** |
| Single hub instance | ✅ | ✅ |
| Multiple worker instances | ❌ | ✅ |
| Instance registry | ❌ | ✅ |

## Migration Path

**No breaking changes:**
- Services stay realm-agnostic
- Database keeps realmId filtering
- Middleware swap: `authGuard` → `routingMiddleware`
- Handler changes: local call → response combining

## MVP Checklist

- [ ] Realm model (set to 'hub')
- [ ] All queries filter by realmId
- [ ] Services are realm-agnostic
- [ ] tRPC procedures defined
- [ ] DI (tsyringe) working
- [ ] Auth enforcement in middleware
- [ ] Tests for realm isolation

## Worker Checklist

- [ ] Redis setup
- [ ] routingMiddleware
- [ ] tRPC client
- [ ] Instance registry
- [ ] Federation table
- [ ] Multi-instance tests

---

**For complete details**: `future-plans/big-picture-index.md`

**Last updated**: 2025-11-17

