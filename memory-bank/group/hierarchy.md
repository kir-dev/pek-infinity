---
purpose: "Group model with parent-child hierarchy, realmId isolation, composite constraints, cascading on creation"
triggers: ["creating groups", "querying group hierarchy", "designing group operations", "validating group constraints"]
keywords: ["group", "hierarchy", "parent", "children", "composite-key", "archived", "cascade"]
importance: "critical"
size: "400 tokens"
status: "active"
created: "2025-10-20"
updated: "2025-11-27"





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

see `prisma/models/group.prisma`

## Critical Constraints

### Constraint 1: Parent Cannot Be Archived

**Rule:** When creating subgroup, parent.isArchived must be false

**Why:** Archived groups are deleted logically; cannot have "orphaned" children

### Constraint 3: Unique Name Per Realm

**Rule:** Group names are unique within a realm, not globally

**Handled by:** `@@unique([name, realmId])` - Prisma enforces this

## Hierarchy Queries

### Get All Ancestors (Path to Root)

Using recursion

### Get All Descendants

Using recursion

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
