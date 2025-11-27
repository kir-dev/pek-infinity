---
purpose: "Enforce naming conventions"
triggers: ["naming file", "naming variable"]
keywords: ["naming", "convention", "rules"]
importance: "must know"
size: "100 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Naming Conventions

Consistency is key.

## Files
-   **Controllers**: `*.controller.ts`
-   **Services**: `*.service.ts`
-   **Schemas**: `*.schema.ts`
-   **Tests**: `*.spec.ts`

## Classes & Variables
-   **Services**: `GroupService` (PascalCase)
-   **DTOs**: `GroupCreateDto` (PascalCase, match Schema)
-   **Variables**: `groupService` (camelCase)
