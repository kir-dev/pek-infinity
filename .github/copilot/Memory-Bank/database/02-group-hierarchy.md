---
file: database/02-group-hierarchy.md
purpose: "Group model with parent-child hierarchy, realmId isolation, composite constraints, cascading on creation"
triggers: ["creating groups", "querying group hierarchy", "designing group operations", "validating group constraints"]
keywords: ["group", "hierarchy", "parent", "children", "composite-key", "archived", "cascade"]
dependencies: ["database/00-realm-model.md", "database/01-policy-system.md"]
urgency: "critical"
size: "1500 words"
status: "active"
created: "2025-10-20"




---

# Group Hierarchy: Structure, Constraints, and Cascading

## Core Concept

Groups are the organizational units in PÉK. A group can have:
- **One parent group** (or none if top-level)
- **Many children** (subgroups)
- **Members** (via Membership model)
- **An owner/manager** (has GOD policy)

The hierarchy is a **tree structure**, not a DAG. Each group knows its parent, children are queried.

## Schema Model

```prisma
model Group {
  id                      String   @id @default(cuid())
  name                    String
  description             String
  
  // Realm isolation (CRITICAL)
  realmId                 String   @default("cloud")
  realm                   Realm    @relation(fields: [realmId], references: [id])
  
  // Hierarchy
  parentId                String?
  parent                  Group?   @relation("ParentGroup", fields: [parentId], references: [id])
  children                Group[]  @relation("ParentGroup")

  // Metadata
  purpose                 GroupPurpose
  isCommunity             Boolean
  isResort                Boolean
  isTaskForce             Boolean
  hasTransitiveMembership Boolean
  isArchived              Boolean  @default(false)

  // Relations
  memberships             Membership[]
  guidelines              GuidelineCollection[]
  scoreboards             Scoreboard[]
  appliedStatements       Statement[]  // For resource scoping in policies

  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  // Constraints
  @@unique([name, realmId])  // Group names unique PER REALM
  @@index([realmId])
  @@index([parentId])
}

enum GroupPurpose {
  UNKNOWN
  OLD
  COMMITTEE
  PARTY
  CIRCLE
  D
  ELLIPSE
  YEAR_CLASS
  GROUP
  CULTURE
  PROJECT
  EVENT
  RESORT
  SPORT
  PROFESSIONAL
  FLOOR
  SERVICE
}
```

**Field meanings:**
- `name`: Human-readable group name (unique within realm)
- `realmId`: Which realm this group belongs to (cloud vs enterprise instance)
- `parentId`: Reference to parent group (null = top-level)
- `children`: Inverse relation (query children via this)
- `purpose`: Category of the group (for UI/filtering)
- `isCommunity`: Informal group? (kor-e)
- `isResort`: Resort/department? (reszort-e)
- `isTaskForce`: Temporary task force?
- `hasTransitiveMembership`: Should members of children be counted as members of parent?
- `isArchived`: Soft-delete flag

## Composite Unique Constraint

```prisma
@@unique([name, realmId])
```

**Why this matters:**
- In MVP: All groups in "cloud" realm, so effectively unique globally
- In enterprise: Each instance has its own realm, so "Engineering" can exist in cloud AND enterprise-acme
- **Example:**
  ```
  Group { name: "Engineering", realmId: "cloud" }      ✅ Allowed
  Group { name: "Engineering", realmId: "enterprise-a" } ✅ Allowed (different realm)
  Group { name: "Engineering", realmId: "cloud" }       ❌ Error (duplicate)
  ```

---

## Critical Constraints

### Constraint 1: Parent Cannot Be Archived

**Rule:** When creating subgroup, parent.isArchived must be false

**Why:** Archived groups are deleted logically; cannot have "orphaned" children

**Implementation:**
```typescript
async function createGroup(
  name: string,
  parentId?: string,
  realm: string
) {
  // Validate parent if specified
  if (parentId) {
    const parent = await prisma.group.findUnique({
      where: { id: parentId, realmId: realm }
    });

    if (!parent) {
      throw new Error("Parent group not found");
    }
    if (parent.isArchived) {
      throw new Error("Cannot create subgroup under archived parent");
    }
  }

  // Create group
  return prisma.group.create({
    data: { name, parentId, realmId: realm }
  });
}
```

### Constraint 2: Parent Must Be Same Realm

**Rule:** When creating subgroup, parent.realmId must equal child.realmId

**Why:** Prevents cross-realm hierarchies (data isolation violation)

**Implementation:**
```typescript
if (parentId && parent.realmId !== realm) {
  throw new Error("Cannot create cross-realm subgroups");
}
```

### Constraint 3: Unique Name Per Realm

**Rule:** Group names are unique within a realm, not globally

**Handled by:** `@@unique([name, realmId])` - Prisma enforces this

**Example:**
```typescript
// Same realm: Error
await createGroup("Engineering", null, "cloud");
await createGroup("Engineering", null, "cloud");  // ❌ Unique violation

// Different realm: OK
await createGroup("Engineering", null, "cloud");
await createGroup("Engineering", null, "enterprise-a");  // ✅ Different realm
```

---

## Hierarchy Queries

### Get All Ancestors (Path to Root)

```typescript
async function getAncestors(groupId: string, realm: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId, realmId: realm }
  });

  if (!group || !group.parentId) return [group];

  const parent = await getAncestors(group.parentId, realm);
  return [group, ...parent];
}

// Usage: Find who can escalate on a subgroup
const path = await getAncestors("subgroup-id", "cloud");
// Returns: [subgroup, parent, grandparent, ..., root]
```

### Get All Descendants

```typescript
async function getDescendants(groupId: string, realm: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId, realmId: realm },
    include: { children: true }
  });

  if (!group || group.children.length === 0) return [group];

  let descendants = [group];
  for (const child of group.children) {
    const childDescendants = await getDescendants(child.id, realm);
    descendants = descendants.concat(childDescendants);
  }

  return descendants;
}

// Usage: Find all groups a manager oversees
const managed = await getDescendants("engineering-group-id", "cloud");
```

### Get Direct Children Only

```typescript
async function getChildren(groupId: string, realm: string) {
  return prisma.group.findMany({
    where: { parentId: groupId, realmId: realm }
  });
}
```

---

## Cascading on Group Creation

### What Happens When Manager Creates Subgroup

**Trigger:** Manager creates "ML Team" subgroup under "Engineering"

**Steps:**
1. Create group with parent.id = "engineering-id"
2. Assign creator GOD on new group
3. **CASCADE**: Find all managers of parent group
4. **CASCADE**: Add escalation statements to each parent manager's policy

**Code:**
```typescript
async function createGroup(
  name: string,
  parentId: string,
  creatorId: string,
  realm: string
) {
  // 1. Validate parent
  const parent = await validateParent(parentId, realm);

  // 2. Create group
  const group = await prisma.group.create({
    data: { name, parentId, realmId: realm }
  });

  // 3. Assign creator GOD
  const godPolicy = await getOrCreateGodPolicy(creatorId, group.id, realm);
  await prisma.policyAssignment.create({
    data: { userId: creatorId, policyId: godPolicy.id }
  });

  // 4. CASCADE: Add escalation to parent managers
  const parentManagers = await getGroupManagers(parentId, realm);
  for (const manager of parentManagers) {
    await addEscalationStatement(manager, group.id, realm);
  }

  return group;
}

// Get all users with GOD on a group
async function getGroupManagers(groupId: string, realm: string) {
  const statements = await prisma.statement.findMany({
    where: {
      groupIdRestrict: groupId,
      moveGroupOwner: true  // Can manage the group
    },
    include: {
      policy: {
        include: {
          assignments: true
        }
      }
    }
  });

  const managers = new Set();
  for (const stmt of statements) {
    for (const assignment of stmt.policy.assignments) {
      managers.add(assignment.userId);
    }
  }
  return Array.from(managers);
}

// Add escalation statement
async function addEscalationStatement(
  userId: string,
  groupId: string,
  realm: string
) {
  // Find user's GOD_PARENT policy
  const parentGodPolicy = await findGodPolicyForUser(userId, realm);
  if (!parentGodPolicy) return;  // User has no policy, skip

  // Add statement for new group
  await prisma.statement.create({
    data: {
      policyId: parentGodPolicy.id,
      groupIdRestrict: groupId,
      resource: "GROUP_ESCALATION",
      viewMembers: true,
      moveGroupOwner: true,
      viewGroup: true,
      // Other permissions false (restricted escalation)
    }
  });
}
```

---

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

### ❌ WRONG: Missing realmId in queries

```typescript
// WRONG: Returns groups from all realms
const groups = await prisma.group.findMany({
  where: { parentId: groupId }
});

// RIGHT: Filter by realmId
const groups = await prisma.group.findMany({
  where: { parentId: groupId, realmId: realm }
});
```

### ❌ WRONG: Cascading without checking realm

```typescript
// WRONG: Parent in different realm
const parent = await prisma.group.findUnique({ where: { id: parentId } });
if (parent.realmId !== realm) {
  // Still cascades—data leak!
}

// RIGHT: Validate realm before cascading
if (parent.realmId !== realm) {
  throw new Error("Cross-realm hierarchy not allowed");
}
```

### ❌ WRONG: Not cascading at all

```typescript
// WRONG: Creates subgroup but parent managers don't get escalation
const group = await prisma.group.create({ data: { ... } });

// RIGHT: Always cascade if parent exists
if (parentId) {
  const parentManagers = await getGroupManagers(parentId, realm);
  for (const manager of parentManagers) {
    await addEscalationStatement(manager, group.id, realm);
  }
}
```

---

## Rules to Enforce

### Rule 1: Parent Must Exist and Not Be Archived

Every group creation with parent must validate.

**Check:**
```typescript
if (parentId) {
  const parent = await prisma.group.findUnique({ where: { id: parentId } });
  if (!parent || parent.isArchived) {
    throw new Error("Invalid parent");
  }
}
```

### Rule 2: Realm Must Match

**Check:**
```typescript
if (parentId && parent.realmId !== realm) {
  throw new Error("Parent realm mismatch");
}
```

### Rule 3: Cascading Must Happen

**Check:**
```typescript
// After group creation with parent:
if (parentId) {
  const escalations = await prisma.statement.findMany({
    where: {
      groupIdRestrict: newGroup.id,
      resource: "GROUP_ESCALATION"
    }
  });
  expect(escalations.length).toBeGreaterThan(0);
}
```

---

## Test Cases

```typescript
describe("Group Hierarchy", () => {
  it("should prevent creation under archived parent", async () => {
    const parent = await createGroup("Parent");
    await archiveGroup(parent.id);

    await expect(
      createGroup("Child", parent.id)
    ).rejects.toThrow("archived");
  });

  it("should cascade escalation to parent managers", async () => {
    // Alice is GOD of Engineering
    const engineering = await getGroup("engineering-id");

    // Bob (child manager) creates ML Team
    const mlTeam = await createGroup("ML Team", engineering.id, bob.id);

    // Check Alice has escalation
    const aliceStmts = await getPermissions(alice.id);
    const hasEscalation = aliceStmts.some(
      s => s.groupIdRestrict === mlTeam.id && s.moveGroupOwner
    );

    expect(hasEscalation).toBe(true);
  });

  it("should enforce unique names per realm", async () => {
    await createGroup("Engineering", null, "cloud");

    await expect(
      createGroup("Engineering", null, "cloud")
    ).rejects.toThrow("unique");

    // But different realm is OK
    await createGroup("Engineering", null, "enterprise-a");
  });
});
```

---

## See Also

- Database: `database/01-policy-system.md` - Cascading adds statements
- Architecture: `architecture/00-federation-model.md` - Groups per realm
- Rules: `rules/04-parent-validation.md` - Must enforce these constraints
- Reference: `reference/02-policy-examples.md` - Example group hierarchies
