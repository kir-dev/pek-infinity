# NestJS-style Dependency Injection in TanStack Start

This document describes the dependency injection (DI) system implemented in the full-stack application using `tsyringe`.

## Overview

The DI system follows NestJS patterns and provides:
- Request-scoped service lifetimes
- Type-safe service injection
- Authentication and authorization middleware
- Automatic resource cleanup (Prisma disconnection)

## Core Components

### 1. Services

Services are decorated with `@injectable()` and can inject dependencies via `@inject()`:

```typescript
import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import { PrismaService } from './prisma.service';

@injectable()
export class UserService {
  constructor(@inject(PrismaService) private prisma: PrismaService) {}
  
  async getUserProfile(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}
```

#### PrismaService

The `PrismaService` extends `PrismaClient` and is registered per-request by the `authGuard` middleware:

```typescript
@injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super(/* options */);
  }
}
```

### 2. Middleware

#### injectService()

Attempts to resolve a service from the DI container. If resolution fails (e.g., Prisma not yet available), it defers resolution to `authGuard`.

```typescript
import { injectService } from './middleware';
import { UserService } from './services/user.service';

middleware: [
  injectService(UserService),
  // ... other middleware
]
```

**Behavior:**
1. Try to resolve service immediately
2. If success: set `ctx.service` and proceed
3. If fail: store `ServiceClass` in `ctx.pendingServiceClass` for deferred resolution
4. After `next()`: verify no pending service remains (throws error if not resolved)

#### authGuard()

Handles authentication, scope checking, Prisma registration, and service resolution:

```typescript
import { authGuard, SCOPE } from './middleware';

middleware: [
  authGuard([SCOPE.USER_EDIT_PROFILE]),
]
```

**Behavior:**
1. Authenticates the user (currently mocked)
2. Checks if user has all required scopes
3. Creates and registers `PrismaService` for this request
4. Resolves any pending service from `injectService`
5. Executes the handler
6. Cleanup: disconnects Prisma after response

### 3. Request Context

The `RequestContext` type provides type-safe access to request-scoped data:

```typescript
export type RequestContext = {
  prisma?: PrismaService;
  service?: any;
  pendingServiceClass?: any;
  user?: { id: string; scopes: string[] };
};
```

### 4. Scopes

Authorization scopes are defined in `middleware/scopes.ts`:

```typescript
export const SCOPE = {
  USER_VIEW_PROFILE: 'USER_VIEW_PROFILE',
  USER_EDIT_PROFILE: 'USER_EDIT_PROFILE',
  // Add more scopes as needed
} as const;
```

## Usage Example

### Creating a Route with DI

```typescript
import 'reflect-metadata';
import { createFileRoute } from '@tanstack/react-router';
import { injectService, authGuard, SCOPE, type RequestContext } from '../../middleware';
import { UserService } from '../../services/user.service';

export const Route = createFileRoute('/user/profile')({
  server: {
    middleware: [
      injectService(UserService),
      authGuard([SCOPE.USER_EDIT_PROFILE]),
    ],
    handlers: {
      GET: async ({ context }) => {
        const ctx = context as RequestContext;
        const result = await ctx.service.getUserProfile(ctx.user!.id);
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' },
        });
      },
      POST: async ({ request, context }) => {
        const ctx = context as RequestContext;
        const body = await request.json();
        const result = await ctx.service.updateUserProfile(ctx.user!.id, body);
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' },
        });
      },
    },
  },
  component: UserProfileComponent,
});
```

## Testing

Tests use vitest and mock services using the DI container:

```typescript
import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { container } from 'tsyringe';
import { PrismaService } from '../../src/services/prisma.service';
import { UserService } from '../../src/services/user.service';
import { createMockPrismaService } from '../services-mock.util';

describe('UserService', () => {
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    container.clearInstances();
    mockPrisma = createMockPrismaService();
    container.registerInstance(PrismaService, mockPrisma as any);
  });

  afterEach(() => {
    container.clearInstances();
  });

  it('should get user profile', async () => {
    const userService = container.resolve(UserService);
    const mockUser = { id: '123', name: 'John Doe' };
    mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

    const result = await userService.getUserProfile('123');

    expect(result).toEqual(mockUser);
    expect(mockPrisma.user.findUnique).toHaveBeenCalled();
  });
});
```

## Configuration

### TypeScript

Enable experimental decorators in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Vite

Configure esbuild to support decorators in `vite.config.ts`:

```typescript
export default defineConfig({
  esbuild: {
    target: 'ES2022',
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    },
  },
  ssr: {
    external: ['@prisma/client'],
  },
});
```

### Biome

Enable unsafe parameter decorators in `biome.json`:

```json
{
  "javascript": {
    "parser": {
      "unsafeParameterDecoratorsEnabled": true
    }
  }
}
```

## Best Practices

1. **Always import `reflect-metadata`** at the top of files using decorators
2. **Use `@injectable()` decorator** on all services
3. **Use `@inject()` decorator** for constructor parameter injection
4. **Clear container instances** in test cleanup (`afterEach`)
5. **Register PrismaService per-request** (done automatically by `authGuard`)
6. **Define scopes** for all protected endpoints
7. **Type-cast context** to `RequestContext` in handlers

## Architecture Notes

- **Per-request lifetimes**: Each request gets its own `PrismaService` instance
- **Deferred resolution**: Services requiring Prisma are resolved after authentication
- **Automatic cleanup**: Prisma disconnects automatically after request completes
- **Type safety**: Strong typing throughout the DI system
- **Middleware order**: `injectService` → `authGuard` → handler
