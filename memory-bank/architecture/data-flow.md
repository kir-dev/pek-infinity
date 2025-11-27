---
purpose: "Visual reference: request flows, auth flows, policy cascade, error handling paths"
triggers: ["understanding request lifecycle", "tracing bug through system", "architectural review"]
keywords: ["flow", "diagram", "sequence", "request", "auth", "policy", "cascade", "response"]
importance: "medium"
size: "1200 words"
status: "active"
created: "2025-10-20"
updated: "2025-11-27"





---

# Data Flow & Request Lifecycle

## MVP Request Flow (Single Hub Instance)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MVP REQUEST FLOW                                  │
│                 (Hub Instance, Single Realm)                       │
└─────────────────────────────────────────────────────────────────────┘

User Browser                 TanStack Start              Hub Backend
    │                              │                          │
    │  1. Click "View Groups"      │                          │
    ├─────────────────────────────>│                          │
    │                              │  2. Call serverFn        │
    │                              ├─────────────────────────>│
    │                              │  (getGroupsFn)           │
    │                              │                          │
    │                              │  3. authGuard middleware  │
    │                              │  - Verify JWT            │
    │                              │  - Check policy snapshot  │
    │                              │  - Extract context       │
    │                              │  {userId, realmId, ...}  │
    │                              │                          │
    │                              │  4. policyGuard          │
    │                              │  - Verify permission     │
    │                              │  (canViewGroups)         │
    │                              │                          │
    │                              │  5. Service layer        │
    │                              │  await groupService      │
    │                              │    .findAll()            │
    │                              │                          │
    │                              │  6. Prisma query         │
    │                              ├────────────────────────>│
    │                              │  findMany({              │
    │                              │    where: {              │
    │                              │      realmId: 'hub'    │
    │                              │    }                     │
    │                              │  })                      │
    │                              │                          │
    │                              │ <────────────────────────┤
    │                              │  7. Database response    │
    │                              │  [groups...]             │
    │                              │                          │
    │                              │  8. Serialize response   │
    │ <─────────────────────────────│  JSON { data: [...] }   │
    │ 9. Render groups list        │                          │
    │                              │                          │

Legend:
- Middleware runs FIRST (auth, policy)
- Service layer (realm-agnostic, receives realm from context)
- Database query includes realmId filter
- Response serialized and sent to client
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                   ERROR HANDLING FLOW                                │
│              Middleware Errors vs Handler Errors                     │
└─────────────────────────────────────────────────────────────────────┘

Request enters middleware chain:

   authGuard
      │
      ├─ No JWT?
      │  └─> throw AppError('Unauthorized', 401)
      │
      ├─ Invalid JWT?
      │  └─> throw AppError('Invalid token', 401)
      │
      ├─ JWT expired?
      │  └─> throw AppError('Token expired', 401)
      │
      └─ ✓ Valid JWT, extract context
            │
            └─> policyGuard(['canViewGroups'])
                   │
                   ├─ Policy snapshot missing?
                   │  └─> throw AppError('Policy check failed', 403)
                   │
                   ├─ User doesn't have permission?
                   │  └─> throw AppError('Insufficient permissions', 403)
                   │
                   └─ ✓ Permission granted
                         │
                         └─> Handler execution
                                │
                                ├─ Data not found?
                                │  └─> throw AppError('Group not found', 404)
                                │
                                ├─ Validation failed?
                                │  └─> throw AppError('Invalid input', 400)
                                │
                                ├─ Database error?
                                │  └─> throw AppError('Database error', 500)
                                │
                                └─ ✓ Success
                                      └─> return data

Response formatting:

Success (200):
{
  "data": { /* result */ },
  "meta": { "timestamp": "..." }
}

Client error (400, 401, 403, 404):
{
  "error": {
    "message": "Insufficient permissions",
    "code": "PERMISSION_DENIED",
    "status": 403
  }
}

Server error (500):
{
  "error": {
    "message": "Internal server error",
    "code": "INTERNAL_ERROR",
    "status": 500,
    "requestId": "req-xyz"  // for logging
  }
}
```

## Key points
- Middleware errors (401, 403) caught early, request never reaches handler
- Handler errors (400, 404, 500) caught, formatted consistently
- All errors logged with requestId for debugging
- No stack traces in response (security)
- Client receives structured error with actionable message
