---
file: decisions/01-future-roadmap.md
purpose: "Detailed future plans: federation rollout, worker instances, tRPC migration timeline, feature priorities"
triggers: ["planning year 2+", "discussing future architecture", "estimating federation work", "questioning roadmap"]
keywords: ["roadmap", "future", "plans", "timeline", "federation", "worker-instance", "phase", "rollout"]
dependencies: ["decisions/00-mvp-vs-worker-instance.md", "architecture/00-federation-model.md"]
urgency: "medium"
size: "2500 words"
status: "active"
created: 2025-11-17
mvp-scope: "future"
phase: "Phase 1+ (Q2 2026+)"
updated: "2025-11-17"
---

# Future Roadmap: Post-MVP Plans

## Overview

This document details the planned evolution from MVP (single hub instance) to full federation (hub + multiple worker instances). It provides concrete timelines, technical steps, and migration strategies.

**Current State:** MVP 1.0 - Single hub instance
**Target State:** Federation 2.0 - Hub + worker instances
**Timeline:** 12-18 months post-MVP

## Phase Breakdown

### Phase 0: MVP 1.0 (Current - Q1 2026)

**Goal:** Launch single-instance system with federation-ready architecture

**Completed:**
- ✅ Domain-driven code organization
- ✅ Realm model baked into schema (realmId on all tables)
- ✅ Service layer (realm-agnostic, reusable)
- ✅ Auth system with policy hierarchy
- ✅ TanStack Start + serverFn routing
- ✅ DI pattern with tsyringe

**In Progress:**
- [ ] All core domain features (groups, memberships, evaluations)
- [ ] Admin dashboard
- [ ] User management
- [ ] Policy administration UI

**Technical Debt for Future:**
- Realm filtering currently hardcoded to 'hub'
- No BFF routing layer (only one instance)
- tRPC documented but not used
- No instance discovery mechanism

---

### Phase 1: Multi-Instance Preparation (Q2-Q3 2026)

**Goal:** Refactor infrastructure to support multiple databases and instances

**Technical Work:**

#### 1.1 Database Infrastructure
- [ ] Set up instance registry (tracks deployed worker instances)
- [ ] Implement database provisioning automation
- [ ] Create instance configuration management
- [ ] Set up separate Redis instance per worker (for caching)

**Migration Pattern:**
```typescript
// Before (MVP)
const prisma = new PrismaClient();

// After (Multi-Instance)
const prismaRegistry = new PrismaRegistry();
const prisma = prismaRegistry.getClient(realmId);
```

#### 1.2 Auth System Enhancement
- [ ] Policy snapshot system (freeze policy state for performance)
- [ ] x-policy-hint header implementation
- [ ] Worker-instance auth validation (each instance checks own policies)
- [ ] JWT scope expansion (include instance-specific scopes)

#### 1.3 Configuration Management
- [ ] Feature flags system (toggle federation features)
- [ ] Instance-specific environment variables
- [ ] Central config service (stores instance metadata)

**Deliverables:**
- Infrastructure automation scripts
- Updated deployment documentation
- Instance provisioning runbook
- Performance benchmarks (single vs multi-instance)

**Estimated Effort:** 3 person-months

---

### Phase 2: tRPC Layer Implementation (Q3-Q4 2026)

**Goal:** Add tRPC procedures for remote instance communication

**Technical Work:**

#### 2.1 Convert Services to tRPC Procedures
- [ ] Implement tRPC server setup per instance
- [ ] Convert existing services to tRPC procedure wrappers
- [ ] Add tRPC client configuration
- [ ] Implement error handling for remote calls

**Pattern Migration:**
```typescript
// Before (MVP - Direct service call)
export const GroupService = {
  findById: createServerFn({ method: 'GET' })
    .middleware([authGuard([SCOPE.GROUP_VIEW])])
    .handler(({ context: { prisma }, data: { id } }) => {
      return prisma.group.findUnique({ where: { id } });
    }),
};

// After (Federation - tRPC procedure)
export const groupProcedures = {
  findById: procedure
    .input(z.object({ id: z.cuid() }))
    .middleware([authGuard([SCOPE.GROUP_VIEW])])
    .query(async ({ input, ctx: { groupService } }) => {
      return groupService.findOne(input.id);
    }),
};
```

#### 2.2 BFF Routing Layer
- [ ] Implement routing middleware (determines which instance handles request)
- [ ] Add response combining logic (merge results from multiple instances)
- [ ] Create fallback logic (if worker instance unavailable)
- [ ] Add request tracing (track cross-instance requests)

**BFF Pattern:**
```typescript
// Determines instance based on realmId
export const routingMiddleware = async (req, res, next) => {
  const realmId = extractRealmId(req);
  
  if (realmId === 'hub') {
    // Handle locally
    return localServiceCall(req);
  }
  
  // Route to worker instance
  const instance = await instanceRegistry.find(realmId);
  return proxyToInstance(instance, req);
};
```

#### 2.3 Testing Strategy
- [ ] Add integration tests for cross-instance calls
- [ ] Performance testing (latency, throughput)
- [ ] Chaos testing (instance failures, network issues)
- [ ] Load testing (concurrent multi-instance requests)

**Deliverables:**
- tRPC procedure implementations for all domains
- BFF routing layer
- Updated API documentation
- Performance comparison report

**Estimated Effort:** 4 person-months

---

### Phase 3: Federation Rollout (Q1-Q2 2027)

**Goal:** Deploy first worker instance, validate federation in production

**Technical Work:**

#### 3.1 First Worker Instance Deployment
- [ ] Deploy worker instance for pilot department (smallest, lowest risk)
- [ ] Migrate pilot department data from hub to worker
- [ ] Set up monitoring and alerting
- [ ] Document deployment process

**Pilot Selection Criteria:**
- Small user base (< 50 users)
- Limited external dependencies
- Active maintainer willing to test
- Non-critical functionality (can tolerate downtime)

#### 3.2 Data Migration Strategy
- [ ] Design migration scripts (hub → worker)
- [ ] Implement rollback mechanism
- [ ] Add data validation (ensure no data loss)
- [ ] Create migration runbook

**Migration Steps:**
1. Snapshot data from hub database
2. Filter by future worker realmId
3. Export to SQL/JSON
4. Provision worker database
5. Import data
6. Validate data integrity
7. Switch routing to worker instance
8. Monitor for issues
9. Archive hub data (keep for rollback)

#### 3.3 Operational Readiness
- [ ] Update monitoring dashboards (multi-instance view)
- [ ] Set up log aggregation (combine logs from all instances)
- [ ] Create incident response playbook
- [ ] Train support team

**Success Criteria:**
- Worker instance serves 100% of pilot traffic
- No data leakage between instances
- Response times < 200ms (95th percentile)
- Zero data loss during migration
- Rollback plan tested and validated

**Deliverables:**
- First production worker instance
- Migration automation scripts
- Updated operational runbooks
- Post-mortem report

**Estimated Effort:** 2 person-months

---

### Phase 4: Full Federation (Q2-Q4 2027)

**Goal:** Roll out worker instances for all departments, achieve full federation

**Technical Work:**

#### 4.1 Automated Onboarding
- [ ] Self-service worker instance provisioning
- [ ] Automated data migration
- [ ] Instance health monitoring
- [ ] Cost tracking per instance

#### 4.2 Advanced Features
- [ ] Cross-instance search (query multiple instances)
- [ ] Federated reporting (aggregate data from all instances)
- [ ] Instance-to-instance communication (optional)
- [ ] Central admin dashboard (view all instances)

#### 4.3 Optimization
- [ ] Redis caching per instance
- [ ] Database connection pooling
- [ ] Query optimization
- [ ] CDN for static assets

**Deliverables:**
- All departments on worker instances
- Self-service provisioning system
- Advanced federation features
- Cost optimization report

**Estimated Effort:** 6 person-months

---

## Technical Debt Payoff

### Items to Address During Federation Migration

1. **Hardcoded Realm Filtering**
   - Current: `realmId: 'hub'` everywhere
   - Future: Dynamic realm detection based on instance

2. **In-Memory Caching**
   - Current: Local memory cache (fine for single instance)
   - Future: Redis per instance (shared cache)

3. **Direct Database Calls**
   - Current: Prisma calls directly in serverFn
   - Future: tRPC procedures (remote-capable)

4. **Single Database Connection**
   - Current: One Prisma client, one database
   - Future: Connection registry, multiple databases

---

## Migration Risks and Mitigation

### Risk: Data Loss During Migration
**Mitigation:**
- Automated backups before migration
- Validation scripts after migration
- Rollback plan (switch back to hub)
- Keep hub data for 90 days post-migration

### Risk: Performance Degradation
**Mitigation:**
- Load testing before rollout
- Gradual rollout (one instance at a time)
- Performance monitoring dashboards
- Circuit breakers (fallback to hub if worker slow)

### Risk: Auth Bypass
**Mitigation:**
- Penetration testing before federation
- Auth checks in both BFF and worker
- Audit logs for all cross-instance calls
- Regular security reviews

### Risk: Instance Unavailability
**Mitigation:**
- Health checks and auto-restart
- Fallback to hub for critical operations
- Redundant instances for high-traffic departments
- Clear SLA definitions

---

## Feature Priorities by Phase

### Must-Have for Federation (Blocking)
- Instance registry
- tRPC procedures
- BFF routing layer
- Data migration automation
- Policy snapshot system

### Should-Have (High Value)
- Cross-instance search
- Federated reporting
- Self-service provisioning
- Redis caching

### Nice-to-Have (Future)
- Instance-to-instance communication
- Advanced admin dashboard
- Cost optimization tools
- A/B testing per instance

---

## Decision Points

### When to Start Phase 1?
**Trigger:** MVP launch complete, 3+ months of stable production usage

### When to Start Phase 2?
**Trigger:** Infrastructure automation complete, first pilot department identified

### When to Start Phase 3?
**Trigger:** tRPC procedures tested, BFF routing validated in staging

### When to Start Phase 4?
**Trigger:** First worker instance running 30+ days without major issues

---

## Open Questions for Future Resolution

1. **How to handle cross-instance dependencies?**
   - Example: User in worker instance A needs to see group in worker instance B
   - Options: BFF merges, direct instance-to-instance calls, hub acts as proxy

2. **What's the pricing model for worker instances?**
   - Per instance? Per user? Per API call?

3. **Who manages worker instance updates?**
   - Central team? Department admins? Automated?

4. **How to handle schema migrations across instances?**
   - All instances same schema version? Independent upgrades?

5. **What's the data retention policy?**
   - Archive data from hub after migration? Keep forever?

---

## Success Metrics

### Phase 1 Success
- [ ] 3 worker databases provisioned in test environment
- [ ] Instance registry functional
- [ ] Configuration management automated

### Phase 2 Success
- [ ] All services have tRPC procedures
- [ ] BFF routing handles 100% of requests correctly
- [ ] Performance within 10% of MVP baseline

### Phase 3 Success
- [ ] First worker instance in production
- [ ] Zero data loss during migration
- [ ] Pilot department satisfied (NPS > 8)

### Phase 4 Success
- [ ] 10+ worker instances in production
- [ ] Self-service provisioning used by 3+ departments
- [ ] System reliability > 99.9%

---

## References

- `decisions/00-mvp-vs-worker-instance.md` - Feature matrix
- `architecture/00-federation-model.md` - Federation architecture
- `implementation/01-trpc-procedures.md` - tRPC patterns
- `architecture/04-routing-aggregation.md` - BFF routing
