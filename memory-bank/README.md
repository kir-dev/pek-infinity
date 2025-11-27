---
purpose: "Define the core business requirements and domain model of Pek Infinity"
triggers: ["onboarding", "understanding business logic"]
keywords: ["product", "requirements", "authsch", "groups", "evaluation", "docs-entrypoint", "system"]
importance: "must know"
size: "300 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Product Context

Pek Infinity is the phonebook and student organization management system for Schönherz Zoltán Kollégium.

## Core Features

### 1. Authentication
-   **Provider**: AuthSCH (OAuth).
-   **Mechanism**: Users log in via AuthSCH, which redirects to our backend. We issue a secure, HTTP-only cookie.
-   **Identity**: Users are identified by their AuthSCH internal ID.

### 2. Group System
-   **Hierarchy**: Groups are organized in a recursive tree structure (Organization -> Subgroup -> Subgroup).
-   **Roles**:
    -   **Leader**: Has full control over the group and all descendant groups.
    -   **Member**: Basic membership.
    -   **Custom Roles**: Leaders can create roles with specific permission subsets.
-   **Inheritance**: Permissions cascade down the tree. A leader of the "Dev Team" is implicitly a leader of "Frontend Team".

### 3. Evaluation System
-   **Goal**: Track member activity and award points.
-   **Integration**: Syncs with Google Sheets for data entry and visualization.

## Future Vision
-   **Federation**: The system is designed to eventually support multiple independent instances (Workers) connected to a central Hub.
-   See `memory-bank/.federation/vision.md` for details.
