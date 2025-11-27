---
purpose: "MUST: Services realm-agnostic for MVP + worker-instance reuse"
triggers: ["implementing service", "code review for service", "adding realm parameter"]
keywords: ["service", "purity", "realm-agnostic", "DI", "reusable", "MVP", "worker-instance"]
importance: "critical"
size: "200 words"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Rule: Services are Realm-Agnostic

## The Rule (Absolute)

**Services MUST NOT know about realms. They don't accept `realmId` parameter.**

**Wait, that looks wrong!** Where does realmId come from?

**Answer:** The caller (procedure/serverFn) is responsible for enforcing realm.

## Why It Matters

### Reason 1: Same Code Works MVP + Worker Instance

**MVP:**
- Service called directly via DI
- Caller (procedure) already validated user has access to this realm
- Database query runs within that context

**Worker Instance:**
- Same service code
- Called via tRPC client from BFF
- Caller (routing middleware) determined which instance to call
- BFF has already ensured user/instance match
