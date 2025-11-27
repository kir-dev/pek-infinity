---
purpose: "Complete federation model - hub/worker relationships, realm concept, instance coordination, user profile management"
triggers: ["planning future", "scaling", "understanding federation"]
keywords: ["federation", "vision", "scaling", "hub", "worker", "realm"]
importance: "future"
size: "1500 words"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Federation Vision: Hub + Worker Instances

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

## Key Concept: "Realm"

A **realm** is either hub or a worker instance. Each realm:
- Has unique ID (e.g., "hub", "worker-acme-corp", "worker-conference-2025")
- Has own database (or hub has master database with realm_id filtering)
- Owns certain data (groups, memberships, evaluations)
- Has isolation boundary (data in one realm doesn't leak to another)

**Realms are NOT federated automatically.** A user exists in hub's user table. They may have memberships in hub realm + worker realm A. Crossing realm boundaries requires explicit routing.

## What About User Profiles?

**Hub stores all user profiles.** Why?

- Users have ONE identity across federation
- Easier for users (don't manage separate profiles per instance)
- Central place for privacy settings
- Reduces data consistency problems

**But:** Users have different permissions per instance. User A sees User B's full profile in worker realm A, but only basic profile in hub realm (if policies don't grant access).

## Federation in Practice: Example Scenarios

### Scenario 1: User Alice logs into pek.com

1. Frontend redirects to AuthSCH (OAuth)
2. AuthSCH redirects back to hub with OAuth token
3. Hub creates/updates Alice's user profile (hub realm)
4. BFF checks: Does Alice have memberships in other instances?
   - Query: `SELECT instances FROM federation WHERE userId = alice`
   - Returns: [hub, worker-acme, worker-conference]
5. BFF caches this (Redis in worker, in-memory in MVP)
6. Alice is now logged in, can use full frontend

### Scenario 2: Alice searches for groups

1. Frontend calls `searchGroups("engineering")`
2. BFF routes to all instances Alice has access to (hub, worker-acme, worker-conference)
3. Each instance searches its own database, filters by Alice's permissions
4. BFF combines results:
   - Hub: 2 groups (Alice is member)
   - Worker-acme: 5 groups (Alice can view)
   - Worker-conference: 0 groups (Alice not member)
5. Frontend shows combined 7 groups
