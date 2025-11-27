---
purpose: "Define how points are calculated"
triggers: ["evaluating members", "setting up semester"]
keywords: ["evaluation", "scoring", "points", "ranking"]
importance: "must know"
size: "200 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

# Scoring System

The Evaluation system tracks member activity.

## Components
-   **Scoreboard**: A collection of scores for a specific group and semester.
-   **Category**: Types of work (e.g., "Dev Work", "Community Work").
-   **Multiplier**: Weighting for different categories.

## Calculation
`Total Score = Sum(Activity * Multiplier)`

## Code Reference
-   *Implementation*: `full-stack/src/domains/evaluation/api/evaluation.service.ts` (Pending implementation).
