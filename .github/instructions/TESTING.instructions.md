---
applyTo: "/**/*spec.ts"
---

# AI Testing Instructions (for .spec.ts files)

Purpose: teach the AI agent practical, actionable testing skills and provide examples from the actual codebase that the assistant can reference when helping engineers write or review tests.

## Core Testing Principles

- Learn the intent: read feature goals, acceptance criteria, and user flows before designing tests.
- Test behaviours, not implementation: assert public contracts and observable outcomes.
- Make failures reproducible: include minimal repro steps, exact environment, logs, and a small failing script if possible.
- Keep tests deterministic: seed randomness, avoid time-based assertions, and isolate state.
- Prefer fast unit tests; reserve heavy scenarios for focused integration/E2E suites.
- Mock only external systems; use in-memory fakes for infra where feasible.
- Triage and fix flaky tests — quarantine only temporarily with a remediation plan.
- Use factories, fixtures, and helpers to avoid duplicated setup.
- Name tests by behaviour and intent; include a short comment for tricky cases.
- Validate fixes end-to-end and add observability checks for unstable areas.
