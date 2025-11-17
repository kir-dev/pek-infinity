---
file: reference/03-glossary.md
purpose: "Terminology glossary for pek-infinity architecture, policies, and system design"
triggers: ["confused about terminology", "onboarding new developer", "architectural discussion"]
keywords: ["glossary", "terms", "definitions", "realm", "federation", "hub", "worker-instance", "policy", "cascade", "mvp"]
dependencies: []
urgency: "low"
size: "800 words"
sections: ["core-concepts", "architecture-terms", "policy-terms", "database-terms", "performance-terms"]
status: "active"
mvp-scope: "current"
phase: "MVP 1.0"
created: "2025-11-17"
updated: "2025-11-17"
---

# Reference: Glossary of Terms

## Core Concepts

### Realm
A **self-contained instance** of the application with its own data, users, and policies.

**Examples:**
- `hub`: Central MVP instance at pek.com
- `ent-conf-2025`: Worker instance for ITConf 2025 event
- `ent-dorm-2025`: Worker instance for Dorm X dormitory

**Characteristics:**
- Isolated data (composite keys prevent mixing)
- Independent auth provider (can use different OAuth)
- Own group hierarchy
- Own user base (users don't cross realms)

**See:** `rules/00-realm-isolation.md`

---

### Federation
**Ability to connect multiple realms** into one logical experience.

**MVP:** Single realm (no federation)  
**Worker:** Hub BFF federates access to multiple realms

**How it works:**
1. User logs into hub (realm = 'hub')
2. Hub determines which realms user can access
3. Hub BFF proxies requests to appropriate instances
4. User sees unified interface across realms

**Example:** User sees groups from:
- Hub instance (realm = 'hub')
- ITConf 2025 instance (realm = 'ent-conf-2025')
- Dormitory event instance (realm = 'ent-dorm-2025')

**See:** `architecture/00-federation-model.md`

---

### MVP (Minimum Viable Product)
**Phase 1: Single hub instance at pek.com**

**Scope:**
- One realm (`hub`)
- One database
- Schönherz college only
- ~100-500 users

**Architecture:** TanStack Start + NestJS DI + tRPC + Prisma

**When:** Months 1-3

**See:** `decisions/00-mvp-vs-worker.md`

---

### Worker
**Phase 2+: Multiple instances deployed independently**

**Scope:**
- Multiple realms (different organizations, events)
- Separate databases per instance
- Own auth providers
- Federated via hub BFF

**Examples:**
- ITConf 2025 instance (1000s of users)
- Different dormitory events
- Corporate partnerships

**When:** After MVP validated

---

## Architecture Terms

### BFF (Backend For Frontend)
**Hub instance acting as proxy between frontend and worker instances**

**Responsibilities:**
- User authentication (central OAuth)
- Policy snapshot caching (Redis)
- Federation (routing to correct realm)
- Load balancing across instances

**Request flow:** Browser → Hub BFF → Worker Instance

**See:** `architecture/01-auth-system.md`

---

### Service Layer
**Business logic layer** between controllers/procedures and database

**Characteristics:**
- Realm-agnostic (receives realm via DI)
- Validates business rules (parent not archived, etc.)
- Uses Prisma for queries
- Dependency injected

**Example:** `GroupService.create()`, `UserService.findOne()`

**NOT:** Service does NOT know which realm it's working with

**See:** `rules/02-service-purity.md`

---

### tRPC Procedure
**Remote Procedure Call** defined on server, callable from client

**Characteristics:**
- Full type safety end-to-end
- Input validated with Zod schema
- Middleware-based auth/authorization
- Returns typed response

**Example:**
```typescript
export const getGroupsProcedure = t.procedure
  .use(authGuard)
  .input(GetGroupsSchema)
  .query(({ ctx, input }) => {...});
```

**vs serverFn:** tRPC handles aggregation & complex logic

**See:** `implementation/01-trpc-procedures.md`

---

### serverFn (Server Function)
**Form handler** from TanStack Start, like tRPC but simpler

**Characteristics:**
- Input NOT type-checked (raw FormData)
- Middleware-based (jwtGuard, authGuard)
- Used for mutations (forms, file uploads)
- Response sent back to form

**vs tRPC:** simpler, but less type-safe

**See:** `implementation/02-serverfn-routing.md`

---

### Middleware
**Function that runs before handler**, can:
- Validate request (authGuard)
- Check permissions (policyGuard)
- Aggregate data (routingMiddleware)
- Extract context

**Order matters:** Auth first, then policy, then business logic

**See:** `architecture/03-middleware-layering.md`

---

## Policy Terms

### Policy
**Collection of permissions** assigned to user

**Structure:**
- `id`: unique identifier
- `name`: human-readable name (e.g., "SIMONYI_ELNOK")
- `type`: category (e.g., "ROLE", "ESCALATION")
- `statements`: list of permission scopes

**Example:** User has policies [ELNOK, BOARD_MEMBER]

**See:** `database/01-policy-system.md`

---

### Statement
**Single permission scope** within a policy

**Contains:**
- `canViewMembers`: boolean
- `canEditMembers`: boolean
- `canDeleteGroup`: boolean
- `escalatedFrom`: (optional) which group this cascaded from
- `scope`: which groups this applies to

**Example:** Policy BOARD_MEMBER has statement "canViewMembers for board scope"

---

### Policy Snapshot
**Cached calculation of all user's permissions** at login time

**Contains:**
- User's ID
- All policies (computed)
- All statements (computed)
- Cascading escalations (computed)
- Scope boundaries

**Size:** Typically 10-50KB per user

**Storage:** Redis cache with hash key

**TTL:** 1 hour (invalidated on policy change)

**Why:** Avoid recalculating permissions on every request

**See:** `architecture/01-auth-system.md`

---

### Cascading / Escalation
**Automatically grant permissions when creating subgroup**

**How it works:**
1. Create group "Engineering" under "Company"
2. Company managers get "canMoveGroup" escalated to Engineering
3. Allows managers to move subgroup without "editMembers" (principle of least privilege)

**Why:** Separates structural decisions (move, delete) from personnel decisions (edit, add)

**See:** `gotchas/01-migration-blockers.md` (policy cascade section)

---

## Database Terms

### Composite Key
**Primary key using TWO fields:** `(id, realmId)`

**Purpose:** Prevent mixing realms

**Example:**
```typescript
@@id([id, realmId])  // Groups have unique id WITHIN realm, not globally
```

**Why:** If id was global, couldn't isolate data per realm

**See:** `rules/00-realm-isolation.md`

---

### Foreign Key with Realm
**References must include realmId** to prevent cross-realm relationships

**Example:**
```typescript
model Membership {
  groupId String
  groupRealmId String  // ← Can't reference group without realm!
  
  @@foreign([groupId, groupRealmId], 
    references: [Group.id, Group.realmId]
  )
}
```

**Prevents:** Group from realm A having member from realm B

---

### Cascading Delete
**Automatic deletion of children** when parent deleted

**Example:** Archive group → all subgroups archived

**Configuration:** `onDelete: CASCADE` in Prisma schema

---

## Performance Terms

### N+1 Query Problem
**Loading 1 group + N members = N+1 queries instead of 1**

**Bad:**
```typescript
const group = await findGroup(id);              // Query 1
const members = await findMembers(group.id);   // Query 2
members.forEach(m => fetchUser(m.userId));     // Queries 3..N+1
```

**Good:**
```typescript
const group = await findGroup(id, { include: { members: { include: { user: true } } } });
// Query 1, all data returned
```

**Cost:** 100 members = 102 queries instead of 1, ~100ms slowdown

**See:** `gotchas/02-performance-gotchas.md`

---

### Policy Snapshot Hash
**Small identifier** for entire policy snapshot

**Usage:**
- Stored in JWT (prevents JWT bloat)
- Used to look up full snapshot in Redis
- Invalidated when policies change

**Benefit:** JWT = 500 bytes instead of 60KB

---

### Redis Cache
**In-memory key-value store** for fast lookups

**In pek-infinity:**
- Caches policy snapshots
- Pub/sub for cache invalidation
- Session management

**Hit rate:** 99% of requests (1ms lookup vs 100ms DB query)

---

### Realm Injection (DI)
**Dependency injection of current realm** into services

**How it works:**
1. Middleware extracts realm from context
2. Creates DI container with `REALM_ID = <current realm>`
3. Services resolve from container, automatically get realm
4. Services don't need realm parameter

**Benefit:** Same service code for MVP (hub) and worker (any realm)

**See:** `rejected/01-service-realm-awareness.md`

---

## Development Terms

### PR Checklist
**Code review points** to verify before merging

**Example:** Check auth in middleware, not handler

**See:** `rules/01-auth-enforcement.md` (PR Checklist section)

---

### Migration Blocker
**Architectural mistake** that makes MVP→Worker scaling impossible

**Examples:**
- Service aware of realm
- Single-key lookups (no realmId in query)
- Monolithic policy system

**See:** `gotchas/01-migration-blockers.md`

---

### Type Drift
**Zod schema and Prisma type fall out of sync**

**Prevention:** Use `satisfies z.ZodType<Prisma.Model>`

**See:** `rules/03-schema-validation.md`
