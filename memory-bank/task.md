---
purpose: "Track the current state of work and active focus"
triggers: ["daily standup", "context switch"]
keywords: ["active", "status", "todo", "focus", "roadmap"]
importance: "must know"
size: "200 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Active Context

## Current Focus
We are currently in the **Refactoring Phase** of the documentation.
The goal is to transition from a monolithic `project.md` to a structured, domain-driven **Memory Bank**.

This involves:
1.  **Decomposition**: Breaking down large concepts into atomic files (e.g., `auth/login-flow.md`).
2.  **Verification**: Ensuring every documentation file links to actual, working code.
3.  **Cleanup**: Removing theoretical "future" code (Federation) from the main context and isolating it.

## Recent Changes
-   **Group Domain Implementation**: The `Group` domain has been fully implemented with Controller, Service, and Schema layers. This serves as the "Canonical Example" for the rest of the system.
-   **Documentation Strategy**: Adopted the "Atomic Memory" philosophy. Documentation is now classified by business logic, not just technology.
-   **Product Requirements**: Clarified that "Evaluation" is a core MVP feature, not a future goal.

## Next Steps
1.  **Architecture Documentation**: Document the Custom Framework patterns (`architecture/data-flow.md`, `architecture/service-layer.md`).
2.  **Domain Documentation**: Create atomic files for `Auth`, `Group`, `User`, and `Membership` domains.
3.  **Evaluation System**: Design and document the Google Sheets integration strategy in `memory-bank/evaluation/`.
4.  **Federation Isolation**: Move all multi-instance logic to `memory-bank/.federation/`.
