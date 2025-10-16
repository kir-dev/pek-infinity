# Architecture Diagram

## Request Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Incoming HTTP Request                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    TanStack Router Middleware                        │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Step 1: injectService(ServiceClass)                          │  │
│  │                                                               │  │
│  │ • Attempts to resolve service from container                 │  │
│  │ • If PrismaService available → Success, set ctx.service      │  │
│  │ • If PrismaService missing → Defer, set ctx.pendingService   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                  │                                   │
│                                  ▼                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Step 2: authGuard([scopes])                                  │  │
│  │                                                               │  │
│  │ • Authenticates user (JWT/session)                           │  │
│  │ • Validates required scopes                                  │  │
│  │ • Creates new PrismaService instance                         │  │
│  │ • Registers PrismaService in container (per-request)         │  │
│  │ • Resolves pending service if any                            │  │
│  │ • Sets ctx.prisma and ctx.service                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                  │                                   │
└──────────────────────────────────┼───────────────────────────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Route Handler                               │
│                                                                       │
│  const ctx = context as RequestContext;                             │
│  const result = await ctx.service.getData();                        │
│  return Response.json(result);                                      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Cleanup (finally)                           │
│                                                                       │
│  • await prisma.$disconnect()                                       │
│  • Release resources                                                │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         HTTP Response                                │
└─────────────────────────────────────────────────────────────────────┘
```

## Dependency Injection Container Lifecycle

```
Per Request:
┌─────────────────────────────────────────────────────────────┐
│  Container (Request-Scoped)                                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ PrismaService (Singleton per request)              │    │
│  │  • Created by authGuard                            │    │
│  │  • Registered in container                         │    │
│  │  • Shared across all services in this request      │    │
│  └────────────────────────────────────────────────────┘    │
│           │                                                  │
│           ▼                                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │ UserService (depends on PrismaService)             │    │
│  │  • Resolved by container                           │    │
│  │  • Injects PrismaService automatically             │    │
│  └────────────────────────────────────────────────────┘    │
│           │                                                  │
│           ▼                                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │ GroupService (depends on PrismaService)            │    │
│  │  • Resolved by container                           │    │
│  │  • Injects PrismaService automatically             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  After request completes:                                   │
│  • PrismaService.$disconnect() called                       │
│  • Container instances can be cleared for next request      │
└─────────────────────────────────────────────────────────────┘
```

## Service Dependency Graph

```
┌──────────────────┐
│  PrismaService   │  ← Injectable, extends PrismaClient
│  @injectable()   │     Created per-request by authGuard
└────────┬─────────┘
         │
         │ @inject(PrismaService)
         │
    ┌────┴────┬──────────────┬──────────────┐
    │         │              │              │
    ▼         ▼              ▼              ▼
┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐
│  User   │ │  Group   │ │  Member  │ │   Other     │
│ Service │ │ Service  │ │ Service  │ │  Services   │
└─────────┘ └──────────┘ └──────────┘ └─────────────┘
```

## Context Flow

```
Request Context Object:
┌──────────────────────────────────────────────────────┐
│  RequestContext {                                     │
│                                                       │
│    prisma?: PrismaService                            │
│    │  ↑ Set by authGuard                             │
│    │                                                  │
│    service?: T (UserService | GroupService | ...)   │
│    │  ↑ Set by injectService or authGuard           │
│    │                                                  │
│    pendingServiceClass?: ServiceClass                │
│    │  ↑ Set by injectService if resolution deferred │
│    │  ↑ Cleared by authGuard after resolution       │
│    │                                                  │
│    user?: { id: string; scopes: string[] }          │
│       ↑ Set by authGuard after authentication       │
│                                                       │
│  }                                                    │
└──────────────────────────────────────────────────────┘
```

## Middleware Resolution Patterns

### Pattern 1: Immediate Resolution (PrismaService already available)
```
injectService(UserService)
  → container.resolve(UserService)
  → ✓ Success (PrismaService exists)
  → ctx.service = userService

authGuard([scopes])
  → Authenticate
  → Check scopes
  → No pending service to resolve
  → Continue
```

### Pattern 2: Deferred Resolution (PrismaService not yet available)
```
injectService(UserService)
  → container.resolve(UserService)
  → ✗ Fail (PrismaService doesn't exist yet)
  → ctx.pendingServiceClass = UserService

authGuard([scopes])
  → Authenticate
  → Check scopes
  → Create & register PrismaService
  → Resolve ctx.pendingServiceClass
  → ctx.service = container.resolve(UserService)
  → ✓ Success (PrismaService now exists)
  → delete ctx.pendingServiceClass
```

## Type Safety Flow

```
TypeScript Types:
┌────────────────────────────────────────────────────┐
│                                                     │
│  Route Handler                                     │
│  ({ context }: { context: unknown })               │
│         │                                           │
│         ▼                                           │
│  const ctx = context as RequestContext             │
│         │                                           │
│         ▼                                           │
│  ctx.service (type: any but typed at runtime)      │
│  ctx.prisma  (type: PrismaService)                 │
│  ctx.user    (type: { id: string; scopes: [] })    │
│                                                     │
└────────────────────────────────────────────────────┘
```
