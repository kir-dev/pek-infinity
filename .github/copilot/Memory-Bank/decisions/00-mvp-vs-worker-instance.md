---
file: decisions/00-mvp-vs-worker-instance.md
purpose: "Feature-by-feature breakdown of MVP vs worker-instance; scope, timeline, reversibility"
triggers: ["planning sprint", "estimating PR scope", "questioning feature scope"]
keywords: ["MVP", "worker-instance", "scope", "timeline", "feature", "rollout"]
dependencies: []
urgency: "high"
size: "2000 words"
reversibility: "high"
decision-date: "2025-10-20"
status: "active"
created: "2025-10-20"
mvp-scope: "future"
phase: "Phase 1+ (Q2 2026+)"
created: "2025-10-20"
updated: "2025-11-17"
---

# Decision: MVP vs Worker Instance Features

## Overview

This matrix clarifies what's in MVP 1.0 (single hub instance) vs what's worker instance rollout (1.1+).

**Key principle**: MVP code is worker-ready. We're not rewriting; we're enabling.

## Feature Matrix

| Feature | MVP | Worker | Notes |
|---------|-----|-----------|-------|
| **Auth & Authorization** |
| Global JWT (httpOnly cookie) | ✅ Yes | ✅ Yes | Same everywhere |
| Policy hierarchy | ✅ Yes | ✅ Yes | Same schema |
| Policy cascading on group create | ✅ Yes | ✅ Yes | Same logic |
| Audit trail (PolicyAssignment) | ✅ Yes | ✅ Yes | Same everywhere |
| Redis caching | ❌ No | ✅ Yes | MVP uses in-memory |
| Policy snapshots | ❌ No | ✅ Yes | Optimization for multi-instance |
| x-policy-hint header | ❌ No | ✅ Yes | Performance optimization |
| Instance-level auth guards | ❌ No | ✅ Yes | Each instance validates |
| **Data & Schema** |
| Realm model | ✅ Yes | ✅ Yes | Set to 'hub' in MVP |
| realmId on all models | ✅ Yes | ✅ Yes | Enforced in MVP |
| Realm filtering in queries | ✅ Yes | ✅ Yes | Must-follow rule in MVP |
| **Service Layer** |
| Services (realm-agnostic) | ✅ Yes | ✅ Yes | Same code everywhere |
| tRPC procedures | ✅ Yes | ✅ Yes | Local in MVP, remote in worker |
| DI (tsyringe) | ✅ Yes | ✅ Yes | Same everywhere |
| **Frontend & Routing** |
| Unified frontend (pek.com) | ✅ Yes | ✅ Yes | Single domain |
| serverFn (RPC-only) | ✅ Yes | ✅ Yes | Same everywhere |
| Local service calls (MVP) | ✅ Yes | ❌ No | MVP only via DI |
| tRPC client calls (Worker) | ❌ No | ✅ Yes | Worker only |
| Response combining logic | ⚠️ Partial | ✅ Yes | MVP: trivial (one instance) |
| **Middleware** |
| jwtGuard | ✅ Yes | ✅ Yes | Same everywhere |
| authGuard (MVP version) | ✅ Yes | ✅ Limited | MVP only for local checks |
| routingMiddleware | ❌ No | ✅ Yes | Worker only |
| **Scaling** |
| Single hub instance | ✅ Yes | ✅ Yes | MVP only has hub |
| Multiple worker instances | ❌ No | ✅ Yes | Worker feature |
| BFF pattern | ⚠️ Implicit | ✅ Explicit | Hub is BFF in worker |
| Instance discovery (federation) | ❌ No | ✅ Yes | Added in worker |
| **Operational** |
| Feature flags | ❌ No | ✅ Yes | MVP doesn't need them yet |
| Audit logs for admins | ❌ No | ✅ Yes | Worker admins query logs |
| Instance registry | ❌ No | ✅ Yes | Track deployed instances |

## MVP 1.0 Scope (Single Hub Instance)

### What We're Building

- One hub instance, one database
- Central auth (AuthSCH)
- User profiles, groups, evaluations
- Policies and hierarchical permissions
- Web frontend (TanStack Start, serverFn only)

### What We're Preparing For (But Not Implementing)

- Realm model (exists, set to 'hub')
- realmId filtering (enforced, all queries use it)
- Policy snapshots (infrastructure ready, unused)
- tRPC procedures (alongside serverFn, but local)
- Service abstraction (realm-agnostic)

### Code Structure

```
src/domains/{domain}/
├── backend/
│   ├── {domain}.service.ts        # Pure business logic
│   ├── {domain}.procedures.ts     # tRPC (reusable, unused in MVP)
│   └── {domain}.guards.ts         # Auth middleware
├── components/
│   └── {feature}.tsx
├── hooks/
│   └── use{Feature}.ts
├── types/
│   └── {domain}.schema.ts
└── index.ts
```

### What MVP Tests Must Cover

- ✅ Realm isolation (single realm)
- ✅ Policy hierarchy and cascading
- ✅ Auth enforcement
- ✅ Service purity (testable in isolation)
- ✅ Zod + Prisma alignment

### MVP Timeline

**Target**: Q1 2025 (3 months)

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Auth system | Weeks 1-2 | JWT, policies, guards |
| Service layer | Weeks 2-3 | Services, tRPC procedures |
| Frontend | Weeks 3-5 | serverFn, hooks, components |
| Testing | Weeks 5-6 | Full coverage |
| Deployment | Week 7+ | Hub instance live |

## Worker 1.1+ Rollout (Multiple Instances)

### What We're Adding (When Needed)

- Second docker image deployment (or feature flag on same image)
- Redis for BFF caching
- tRPC client for inter-instance calls
- routingMiddleware for request routing
- Federation table (user → instances mapping)
- Instance registry

### What Stays the Same

- Service code (unchanged)
- Policy logic (unchanged)
- Frontend code (unchanged)
- Prisma schema structure (no breaking changes)

### Code Changes (Minimal)

**routingMiddleware** (new file):
```typescript
// Worker only: routes requests to multiple instances
export const routingMiddleware = (worker, instanceRouter) => {...}
```

**serverFn updates** (optional):
```typescript
// MVP:
.middleware([jwtGuard, authGuard])
.handler(async ({ context: { injector } }) => {...})

// Worker (same code, different middleware):
.middleware([jwtGuard, routingMiddleware(procedures.findOne)])
.handler(async ({ context: { responses } }) => {...})
```

**Service code** (unchanged):
```typescript
// Same everywhere
export class GroupService {
  async findOne(id: string) { ... }
}
```

### Worker Timeline

**Estimated**: Q2-Q3 2025 (when scaling is needed)

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Infrastructure | Weeks 1-2 | Redis, routing middleware |
| Instance API | Weeks 2-4 | tRPC endpoints |
| Federation | Weeks 4-6 | User → instance mapping |
| Testing | Weeks 6-8 | Multi-instance scenarios |
| Rollout | Week 8+ | First worker instances live |

## Why This Split?

### MVP Advantages

1. **Faster to market** - No scaling complexity
2. **Easier testing** - Single instance scenarios
3. **Simpler debugging** - No network calls to troubleshoot
4. **Lower ops burden** - One database, one instance

### Worker-Ready Design

1. **Code reuse** - Service layer doesn't change
2. **Database foundation** - realmId everywhere, ready for isolation
3. **Middleware abstraction** - Can swap local for remote calls
4. **Type safety** - Procedures are typed, can be called locally or via tRPC

## Migration Path: MVP → Worker

### No Breaking Changes

```
MVP serverFn:
.middleware([jwtGuard, authGuard(['GROUP_VIEW'])])
.handler(async ({ context: { injector } }) => {
  const svc = injector.resolve(GroupService);
  return svc.findOne(id);
})

Worker serverFn (same code, different middleware):
.middleware([jwtGuard, routingMiddleware(procedure)])
.handler(async ({ context: { responses } }) => {
  return responses.successResponses[0]?.data;
})

Service:
async findOne(id: string) { ... }  // ← UNCHANGED
```

### What Changes

| Component | MVP | Worker | Effort |
|-----------|-----|-----------|--------|
| Middleware | jwtGuard + authGuard | jwtGuard + routingMiddleware | Medium |
| Handler | Local service call | Response combining | Low |
| Service | N/A | N/A | None |
| Database | realmId filtering | realmId filtering | None |
| Schema | Same | Same | None |

## Risks & Mitigations

### Risk: Scaling to Worker Later is Painful

**Mitigation**: Build MVP with worker-ready code structure (this document ensures it)

### Risk: realmId Filtering Adds Overhead in MVP

**Mitigation**: Minimal (one WHERE clause), worth the infrastructure readiness

### Risk: Feature Flags Complexity in MVP

**Mitigation**: Don't use feature flags in MVP. Add when worker is live.

### Risk: tRPC Procedures Unused in MVP

**Mitigation**: They're just code; unused is fine. No runtime cost.

## Rollback Plan

**If worker rollout goes wrong:**

1. Keep MVP running (it's unchanged)
2. Disable worker instances
3. Route users back to MVP
4. Debug worker layer
5. Re-enable when fixed

No data loss, no breaking changes.

## Checklist: MVP Must Include

- [ ] Realm model (set to 'hub')
- [ ] realmId on all models
- [ ] All queries filter by realmId
- [ ] Services are realm-agnostic
- [ ] tRPC procedures defined (even if unused)
- [ ] DI (tsyringe) working
- [ ] Auth enforcement in middleware
- [ ] Tests for realm isolation
- [ ] Documentation (this file)

## Checklist: Worker Adds

- [ ] Redis setup
- [ ] routingMiddleware
- [ ] tRPC client
- [ ] Instance registry
- [ ] Federation table
- [ ] Feature flags (optional)
- [ ] Multi-instance tests

## Next Steps

- `architecture/00-federation-model.md` - Understand the architecture
- `rules/00-realm-isolation.md` - Understand realm enforcement
- `implementation/` - Copy-paste templates for MVP

---

**Last updated**: 2025-10-20
