---
file: architecture/00-federation-model.md
purpose: "Explain why cloud + enterprise architecture exists, how instances relate, why BFF is needed"
triggers: ["designing multi-instance features", "debugging federation logic", "adding realm support"]
keywords: ["federation", "cloud", "enterprise", "instance", "BFF", "multi-tenancy", "realm"]
dependencies: []
urgency: "critical"
size: "1500 words"
status: "active"
created: "2025-10-20"
updated: "2025-10-20"




---

# Federation Model: Cloud + Enterprise Instances

## The Problem We're Solving

SchönHerz (and similar organizations) have a contradiction:
- **Need centralization**: Single identity system, unified user profiles, central auth
- **Need decentralization**: Departments/events need isolated deployments they control, with their own data

Monolithic SaaS doesn't work. Neither does fully federated (everyone managing their own instance).

We need a hybrid.

## Solution: Cloud Instance + Enterprise Instances + BFF Router

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
        │  (Cloud instance, routes)  │
        │                            │
        │  - Determines instances    │
        │  - Orchestrates calls      │
        │  - Combines responses      │
        └────────┬──────────┬────────┘
                 │          │
        ┌────────▼──┐   ┌───▼────────────┐
        │  Cloud    │   │  Enterprise    │
        │ Instance  │   │  Instances     │
        │           │   │                │
        │ - Auth    │   │ - Per dept/    │
        │ - Profiles│   │   event        │
        │ - Central │   │ - Isolated     │
        │   data    │   │   data         │
        └───────────┘   └────────────────┘
```

### Three Tiers

#### 1. **Cloud Instance** (The BFF + Central Authority)

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
- Know about internal structures of enterprise instances

**Tech:** Same as enterprise (NestJS + Prisma), but runs as the BFF layer

#### 2. **Enterprise Instances** (Per Department/Event)

**Responsibilities:**
- Manage their own groups, memberships, evaluations
- Validate user permissions against their own policies
- Store isolated data (no leakage to other instances)
- Provide tRPC endpoints for BFF to call
- Run the same Docker image as cloud (feature flags determine behavior)

**What they do NOT do:**
- Manage user authentication (cloud does via BFF)
- Know about other instances
- Store user profiles (cloud is authority)

**Setup:**
- Each instance gets unique database
- Each instance knows its own realm ID
- Each instance has its own auth provider (can be Okta, Azure AD, custom, etc.)

#### 3. **Frontend** (Unified)

**One website (pek.com)**, not enterprise1.pek.com, enterprise2.pek.com, etc.

**Client only calls BFF via serverFn**, never directly to instances. BFF transparently routes and combines.

### Communication Flow: MVP vs Enterprise

#### MVP (Single Cloud Instance)

```
Client serverFn call
  ↓
BFF (cloud)
  ├─ jwtGuard: Validate JWT
  ├─ Routing: Determine instance (only cloud exists)
  ├─ Call local service (no network call, DI injection)
  ├─ Service queries Prisma (cloud database)
  └─ Return result
  ↓
Client receives response
```

**Key point:** No remote calls. Everything is local. Same code, simpler execution.

#### Enterprise (Multiple Instances)

```
Client serverFn call
  ↓
BFF (cloud)
  ├─ jwtGuard: Validate JWT
  ├─ Routing: Determine instances (cloud + enterprise1 + enterprise2)
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

A **realm** is either cloud or an enterprise instance. Each realm:
- Has unique ID (e.g., "cloud", "enterprise-acme-corp", "conference-2025")
- Has own database (or cloud has master database with realm_id filtering)
- Owns certain data (groups, memberships, evaluations)
- Has isolation boundary (data in one realm doesn't leak to another)

**Realms are NOT federated automatically.** A user exists in cloud's user table. They may have memberships in cloud realm + enterprise realm A. Crossing realm boundaries requires explicit routing.

## Why BFF?

1. **Single point of routing** - Frontend doesn't need to know about instances
2. **Transparent scaling** - Add instances without frontend changes
3. **Centralized auth** - All auth goes through cloud
4. **Response aggregation** - Smart combining (search across all instances, but show only what user can see)
5. **Error resilience** - If one instance is down, BFF can return partial results

## What About User Profiles?

**Cloud stores all user profiles.** Why?

- Users have ONE identity across federation
- Easier for users (don't manage separate profiles per instance)
- Central place for privacy settings
- Reduces data consistency problems

**But:** Users have different permissions per instance. User A sees User B's full profile in enterprise realm A, but only basic profile in cloud realm (if policies don't grant access).

## Federation in Practice: Example

**Scenario:** User Alice logs into pek.com

1. Frontend redirects to AuthSCH (OAuth)
2. AuthSCH redirects back to cloud with OAuth token
3. Cloud creates/updates Alice's user profile (cloud realm)
4. BFF checks: Does Alice have memberships in other instances?
   - Query: `SELECT instances FROM federation WHERE userId = alice`
   - Returns: [cloud, enterprise-acme, enterprise-conference]
5. BFF caches this (Redis in enterprise, in-memory in MVP)
6. Alice is now logged in, can use full frontend

**Scenario:** Alice searches for groups

1. Frontend calls `searchGroups("engineering")`
2. BFF routes to all instances Alice has access to (cloud, enterprise-acme, enterprise-conference)
3. Each instance searches its own database, filters by Alice's permissions
4. BFF combines results:
   - Cloud: 2 groups (Alice is member)
   - Enterprise-acme: 5 groups (Alice can view)
   - Enterprise-conference: 0 groups (Alice not member)
5. Frontend shows combined 7 groups

**Scenario:** Alice edits a group in enterprise-acme

1. Frontend calls `updateGroup(id, data)`
2. BFF determines instance (enterprise-acme)
3. BFF calls enterprise-acme's tRPC endpoint with Alice's JWT
4. Enterprise-acme validates JWT (trusts cloud)
5. Enterprise-acme checks Alice's permissions (is she GOD on this group?)
6. If yes, update; if no, return 403
7. Response returned to frontend

## Common Gotchas

### ❌ Gotcha 1: Frontend calls instances directly
- **Wrong**: Frontend has URL to enterprise1.pek.com, calls REST API
- **Right**: Frontend always calls BFF; BFF routes to instances

### ❌ Gotcha 2: Services know which realm they're in
- **Wrong**: `GroupService.findMany(realm: 'enterprise-acme')`
- **Right**: Services don't know realm; BFF handles realm routing

### ❌ Gotcha 3: Data from one realm visible in another
- **Wrong**: Query returns groups from all realms
- **Right**: Every query filters by realmId

### ❌ Gotcha 4: User profiles scattered across instances
- **Wrong**: Enterprise-acme stores Alice's profile in their database
- **Right**: Only cloud stores user profiles; instances only store group/membership data

## MVP Implication

In MVP (single cloud instance), this architecture still applies:

- Cloud instance **is also** the BFF (same Docker container)
- Routes to "local" service (via DI, no network call)
- No enterprise instances yet, but code path is identical
- When we add enterprise instances, we don't rewrite MVP code—we just activate the routing

## Next Steps

Read these files to understand how federation is implemented:
- `architecture/01-auth-system.md` - How JWT and policies work across realms
- `architecture/03-middleware-layering.md` - How routing middleware works
- `database/00-realm-model.md` - How realmId is used in schema
- `decisions/00-mvp-vs-enterprise.md` - What features are MVP vs enterprise

---

**Last updated**: 2025-10-20
