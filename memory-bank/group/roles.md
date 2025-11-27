---
purpose: "Define roles and permission inheritance"
triggers: ["assigning roles", "checking permissions"]
keywords: ["group", "roles", "permissions", "inheritance"]
importance: "must know"
size: "200 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Group Roles

Roles define what a user can do within a group.

## Standard Roles
-   **Leader (Owner)**: Has full control (`GROUP_OWNER`). Can edit profile, manage members, and create subgroups.
-   **Member**: Can view the group (`GROUP_VIEW`).

## Inheritance
Permissions cascade down the hierarchy.
-   If Alice is the Leader of "Simonyi", she is implicitly the Leader of "Kir-Dev" (a subgroup of Simonyi).
-   This is enforced by the `authGuard` logic which checks parent permissions.

## Code Reference
-   *Scopes*: `full-stack/src/domains/group/api/group.controller.ts` (e.g., `SCOPE.GROUP_OWNER`).
