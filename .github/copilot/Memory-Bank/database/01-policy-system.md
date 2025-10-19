---
file: database/01-policy-system.md
purpose: "Policy, Statement, PolicyAssignment models; hierarchy with delegation, cascading escalation, permission grants"
triggers: ["implementing auth system", "designing policies", "debugging permission", "cascading on subgroup creation"]
keywords: ["policy", "statement", "assignment", "hierarchy", "delegation", "cascading", "permission", "resource"]
dependencies: ["database/00-realm-model.md", "architecture/01-auth-system.md"]
urgency: "critical"
size: "2000 words"
status: "active"
created: "2025-10-20"




---

# Policy System: Hierarchy, Delegation, and Resource Scoping

## Core Concept

The policy system implements **hierarchical RBAC with delegation**. Think of it like Discord roles but with:
- **Hierarchy**: Policies can have parent policies (delegation chain)
- **Resource scoping**: Permissions can be restricted to specific users or groups
- **Cascading escalation**: When a subgroup is created, parent managers auto-get escalation permissions

## Schema Models

### Policy Model

```prisma
model Policy {
  id       Int     @id @default(autoincrement())
  name     String  // e.g., "Simonyi Elnök", "Engineering Manager"
  canIssue Boolean @default(false)  // Can create child policies (delegation)

  // Hierarchy
  parentId Int?
  parent   Policy?  @relation("PolicyHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children Policy[] @relation("PolicyHierarchy")

  // Relations
  statements       Statement[]
  assignments      PolicyAssignment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([parentId])
  @@index([name])
}
```

**Field meanings:**
- `name`: Human-readable policy name (unique globally)
- `canIssue`: If true, manager can create child policies as a subset
- `parentId`: Links to parent policy in hierarchy (null = top-level)
- `statements`: Permissions granted by this policy

**⚠️ Critical rules:**
- Child policy can ONLY delegate what parent has
- `canIssue` controls whether subpolicies can be created
- If policy deleted, cascade deletes all children + assignments

### Statement Model

```prisma
model Statement {
  id       String @id @default(cuid())
  policyId Int
  policy   Policy @relation(fields: [policyId], references: [id], onDelete: Cascade)

  // Resource scoping
  userIdRestrict  String?
  userRestriction User?   @relation(fields: [userIdRestrict], references: [id])

  groupIdRestrict  String?
  groupRestriction Group?  @relation(fields: [groupIdRestrict], references: [id])

  resource String  // Human-readable: "GROUP_MEMBERS", "USER_PROFILE", etc.

  // Fine-grained permissions
  viewMembers      Boolean
  editMembers      Boolean
  viewGroup        Boolean
  editGroupProfile Boolean
  moveGroupOwner   Boolean  // Can fire/replace group manager
  viewScores       Boolean
  editScores       Boolean
  evaluateScores   Boolean
  viewBasicProfile Boolean
  viewFullProfile  Boolean
  editProfile      Boolean
}
```

**Field meanings:**
- `policyId`: Which policy grants this permission
- `userIdRestrict`: If set, only grants access to this specific user (e.g., "can view user X's profile")
- `groupIdRestrict`: If set, only grants access to this specific group (e.g., "can edit group Y")
- `resource`: What thing this permission applies to (not a foreign key—just a string for flexibility)
- `viewMembers`, `editMembers`, etc.: Boolean flags for each action

**Example: Engineer can view group members**

```prisma
Statement {
  policyId: 5,  // "Engineering Manager" policy
  userIdRestrict: null,  // Applies to any user with this policy
  groupIdRestrict: "group-123",  // BUT only for this group
  resource: "ENGINEERING_GROUP",
  viewMembers: true,  // Can view members
  editMembers: false,  // Cannot edit members (parent doesn't have it)
  moveGroupOwner: true,  // Can fire the manager (escalation power)
  // ... other permissions false
}
```

### PolicyAssignment Model

```prisma
model PolicyAssignment {
  userId String
  user   User   @relation("HasPolicy", fields: [userId], references: [id], onDelete: Cascade)

  policyId Int
  policy   Policy @relation(fields: [policyId], references: [id], onDelete: Cascade)

  // Audit trail
  assignedAt     DateTime @default(now())
  assignedBy     String?  // User ID who assigned this
  assignedByUser User?    @relation("AssignedPolicy", fields: [assignedBy], references: [id])

  @@id([userId, policyId])
  @@index([userId])
  @@index([policyId])
}
```

**Field meanings:**
- `userId` + `policyId`: Composite key (user can have multiple policies)
- `assignedAt`: When policy was granted
- `assignedBy`: Audit trail—who granted this policy

**Audit trail example:**
```
Alice grants Bob "Engineering Manager" policy on 2025-10-20
→ PolicyAssignment { userId: bob, policyId: 5, assignedBy: alice, assignedAt: now }
```

---

## Hierarchy & Delegation Example

### Scenario: Department Head Creates Submanager

```
Policy Hierarchy:
├─ GOD (top-level, can create children)
│  └─ GOD_ENGINEERING (parent: GOD, can create children)
│     └─ MANAGER_ML_TEAM (parent: GOD_ENGINEERING, cannot create children)

Permissions:
- GOD:
  - viewMembers, editMembers, moveGroupOwner on ANY group
  - viewFullProfile, editProfile on ANY user

- GOD_ENGINEERING (child of GOD):
  - Inherits: viewMembers, editMembers on ENGINEERING group
  - Can only delegate what GOD has

- MANAGER_ML_TEAM (child of GOD_ENGINEERING):
  - Can only delegate what GOD_ENGINEERING has
  - Cannot be more powerful than parent
```

### Assignment Chain

```
Alice (user-1) ← GOD policy (top-level, can create subpolicies)
Bob (user-2) ← GOD_ENGINEERING policy (child, Alice created)
Carol (user-3) ← MANAGER_ML_TEAM policy (child, Bob created)

- Alice can fire Bob (has moveGroupOwner everywhere)
- Bob can fire Carol (has moveGroupOwner on ENGINEERING)
- Carol can fire ML_TEAM manager (has moveGroupOwner on ML_TEAM only)
```

---

## Cascading Escalation on Subgroup Creation

### The Pattern

When **Bob creates a subgroup under ENGINEERING group:**

1. Bob gets `GOD_ML_TEAM` policy (full control of new group)
2. **CASCADE**: Alice (GOD_ENGINEERING holder) gets escalation permissions added

```prisma
// Before: Alice's GOD_ENGINEERING policy
Statement {
  policyId: 2,  // GOD_ENGINEERING
  groupIdRestrict: "group-engineering",
  viewMembers: true,
  editMembers: true,
  moveGroupOwner: true,
}

// After cascading: New statement added
Statement {
  policyId: 2,  // SAME GOD_ENGINEERING policy
  groupIdRestrict: "group-ml-team",  // NEW: Cascaded group
  viewMembers: true,
  editMembers: false,  // Cannot modify members
  editScores: false,  // Cannot modify scores
  moveGroupOwner: true,  // CAN fire Bob
}
```

### Implementation Logic

```typescript
async function createGroup(
  name: string,
  parentId?: string,
  creatorId: string,
  realm: string
) {
  // 1. Create the group
  const newGroup = await prisma.group.create({
    data: { name, parentId, realmId: realm }
  });

  // 2. Give creator GOD on this group
  const godPolicy = await getOrCreateGodPolicy(creatorId, realm);
  await assignPolicyToGroup(creatorId, godPolicy.id, newGroup.id);

  // 3. CASCADE: If parent exists, add escalation to parent managers
  if (parentId) {
    const parentGroup = await prisma.group.findUnique({ where: { id: parentId } });
    const parentManagers = await getGroupManagers(parentId, realm);

    for (const manager of parentManagers) {
      // Add escalation statement to their GOD_PARENT policy
      await addEscalationStatement(
        manager,
        newGroup.id,  // New group ID
        parentGroup.id  // Reference to parent
      );
    }
  }

  return newGroup;
}
```

---

## Query Examples

### Get All Permissions for a User

```typescript
async function getPermissionsForUser(userId: string, realm: string) {
  const assignments = await prisma.policyAssignment.findMany({
    where: { userId },
    include: {
      policy: {
        include: {
          statements: true  // Get all statements
        }
      }
    }
  });

  // Flatten all statements from all policies
  const allStatements = assignments.flatMap(a => a.policy.statements);
  
  return allStatements;
}
```

### Check if User Can Perform Action

```typescript
async function canUserPerformAction(
  userId: string,
  action: string,  // "viewMembers", "editMembers", etc.
  resourceId: string,  // group ID or user ID
  resourceType: "GROUP" | "USER",
  realm: string
) {
  const statements = await getPermissionsForUser(userId, realm);

  // Find statement that allows this action on this resource
  return statements.some(stmt => {
    // Check permission flag
    if (!stmt[action]) return false;

    // Check resource scoping
    if (resourceType === "GROUP" && stmt.groupIdRestrict && stmt.groupIdRestrict !== resourceId) {
      return false;  // Wrong group
    }
    if (resourceType === "USER" && stmt.userIdRestrict && stmt.userIdRestrict !== resourceId) {
      return false;  // Wrong user
    }

    return true;
  });
}
```

---

## Common Mistakes

### ❌ WRONG: Not checking permission flag

```typescript
// WRONG: Only checks if statement exists
const canEdit = statements.some(stmt => stmt.groupIdRestrict === groupId);

// RIGHT: Check the specific permission
const canEdit = statements.some(stmt => 
  stmt.groupIdRestrict === groupId && stmt.editMembers === true
);
```

### ❌ WRONG: Allowing child policy more than parent

```typescript
// WRONG: Child can edit members, parent can't
const parent = { editMembers: false };
const child = { editMembers: true };  // VIOLATION

// RIGHT: Validate on creation
if (childStatement.editMembers && !parentStatement.editMembers) {
  throw new Error("Child cannot have more permissions than parent");
}
```

### ❌ WRONG: Cascading escalation not checking parent

```typescript
// WRONG: Cascade without verifying parent
await addEscalationStatement(manager, newGroup.id, parentId);

// RIGHT: Verify parent exists and isn't archived
const parent = await prisma.group.findUnique({ where: { id: parentId } });
if (!parent || parent.isArchived) {
  throw new Error("Cannot cascade to archived parent");
}
```

---

## Rules to Enforce

### Rule 1: Policy Hierarchy Must Be Valid

**Statement:** When creating child policy, validate all statements are subset of parent

**Check:**
```typescript
// For each statement in child policy:
const parentStatements = await getStatementsForPolicy(parentPolicyId);
for (const childStmt of childStatements) {
  const matchingParent = parentStatements.find(
    p => p.groupIdRestrict === childStmt.groupIdRestrict || !childStmt.groupIdRestrict
  );
  if (!matchingParent) {
    throw new Error("Child statement not permitted by parent");
  }
}
```

### Rule 2: Cascading Must Respect Realm

**Statement:** When cascading escalation, only cascade within same realm

**Check:**
```typescript
// Parent group and new group must have same realmId
if (parent.realmId !== newGroup.realmId) {
  throw new Error("Cross-realm cascading not allowed");
}
```

### Rule 3: Statements Must Have Resource

**Statement:** Every statement must identify what resource it applies to

**Check:**
```typescript
if (!stmt.resource || stmt.resource.length === 0) {
  throw new Error("Statement must specify resource");
}
```

---

## Test Cases

### Test: Escalation on Subgroup Creation

```typescript
describe("Policy Cascading", () => {
  it("should add escalation statement when manager creates subgroup", async () => {
    // Alice has GOD_ENGINEERING
    // Bob (submanager) has MANAGER_ENGINEERING

    const subgroup = await createGroup("ML Team", groupId, bobId, realm);

    // Check Alice gets escalation
    const aliceStatements = await getPermissionsForUser(aliceId, realm);
    const escalation = aliceStatements.find(
      s => s.groupIdRestrict === subgroup.id && s.moveGroupOwner
    );

    expect(escalation).toBeDefined();
  });

  it("should NOT allow child policy more than parent", async () => {
    const parent = await createPolicy("Parent", true);
    const child = await createPolicy("Child", false, parent.id);

    // Try to grant editMembers to child when parent doesn't have it
    await expect(
      addStatement(child.id, { editMembers: true })
    ).rejects.toThrow("Child cannot exceed parent");
  });
});
```

---

## See Also

- Architecture: `architecture/01-auth-system.md` - How policies are cached in snapshots
- Rules: `rules/01-auth-enforcement.md` - How to validate permissions
- Reference: `reference/02-policy-examples.md` - Real-world policy hierarchies
