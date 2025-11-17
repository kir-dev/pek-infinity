---
file: architecture/00-federation-model.md
purpose: "Explain why hub + worker-instance architecture exists, how instances relate, why BFF is needed"
triggers: ["designing multi-instance features", "debugging federation logic", "adding realm support"]
keywords: ["federation", "hub", "worker-instance", "instance", "BFF", "multi-tenancy", "realm"]
dependencies: []
urgency: "critical"
size: "1500 words"
status: "active"
mvp-scope: "future"
phase: "Phase 1+ (Q2 2026+)"
created: "2025-10-20"
updated: "2025-11-17"
---

# Federation Model: Hub + Worker Instances

## The Problem We're Solving

SchönHerz (and similar organizations) have a contradiction:
- **Need centralization**: Single identity system, unified user profiles, central auth
- **Need decentralization**: Departments/events need isolated deployments they control, with their own data

Monolithic SaaS doesn't work. Neither does fully federated (everyone managing their own instance).

We need a hybrid.

## Solution: Hub Instance + Worker Instances + BFF Router

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│              Unified Frontend (pek.com)             │
│          (TanStack Start, serverFn only)            │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │   BFF (Backend-for-Front)  │
        │  (Hub instance, routes)    │
        │                            │
        │  - Determines instances    │
        │  - Orchestrates calls      │
        │  - Combines responses      │
        └────────┬──────────┬────────┘
                 │          │
        ┌────────▼──┐   ┌───▼────────────┐
        │   Hub     │   │   Worker       │
        │ Instance  │   │   Instances    │
        │           │   │                │
        │ - Auth    │   │ - Per dept/    │
        │ - Profiles│   │   event        │
        │ - Central │   │ - Isolated     │
        │   data    │   │   data         │
        └───────────┘   └────────────────┘
```

### Three Tiers

#### 1. **Hub Instance** (The BFF + Central Authority)

**Responsibilities:**
- Single source of user authentication (AuthSCH OAuth)
- User profile storage (single profile per user, globally)
- Basic profile data visible across federation (name, avatar—can see who exists)
- Central policy/permissions management (how to delegate, escalation rules)
- Frontend routing (determined where to send requests)
- Response aggregation (combines results from multiple instances)

**What it does NOT do:**
- Store detailed data (groups, memberships, evaluations)
- Enforce instance-specific policies (each instance does its own)
- Know about internal structures of worker instances

**Tech:** Same as worker (NestJS + Prisma), but runs as the BFF layer

#### 2. **Worker Instances** (Per Department/Event)

**Responsibilities:**
- Manage their own groups, memberships, evaluations
- Validate user permissions against their own policies
- Store isolated data (no leakage to other instances)
- Provide tRPC endpoints for BFF to call
- Run the same Docker image as hub (feature flags determine behavior)

**What they do NOT do:**
- Manage user authentication (hub does via BFF)
- Know about other instances
- Store user profiles (hub is authority)

**Setup:**
- Each instance gets unique database
- Each instance knows its own realm ID
- Each instance has its own auth provider (can be Okta, Azure AD, custom, etc.)

#### 3. **Frontend** (Unified)

**One website (pek.com)**, not worker1.pek.com, worker2.pek.com, etc.

**Client only calls BFF via serverFn**, never directly to instances. BFF transparently routes and combines.

### Communication Flow: MVP vs Worker

#### MVP (Single Hub Instance)

```
Client serverFn call
  ↓
BFF (hub)
  ├─ jwtGuard: Validate JWT
  ├─ Routing: Determine instance (only hub exists)
  ├─ Call local service (no network call, DI injection)
  ├─ Service queries Prisma (hub database)
  └─ Return result
  ↓
Client receives response
```

**Key point:** No remote calls. Everything is local. Same code, simpler execution.

#### Worker (Multiple Instances)

```
Client serverFn call
  ↓
BFF (hub)
  ├─ jwtGuard: Validate JWT
  ├─ Routing: Determine instances (hub + worker1 + worker2)
  ├─ For each instance:
  │   ├─ Make tRPC call to instance
  │   ├─ Instance validates JWT (knows BFF is trusted)
  │   ├─ Instance queries own database
  │   └─ Return result
  ├─ Combine responses (filter, merge, etc.)
  └─ Return combined result
  ↓
Client receives response
```

**Key point:** Same serverFn code. Only BFF's routing middleware changes.

## Key Concept: "Realm"

A **realm** is either hub or a worker instance. Each realm:
- Has unique ID (e.g., "hub", "worker-acme-corp", "worker-conference-2025")
- Has own database (or hub has master database with realm_id filtering)
- Owns certain data (groups, memberships, evaluations)
- Has isolation boundary (data in one realm doesn't leak to another)

**Realms are NOT federated automatically.** A user exists in hub's user table. They may have memberships in hub realm + worker realm A. Crossing realm boundaries requires explicit routing.

## Why BFF?

1. **Single point of routing** - Frontend doesn't need to know about instances
2. **Transparent scaling** - Add instances without frontend changes
3. **Centralized auth** - All auth goes through hub
4. **Response aggregation** - Smart combining (search across all instances, but show only what user can see)
5. **Error resilience** - If one instance is down, BFF can return partial results

## What About User Profiles?

**Hub stores all user profiles.** Why?

- Users have ONE identity across federation
- Easier for users (don't manage separate profiles per instance)
- Central place for privacy settings
- Reduces data consistency problems

**But:** Users have different permissions per instance. User A sees User B's full profile in worker realm A, but only basic profile in hub realm (if policies don't grant access).

## Federation in Practice: Example

**Scenario:** User Alice logs into pek.com

1. Frontend redirects to AuthSCH (OAuth)
2. AuthSCH redirects back to hub with OAuth token
3. Hub creates/updates Alice's user profile (hub realm)
4. BFF checks: Does Alice have memberships in other instances?
   - Query: `SELECT instances FROM federation WHERE userId = alice`
   - Returns: [hub, worker-acme, worker-conference]
5. BFF caches this (Redis in worker, in-memory in MVP)
6. Alice is now logged in, can use full frontend

**Scenario:** Alice searches for groups

1. Frontend calls `searchGroups("engineering")`
2. BFF routes to all instances Alice has access to (hub, worker-acme, worker-conference)
3. Each instance searches its own database, filters by Alice's permissions
4. BFF combines results:
   - Hub: 2 groups (Alice is member)
   - Worker-acme: 5 groups (Alice can view)
   - Worker-conference: 0 groups (Alice not member)
5. Frontend shows combined 7 groups

**Scenario:** Alice edits a group in worker-acme

1. Frontend calls `updateGroup(id, data)`
2. BFF determines instance (worker-acme)
3. BFF calls worker-acme's tRPC endpoint with Alice's JWT
4. Worker-acme validates JWT (trusts hub)
5. Worker-acme checks Alice's permissions (is she GOD on this group?)
6. If yes, update; if no, return 403
7. Response returned to frontend

## Common Gotchas

### ❌ Gotcha 1: Frontend calls instances directly
- **Wrong**: Frontend has URL to worker1.pek.com, calls REST API
- **Right**: Frontend always calls BFF; BFF routes to instances

### ❌ Gotcha 2: Services know which realm they're in
- **Wrong**: `GroupService.findMany(realm: 'worker-acme')`
- **Right**: Services don't know realm; BFF handles realm routing

### ❌ Gotcha 3: Data from one realm visible in another
- **Wrong**: Query returns groups from all realms
- **Right**: Every query filters by realmId

### ❌ Gotcha 4: User profiles scattered across instances
- **Wrong**: Worker-acme stores Alice's profile in their database
- **Right**: Only hub stores user profiles; instances only store group/membership data

## MVP Implication

In MVP (single hub instance), this architecture still applies:

- Hub instance **is also** the BFF (same Docker container)
- Routes to "local" service (via DI, no network call)
- No worker instances yet, but code path is identical
- When we add worker instances, we don't rewrite MVP code—we just activate the routing

## Next Steps

Read these files to understand how federation is implemented:
- `architecture/01-auth-system.md` - How JWT and policies work across realms
- `architecture/03-middleware-layering.md` - How routing middleware works
- `database/00-realm-model.md` - How realmId is used in schema
- `decisions/00-mvp-vs-worker.md` - What features are MVP vs worker

---

**Last updated**: 2025-10-20
