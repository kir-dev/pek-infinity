---
file: architecture/00-federation-model.md
purpose: "Hub + worker-instance stub - see future-plans/federation.md and future-plans/worker-instances.md for complete details"
triggers: ["designing multi-instance features", "debugging federation logic", "adding realm support"]
keywords: ["federation", "hub", "worker-instance", "instance", "BFF", "multi-tenancy", "realm", "future"]
dependencies: ["future-plans/federation.md", "future-plans/worker-instances.md"]
urgency: "low"
size: "150 words"
status: "stub"
updated: "2025-11-17"




---

# Federation Model: Worker-Only Feature (Future)

## Status

**Worker-only (Year 2+)** - Multi-instance federation. **MVP uses single hub instance only.**

## For Complete Documentation

See:
- **`future-plans/federation.md`** - Complete federation model, hub/worker relationships, realm concept, user profiles
- **`future-plans/worker-instances.md`** - Multi-instance routing, BFF pattern, aggregation strategies

## Quick Overview

**The Problem**: Organizations need both centralization (auth, profiles) and decentralization (isolated data per department/event).

**The Solution**: Hub instance + Worker instances + BFF router

```
Frontend (pek.com)
    ↓
BFF (Hub routes requests)
    ├─ Hub Instance (auth, profiles, central data)
    └─ Worker Instances (per dept/event, isolated data)
```

## Key Concepts

**Realm**: Either hub or a worker instance. Each has:
- Unique ID (`"hub"`, `"worker-acme"`)
- Own database (or shared DB with realm filtering)
- Isolation boundary (data doesn't leak across realms)

**User Profiles**: Stored in hub only (single identity across federation).

**Permissions**: Per-instance. User sees different data in each realm based on policies.

## MVP Implication

In MVP:
- Hub instance **is** the BFF (same container)
- Routes to "local" service (no network calls)
- No worker instances yet
- Code path identical to worker; just activate routing later

---

**For complete details**: `future-plans/federation.md` and `future-plans/worker-instances.md`

**Last updated**: 2025-11-17
