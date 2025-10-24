---
file: implementation/00-service-layer.md
purpose: "Copy-paste service template with DI pattern; what goes in service, what doesn't, testing in isolation"
triggers: ["implementing new domain", "code review for service layer", "understanding DI pattern"]
keywords: ["service", "dependency-injection", "tsyringe", "injectable", "template", "testing"]
dependencies: ["architecture/02-service-patterns.md", "rules/02-service-purity.md"]
urgency: "high"
size: "1500 words"
template: true
status: "active"
created: "2025-10-20"




---

# Service Layer Template

## Core Principles

1. **Pure business logic**—no realm, no auth, no routing
2. **Dependency injection**—use tsyringe `@injectable()` and `@inject()`
3. **Database access only**—services call Prisma (or other data layer)
4. **Testable in isolation**—mock PrismaService, run tests without HTTP
5. **Reusable**—same service code for MVP (local DI) and worker (tRPC)

---

## Template: GroupService

```typescript
import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';
import type * as Prisma from '@prisma/client';
import { PrismaService } from '@/domains/prisma';

@injectable()
export class GroupService {
  constructor(@inject(PrismaService) private prisma: PrismaService) {}

  // ✅ GOOD: Pure query, no realm in method signature
  async findOne(id: string) {
    return this.prisma.group.findUnique({ where: { id } });
  }

  // ✅ GOOD: List with filters
  async findMany(filters?: { parentId?: string; isArchived?: boolean }) {
    return this.prisma.group.findMany({
      where: filters,
      orderBy: { name: 'asc' }
    });
  }

  // ✅ GOOD: Create with minimal validation
  async create(data: Prisma.GroupCreateInput) {
    // Business logic: Validate parent exists if specified
    if (data.parentId) {
      const parent = await this.prisma.group.findUnique({
        where: { id: data.parentId }
      });
      if (!parent) {
        throw new Error('Parent group not found');
      }
      if (parent.isArchived) {
        throw new Error('Cannot create under archived parent');
      }
    }

    return this.prisma.group.create({ data });
  }

  // ✅ GOOD: Update with validation
  async update(id: string, data: Prisma.GroupUpdateInput) {
    // Verify group exists
    const existing = await this.prisma.group.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Group not found');
    }

    return this.prisma.group.update({
      where: { id },
      data
    });
  }

  // ✅ GOOD: Delete (soft via isArchived)
  async archive(id: string) {
    return this.prisma.group.update({
      where: { id },
      data: { isArchived: true }
    });
  }

  // ✅ GOOD: Complex business logic
  async getHierarchy(id: string): Promise<string[]> {
    const ancestors: string[] = [];
    let current = await this.findOne(id);

    while (current) {
      ancestors.push(current.id);
      if (current.parentId) {
        current = await this.findOne(current.parentId);
      } else {
        break;
      }
    }

    return ancestors;
  }
}
```

---

## What Goes IN Services

### ✅ Database Queries

```typescript
async findOne(id: string) {
  return this.prisma.group.findUnique({ where: { id } });
}
```

### ✅ Business Logic / Validation

```typescript
async create(data: Prisma.GroupCreateInput) {
  if (data.parentId) {
    const parent = await this.prisma.group.findUnique({
      where: { id: data.parentId }
    });
    if (!parent || parent.isArchived) {
      throw new Error("Cannot create under archived parent");
    }
  }
  // ...
}
```

### ✅ Transformations for Data Access

```typescript
async getFullHierarchy(id: string) {
  const group = await this.findOne(id);
  const descendants = await this.getDescendants(group.id);
  return { ...group, descendants };
}
```

---

## What DOES NOT Go IN Services

### ❌ Realm Filtering

```typescript
// WRONG: Service knows about realm
async findMany(realm: string) {
  return this.prisma.group.findMany({
    where: { realmId: realm }  // ❌ Service shouldn't filter by realm
  });
}

// RIGHT: Caller (middleware/procedure) filters by realm
async findMany() {
  return this.prisma.group.findMany();
}
```

**Why?** In worker, you call same service from multiple instances. Each instance filters by its own realmId.

### ❌ Authentication/Authorization

```typescript
// WRONG: Service checks permissions
async findOne(id: string, userId: string) {
  const canView = await checkPermission(userId, 'GROUP_VIEW', id);
  if (!canView) throw new Error("Forbidden");
  return this.prisma.group.findUnique({ where: { id } });
}

// RIGHT: Auth happens in middleware, not service
async findOne(id: string) {
  return this.prisma.group.findUnique({ where: { id } });
}
```

**Why?** Auth is cross-cutting concern. Same service used by different auth layers (MVP vs worker).

### ❌ HTTP/Protocol Details

```typescript
// WRONG: Service cares about HTTP
async findOne(id: string): Response {
  try {
    return { status: 200, data: ... };
  } catch (e) {
    return { status: 500, error: ... };
  }
}

// RIGHT: Service throws errors, let middleware handle HTTP
async findOne(id: string) {
  return this.prisma.group.findUnique({ where: { id } });
  // Caller decides whether this is HTTP 200, 500, or something else
}
```

### ❌ Logging/Metrics (usually)

```typescript
// WRONG: Service logs all operations
async findOne(id: string) {
  console.log(`Finding group ${id}`);
  // ...
}

// RIGHT: Logging in middleware or observability layer
// Services focus on business logic
```

---

## Testing Services in Isolation

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GroupService } from './group.service';
import { PrismaService } from '@/domains/prisma';

describe('GroupService', () => {
  let service: GroupService;
  let prismaMock: Partial<PrismaService>;

  beforeEach(() => {
    // Mock PrismaService
    prismaMock = {
      group: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
      }
    };

    // Create service with mocked Prisma
    service = new GroupService(prismaMock as PrismaService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create group with valid parent', async () => {
      const parent = { id: 'parent-1', isArchived: false };
      (prismaMock.group.findUnique as any).mockResolvedValue(parent);
      (prismaMock.group.create as any).mockResolvedValue({
        id: 'new-group',
        parentId: 'parent-1'
      });

      const result = await service.create({
        name: 'Test',
        parentId: 'parent-1'
      });

      expect(result.id).toBe('new-group');
      expect(prismaMock.group.create).toHaveBeenCalled();
    });

    it('should throw if parent is archived', async () => {
      const parent = { id: 'parent-1', isArchived: true };
      (prismaMock.group.findUnique as any).mockResolvedValue(parent);

      await expect(
        service.create({ name: 'Test', parentId: 'parent-1' })
      ).rejects.toThrow('archived');
    });

    it('should throw if parent not found', async () => {
      (prismaMock.group.findUnique as any).mockResolvedValue(null);

      await expect(
        service.create({ name: 'Test', parentId: 'invalid' })
      ).rejects.toThrow('not found');
    });
  });

  describe('getHierarchy', () => {
    it('should return path to root', async () => {
      const groups = {
        'grandchild': { id: 'grandchild', parentId: 'child' },
        'child': { id: 'child', parentId: 'parent' },
        'parent': { id: 'parent', parentId: null }
      };

      (prismaMock.group.findUnique as any).mockImplementation(({ where }) => {
        return Promise.resolve(groups[where.id]);
      });

      const hierarchy = await service.getHierarchy('grandchild');
      expect(hierarchy).toEqual(['grandchild', 'child', 'parent']);
    });
  });
});
```

---

## Common Mistakes

### ❌ WRONG: Accepting realm in service method

```typescript
// WRONG
async findMany(realm: string) {
  return this.prisma.group.findMany({
    where: { realmId: realm }
  });
}

// RIGHT
async findMany() {
  return this.prisma.group.findMany();
}
```

### ❌ WRONG: Service throwing HTTP errors

```typescript
// WRONG
async findOne(id: string) {
  const group = await this.prisma.group.findUnique({ where: { id } });
  if (!group) {
    throw new HttpException('Not Found', 404);  // ❌ Service shouldn't know about HTTP
  }
  return group;
}

// RIGHT
async findOne(id: string) {
  const group = await this.prisma.group.findUnique({ where: { id } });
  if (!group) {
    throw new Error('Group not found');  // Plain error, let middleware handle HTTP
  }
  return group;
}
```

### ❌ WRONG: Multiple databases in one service

```typescript
// WRONG: Service uses both Prisma and Redis
async findOne(id: string) {
  const cached = await redis.get(`group:${id}`);
  if (cached) return cached;
  
  const group = await this.prisma.group.findUnique({ where: { id } });
  await redis.set(`group:${id}`, group);
  return group;
}

// RIGHT: Caching is middleware concern
async findOne(id: string) {
  return this.prisma.group.findUnique({ where: { id } });
}
```

---

## Checklist Before Submitting PR

- [ ] Service is marked `@injectable()`
- [ ] All dependencies injected via `@inject()`
- [ ] No `realmId` parameters in service methods
- [ ] No auth/permission checks in service
- [ ] No HTTP/protocol-specific code
- [ ] Business logic is clear and testable
- [ ] All methods have unit tests with mocked Prisma
- [ ] Service doesn't call other services (data access only)
- [ ] Error messages are plain English (not HTTP status codes)
- [ ] Naming follows domain pattern: `{Domain}Service`

---

## Real Example: Full Service

See `architecture/02-service-patterns.md` for GroupService implementation breakdown.

---

## See Also

- Architecture: `architecture/02-service-patterns.md` - Why services are realm-agnostic
- Implementation: `implementation/01-trpc-procedures.md` - How procedures call services
- Rules: `rules/02-service-purity.md` - Enforcement rules
- Gotchas: `gotchas/00-common-mistakes.md` - Common violations
