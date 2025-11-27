---
purpose: "Complete worker instance architecture - routing, aggregation, BFF pattern, instance coordination"
triggers: ["implementing worker", "scaling", "understanding multi-instance"]
keywords: ["worker", "instance", "routing", "aggregation", "BFF", "federation"]
importance: "future"
size: "2000 words"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Worker Instances: Multi-Instance Architecture

**Status: Year 2+ (Multi-Instance Federation)**

Worker instances enable departments/events to have isolated deployments they control, while sharing central auth and user profiles.

## The Three Tiers

### 1. Hub Instance (BFF + Central Authority)

**Responsibilities:**
- Single source of user authentication (AuthSCH OAuth)
- User profile storage (single profile per user, globally)
- Basic profile data visible across federation
- Central policy/permissions management
- **Frontend routing (determines where to send requests)**
- **Response aggregation (combines results from multiple instances)**

### 2. Worker Instances (Per Department/Event)

**Responsibilities:**
- Manage their own groups, memberships, evaluations
- Validate user permissions against their own policies
- Store isolated data (no leakage to other instances)
- Provide tRPC endpoints for BFF to call
- Run the same Docker image as hub (feature flags determine behavior)

### 3. Frontend (Unified)

**One website (pek.com)**, not worker1.pek.com, worker2.pek.com, etc.

**Client only calls BFF via serverFn**, never directly to instances. BFF transparently routes and combines.

## Communication Flow: MVP vs Worker

### MVP (Single Hub Instance)

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

### Worker (Multiple Instances)

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

## Request Routing with Policy Hints

### User makes API request

```
1. Frontend calls serverFn: getGroup({ id: "abc" })
   - Global JWT is in httpOnly cookie (automatic)

2. BFF receives request
   - jwtGuard extracts JWT from cookie
   - routingMiddleware checks cache:
     cache["session:${jwt}"] → Get list of instances
   
3. For each instance:
   - BFF needs to call instance.getGroup({ id: "abc" })
   - BFF looks up instance JWT from cache: "worker-acme:jwt"
   - BFF gets policy hints from cache: ["GOD in engineering"]
   - BFF calls instance API with:
     {
       jwt: "short-lived instance JWT",
       x-policy-hint: "GOD in engineering"
     }

4. Instance receives request
   - Auth guard validates JWT
   - Auth guard uses x-policy-hint to optimize:
     SELECT statements FROM policies WHERE name IN ('GOD in engineering')
     ↓ (faster than full policy lookup)
   - Auth guard checks: Does 'GOD in engineering' grant access to GROUP:abc?
   - If yes, call service; if no, return 403

5. BFF combines responses
   - Collects results: [success from worker-acme, 403 from worker-conference]
   - Returns first successful result (or error if all fail)

6. Frontend receives response
```
