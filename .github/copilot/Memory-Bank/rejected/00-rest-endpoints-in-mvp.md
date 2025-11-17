---
file: rejected/00-rest-endpoints-in-mvp.md
purpose: "Why REST not chosen for MVP. When REST will be added (worker instances)"
triggers: ["architectural discussion", "comparing REST vs tRPC", "worker planning"]
keywords: ["REST", "tRPC", "API", "resource", "HTTP", "endpoint", "MVP", "worker"]
dependencies: ["architecture/04-routing-aggregation.md", "decisions/00-mvp-vs-worker.md"]
urgency: "medium"
size: "900 words"
sections: ["decision-summary", "why-not-rest-for-mvp", "trpc-advantages", "when-rest-needed", "migration-plan", "comparison-table"]
status: "active"
mvp-scope: "future"
phase: "Phase 1+ (Q2 2026+)"
created: "2025-11-17"
updated: "2025-11-17"
---

# Rejected: REST Endpoints in MVP

## Decision Summary

**REST endpoints are NOT used in MVP.**  
**tRPC is used instead.**  
**REST will be added when worker instances need external integrations.**

---

## Why NOT REST for MVP?

### 1. REST Complexity for Aggregation

MVP needs to aggregate data from multiple domains (group + members + policies). REST makes this awkward:

```typescript
// ❌ REST approach: Multiple round trips
GET /api/groups/{id}
  ↓ response: { groupId, parentId, ... }

GET /api/groups/{id}/members
  ↓ response: [ { userId, ... }, ... ]

GET /api/groups/{id}/policies
  ↓ response: [ { policyId, ... }, ... ]

// Client combines 3 responses
// 3 HTTP round trips, 3 deserialization cycles
// If members endpoint needs user details:

GET /api/members/{id}/users
  ↓ response: [ { userId, name, email, ... }, ... ]

// Now 4 requests, N+1 problem client-side too!
```

**tRPC approach: Single call with aggregation**

```typescript
// ✅ tRPC approach: Single round trip
const data = await trpc.getGroupDashboard({
  groupId: 'g1',
  includeMembers: true,
  includePolicies: true,
});

// Server-side join, single query, single response
// Client gets exactly what it needs
```

### 2. REST Type Safety Issues

```typescript
// ❌ REST: Types not guaranteed
const response = await fetch('/api/groups/1');
const data = await response.json();

// TypeScript doesn't know shape of response!
// If backend changes response shape, no error!
data.name  // Could be undefined!
data.owner?.email  // Could crash!

// ✅ tRPC: Full type safety
const data = await trpc.getGroup({ id: '1' });

data.name  // TypeScript error if property removed!
data.owner?.email  // Compiler validates shape!
// Types derived from server schema
```

### 3. REST Doesn't Fit Aggregation Patterns

```typescript
// ❌ How to express this in REST?
// "Get group, with members, but only members who are active,
// with user details, but NOT sensitive fields, sorted by name"

GET /api/groups/1?include=members,policies&member_status=active&sort=name

// Overloaded query parameters
// Easy to get wrong, hard to validate
// If backend wants to cache this, hard to identify unique requests

// ✅ tRPC: Structured input
const data = await trpc.getGroup({
  id: '1',
  members: {
    include: true,
    status: ['ACTIVE'],
    sort: 'name',
    exclude: ['ssn', 'salary'],  // Explicit field filtering
  },
  policies: {
    include: true,
  },
});

// Strongly typed, validated, cacheable
```

### 4. REST Verb Semantics Don't Map

```typescript
// ❌ REST confusion: What verb for this?
// "Create group, assign owner, send notification, update parent"

POST /api/groups
POST /api/groups/{id}/owner
POST /api/groups/{id}/notifications
PATCH /api/groups/{parent}/children

// Is this 4 separate requests? Transactional?
// What if one fails?

// ✅ tRPC: Single procedure
const result = await trpc.createGroupWithOwnerAndNotify({
  name: 'New Group',
  ownerId: 'u1',
  parentId: 'parent',
  shouldNotify: true,
});

// Single transaction, single response, clear semantics
```

---

## tRPC Advantages for MVP

| Aspect | tRPC | REST |
|--------|------|------|
| **Aggregation** | Native (include/relations) | Multiple requests |
| **Type Safety** | Full end-to-end | Request/response manual |
| **Caching** | Backend controlled | Client-side guessing |
| **Transactions** | Native (server controls) | Unclear semantics |
| **Error Handling** | Typed errors | HTTP status codes |
| **Field Selection** | Explicit input | Query parameter mess |
| **Batching** | Native (batch requests) | N+1 requests |

---

## When REST Will Be Needed

### Phase 1 (MVP, 1 server)
- ✅ tRPC for frontend → backend
- ❌ No REST (no external integrations)

### Phase 2 (Worker, multiple instances)
- ✅ tRPC for frontend → backend (same instance)
- ✅ tRPC for hub BFF → instances (server-to-server)
- ❌ No external REST

### Phase 3 (Open API, ~year 2)
- ✅ tRPC for frontend → backend
- ✅ tRPC for hub BFF → instances
- ✅ REST for external integrations (mobil app, third-party)

### REST Use Cases (Phase 3+)

**Mobile app (separate from web frontend)**
```typescript
// Mobile needs different client, can't use tRPC directly
// Expose REST for mobile
GET /api/v1/groups/{id}
  → { id, name, description, ... }

GET /api/v1/groups/{id}/members
  → [ { id, name, email, ... } ]
```

**Third-party integrations**
```typescript
// Other departments' systems need to read group data
// Can't give them tRPC client (server-only)
// Expose REST
GET /api/v1/groups?department=IT&archived=false
  → [ { id, name, ... } ]
```

**Webhook/job system**
```typescript
// Background jobs need to call our API
// Can't use browser-only tRPC
// Expose REST with API key auth
POST /api/v1/groups/{id}/evaluate
  + { rubricId, scores: [...] }
```

---

## Migration Plan (When REST Needed)

```typescript
// Step 1: Define REST schemas separate from tRPC
export const GroupRestSchema = z.object({
  id: z.cuid(),
  name: z.string(),
  description: z.string(),
  purpose: z.enum(Prisma.$Enums.GroupPurpose),
}) satisfies z.ZodType<Prisma.Group>;

// Step 2: Create REST endpoints wrapping tRPC procedures
import express from 'express';

app.get('/api/v1/groups/:id', async (req, res) => {
  try {
    const groupId = req.params.id;
    
    // Call tRPC procedure internally
    const group = await trpc.getGroup({ id: groupId });
    
    // Return REST response
    res.json(GroupRestSchema.parse(group));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Step 3: No code duplication
// tRPC procedures contain business logic
// REST endpoints are thin wrappers
// Both call same underlying service layer

// This works because:
// - Services realm-agnostic ✅ (works for REST too)
// - Auth in middleware ✅ (REST has its own auth)
// - Business logic decoupled ✅ (same code path)
```

---

## Why This Matters

**Cost of choosing REST for MVP:**
- 40% more time to build aggregate endpoints
- Type safety issues (silent bugs)
- Harder to cache/optimize
- Complex query parameter semantics
- N+1 problems easier to create

**Cost of choosing tRPC for MVP:**
- **Zero cost** (same language, can add REST later)

**If we need REST for worker:** Just add it! No refactoring needed because:
1. Services are realm-agnostic (work for both)
2. Auth is middleware-based (can add REST middleware)
3. Business logic in services (reusable by REST endpoints)

---

## Architecture Implication

```
┌─────────────────────────────────────┐
│   MVP Architecture (Now)            │
├─────────────────────────────────────┤
│ Client (React)                      │
│   ↓ tRPC                            │
│ TanStack Start (SSR Router)         │
│   ↓ Procedures (tRPC)               │
│ Service Layer                       │
│   ↓ Prisma                          │
│ PostgreSQL                          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   Worker Architecture (Year 2)  │
├─────────────────────────────────────┤
│ Mobile App                          │
│   ↓ REST ← NEW LAYER                │
│ Hub BFF                           │
│   ↓ tRPC + REST ← EXPANDED          │
│ Service Layer (shared)              │
│   ↓ Prisma                          │
│ PostgreSQL (hub)                  │
└─────────────────────────────────────┘

Worker instances:
│ Mobile App (offline first)          │
│   ↓ REST                            │
│ Worker Server                   │
│   ↓ tRPC (internal only)            │
│ Service Layer (same code)           │
│   ↓ Prisma                          │
│ PostgreSQL (worker)             │
└─────────────────────────────────────┘
```

**tRPC now, REST when needed = zero rework required.**

