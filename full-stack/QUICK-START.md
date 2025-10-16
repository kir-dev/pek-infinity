# Quick Start: Dependency Injection in TanStack Start

This guide shows you how to quickly add dependency injection to your TanStack Start routes.

## 1. Create a Service

```typescript
// src/services/my.service.ts
import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import { PrismaService } from './prisma.service';

@injectable()
export class MyService {
  constructor(@inject(PrismaService) private prisma: PrismaService) {}

  async getData() {
    return this.prisma.myModel.findMany();
  }
}
```

## 2. Define Scopes (Optional)

```typescript
// src/middleware/scopes.ts
export const SCOPE = {
  MY_SCOPE_READ: 'MY_SCOPE_READ',
  MY_SCOPE_WRITE: 'MY_SCOPE_WRITE',
} as const;
```

## 3. Create a Route with DI

```typescript
// src/routes/my-route.tsx
import 'reflect-metadata';
import { createFileRoute } from '@tanstack/react-router';
import { injectService, authGuard, SCOPE, type RequestContext } from '../middleware';
import { MyService } from '../services/my.service';

export const Route = createFileRoute('/my-route')({
  server: {
    middleware: [
      injectService(MyService),
      authGuard([SCOPE.MY_SCOPE_READ]),
    ],
    handlers: {
      GET: async ({ context }) => {
        const ctx = context as RequestContext;
        const data = await ctx.service.getData();
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' },
        });
      },
    },
  },
  component: MyComponent,
});

function MyComponent() {
  return <div>My Component</div>;
}
```

## 4. Write Tests

```typescript
// test/services/my.service.spec.ts
import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { container } from 'tsyringe';
import { PrismaService } from '../../src/services/prisma.service';
import { MyService } from '../../src/services/my.service';
import { createMockPrismaService } from '../services-mock.util';

describe('MyService', () => {
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    container.clearInstances();
    mockPrisma = createMockPrismaService();
    container.registerInstance(PrismaService, mockPrisma as any);
  });

  afterEach(() => {
    container.clearInstances();
  });

  it('should get data', async () => {
    const service = container.resolve(MyService);
    const mockData = [{ id: '1', name: 'Test' }];
    mockPrisma.myModel.findMany.mockResolvedValue(mockData as any);

    const result = await service.getData();

    expect(result).toEqual(mockData);
  });
});
```

## Key Points

- Always import `'reflect-metadata'` at the top of service and route files
- Use `@injectable()` on all services
- Use `@inject()` for constructor parameters
- Order middleware: `injectService` → `authGuard`
- Type-cast context to `RequestContext` in handlers
- Clear container instances in test cleanup

## Examples

Check these files for complete examples:
- `src/services/user.service.ts` - User service
- `src/services/group.service.ts` - Group service
- `src/routes/user/profile.tsx` - User route
- `src/routes/groups/index.tsx` - Groups route
- `test/services/user.service.spec.ts` - Service tests

See `DI-README.md` for full documentation.
