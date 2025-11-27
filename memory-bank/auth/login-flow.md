---
purpose: "Complete JWT flow, auth guards, and permission system"
triggers: ["implementing auth", "designing login flow", "debugging permissions"]
keywords: ["JWT", "auth", "policy", "guard", "cookie", "oauth"]
importance: "critical"
size: "700 tokens"
status: "active"
created: "2025-10-20"
updated: "2025-11-27"





---

# Auth System: JWT & Permissions

## Overview

Authentication in pek-infinity works in layers:

1. **Global JWT**: httpOnly cookie, issued by hub on login
2. **Auth Guard**: Validation against policies

This design allows for a simple, secure, and fast authentication flow for the MVP.

## Login Flow

### User initiates login

```
1. Frontend redirects to AuthSCH (OAuth provider)
   GET https://auth.sch.bme.hu/oauth/...

2. AuthSCH redirects back to hub BFF with code
   GET https://pek.com/callback?code=xxx

3. BFF exchanges code for user info
   - Create/update User profile in hub database
   - Generate long-lived JWT (24h or configurable)
   - Set JWT as httpOnly cookie
   
4. Frontend receives redirect to dashboard
   httpOnly cookie is set; frontend never sees JWT
```

### API Request Flow

```
1. Frontend calls serverFn with JWT
2. BFF jwtGuard extracts JWT
3. routingMiddleware finds zero other instances (only hub)
4. BFF calls local service (no network, DI injection)
5. Service queries local Prisma database
6. Response returned
```

## Common Auth Flows: Examples

### Example 1: View a Group (Permission Granted)

```
Request: getGroup({ id: "engineering" })
Flow:
  1. jwtGuard: ✅ JWT valid
  2. authGuard: Check permissions
     - Query: SELECT statements WHERE userId=user
     - Check: Does user have 'GROUP_VIEW' or similar?
  3. ✅ Permission granted
  4. Service: getGroup("engineering")
  5. Return group data
Response:
  ✅ Frontend shows group
```

### Example 2: Edit a Group (Permission Denied)

```
Request: updateGroup({ id: "conference", data: {...} })
Flow:
  1. jwtGuard: ✅ JWT valid
  2. authGuard: Check permissions
     - Query: SELECT statements WHERE userId=user
     - Check: Does user have 'GROUP_EDIT'?
  3. ❌ Permission denied
  4. Return 403 Forbidden
Response:
  ❌ Frontend shows "You don't have permission"
```

## Gotchas & Common Mistakes

### ❌ Gotcha 1: Auth in Handler, Not Middleware

**Wrong:**
```typescript
.handler(async ({ data, context: { user } }) => {
  if (!user.hasPermission('GROUP_VIEW')) {  // ❌ Prefer middleware
    throw new Error('Forbidden');
  }
  return service.getGroup(data.id);
});
```

**Right:**
```typescript
.middleware([authGuard(['GROUP_VIEW'])])  // ✅ Checks before handler
.handler(async ({ data, context: { user } }) => {
  // Permission already validated
  return service.getGroup(data.id);
});
```

**Why**: If auth is in handler, a bug could skip the check. Middleware is always executed.

