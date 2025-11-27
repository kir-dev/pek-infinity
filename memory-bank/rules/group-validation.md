---
purpose: "MUST: Validate parent group exists and is not archived. Prevent orphaned groups"
triggers: ["group creation", "group update", "parentId assignment"]
keywords: ["parent", "validation", "archived", "orphan", "hierarchy", "constraint"]
importance: "high"
size: "800 words"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





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

## Why It Matters

### The Orphaned Group Problem

Without validation, groups become detached from hierarchy:
- **Scenario 1:** Parent deleted, child becomes orphan. Breaks hierarchy traversal.
- **Scenario 2:** Parent archived, child still visible. Business logic expects active groups to have active parents.

## Implementation

### Service Layer Pattern

```typescript
@injectable()
export class GroupService {
  async create(input: GroupCreateInput, realmId: string) {
    // Step 1: Validate parent if provided
    if (input.parentId) {
      const parent = await this.prisma.group.findUnique({
        where: { id_realmId: { id: input.parentId, realmId } },
      });

      // Check existence
      if (!parent) {
        throw new AppError('Parent group not found', 404);
      }

      // Check archived
      if (parent.isArchived) {
        throw new AppError('Cannot nest under archived group', 400);
      }
    }

    // Step 2: Create group
    return this.prisma.group.create({
      data: { ...input, realmId },
    });
  }
}
```
