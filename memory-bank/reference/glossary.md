---
purpose: "Terminology glossary for pek-infinity architecture, policies, and system design"
triggers: ["confused about terminology", "onboarding new developer", "architectural discussion"]
keywords: ["glossary", "terms", "definitions", "realm", "federation", "hub", "worker-instance", "policy", "cascade", "mvp"]
importance: "low"
size: "800 words"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Reference: Glossary of Terms

## Core Concepts

### Realm
A **self-contained instance** of the application with its own data, users, and policies.
- **Examples:** `hub` (pek.com), `ent-conf-2025` (Event instance).
- **Characteristics:** Isolated data (composite keys), independent auth, own group hierarchy.

### Federation
**Ability to connect multiple realms** into one logical experience.
- **MVP:** Single realm (no federation).
- **Worker:** Hub BFF federates access to multiple realms via tRPC.

### MVP (Minimum Viable Product)
**Phase 1: Single hub instance.**
- One realm (`hub`), one DB, ~500 users.
- Architecture: TanStack Start + NestJS DI + tRPC + Prisma.

### Worker Instance
**Phase 2+: Multiple instances deployed independently.**
- Multiple realms, separate DBs, federated via Hub BFF.

## Architecture Terms

### BFF (Backend For Frontend)
**Hub instance acting as proxy** between frontend and worker instances.
- Handles auth, policy caching, federation routing, load balancing.

### Service Layer
**Business logic layer** between controllers and database.
- **Realm-agnostic:** Receives realm via DI.
- **Pure:** No HTTP, no auth checks (middleware does that).

### tRPC Procedure
**Remote Procedure Call** defined on server, callable from client.
- Type-safe, validated inputs (Zod), middleware-based auth.

### serverFn (Server Function)
**Form handler** from TanStack Start.
- Used for mutations (forms, uploads).
- Acts as BFF routing layer in our architecture.

### Middleware
**Function that runs before handler.**
- **Order:** Auth -> Policy -> Routing -> Handler.

## Policy Terms

### Policy
**Collection of permissions** assigned to user.
- e.g., "BOARD_MEMBER" containing statements like "canViewMembers".

### Statement
**Single permission scope** within a policy.
- Defines specific actions (`canEdit`) on specific scopes (groups).

### Policy Snapshot
**Cached calculation of all user's permissions** at login time.
- stored in Redis, referenced by hash in JWT.

### Cascading / Escalation
**Automatically grant permissions** when creating subgroup.
- e.g., Parent managers get rights on new child group.

## Database Terms

### Composite Key
**Primary key using TWO fields:** `(id, realmId)`.
- Critical for realm isolation.

### N+1 Query Problem
**Loading 1 group + N members = N+1 queries.**
- Performance killer. Solve with `include` (joins).
