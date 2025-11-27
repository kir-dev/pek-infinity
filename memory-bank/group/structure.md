---
purpose: "Define the Group data model and hierarchy"
triggers: ["schema changes", "understanding groups"]
keywords: ["group", "structure", "hierarchy", "organization"]
importance: "high"
size: "500 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Group Structure

The Group domain is the core of the application.

## Core Concept

Groups are the organizational units in PÉK. A group can have:
- **One parent group** (or none if top-level)
- **Many children** (subgroups)
- **Members** (via Membership model)
- **An owner/manager**

The hierarchy is a **tree structure**, not a DAG. Each group knows its parent, children are queried.

## Field Meanings
- `name`: Human-readable group name (unique within realm)
- `realmId`: Which realm this group belongs to (hub vs worker instance)
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
- In MVP: All groups in "hub" realm, so effectively unique globally
- In worker: Each instance has its own realm, so "Engineering" can exist in hub AND worker-acme
- **Example:**
  ```
  Group { name: "Engineering", realmId: "hub" }      ✅ Allowed
  Group { name: "Engineering", realmId: "worker-a" } ✅ Allowed (different realm)
  Group { name: "Engineering", realmId: "hub" }       ❌ Error (duplicate)
  ```

## ID Format
-   **Format**: `organizationId@groupName` (e.g., `simonyi@kir-dev`).
-   **Constraint**: Ensures uniqueness within an organization while allowing simple URL routing.

## Code Reference
-   *Schema*: `full-stack/prisma/schema.prisma` (Group model).
-   *DTOs*: `full-stack/src/domains/group/api/group.schema.ts`.
