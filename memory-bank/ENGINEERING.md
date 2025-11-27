---
purpose: "Overview of the technology stack and architectural choices"
triggers: ["setup", "dependency updates", "architectural review"]
keywords: ["stack", "technology", "framework", "tanstack", "prisma"]
importance: "must know"
size: "500 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Tech Context

Pek Infinity is built on a modern, type-safe full-stack architecture. We prioritize developer experience (DX) and strict separation of concerns.

## Core Stack

### Frontend & Framework
-   **Framework**: **TanStack Start** (React).
    -   We use Server Actions for all data mutations and fetching.
    -   *See*: `architecture/data-flow.md` for the request lifecycle.
-   **State Management**: **TanStack Query** (React Query).
    -   Handles async state, caching, and optimistic updates.
    -   *See*: `external/tanstack-query.md` (guide).
-   **Routing**: **TanStack Router**.
    -   File-based routing with type-safe params.
-   **Forms**: **React Hook Form** / **TanStack Form** (TBD) + `zod-form-data`.
    -   *See*: `external/tanstack-form.md` (guide).

### Backend & Data
-   **Runtime**: **Node.js**.
-   **Database**: **PostgreSQL**.
-   **ORM**: **Prisma**.
    -   We use Prisma for type-safe database access and migrations.
    -   *See*: `architecture/data-modeling.md` for how we map tables to DTOs.
    -   *See*: `architecture/database.md` for RLS and connection pooling details.
-   **Validation**: **Zod**.
    -   Single source of truth for runtime validation of API inputs and environment variables.

### Testing
-   **Runner**: **Vitest**.
    -   Fast, modern test runner compatible with Vite.
    -   *See*: `architecture/testing.md` for our testing philosophy (Unit vs Integration) and mocking patterns.

## Architectural Patterns

### The "Custom Framework"
We have built a lightweight abstraction over TanStack Start to enforce consistency.

1.  **Controller Layer**:
    -   Uses `createServerFn` to define API endpoints.
    -   Handles Input Validation (Zod) and Middleware (Auth).
    -   *See*: `architecture/server-actions.md`.

2.  **Service Layer**:
    -   Pure business logic classes.
    -   Decoupled from the HTTP layer.
    -   *See*: `architecture/service-layer.md` for DI patterns using `tsyringe`.

3.  **Dependency Injection**:
    -   We use `tsyringe` to manage dependencies between services and controllers.
    -   *See*: `architecture/dependency-injection.md`.

## Key Libraries & Tools
-   `tsyringe`: For Inversion of Control (IoC).
-   `zod-form-data`: For parsing `FormData` objects in Server Actions.
-   `biome`: For linting and formatting (replacing ESLint/Prettier).
