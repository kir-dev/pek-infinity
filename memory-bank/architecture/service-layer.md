---
purpose: "Copy-paste service template with DI pattern; what goes in service, what doesn't, testing in isolation"
triggers: ["implementing new domain", "code review for service layer", "understanding DI pattern"]
keywords: ["service", "dependency-injection", "tsyringe", "injectable", "template", "testing"]
importance: "critical"
size: "1500 words"
status: "active"
created: "2025-10-20"
updated: "2025-11-27"





---

# Service Layer Template

## Core Principles

1. **Pure business logic**—no realm, no auth, no routing
2. **Dependency injection**—use tsyringe `@injectable()` and `@inject()`
3. **Database access only**—services call Prisma (or other data layer)
4. **Testable in isolation**—mock PrismaService, run tests without HTTP
5. **Reusable**—same service code for MVP (local DI) and worker (tRPC)

---

## Services Adapt to Business Requirements

Services are **not just CRUD wrappers**. They adapt to specific business needs while maintaining a close relation to the database schema.

**Example:**
- `findUserById(id)`: Standard lookup.
- `findUserByUsername(username)`: Business requirement for login/profile.
- `findActiveUsersInGroup(groupId)`: Complex business logic filter.

Don't just expose `findMany({ where })` and let the controller build the query. The service should expose semantic methods that reflect *intent*.

## Template: GroupService

See the high-quality implementation in: [group.service.ts](file:///home/sudta/projects/kir-dev/pek-infinity/copilot/refactor-memory-bank-docs/full-stack/src/domains/group/api/group.service.ts)

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

---

## What DOES NOT Go IN Services

### ❌ Realm Filtering

RIGHT: Caller (middleware/procedure) filters by realm

**Why?** In worker, you call same service from multiple instances. Each instance filters by its own realmId.

### ❌ Authentication/Authorization

RIGHT: Auth happens in middleware, not service

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

---

## Testing Services in Isolation

See `architecture/testing.md` for the detailed testing guide.

## Checklist Before Submitting PR

- [ ] Service is marked `@injectable()`
- [ ] All dependencies injected via `@inject()`
- [ ] No `realmId` parameters in service methods
- [ ] No auth/permission checks in service
- [ ] No HTTP/protocol-specific code
- [ ] Business logic is clear and testable
- [ ] All methods have unit tests with mocked Prisma
