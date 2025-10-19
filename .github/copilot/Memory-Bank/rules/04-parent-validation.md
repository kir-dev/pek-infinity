---
file: rules/04-parent-validation.md
purpose: "MUST: Validate parent group exists and is not archived. Prevent orphaned groups"
triggers: ["group creation", "group update", "parentId assignment"]
keywords: ["parent", "validation", "archived", "orphan", "hierarchy", "constraint"]
dependencies: ["implementation/03-auth-guards.md", "gotchas/01-migration-blockers.md"]
urgency: "high"
enforcement: "must-follow"
size: "800 words"
sections: ["the-rule", "why-it-matters", "implementation", "bad-examples", "good-examples", "testing", "checklist"]
status: "active"




---

# Rule: Parent Group Must Exist and Not Be Archived

## The Rule (Absolute)

**When assigning or updating `parentId`, ALWAYS validate:**
1. Parent group exists in the database
2. Parent group is not archived (`isArchived === false`)
3. Parent group is in the same realm as child

**Failure to validate creates orphaned groups (broken hierarchy).**

```typescript
// ❌ FORBIDDEN: No parent validation
export const createGroup = (input: GroupCreateInput) => {
  return prisma.group.create({
    data: {
      name: input.name,
      parentId: input.parentId,  // ← Not verified!
      realmId: input.realmId,
    },
  });
};

// ✅ REQUIRED: Validate parent before create
export const createGroup = (input: GroupCreateInput) => {
  // Validate parent exists and is not archived
  if (input.parentId) {
    const parent = await prisma.group.findUnique({
      where: { id_realmId: { id: input.parentId, realmId: input.realmId } },
    });
    
    if (!parent) {
      throw new AppError('Parent group not found', 404);
    }
    if (parent.isArchived) {
      throw new AppError('Cannot nest under archived group', 400);
    }
  }
  
  return prisma.group.create({
    data: {
      name: input.name,
      parentId: input.parentId,
      realmId: input.realmId,
    },
  });
};
```

---

## Why It Matters

### The Orphaned Group Problem

Without validation, groups become detached from hierarchy:

```typescript
// Scenario 1: Parent deleted, child becomes orphan
const parentId = 'clg12345';
await prisma.group.create({
  data: {
    name: 'Engineering Team',
    parentId: 'clg12345',  // Valid parent exists
    realmId: 'realm1',
  },
});

// Later: Someone manually deletes parent in DB
// (via migration, admin tool, etc)
await prisma.group.delete({
  where: { id: 'clg12345' },
});

// Now child group points to non-existent parent
// Query results: { name: 'Engineering Team', parentId: 'clg12345' }
// But parent doesn't exist!
// ← Breaks hierarchy traversal, filtering, authorization checks

// Scenario 2: Parent archived, child still visible
const parent = await prisma.group.update({
  where: { id: 'clg12345' },
  data: { isArchived: true },  // Parent archived, but no validation for children
});

// Now child belongs to archived parent
// Business logic expects: active groups have active parents
// Bug: Reports show "active" groups under archived parent
// Bug: Permissions check fails (cascade archived)
// Bug: User tries to add members to parent's child (expect active)
```

---

## Implementation

### Service Layer Pattern

```typescript
@injectable()
export class GroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async create(input: GroupCreateInput, realmId: string) {
    // Step 1: Validate parent if provided
    if (input.parentId) {
      const parent = await this.prisma.group.findUnique({
        where: { id_realmId: { id: input.parentId, realmId } },
      });

      // Check existence
      if (!parent) {
        this.logger.debug(`Parent group not found: ${input.parentId}`);
        throw new AppError('Parent group not found', 404);
      }

      // Check archived
      if (parent.isArchived) {
        this.logger.debug(`Parent group archived: ${input.parentId}`);
        throw new AppError('Cannot nest under archived group', 400);
      }
    }

    // Step 2: Create group
    const group = await this.prisma.group.create({
      data: {
        id: generateId(),
        name: input.name,
        description: input.description,
        parentId: input.parentId,
        realmId,
        purpose: input.purpose,
        isArchived: false,
        isCommunity: input.isCommunity ?? false,
        isResort: input.isResort ?? false,
        isTaskForce: input.isTaskForce ?? false,
        hasTransitiveMembership: input.hasTransitiveMembership ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return group;
  }

  async update(id: string, input: GroupUpdateInput, realmId: string) {
    // Validate target group exists
    const group = await this.prisma.group.findUnique({
      where: { id_realmId: { id, realmId } },
    });
    if (!group) throw new AppError('Group not found', 404);

    // Only validate new parent if parentId is being changed
    if (input.parentId && input.parentId !== group.parentId) {
      const parent = await this.prisma.group.findUnique({
        where: { id_realmId: { id: input.parentId, realmId } },
      });

      if (!parent) {
        throw new AppError('Parent group not found', 404);
      }
      if (parent.isArchived) {
        throw new AppError('Cannot nest under archived group', 400);
      }

      // Prevent circular references (optional but recommended)
      if (await this.isDescendant(input.parentId, id, realmId)) {
        throw new AppError('Cannot create circular hierarchy', 400);
      }
    }

    // Update group
    return this.prisma.group.update({
      where: { id_realmId: { id, realmId } },
      data: input,
    });
  }

  // Utility: Check if target is descendant of parent
  private async isDescendant(
    parentId: string,
    targetId: string,
    realmId: string,
  ): Promise<boolean> {
    const target = await this.prisma.group.findUnique({
      where: { id_realmId: { id: targetId, realmId } },
    });

    if (!target) return false;
    if (target.parentId === null) return false;
    if (target.parentId === parentId) return true;

    // Recursive check
    return this.isDescendant(target.parentId, targetId, realmId);
  }
}
```

### Procedure Layer Pattern

```typescript
export const createGroupProcedure = t.procedure
  .use(t.middleware.authGuard)
  .input(GroupCreateSchema)
  .mutation(async ({ ctx, input }) => {
    const { realmId } = ctx;  // From policy snapshot

    // Service validates parent exists and not archived
    const group = await groupService.create(input, realmId);

    return group;
  });

export const updateGroupProcedure = t.procedure
  .use(t.middleware.authGuard)
  .input(GroupUpdateSchema)
  .mutation(async ({ ctx, input }) => {
    const { realmId } = ctx;
    const { id, ...updateData } = input;

    // Service validates new parent (if changed)
    const group = await groupService.update(id, updateData, realmId);

    return group;
  });
```

---

## Bad Examples

### Example 1: No Parent Validation

```typescript
// ❌ BAD: Direct create without validation
const createGroupFn = createServerFn()
  .middleware(authGuard)
  .handler(async ({ context }) => {
    const { userId, realmId } = context;

    return prisma.group.create({
      data: {
        name: 'New Group',
        parentId: input.parentId,  // ← Not checked if exists!
        realmId,
      },
    });
  });

// If parentId is invalid, group created with broken reference
// Hierarchy queries fail later
```

### Example 2: Only Check Existence, Not Archive

```typescript
// ❌ BAD: Validates existence but ignores archived
const service = {
  async createGroup(input: GroupCreateInput, realmId: string) {
    if (input.parentId) {
      const exists = await prisma.group.findUnique({
        where: { id_realmId: { id: input.parentId, realmId } },
      });

      if (!exists) {
        throw new Error('Parent not found');
      }
      // ← Missing archived check!
    }

    return prisma.group.create({ data: input });
  },
};

// Now child can be nested under archived parent
// Breaks business logic: archived groups should have no children
```

### Example 3: Missing Realm Filter

```typescript
// ❌ BAD: Parent validation ignores realm
const service = {
  async createGroup(input: GroupCreateInput, realmId: string) {
    if (input.parentId) {
      // ← NOT checking realmId!
      const parent = await prisma.group.findUnique({
        where: { id: input.parentId },
      });

      if (!parent) throw new Error('Parent not found');
    }

    return prisma.group.create({
      data: { ...input, realmId },
    });
  },
};

// Vulnerability: Child in realm A points to parent in realm B
// Data leakage via hierarchy traversal
// Authorization checks fail (expected parent in same realm)
```

---

## Good Examples

### Example 1: Complete Validation

```typescript
// ✅ GOOD: Validate all constraints
const service = {
  async createGroup(input: GroupCreateInput, realmId: string) {
    if (input.parentId) {
      const parent = await prisma.group.findUnique({
        where: { id_realmId: { id: input.parentId, realmId } },
      });

      if (!parent) {
        throw new AppError('Parent group not found', 404);
      }
      if (parent.isArchived) {
        throw new AppError('Cannot nest under archived group', 400);
      }
    }

    return prisma.group.create({
      data: {
        ...input,
        realmId,
        isArchived: false,
      },
    });
  },
};
```

### Example 2: Prevent Circular Reference

```typescript
// ✅ GOOD: Prevent circular hierarchy
const service = {
  async updateGroupParent(
    groupId: string,
    newParentId: string | null,
    realmId: string,
  ) {
    // Find target group
    const group = await prisma.group.findUnique({
      where: { id_realmId: { id: groupId, realmId } },
    });
    if (!group) throw new AppError('Group not found', 404);

    // If changing parent
    if (newParentId && newParentId !== group.parentId) {
      // Check parent exists and is active
      const parent = await prisma.group.findUnique({
        where: { id_realmId: { id: newParentId, realmId } },
      });
      if (!parent) throw new AppError('Parent not found', 404);
      if (parent.isArchived) throw new AppError('Parent archived', 400);

      // Check parent is not descendant of target (circular)
      if (await this.isDescendantOf(newParentId, groupId, realmId)) {
        throw new AppError('Cannot create circular hierarchy', 400);
      }
    }

    return prisma.group.update({
      where: { id_realmId: { id: groupId, realmId } },
      data: { parentId: newParentId },
    });
  },

  private async isDescendantOf(
    potentialDescendant: string,
    potentialAncestor: string,
    realmId: string,
  ): Promise<boolean> {
    let current = potentialDescendant;
    const visited = new Set<string>();

    while (current) {
      if (visited.has(current)) return false;  // Prevent infinite loops
      visited.add(current);

      if (current === potentialAncestor) return true;

      const group = await prisma.group.findUnique({
        where: { id_realmId: { id: current, realmId } },
      });

      current = group?.parentId || null;
    }

    return false;
  },
};
```

---

## Testing

```typescript
describe('Group Parent Validation', () => {
  it('should reject non-existent parent', async () => {
    expect(() =>
      groupService.create(
        { name: 'Child', parentId: 'invalid-id' },
        'realm1',
      ),
    ).rejects.toThrow('Parent group not found');
  });

  it('should reject archived parent', async () => {
    const parent = await prisma.group.create({
      data: { name: 'Parent', isArchived: true, realmId: 'realm1' },
    });

    expect(() =>
      groupService.create(
        { name: 'Child', parentId: parent.id },
        'realm1',
      ),
    ).rejects.toThrow('Cannot nest under archived group');
  });

  it('should reject parent from different realm', async () => {
    const parent = await prisma.group.create({
      data: { name: 'Parent', realmId: 'realm-other' },
    });

    expect(() =>
      groupService.create(
        { name: 'Child', parentId: parent.id },
        'realm1',
      ),
    ).rejects.toThrow('Parent group not found');
  });

  it('should accept valid parent', async () => {
    const parent = await prisma.group.create({
      data: { name: 'Parent', realmId: 'realm1' },
    });

    const child = await groupService.create(
      { name: 'Child', parentId: parent.id },
      'realm1',
    );

    expect(child.parentId).toBe(parent.id);
  });
});
```

---

## PR Checklist

- [ ] Service layer validates parent exists before create/update
- [ ] Service layer checks parent.isArchived === false
- [ ] Service layer filters by realm (composite key)
- [ ] Circular references prevented (isDescendantOf check)
- [ ] Error messages distinguish "not found" vs "archived"
- [ ] Unit tests cover all validation paths
- [ ] Integration tests verify orphaned groups not created
- [ ] No parentId assignment without validation in handlers

