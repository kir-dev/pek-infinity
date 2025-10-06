# Permission System Architecture

**A Comprehensive Guide to PEK Infinity's AWS IAM-Inspired Permission System**

---

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [System Architecture](#system-architecture)
4. [Resource Identification](#resource-identification)
5. [Policy Structure](#policy-structure)
6. [Authorization Flow](#authorization-flow)
7. [Permission Patterns & Examples](#permission-patterns--examples)
8. [Special Cases & Edge Cases](#special-cases--edge-cases)
9. [Implementation Guide](#implementation-guide)
10. [Best Practices](#best-practices)

---

## Overview

### What is This System?

PEK Infinity implements an **AWS IAM-inspired permission system** that provides fine-grained, declarative access control. Unlike traditional role-based access control (RBAC), this system uses **policies** and **statements** to define what users can do with resources.

### Design Philosophy

1. **Declarative**: Permissions are explicitly stated, not inferred from relationships in the domain database
2. **Source of Truth**: The permission system is authoritative - if it says you can access something, you can
3. **Disconnected from Domain Logic**: Permission checking doesn't query domain relationships (like `membership.userId`)
4. **Data-Driven**: Organization admins configure permissions, not developers hardcoding rules
5. **Flexible Elevation**: Users can enable/disable elevated permissions (like GitHub's sudo mode)

### Key Terminology

- **Resource**: An entity that can be acted upon (User, Group, Membership, etc.)
- **Action**: An operation that can be performed on a resource (Read, Create, Update, Delete, etc.)
- **Statement**: A tuple of `(Resource Pattern, Action[])` that grants specific permissions
- **Policy**: A named collection of statements with metadata (e.g., `Resort[1]Admin`)
- **Elevated Policy**: A policy that requires manual activation by the user (like sudo mode)
- **Base Policy**: A policy that's always active for the user

---

## Core Concepts

### 1. Resources

Resources are the entities in your system that need access control. Each resource has:
- A **type** (e.g., User, Group, Membership)
- One or more **keys** that identify specific instances
- A set of **actions** that can be performed on it

**Resource Types in PEK Infinity:**

| Resource Type | Keys | Examples |
|--------------|------|----------|
| User | Single: `id` | `User[123]` |
| Group | Single: `id` | `Group[1]` |
| Profile | Single: `userId` | `Profile[123]` |
| Notification | Single: `id` | `Notification[456]` |
| Membership | Composite: `userId`, `groupId` | `Membership[userId:123,groupId:1]` |
| Evaluation | Composite: `userId`, `groupId` | `Evaluation[userId:123,groupId:1]` |
| GroupActionApproval | Single: `id` | `GroupActionApproval[789]` |
| Policy | Single: `name` | `Policy[Resort1Admin]` |

### 2. Actions

Actions represent operations that can be performed on resources. Each resource type has its own set of valid actions.

**Common Action Patterns:**

| Resource | Actions |
|----------|---------|
| User | `Read`, `Create`, `Update`, `Delete`, `Ban`, `Unban` |
| Group | `Read`, `Create`, `Update`, `Delete`, `Archive`, `Restore` |
| Profile | `Read`, `ReadAvatar`, `ReadScores`, `ReadExternalLinks`, `Update`, `UpdateAvatar` |
| Membership | `Read`, `Create`, `Delete`, `UpdateRole` |
| Evaluation | `Create`, `Submit`, `Review`, `Update`, `Import` |
| GroupActionApproval | `Read`, `Approve`, `Reject`, `Delete` |
| Policy | `Read`, `Create`, `Update`, `Delete`, `Assign`, `Unassign`, `Clone` |

**Special Action: Wildcard (`*`)**
- Grants ALL actions on a resource
- Reserved for high-privilege roles (Resort Admins, Site Admins)

### 3. Statements

A **statement** is the atomic unit of permission. It grants specific actions on a resource pattern.

**Structure:**
```typescript
Statement(resourcePattern: string, actions: string[])
```

**Examples:**
```typescript
Statement("User[123]", ["Read", "Update"])
Statement("Group[1]", ["*"])
Statement("Membership[userId:*,groupId:1]", ["Read"])
Statement("Policy[Resort:1:*]", ["Create", "Assign"])
```

### 4. Policies

A **policy** is a named collection of statements with metadata. Policies are the primary way permissions are organized and assigned to users.

**Policy Properties:**
- `name`: Unique identifier (e.g., `"Resort[1]Admin"`)
- `isElevated`: Whether it requires manual activation
- `createdFrom`: Parent policy name (for delegation tracking)
- `statements[]`: Array of Statement objects

**Policy Types:**

1. **Base Policies**: Always active (e.g., `Group[1]Member`)
2. **Elevated Policies**: Require manual activation (e.g., `Resort[1]Admin`)
3. **Delegated Policies**: Created by cloning/subsetting another policy

---

## System Architecture

### High-Level Flow

```
User Request → JWT (contains policy names) → Authorization Guard
                                                      ↓
                               Expand Policies to Statements (with caching)
                                                      ↓
                               Parse Resource from URL/Body
                                                      ↓
                               Match Statements Against Required Permission
                                                      ↓
                               Allow/Deny Request
```

### Data Model

```prisma
model Policy {
  id           Int      @id @default(autoincrement())
  name         String   @unique
  isElevated   Boolean  @default(false)
  createdFrom  String?
  
  statements   Statement[]
  userPolicies UserPolicy[]
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Statement {
  id         Int    @id @default(autoincrement())
  policyId   Int
  policy     Policy @relation(fields: [policyId], references: [id], onDelete: Cascade)
  
  resource   String   // e.g., "Group[userId:*,groupId:1]"
  actions    String[] // e.g., ["Read", "Create"]
  
  @@unique([policyId, resource])
}

model UserPolicy {
  userId    Int
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  policyId  Int
  policy    Policy @relation(fields: [policyId], references: [id], onDelete: Cascade)
  
  isActive  Boolean @default(true)  // For elevated policies
  
  assignedAt DateTime @default(now())
  assignedBy Int?
  
  @@id([userId, policyId])
}
```

### JWT Structure

The JWT contains:
- User identification (`userId`, `username`, etc.)
- **Active policy names** (not full statements - keeps JWT small)
- Optionally: elevated policies that are currently enabled

**Example JWT Payload:**
```json
{
  "userId": 123,
  "username": "alice",
  "policies": [
    "BaseUser",
    "Group[5]Member",
    "Group[10]Member"
  ],
  "elevatedPolicies": [
    "Resort[1]Admin"  // User has enabled this
  ]
}
```

**Why Policy Names Instead of Full Statements?**
- **JWT Size**: 50+ statements would exceed JWT size limits
- **Dynamic Updates**: Policy definitions can change without re-issuing JWTs
- **Caching**: Server-side expansion can be cached efficiently

---

## Resource Identification

### The Unified Tuple Format

All resources in PEK Infinity use a **unified tuple format** for permission checking:

```
Resource[userId:X,groupId:Y]
```

Where:
- `X` can be a specific ID or `*` (wildcard)
- `Y` can be a specific ID or `*` (wildcard)

### Why This Format?

1. **Uniformity**: All resources follow the same pattern
2. **Expressiveness**: Can grant permissions based on user, group, or both
3. **Explicit**: AND logic is clear (both dimensions must match)
4. **No Resolution Needed**: Work directly with IDs from the URL

### Resource Pattern Syntax

#### Simple Resources (Single Key)

For resources with only one meaningful key dimension, use wildcard for the other:

```typescript
// User resource (userId matters, groupId doesn't)
"User[userId:123,groupId:*]"     // Specific user
"User[userId:*,groupId:*]"       // All users

// Group resource (groupId matters, userId doesn't)
"Group[userId:*,groupId:1]"      // Specific group
"Group[userId:*,groupId:*]"      // All groups

// Profile resource (userId matters, groupId doesn't)
"Profile[userId:123,groupId:*]"  // Specific profile
```

#### Composite Resources (Two Keys)

For resources that inherently need both keys:

```typescript
// Membership (both userId and groupId matter)
"Membership[userId:123,groupId:1]"     // Specific membership
"Membership[userId:*,groupId:1]"       // All memberships in group 1
"Membership[userId:123,groupId:*]"     // All memberships of user 123
"Membership[userId:*,groupId:*]"       // All memberships (site-admin)

// Evaluation (both userId and groupId matter)
"Evaluation[userId:123,groupId:1]"     // Specific evaluation
"Evaluation[userId:*,groupId:1]"       // All evaluations in group 1
"Evaluation[userId:123,groupId:*]"     // All evaluations of user 123
```

### Wildcard Matching Rules

Wildcards (`*`) match ANY value in that dimension.

**Matching Logic:**
```typescript
// Statement grants: "Membership[userId:*,groupId:1]", actions: ["Read"]
// Request requires: "Membership[userId:123,groupId:1]", action: "Read"

// Match check:
// - userId: * matches 123 ✓
// - groupId: 1 matches 1 ✓
// - action: "Read" in ["Read"] ✓
// Result: AUTHORIZED
```

**Two-Dimensional AND Logic:**
```typescript
// User has BOTH statements:
// 1. "Membership[userId:*,groupId:1]", ["Read"]
// 2. "Membership[userId:123,groupId:*]", ["Read"]

// Request: "Membership[userId:123,groupId:1]", "Read"
// Statement 1 matches: (* matches 123) AND (1 matches 1) ✓
// Statement 2 matches: (123 matches 123) AND (* matches 1) ✓
// Result: AUTHORIZED (only need ONE matching statement)
```

### Special Patterns

#### Policy Management Pattern

```typescript
// Can manage policies for a resort
"Policy[userId:*,groupId:{resortId}:*]"

// Can manage specific category of policies
"Policy[userId:*,groupId:{resortId}:Membership]"
```

This special syntax allows delegation control - Resort admins can create and assign sub-policies.

---

## Policy Structure

### Standard Policy Templates

#### 1. Base User Policy

Every authenticated user automatically gets this policy.

```typescript
{
  name: "BaseUser",
  isElevated: false,
  statements: [
    // Can read and update their own user data
    Statement("User[userId:{selfId},groupId:*]", ["Read", "Update"]),
    
    // Can read and update their own profile
    Statement("Profile[userId:{selfId},groupId:*]", ["Read", "Update", "UpdateAvatar"]),
    
    // Can read their own notifications
    Statement("Notification[userId:{selfId},groupId:*]", ["Read", "MarkAsRead"]),
    
    // Can read their own memberships
    Statement("Membership[userId:{selfId},groupId:*]", ["Read"])
  ]
}
```

**Note:** `{selfId}` is a special placeholder that gets replaced with the user's actual ID at runtime.

#### 2. Group Member Policy

Assigned when a user joins a group.

```typescript
{
  name: "Group[1]Member",
  isElevated: false,
  statements: [
    // Can read the group
    Statement("Group[userId:*,groupId:1]", ["Read"]),
    
    // Can read memberships in the group (if group settings allow)
    Statement("Membership[userId:*,groupId:1]", ["Read"]),
    
    // Can read profiles of group members
    Statement("Profile[userId:*,groupId:1]", ["Read"])
  ]
}
```

**Dynamic Behavior:** The statements in this policy depend on group settings:
- If `group.membershipsPublic = true`: Include `Membership` read permission
- If `group.membershipsPublic = false`: Omit it

#### 3. Resort Admin Policy (Auto-Created)

When a user creates a resort (top-level group), they automatically receive this policy.

```typescript
{
  name: "Resort[1]Admin",
  isElevated: true,  // Requires manual activation
  createdFrom: null,  // Root policy
  statements: [
    // Full control over the resort
    Statement("Group[userId:*,groupId:1]", ["*"]),
    
    // Full control over all subgroups (explicit statements for each)
    Statement("Group[userId:*,groupId:2]", ["*"]),  // Child group
    Statement("Group[userId:*,groupId:3]", ["*"]),  // Another child
    Statement("Group[userId:*,groupId:4]", ["*"]),  // Grandchild
    
    // Full control over memberships
    Statement("Membership[userId:*,groupId:1]", ["*"]),
    Statement("Membership[userId:*,groupId:2]", ["*"]),
    Statement("Membership[userId:*,groupId:3]", ["*"]),
    Statement("Membership[userId:*,groupId:4]", ["*"]),
    
    // Full control over group action approvals
    Statement("GroupActionApproval[userId:*,groupId:1]", ["*"]),
    Statement("GroupActionApproval[userId:*,groupId:2]", ["*"]),
    Statement("GroupActionApproval[userId:*,groupId:3]", ["*"]),
    Statement("GroupActionApproval[userId:*,groupId:4]", ["*"]),
    
    // Full control over evaluations
    Statement("Evaluation[userId:*,groupId:1]", ["*"]),
    Statement("Evaluation[userId:*,groupId:2]", ["*"]),
    Statement("Evaluation[userId:*,groupId:3]", ["*"]),
    Statement("Evaluation[userId:*,groupId:4]", ["*"]),
    
    // Can manage policies for this resort (delegation capability)
    Statement("Policy[userId:*,groupId:Resort:1:*]", ["Read", "Create", "Update", "Delete", "Assign", "Unassign", "Clone"])
  ]
}
```

**Important:** When a new subgroup is created under the resort, the Resort Admin policy is automatically updated to include statements for the new group.

#### 4. Delegated Policy (Created by Resort Admin)

Resort admins can clone their policy and remove statements to delegate subset of permissions.

```typescript
{
  name: "Resort[1]MembershipManager",
  isElevated: false,
  createdFrom: "Resort[1]Admin",  // Tracks delegation chain
  statements: [
    // Can manage memberships in the resort and subgroups
    Statement("Membership[userId:*,groupId:1]", ["Read", "Create", "Delete"]),
    Statement("Membership[userId:*,groupId:2]", ["Read", "Create", "Delete"]),
    Statement("Membership[userId:*,groupId:3]", ["Read", "Create", "Delete"]),
    
    // Can view groups (but not modify)
    Statement("Group[userId:*,groupId:1]", ["Read"]),
    Statement("Group[userId:*,groupId:2]", ["Read"]),
    Statement("Group[userId:*,groupId:3]", ["Read"]),
    
    // Optionally: Can delegate membership permissions further
    Statement("Policy[userId:*,groupId:Resort:1:Membership]", ["Create", "Assign"])
  ]
}
```

**Delegation Chain:** If this policy includes `Policy` management permissions, the assigned user can create further delegated policies (like Discord's role system).

#### 5. Site Admin Policy

Reserved for IT support members who need god-mode access.

```typescript
{
  name: "SiteAdmin",
  isElevated: true,
  statements: [
    // God mode - can do anything
    Statement("*[userId:*,groupId:*]", ["*"])
  ]
}
```

**Note:** Site Admin can perform actions that even Resort Admins cannot, accessed via `admin.example.com`.

---

## Authorization Flow

### Step-by-Step Process

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User sends request with JWT                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Authentication Middleware verifies JWT                    │
│    - Extracts userId, policies[], elevatedPolicies[]        │
│    - Attaches to request.user                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Request reaches controller endpoint                       │
│    - Decorated with @RequirePermission(resource, action)    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Authorization Guard activates                             │
│    a. Parse resource pattern from decorator + request params │
│    b. Fetch user's statements (expand policies, with cache) │
│    c. Match statements against required permission          │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴────────┐
                    │                │
              ✓ Authorized      ✗ Denied
                    │                │
                    ↓                ↓
        Execute controller    Return 403 Forbidden
```

### Detailed Authorization Logic

```typescript
async function authorize(
  userId: number,
  requiredResource: string,
  requiredAction: string
): Promise<boolean> {
  // 1. Get user's active policies from JWT/session
  const activePolicies = await getActivePolicies(userId);
  
  // 2. Expand policies to statements (with caching)
  const statements = await expandPolicies(activePolicies);
  
  // 3. Parse required resource pattern
  const required = parseResourcePattern(requiredResource);
  // e.g., "Membership[userId:123,groupId:1]" → { userId: 123, groupId: 1 }
  
  // 4. Check each statement for a match
  for (const statement of statements) {
    const granted = parseResourcePattern(statement.resource);
    
    // Check if resource matches
    if (matchesResource(granted, required)) {
      // Check if action is granted
      if (statement.actions.includes("*") || statement.actions.includes(requiredAction)) {
        return true;  // AUTHORIZED
      }
    }
  }
  
  return false;  // DENIED
}

function matchesResource(
  granted: { userId: string, groupId: string },
  required: { userId: number, groupId: number }
): boolean {
  // Wildcard or exact match on userId dimension
  const userIdMatches = granted.userId === "*" || parseInt(granted.userId) === required.userId;
  
  // Wildcard or exact match on groupId dimension
  const groupIdMatches = granted.groupId === "*" || parseInt(granted.groupId) === required.groupId;
  
  // Both dimensions must match (AND logic)
  return userIdMatches && groupIdMatches;
}
```

### Caching Strategy

**Policy Expansion Caching:**
```typescript
// Cache key: policyName
// Cache value: Statement[]
// TTL: 5 minutes (or invalidate on policy update)

const cache = new Map<string, Statement[]>();

async function expandPolicy(policyName: string): Promise<Statement[]> {
  if (cache.has(policyName)) {
    return cache.get(policyName);
  }
  
  const policy = await db.policy.findUnique({
    where: { name: policyName },
    include: { statements: true }
  });
  
  cache.set(policyName, policy.statements);
  return policy.statements;
}
```

**User Permissions Caching:**
```typescript
// Cache key: userId
// Cache value: Statement[] (all statements from all active policies)
// TTL: 1 minute (or invalidate on policy assignment change)

const userPermissionsCache = new Map<number, Statement[]>();

async function getUserStatements(userId: number): Promise<Statement[]> {
  if (userPermissionsCache.has(userId)) {
    return userPermissionsCache.get(userId);
  }
  
  const policies = await getActivePolicies(userId);
  const allStatements = [];
  
  for (const policyName of policies) {
    const statements = await expandPolicy(policyName);
    allStatements.push(...statements);
  }
  
  userPermissionsCache.set(userId, allStatements);
  return allStatements;
}
```

---

## Permission Patterns & Examples

### Example 1: Basic Member Reading Group

**Scenario:** User 123 is a member of Group 5 and wants to read the group info.

**User's Policies:**
```typescript
["BaseUser", "Group[5]Member"]
```

**Expanded Statements:**
```typescript
[
  // From BaseUser
  Statement("User[userId:123,groupId:*]", ["Read", "Update"]),
  Statement("Profile[userId:123,groupId:*]", ["Read", "Update"]),
  
  // From Group[5]Member
  Statement("Group[userId:*,groupId:5]", ["Read"]),
  Statement("Membership[userId:*,groupId:5]", ["Read"])
]
```

**Request:** `GET /groups/5`

**Required Permission:** `Group[userId:*,groupId:5]`, action `Read`

**Authorization Check:**
```typescript
// Check statement: "Group[userId:*,groupId:5]", ["Read"]
// Required: "Group[userId:*,groupId:5]", "Read"
// userId: * matches * ✓
// groupId: 5 matches 5 ✓
// action: "Read" in ["Read"] ✓
// Result: AUTHORIZED ✓
```

---

### Example 2: Member Reading Another Member's Profile

**Scenario:** User 123 (member of Group 5) wants to read User 456's profile (also member of Group 5).

**User 123's Statements:**
```typescript
[
  Statement("Profile[userId:123,groupId:*]", ["Read", "Update"]),  // Own profile
  Statement("Profile[userId:*,groupId:5]", ["Read"])  // Group members' profiles
]
```

**Request:** `GET /profiles/456`

**Required Permission:** `Profile[userId:456,groupId:*]`, action `Read`

**Authorization Check:**

First statement:
```typescript
// "Profile[userId:123,groupId:*]", ["Read"]
// Required: "Profile[userId:456,groupId:*]", "Read"
// userId: 123 matches 456? ✗
// Result: NO MATCH
```

Second statement:
```typescript
// "Profile[userId:*,groupId:5]", ["Read"]
// Required: "Profile[userId:456,groupId:*]", "Read"
// userId: * matches 456 ✓
// groupId: 5 matches *? ✗
// Result: NO MATCH
```

**Result: DENIED ❌**

**Why?** The required permission is `Profile[userId:456,groupId:*]` (any group), but the user only has `Profile[userId:*,groupId:5]` (specific group). The group dimensions don't match due to the wildcard mismatch.

**Fix:** The controller should require `Profile[userId:456,groupId:5]` specifically when accessed via group context.

---

### Example 3: Resort Admin Managing Membership

**Scenario:** User 100 (Resort 1 Admin) wants to delete membership of User 456 in Group 2 (a subgroup of Resort 1).

**User 100's Statements (subset):**
```typescript
[
  Statement("Membership[userId:*,groupId:1]", ["*"]),  // Resort
  Statement("Membership[userId:*,groupId:2]", ["*"]),  // Subgroup
  Statement("Membership[userId:*,groupId:3]", ["*"])   // Another subgroup
]
```

**Request:** `DELETE /groups/2/memberships/456`

**Required Permission:** `Membership[userId:456,groupId:2]`, action `Delete`

**Authorization Check:**
```typescript
// "Membership[userId:*,groupId:2]", ["*"]
// Required: "Membership[userId:456,groupId:2]", "Delete"
// userId: * matches 456 ✓
// groupId: 2 matches 2 ✓
// action: "*" includes "Delete" ✓
// Result: AUTHORIZED ✓
```

---

### Example 4: Creating a New Membership

**Scenario:** User 100 (Resort 1 Admin) wants to create a membership for User 789 in Group 2.

**Challenge:** The membership doesn't exist yet, so we can't reference it by ID. We need to check permissions based on the composite key.

**User 100's Statements:**
```typescript
[
  Statement("Membership[userId:*,groupId:2]", ["*"])
]
```

**Request:** `POST /groups/2/memberships { userId: 789 }`

**Required Permission:** `Membership[userId:789,groupId:2]`, action `Create`

**Authorization Check:**
```typescript
// "Membership[userId:*,groupId:2]", ["*"]
// Required: "Membership[userId:789,groupId:2]", "Create"
// userId: * matches 789 ✓
// groupId: 2 matches 2 ✓
// action: "*" includes "Create" ✓
// Result: AUTHORIZED ✓
```

**Success!** The tuple format handles creation naturally without needing special logic.

---

### Example 5: Delegated Policy Management

**Scenario:** User 100 (Resort Admin) wants to create a sub-policy and assign it to User 200.

**User 100's Statements:**
```typescript
[
  Statement("Policy[userId:*,groupId:Resort:1:*]", ["Create", "Assign", "Clone"])
]
```

**Request:** `POST /policies { name: "Resort[1]EventManager", statements: [...] }`

**Required Permission:** `Policy[userId:*,groupId:Resort:1:*]`, action `Create`

**Authorization Check:**
```typescript
// "Policy[userId:*,groupId:Resort:1:*]", ["Create", "Assign", "Clone"]
// Required: "Policy[userId:*,groupId:Resort:1:*]", "Create"
// userId: * matches * ✓
// groupId: "Resort:1:*" matches "Resort:1:*" ✓ (string match with special syntax)
// action: "Create" in ["Create", "Assign", "Clone"] ✓
// Result: AUTHORIZED ✓
```

**Then:** `POST /users/200/policies { policyName: "Resort[1]EventManager" }`

**Required Permission:** `Policy[userId:*,groupId:Resort:1:*]`, action `Assign`

**Result:** AUTHORIZED ✓

---

### Example 6: Site Admin Override

**Scenario:** Site Admin needs to delete a resort due to policy violation.

**Site Admin's Statements:**
```typescript
[
  Statement("*[userId:*,groupId:*]", ["*"])
]
```

**Request:** `DELETE /groups/1` (Resort 1)

**Required Permission:** `Group[userId:*,groupId:1]`, action `Delete`

**Authorization Check:**
```typescript
// "*[userId:*,groupId:*]", ["*"]
// Required: "Group[userId:*,groupId:1]", "Delete"
// Resource type: "*" matches "Group" ✓ (wildcard resource type)
// userId: * matches * ✓
// groupId: * matches 1 ✓
// action: "*" includes "Delete" ✓
// Result: AUTHORIZED ✓
```

---

## Special Cases & Edge Cases

### Case 1: Hierarchical Groups (Resort → Group → TaskForce)

**Question:** How do we handle permissions that "flow down" the hierarchy?

**Answer:** We don't. Permissions are **explicit, not inherited**.

When a user creates Resort 1 with subgroups 2, 3, 4:
- The `Resort[1]Admin` policy gets explicit statements for groups 1, 2, 3, 4
- When subgroup 5 is created, the policy is **updated** to add statements for group 5
- No recursive/hierarchical matching - every group needs its own statement

**Implementation:**
```typescript
async function createSubgroup(parentGroupId: number, name: string, createdBy: number) {
  // 1. Create the subgroup in domain DB
  const subgroup = await db.group.create({
    data: { name, parentId: parentGroupId }
  });
  
  // 2. Find the Resort Admin policy for this hierarchy
  const resort = await findRootGroup(parentGroupId);
  const resortAdminPolicy = await db.policy.findUnique({
    where: { name: `Resort[${resort.id}]Admin` }
  });
  
  // 3. Add statements for the new subgroup to the policy
  await db.statement.createMany({
    data: [
      { policyId: resortAdminPolicy.id, resource: `Group[userId:*,groupId:${subgroup.id}]`, actions: ["*"] },
      { policyId: resortAdminPolicy.id, resource: `Membership[userId:*,groupId:${subgroup.id}]`, actions: ["*"] },
      { policyId: resortAdminPolicy.id, resource: `Evaluation[userId:*,groupId:${subgroup.id}]`, actions: ["*"] },
      { policyId: resortAdminPolicy.id, resource: `GroupActionApproval[userId:*,groupId:${subgroup.id}]`, actions: ["*"] }
    ]
  });
  
  // 4. Invalidate cache
  cache.delete(resortAdminPolicy.name);
  
  return subgroup;
}
```

---

### Case 2: Group Settings Affecting Permissions

**Question:** Group 1 has `membershipsPublic = true`, but Group 2 has `membershipsPublic = false`. How do we handle this?

**Answer:** The policy assignment is **dynamic based on group settings**.

When creating the `Group[X]Member` policy template:
```typescript
async function createGroupMemberPolicy(groupId: number): Promise<Policy> {
  const group = await db.group.findUnique({ where: { id: groupId } });
  
  const statements = [
    { resource: `Group[userId:*,groupId:${groupId}]`, actions: ["Read"] }
  ];
  
  // Conditionally add membership read permission
  if (group.membershipsPublic) {
    statements.push({
      resource: `Membership[userId:*,groupId:${groupId}]`,
      actions: ["Read"]
    });
  }
  
  return await db.policy.create({
    data: {
      name: `Group[${groupId}]Member`,
      isElevated: false,
      statements: { create: statements }
    }
  });
}
```

**When group settings change:**
```typescript
async function updateGroupSettings(groupId: number, settings: { membershipsPublic: boolean }) {
  // 1. Update domain DB
  await db.group.update({
    where: { id: groupId },
    data: settings
  });
  
  // 2. Update the Group[X]Member policy
  const policy = await db.policy.findUnique({
    where: { name: `Group[${groupId}]Member` },
    include: { statements: true }
  });
  
  if (settings.membershipsPublic) {
    // Add membership read permission if not present
    const hasMembershipRead = policy.statements.some(
      s => s.resource === `Membership[userId:*,groupId:${groupId}]`
    );
    if (!hasMembershipRead) {
      await db.statement.create({
        data: {
          policyId: policy.id,
          resource: `Membership[userId:*,groupId:${groupId}]`,
          actions: ["Read"]
        }
      });
    }
  } else {
    // Remove membership read permission
    await db.statement.deleteMany({
      where: {
        policyId: policy.id,
        resource: `Membership[userId:*,groupId:${groupId}]`
      }
    });
  }
  
  // 3. Invalidate cache
  cache.delete(policy.name);
}
```

---

### Case 3: Semester-Based Evaluation Freezing

**Question:** Past semester evaluations are read-only. How do we enforce this?

**Answer:** This is **business logic, not permission logic**.

The permission system says:
```typescript
Statement("Evaluation[userId:*,groupId:1]", ["Read", "Update"])
```

The controller enforces the freeze:
```typescript
@RequirePermission("Evaluation[userId:{{userId}},groupId:{{groupId}}]", ["Update"])
async updateEvaluation(userId: number, groupId: number, data: UpdateEvaluationDto) {
  // Permission check already passed (user CAN update evaluations in this group)
  
  const evaluation = await db.evaluation.findUnique({
    where: { userId_groupId: { userId, groupId } }
  });
  
  const currentSemester = await db.systemConfiguration.findUnique({
    where: { key: "currentSemester" }
  });
  
  // Business logic: Check if evaluation is from current semester
  if (evaluation.semesterId !== parseInt(currentSemester.value)) {
    throw new ForbiddenException("Cannot modify evaluations from past semesters");
  }
  
  // Proceed with update
  return await this.evaluationService.update(evaluation, data);
}
```

**Separation of Concerns:**
- **Permission System**: "User has permission to update evaluations in this group"
- **Business Logic**: "But not this specific evaluation because semester is frozen"

---

### Case 4: Self-Reference in Policies

**Question:** How do we handle `{selfId}` placeholder in `BaseUser` policy?

**Answer:** Replace placeholders at **authorization time**, not at policy creation.

```typescript
async function getUserStatements(userId: number): Promise<Statement[]> {
  const policies = await getActivePolicies(userId);
  const allStatements = [];
  
  for (const policyName of policies) {
    const statements = await expandPolicy(policyName);
    
    // Replace placeholders
    const resolvedStatements = statements.map(statement => ({
      ...statement,
      resource: statement.resource
        .replace(/{selfId}/g, userId.toString())
        .replace(/{self}/g, userId.toString())
    }));
    
    allStatements.push(...resolvedStatements);
  }
  
  return allStatements;
}
```

**Example:**
```typescript
// Policy definition in DB:
Statement("User[userId:{selfId},groupId:*]", ["Read", "Update"])

// For user 123, expanded to:
Statement("User[userId:123,groupId:*]", ["Read", "Update"])

// For user 456, expanded to:
Statement("User[userId:456,groupId:*]", ["Read", "Update"])
```

---

### Case 5: Elevated Policy Activation (GitHub Sudo Mode)

**Question:** How does policy elevation work?

**Answer:** Two-step process: activate in frontend, re-issue JWT.

**Flow:**

1. User clicks "Enable Admin Mode" in navbar
2. Frontend makes request: `POST /auth/elevate { policyName: "Resort[1]Admin" }`
3. Backend validates:
   ```typescript
   async function elevatePolicy(userId: number, policyName: string): Promise<string> {
     // Check if user has this policy assigned
     const userPolicy = await db.userPolicy.findUnique({
       where: { userId_policyId: { userId, policyId: ... } },
       include: { policy: true }
     });
     
     if (!userPolicy) {
       throw new ForbiddenException("You don't have this policy");
     }
     
     if (!userPolicy.policy.isElevated) {
       throw new BadRequestException("This policy is not elevated");
     }
     
     // Mark as active
     await db.userPolicy.update({
       where: { userId_policyId: { userId, policyId: userPolicy.policyId } },
       data: { isActive: true }
     });
     
     // Re-issue JWT with elevated policy included
     const newJwt = this.jwtService.sign({
       userId,
       policies: [...basePolicies],
       elevatedPolicies: [policyName]  // Added to JWT
     });
     
     return newJwt;
   }
   ```
4. Frontend stores new JWT, uses it for subsequent requests
5. User can deactivate: `POST /auth/deactivate { policyName: "Resort[1]Admin" }`

**Auto-deactivation:**
- Option A: Time-bound (JWT expires in 1 hour)
- Option B: Manual (user clicks "Disable Admin Mode")
- Option C: Hybrid (both)

---

### Case 6: Policy Delegation Chain

**Question:** How do we track who created what policy?

**Answer:** Use the `createdFrom` field to track delegation chain.

```typescript
// Original policy
{
  name: "Resort[1]Admin",
  createdFrom: null  // Root policy
}

// First delegation
{
  name: "Resort[1]MembershipManager",
  createdFrom: "Resort[1]Admin"
}

// Second delegation (if Resort[1]MembershipManager has delegation rights)
{
  name: "Resort[1]Group[5]MembershipManager",
  createdFrom: "Resort[1]MembershipManager"
}
```

**Validation:**
```typescript
async function createDelegatedPolicy(
  creatorUserId: number,
  newPolicyName: string,
  parentPolicyName: string,
  statements: Statement[]
): Promise<Policy> {
  // 1. Verify creator has the parent policy
  const creatorPolicies = await getActivePolicies(creatorUserId);
  if (!creatorPolicies.includes(parentPolicyName)) {
    throw new ForbiddenException("You don't have the parent policy");
  }
  
  // 2. Verify parent policy has delegation rights
  const parentPolicy = await db.policy.findUnique({
    where: { name: parentPolicyName },
    include: { statements: true }
  });
  
  const hasDelegationRight = parentPolicy.statements.some(
    s => s.resource.startsWith("Policy[") && s.actions.includes("Create")
  );
  
  if (!hasDelegationRight) {
    throw new ForbiddenException("Parent policy doesn't allow delegation");
  }
  
  // 3. Verify new policy is a SUBSET of parent policy
  for (const newStatement of statements) {
    const isAllowed = parentPolicy.statements.some(parentStatement =>
      isSubsetOf(newStatement, parentStatement)
    );
    if (!isAllowed) {
      throw new ForbiddenException(`Statement not allowed: ${newStatement.resource}`);
    }
  }
  
  // 4. Create the delegated policy
  return await db.policy.create({
    data: {
      name: newPolicyName,
      createdFrom: parentPolicyName,
      isElevated: false,
      statements: { create: statements }
    }
  });
}

function isSubsetOf(child: Statement, parent: Statement): boolean {
  // Check if child's resource pattern is more specific than parent's
  // Check if child's actions are a subset of parent's actions
  // Implementation details depend on pattern matching logic
}
```

---

## Implementation Guide

### Phase 1: Database Schema

Create the Prisma models:

```prisma
// File: prisma/models/policy.prisma

model Policy {
  id           Int      @id @default(autoincrement())
  name         String   @unique
  isElevated   Boolean  @default(false)
  createdFrom  String?
  
  statements   Statement[]
  userPolicies UserPolicy[]
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Statement {
  id         Int    @id @default(autoincrement())
  policyId   Int
  policy     Policy @relation(fields: [policyId], references: [id], onDelete: Cascade)
  
  resource   String
  actions    String[]
  
  @@unique([policyId, resource])
}

model UserPolicy {
  userId    Int
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  policyId  Int
  policy    Policy @relation(fields: [policyId], references: [id], onDelete: Cascade)
  
  isActive  Boolean @default(true)
  
  assignedAt DateTime @default(now())
  assignedBy Int?
  
  @@id([userId, policyId])
}
```

Run migration:
```bash
npx prisma migrate dev --name add_permission_system
```

---

### Phase 2: Core Permission Service

Create the permission service:

```typescript
// File: backend/src/permission/permission.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionService {
  private policyCache = new Map<string, Statement[]>();
  private userPermissionsCache = new Map<number, Statement[]>();
  
  constructor(private prisma: PrismaService) {}
  
  async expandPolicy(policyName: string): Promise<Statement[]> {
    if (this.policyCache.has(policyName)) {
      return this.policyCache.get(policyName)!;
    }
    
    const policy = await this.prisma.policy.findUnique({
      where: { name: policyName },
      include: { statements: true }
    });
    
    if (!policy) {
      return [];
    }
    
    this.policyCache.set(policyName, policy.statements);
    return policy.statements;
  }
  
  async getUserStatements(userId: number): Promise<Statement[]> {
    if (this.userPermissionsCache.has(userId)) {
      return this.userPermissionsCache.get(userId)!;
    }
    
    const userPolicies = await this.prisma.userPolicy.findMany({
      where: { userId, isActive: true },
      include: { policy: { include: { statements: true } } }
    });
    
    const allStatements: Statement[] = [];
    for (const userPolicy of userPolicies) {
      const statements = userPolicy.policy.statements.map(s => ({
        ...s,
        resource: s.resource.replace(/{selfId}/g, userId.toString())
      }));
      allStatements.push(...statements);
    }
    
    this.userPermissionsCache.set(userId, allStatements);
    return allStatements;
  }
  
  async authorize(
    userId: number,
    requiredResource: string,
    requiredAction: string
  ): Promise<boolean> {
    const statements = await this.getUserStatements(userId);
    const required = this.parseResourcePattern(requiredResource);
    
    for (const statement of statements) {
      const granted = this.parseResourcePattern(statement.resource);
      
      if (this.matchesResource(granted, required)) {
        if (statement.actions.includes('*') || statement.actions.includes(requiredAction)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  private parseResourcePattern(pattern: string): { type: string; userId: string; groupId: string } {
    // Pattern: "ResourceType[userId:X,groupId:Y]"
    const match = pattern.match(/^(\w+|\*)\[userId:([^,]+),groupId:([^\]]+)\]$/);
    if (!match) {
      throw new Error(`Invalid resource pattern: ${pattern}`);
    }
    return { type: match[1], userId: match[2], groupId: match[3] };
  }
  
  private matchesResource(
    granted: { type: string; userId: string; groupId: string },
    required: { type: string; userId: string; groupId: string }
  ): boolean {
    const typeMatches = granted.type === '*' || granted.type === required.type;
    const userIdMatches = granted.userId === '*' || granted.userId === required.userId;
    const groupIdMatches = granted.groupId === '*' || granted.groupId === required.groupId;
    
    return typeMatches && userIdMatches && groupIdMatches;
  }
  
  invalidateCache(userId?: number, policyName?: string) {
    if (policyName) {
      this.policyCache.delete(policyName);
    }
    if (userId) {
      this.userPermissionsCache.delete(userId);
    }
  }
}
```

---

### Phase 3: Authorization Guard

Create the guard and decorator:

```typescript
// File: backend/src/permission/permission.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from './permission.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService
  ) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredResource = this.reflector.get<string>('permission:resource', context.getHandler());
    const requiredAction = this.reflector.get<string>('permission:action', context.getHandler());
    
    if (!requiredResource || !requiredAction) {
      return true; // No permission required
    }
    
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    
    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }
    
    // Replace template variables in resource pattern
    const resolvedResource = this.resolveResourcePattern(requiredResource, request);
    
    const authorized = await this.permissionService.authorize(userId, resolvedResource, requiredAction);
    
    if (!authorized) {
      throw new ForbiddenException(`Permission denied: ${resolvedResource}:${requiredAction}`);
    }
    
    return true;
  }
  
  private resolveResourcePattern(pattern: string, request: any): string {
    // Replace {{paramName}} with actual param values
    return pattern.replace(/\{\{(\w+)\}\}/g, (_, paramName) => {
      return request.params[paramName] || request.body[paramName] || '*';
    });
  }
}

// File: backend/src/permission/permission.decorator.ts

import { SetMetadata } from '@nestjs/common';

export const RequirePermission = (resource: string, action: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata('permission:resource', resource)(target, propertyKey, descriptor);
    SetMetadata('permission:action', action)(target, propertyKey, descriptor);
  };
};
```

---

### Phase 4: Controller Integration

Apply the decorator to controllers:

```typescript
// File: backend/src/group/group.controller.ts

import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PermissionGuard } from '../permission/permission.guard';
import { RequirePermission } from '../permission/permission.decorator';

@Controller('groups')
@UseGuards(PermissionGuard)
export class GroupController {
  
  @Get(':groupId')
  @RequirePermission('Group[userId:*,groupId:{{groupId}}]', 'Read')
  async getGroup(@Param('groupId') groupId: number) {
    // Permission already checked, proceed with logic
    return this.groupService.findOne(groupId);
  }
  
  @Post()
  @RequirePermission('Group[userId:*,groupId:*]', 'Create')
  async createGroup(@Body() createGroupDto: CreateGroupDto) {
    // Permission already checked
    return this.groupService.create(createGroupDto);
  }
  
  @Delete(':groupId')
  @RequirePermission('Group[userId:*,groupId:{{groupId}}]', 'Delete')
  async deleteGroup(@Param('groupId') groupId: number) {
    // Permission already checked
    return this.groupService.delete(groupId);
  }
}

// File: backend/src/membership/membership.controller.ts

@Controller('groups/:groupId/memberships')
@UseGuards(PermissionGuard)
export class MembershipController {
  
  @Get()
  @RequirePermission('Membership[userId:*,groupId:{{groupId}}]', 'Read')
  async listMemberships(@Param('groupId') groupId: number) {
    return this.membershipService.findAll(groupId);
  }
  
  @Post()
  @RequirePermission('Membership[userId:{{userId}},groupId:{{groupId}}]', 'Create')
  async createMembership(
    @Param('groupId') groupId: number,
    @Body('userId') userId: number
  ) {
    return this.membershipService.create(groupId, userId);
  }
  
  @Delete('user/:userId')
  @RequirePermission('Membership[userId:{{userId}},groupId:{{groupId}}]', 'Delete')
  async deleteMembership(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number
  ) {
    return this.membershipService.delete(groupId, userId);
  }
}
```

---

### Phase 5: Policy Management

Create policy CRUD endpoints:

```typescript
// File: backend/src/policy/policy.controller.ts

@Controller('policies')
@UseGuards(PermissionGuard)
export class PolicyController {
  
  @Post()
  @RequirePermission('Policy[userId:*,groupId:{{resortId}}:*]', 'Create')
  async createPolicy(@Body() createPolicyDto: CreatePolicyDto) {
    // Validate that statements are a subset of creator's permissions
    return this.policyService.create(createPolicyDto);
  }
  
  @Post(':policyName/assign/:userId')
  @RequirePermission('Policy[userId:*,groupId:{{resortId}}:*]', 'Assign')
  async assignPolicy(
    @Param('policyName') policyName: string,
    @Param('userId') userId: number
  ) {
    return this.policyService.assignToUser(policyName, userId);
  }
  
  @Delete(':policyName/assign/:userId')
  @RequirePermission('Policy[userId:*,groupId:{{resortId}}:*]', 'Unassign')
  async unassignPolicy(
    @Param('policyName') policyName: string,
    @Param('userId') userId: number
  ) {
    return this.policyService.unassignFromUser(policyName, userId);
  }
}
```

---

### Phase 6: Auto-Create Resort Admin Policy

Hook into group creation:

```typescript
// File: backend/src/group/group.service.ts

async createResort(name: string, createdBy: number): Promise<Group> {
  // 1. Create the resort group
  const resort = await this.prisma.group.create({
    data: { name, parentId: null, createdBy }
  });
  
  // 2. Create Resort Admin policy
  const policy = await this.prisma.policy.create({
    data: {
      name: `Resort[${resort.id}]Admin`,
      isElevated: true,
      createdFrom: null,
      statements: {
        create: [
          { resource: `Group[userId:*,groupId:${resort.id}]`, actions: ['*'] },
          { resource: `Membership[userId:*,groupId:${resort.id}]`, actions: ['*'] },
          { resource: `Evaluation[userId:*,groupId:${resort.id}]`, actions: ['*'] },
          { resource: `GroupActionApproval[userId:*,groupId:${resort.id}]`, actions: ['*'] },
          { resource: `Policy[userId:*,groupId:Resort:${resort.id}:*]`, actions: ['Read', 'Create', 'Update', 'Delete', 'Assign', 'Unassign', 'Clone'] }
        ]
      }
    }
  });
  
  // 3. Assign policy to creator
  await this.prisma.userPolicy.create({
    data: {
      userId: createdBy,
      policyId: policy.id,
      isActive: false,  // Elevated, needs manual activation
      assignedBy: createdBy
    }
  });
  
  return resort;
}

async createSubgroup(parentId: number, name: string, createdBy: number): Promise<Group> {
  // 1. Create the subgroup
  const subgroup = await this.prisma.group.create({
    data: { name, parentId, createdBy }
  });
  
  // 2. Find the resort admin policy
  const resort = await this.findRootGroup(parentId);
  const resortAdminPolicy = await this.prisma.policy.findUnique({
    where: { name: `Resort[${resort.id}]Admin` }
  });
  
  // 3. Add statements for the new subgroup
  await this.prisma.statement.createMany({
    data: [
      { policyId: resortAdminPolicy.id, resource: `Group[userId:*,groupId:${subgroup.id}]`, actions: ['*'] },
      { policyId: resortAdminPolicy.id, resource: `Membership[userId:*,groupId:${subgroup.id}]`, actions: ['*'] },
      { policyId: resortAdminPolicy.id, resource: `Evaluation[userId:*,groupId:${subgroup.id}]`, actions: ['*'] },
      { policyId: resortAdminPolicy.id, resource: `GroupActionApproval[userId:*,groupId:${subgroup.id}]`, actions: ['*'] }
    ]
  });
  
  // 4. Invalidate cache
  this.permissionService.invalidateCache(undefined, resortAdminPolicy.name);
  
  return subgroup;
}
```

---

## Best Practices

### 1. Always Use Explicit Statements

❌ **Don't:**
```typescript
// Trying to use hierarchical patterns
Statement("Group[userId:*,groupId:1:*]", ["Read"])  // Invalid!
```

✅ **Do:**
```typescript
// Explicit statements for each group
Statement("Group[userId:*,groupId:1]", ["Read"])
Statement("Group[userId:*,groupId:2]", ["Read"])
Statement("Group[userId:*,groupId:3]", ["Read"])
```

---

### 2. Separate Permissions from Business Logic

❌ **Don't:**
```typescript
// Mixing permission checks with business logic
if (user.id === membership.userId || user.isAdmin || membership.group.isPublic) {
  // Allow access
}
```

✅ **Do:**
```typescript
// Permission check in guard (declarative)
@RequirePermission('Membership[userId:{{userId}},groupId:{{groupId}}]', 'Read')
async getMembership(...) {
  // Business logic only
  const membership = await this.membershipService.findOne(...);
  
  // Additional business rules (not permissions)
  if (membership.status === 'pending') {
    throw new BadRequestException('Membership is pending approval');
  }
  
  return membership;
}
```

---

### 3. Use Meaningful Policy Names

❌ **Don't:**
```typescript
{ name: "Policy1" }
{ name: "AdminPolicy" }  // Which admin? For what?
```

✅ **Do:**
```typescript
{ name: "Resort[1]Admin" }  // Clear: Admin of Resort 1
{ name: "Group[5]Member" }  // Clear: Member of Group 5
{ name: "Resort[1]MembershipManager" }  // Clear: Manages memberships in Resort 1
```

---

### 4. Invalidate Caches Appropriately

Invalidate caches when:
- Policy statements are added/removed
- User policies are assigned/unassigned
- Policy is activated/deactivated

```typescript
// After updating policy
this.permissionService.invalidateCache(undefined, policyName);

// After changing user's policies
this.permissionService.invalidateCache(userId);

// After both
this.permissionService.invalidateCache(userId, policyName);
```

---

### 5. Audit Policy Changes

Always log who created/modified policies:

```typescript
async createPolicy(dto: CreatePolicyDto, createdBy: number) {
  const policy = await this.prisma.policy.create({
    data: { ...dto }
  });
  
  await this.auditService.log({
    action: 'POLICY_CREATE',
    userId: createdBy,
    resourceType: 'Policy',
    resourceId: policy.id,
    details: { policyName: policy.name, statements: policy.statements }
  });
  
  return policy;
}
```

---

### 6. Test Permission Edge Cases

Write tests for:
- Wildcard matching in both dimensions
- Self-reference placeholders
- Elevated policy activation/deactivation
- Policy delegation (subset validation)
- Cache invalidation

```typescript
describe('PermissionService', () => {
  it('should match wildcard userId', async () => {
    const granted = parsePattern('Membership[userId:*,groupId:1]');
    const required = parsePattern('Membership[userId:123,groupId:1]');
    expect(matchesResource(granted, required)).toBe(true);
  });
  
  it('should not match wildcard mismatch', async () => {
    const granted = parsePattern('Membership[userId:*,groupId:1]');
    const required = parsePattern('Membership[userId:123,groupId:2]');
    expect(matchesResource(granted, required)).toBe(false);
  });
});
```

---

## Conclusion

You now have a comprehensive, AWS IAM-inspired permission system that provides:

✅ **Fine-grained access control** with statement-level permissions  
✅ **Declarative** permission definitions  
✅ **Data-driven** configuration by org admins  
✅ **Flexible delegation** with policy cloning  
✅ **Elevated permissions** with manual activation (GitHub sudo mode)  
✅ **Hierarchical groups** with explicit statement propagation  
✅ **Separation of concerns** between permissions and business logic  

### Next Steps

1. **Implement Phase 1-6** as outlined in the Implementation Guide
2. **Create seed data** for `BaseUser` and `SiteAdmin` policies
3. **Build frontend UI** for policy management and elevation
4. **Add audit logging** for all permission-related changes
5. **Performance testing** with caching strategies
6. **Write comprehensive tests** for all permission patterns

**Welcome back from vacation! 🌴**

When you return, this document should have everything you need to understand and continue implementing the permission system. Good luck!
