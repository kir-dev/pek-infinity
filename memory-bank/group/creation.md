---
purpose: "Rules for creating organizations and subgroups"
triggers: ["creating group", "onboarding organization"]
keywords: ["group", "creation", "organization", "subgroup"]
importance: "probably needed"
size: "400 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Group Creation

Creating groups involves strict validation to ensure data integrity.

## Creating an Organization
-   **Endpoint**: `createOrganization`.
-   **Rules**:
    -   Must have a unique name.
    -   `parentId` is null.
    -   ID is generated as `name@name`.

## Creating a Subgroup
-   **Endpoint**: `createSubGroup`.
-   **Rules**:
    -   Must have a valid `parentId`.
    -   Parent must not be archived.
    -   ID is generated as `organizationId@subgroupName`.

## Cascading on Group Creation

### What Happens When Manager Creates Subgroup

**Trigger:** Manager creates "ML Team" subgroup under "Engineering"

**Steps:**
1. Create group with parent.id = "engineering-id"
2. Assign creator GOD on new group
3. **CASCADE**: Find all managers of parent group
4. **CASCADE**: Add escalation statements to each parent manager's policy

## Common Mistakes

### ❌ WRONG: Creating subgroup under archived parent

```typescript
// WRONG: No validation
const subgroup = await prisma.group.create({
  data: { name, parentId, realmId }
});
// Result: Orphaned subgroup if parent is deleted

// RIGHT: Validate parent.isArchived = false
const parent = await prisma.group.findUnique({ where: { id: parentId } });
if (parent.isArchived) {
  throw new Error("Cannot create under archived parent");
}
```


## Code Reference
-   *Implementation*: `createOrganization` and `createSubGroup` in `full-stack/src/domains/group/api/group.service.ts`.
