---
purpose: "Middleware stack order and guard responsibilities"
triggers: ["implementing middleware", "debugging auth failures", "adding new guard"]
keywords: ["middleware", "guard", "stack", "order", "jwtGuard", "authGuard"]
importance: "critical"
size: "800 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Middleware Layering

## Core Principle: Middleware Order is Critical

Middleware executes in the order it's declared. **Order mistakes = security holes.**

**Correct order:**
```typescript
.middleware([jwtGuard, authGuard, routingMiddleware])
```

## Standard Middleware Stack

```
Request
  ↓
1️⃣ jwtGuard
   └─ Extract JWT from httpOnly cookie
   └─ Validate signature
   └─ Inject user into context
   └─ If invalid → 401
  ↓
2️⃣ authGuard
   └─ Check permissions against policies
   └─ If no permission → 403
  ↓
3️⃣ routingMiddleware (MVP: local DI)
   └─ Resolve service via DI
   └─ Inject into context
  ↓
Handler
  └─ Call service method
```

## Guard Responsibilities

### jwtGuard
- Extract JWT from httpOnly cookie
- Validate JWT signature
- Decode claims (userId, exp)
- Inject `user` into context
- **Does NOT:** Check permissions, know about realms

### authGuard
- Check user has required permissions
- Query policy statements
- Verify scope
- **Does NOT:** Know about realms, route requests

## Why Order Matters

**❌ Bad:** jwtGuard AFTER authGuard
```typescript
.middleware([
  authGuard(['GROUP_VIEW']),  // ❌ Runs before JWT validated
  jwtGuard(),                 // ❌ Too late!
])
```

**Problem:** authGuard runs before JWT is validated. Security bypass risk.

## Code References

- jwtGuard implementation: `full-stack/src/middleware/jwt.guard.ts`
- authGuard implementation: `full-stack/src/middleware/auth.guard.ts`
