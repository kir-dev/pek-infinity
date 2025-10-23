<!-- this is auto generated, do not edit manually -->
<memory-bank>
==> copilot/Memory-Bank/architecture/00-federation-model.md <==
---
file: architecture/00-federation-model.md
purpose: "Explain why hub + worker-instance architecture exists, how instances relate, why BFF is needed"
triggers: ["designing multi-instance features", "debugging federation logic", "adding realm support"]
keywords: ["federation", "hub", "worker-instance", "instance", "BFF", "multi-tenancy", "realm"]
dependencies: []
urgency: "critical"
size: "1500 words"
status: "active"
created: "2025-10-20"

==> copilot/Memory-Bank/architecture/01-auth-system.md <==
---
file: architecture/01-auth-system.md
purpose: "Complete JWT flow, policy snapshots, Redis caching strategy; how MVP and worker-instance auth differs"
triggers: ["implementing auth", "designing login flow", "debugging permissions", "scaling to worker-instance"]
keywords: ["JWT", "auth", "policy", "snapshot", "caching", "x-policy-hint", "redis", "mfa", "oauth"]
dependencies: ["architecture/00-federation-model.md", "database/01-policy-system.md"]
urgency: "critical"
size: "2500 words"
status: "active"
created: "2025-10-20"

==> copilot/Memory-Bank/architecture/02-service-patterns.md <==
---
file: architecture/02-service-patterns.md
purpose: "Why services are realm-agnostic, how they fit MVP and worker, DI pattern"
triggers: ["implementing service layer", "code review of services", "understanding separation of concerns"]
keywords: ["service", "business logic", "DI", "realm-agnostic", "pure", "testable"]
dependencies: ["architecture/00-federation-model.md", "architecture/03-middleware-layering.md"]
urgency: "critical"
size: "2000 words"
status: "active"
created: "2025-10-20"

==> copilot/Memory-Bank/architecture/03-middleware-layering.md <==
---
file: architecture/03-middleware-layering.md
purpose: "Middleware stack differences between MVP and worker-instance; order matters, guard responsibilities"
triggers: ["implementing middleware", "debugging auth failures", "adding new guard", "scaling to worker-instance"]
keywords: ["middleware", "guard", "stack", "order", "jwtGuard", "authGuard", "routing"]
dependencies: ["architecture/01-auth-system.md", "architecture/02-service-patterns.md"]
urgency: "critical"
size: "1500 words"
status: "active"
created: "2025-10-20"

==> copilot/Memory-Bank/architecture/04-routing-aggregation.md <==
---
file: architecture/04-routing-aggregation.md
purpose: "How serverFn routing determines instances and combines responses; handling partial failures"
triggers: ["implementing serverFn", "designing aggregation logic", "handling cross-instance searches"]
keywords: ["routing", "aggregation", "combining", "partial-failure", "federation", "multi-instance"]
dependencies: ["architecture/00-federation-model.md", "architecture/03-middleware-layering.md"]
urgency: "high"
size: "1500 words"
status: "active"
created: "2025-10-20"

==> copilot/Memory-Bank/database/00-realm-model.md <==
---
file: database/00-realm-model.md
purpose: "Realm concept, why realmId exists, which models need it, how queries must filter"
triggers: ["creating new domain", "querying database", "enforcing data isolation", "adding schema field"]
keywords: ["realm", "realmId", "isolation", "constraint", "filter", "data-leakage", "multi-tenancy"]
dependencies: ["architecture/00-federation-model.md"]
urgency: "critical"
size: "1500 words"
status: "active"
created: "2025-10-20"

==> copilot/Memory-Bank/database/01-policy-system.md <==
---
file: database/01-policy-system.md
purpose: "Policy, Statement, PolicyAssignment models; hierarchy with delegation, cascading escalation, permission grants"
triggers: ["implementing auth system", "designing policies", "debugging permission", "cascading on subgroup creation"]
keywords: ["policy", "statement", "assignment", "hierarchy", "delegation", "cascading", "permission", "resource"]
dependencies: ["database/00-realm-model.md", "architecture/01-auth-system.md"]
urgency: "critical"
size: "2000 words"
status: "active"
created: "2025-10-20"

==> copilot/Memory-Bank/database/02-group-hierarchy.md <==
---
file: database/02-group-hierarchy.md
purpose: "Group model with parent-child hierarchy, realmId isolation, composite constraints, cascading on creation"
triggers: ["creating groups", "querying group hierarchy", "designing group operations", "validating group constraints"]
keywords: ["group", "hierarchy", "parent", "children", "composite-key", "archived", "cascade"]
dependencies: ["database/00-realm-model.md", "database/01-policy-system.md"]
urgency: "critical"
size: "1500 words"
status: "active"
created: "2025-10-20"

==> copilot/Memory-Bank/database/03-user-profile-federation.md <==
---
file: database/03-user-profile-federation.md
purpose: "User and Profile models; single profile in hub across federation, privacy scope restrictions, federation awareness"
triggers: ["implementing user queries", "designing profile access", "handling federated users", "privacy boundaries"]
keywords: ["user", "profile", "federation", "privacy", "scope", "basic-profile", "full-profile", "external-account"]
dependencies: ["database/00-realm-model.md", "architecture/00-federation-model.md"]
urgency: "high"
size: "1200 words"
status: "active"
created: "2025-10-20"

==> copilot/Memory-Bank/decisions/00-mvp-vs-worker-instance.md <==
---
file: decisions/00-mvp-vs-worker-instance.md
purpose: "Feature-by-feature breakdown of MVP vs worker-instance; scope, timeline, reversibility"
triggers: ["planning sprint", "estimating PR scope", "questioning feature scope"]
keywords: ["MVP", "worker-instance", "scope", "timeline", "feature", "rollout"]
dependencies: []
urgency: "high"
size: "2000 words"
reversibility: "high"
decision-date: "2025-10-20"

==> copilot/Memory-Bank/gotchas/00-common-mistakes.md <==
---
file: gotchas/00-common-mistakes.md
purpose: "Learn from mistakes: data leakage, permission bypass, orphaned objects, type mismatches"
triggers: ["code review", "debugging auth issues", "strange behavior after deploy"]
keywords: ["mistake", "bug", "gotcha", "leakage", "bypass", "debug", "common", "trap"]
dependencies: ["rules/00-realm-isolation.md", "rules/01-auth-enforcement.md", "rules/02-service-purity.md"]
urgency: "critical"
size: "2000 words"
sections: ["intro", "mistake-1-service-realm-param", "mistake-2-missing-realmid-filter", "mistake-3-auth-in-handler", "mistake-4-middleware-order", "mistake-5-hardcoded-hub", "mistake-6-type-drift", "debug-checklist"]
status: "active"

==> copilot/Memory-Bank/gotchas/01-migration-blockers.md <==
---
file: gotchas/01-migration-blockers.md
purpose: "Understand what breaks MVP→Worker Instance migration if done wrong"
triggers: ["scaling planning", "code review before release", "architectural decision"]
keywords: ["migration", "blocker", "scale", "worker-instance", "impossible", "refactor", "debt"]
dependencies: ["gotchas/00-common-mistakes.md", "decisions/00-mvp-vs-worker-instance.md"]
urgency: "high"
size: "1500 words"
sections: ["intro", "blocker-1-service-realm-aware", "blocker-2-data-leakage", "blocker-3-auth-in-handler", "blocker-4-hardcoded-endpoints", "blocker-5-monolithic-policy", "blocker-6-circular-deps", "prevention-checklist"]
status: "active"

==> copilot/Memory-Bank/gotchas/02-performance-gotchas.md <==
---
file: gotchas/02-performance-gotchas.md
purpose: "Understand performance traps at scale: N+1 queries, cascading O(n²), caching issues"
triggers: ["performance review", "database profiling", "scaling to 1000+ users"]
keywords: ["performance", "N+1", "query", "cascading", "O(n)", "slow", "bottleneck", "scale"]
dependencies: ["implementation/03-auth-guards.md", "reference/01-er-diagram.md"]
urgency: "medium"
size: "1200 words"
sections: ["intro", "gotcha-1-n-plus-one", "gotcha-2-cascading-queries", "gotcha-3-policy-snapshot-size", "gotcha-4-serial-trpc", "gotcha-5-redis-invalidation", "profiling-checklist"]
status: "active"

==> copilot/Memory-Bank/implementation/00-service-layer.md <==
---
file: implementation/00-service-layer.md
purpose: "Copy-paste service template with DI pattern; what goes in service, what doesn't, testing in isolation"
triggers: ["implementing new domain", "code review for service layer", "understanding DI pattern"]
keywords: ["service", "dependency-injection", "tsyringe", "injectable", "template", "testing"]
dependencies: ["architecture/02-service-patterns.md", "rules/02-service-purity.md"]
urgency: "high"
size: "1500 words"
template: true
status: "active"

==> copilot/Memory-Bank/implementation/01-trpc-procedures.md <==
---
file: implementation/01-trpc-procedures.md
purpose: "tRPC procedure structure, input validation, middleware order, context injection, error handling with real examples"
triggers: ["implementing new domain", "adding new procedure", "code review for procedures"]
keywords: ["tRPC", "procedure", "validation", "middleware", "context", "query", "mutation", "router"]
dependencies: ["architecture/02-service-patterns.md", "rules/01-auth-enforcement.md", "rules/03-schema-validation.md"]
urgency: "high"
size: "2000 words"
template: true
sections: ["core-pattern", "input-validation", "middleware-order", "context-injection", "query-vs-mutation", "error-handling", "real-examples", "router-aggregation", "testing", "gotchas", "checklist"]

==> copilot/Memory-Bank/implementation/02-serverfn-routing.md <==
---
file: implementation/02-serverfn-routing.md
purpose: "serverFn as BFF routing layer, jwtGuard, routingMiddleware pattern, response combining, MVP vs worker-instance"
triggers: ["implementing serverFn endpoint", "designing routing layer", "combining multi-instance responses"]
keywords: ["serverFn", "routing", "BFF", "jwtGuard", "routingMiddleware", "response-combining", "aggregation"]
dependencies: ["architecture/04-routing-aggregation.md", "architecture/01-auth-system.md", "implementation/01-trpc-procedures.md"]
urgency: "critical"
size: "2000 words"
template: true
sections: ["core-pattern", "jwt-guard", "routing-middleware", "response-combining", "mvp-vs-worker-instance", "real-examples", "error-handling", "performance", "gotchas", "checklist"]

==> copilot/Memory-Bank/implementation/03-auth-guards.md <==
---
file: implementation/03-auth-guards.md
purpose: "jwtGuard and authGuard implementation, policy validation, statement scoping, error responses, testing"
triggers: ["implementing auth middleware", "debugging permission issues", "code review for auth"]
keywords: ["auth", "guard", "middleware", "JWT", "policy", "scope", "permission", "error"]
dependencies: ["architecture/01-auth-system.md", "database/01-policy-system.md", "rules/01-auth-enforcement.md"]
urgency: "critical"
size: "1800 words"
template: true
sections: ["jwt-guard", "auth-guard", "policy-validation", "statement-scoping", "error-responses", "caching", "real-examples", "testing", "gotchas", "checklist"]

==> copilot/Memory-Bank/implementation/04-domain-structure.md <==
---
file: implementation/04-domain-structure.md
purpose: "File organization within domain, index.ts public API exports, naming conventions, colocalization rationale"
triggers: ["creating new domain", "organizing domain files", "code review for structure"]
keywords: ["domain", "folder", "index.ts", "exports", "organization", "colocalization", "naming"]
dependencies: ["decisions/02-why-colocate-domains.md", "architecture/02-service-patterns.md"]
urgency: "medium"
size: "1200 words"
template: true
sections: ["structure", "file-organization", "index-exports", "naming-conventions", "colocalization", "real-example", "anti-patterns", "checklist"]

==> copilot/Memory-Bank/reference/00-request-flows.md <==
---
file: reference/00-request-flows.md
purpose: "Visual reference: request flows, auth flows, policy cascade, error handling paths"
triggers: ["understanding request lifecycle", "tracing bug through system", "architectural review"]
keywords: ["flow", "diagram", "sequence", "request", "auth", "policy", "cascade", "response"]
dependencies: ["architecture/01-auth-system.md", "architecture/02-service-patterns.md"]
urgency: "medium"
size: "1200 words"
sections: ["mvp-request-flow", "worker-instance-request-flow", "auth-flow", "policy-cascade-flow", "error-handling"]
status: "active"

==> copilot/Memory-Bank/reference/01-er-diagram.md <==
---
file: reference/01-er-diagram.md
purpose: "Database entity relationships, cardinality, composite keys, realm boundaries"
triggers: ["understanding database schema", "designing new features", "migration planning"]
keywords: ["ER", "diagram", "entity", "relationship", "schema", "cardinality", "foreign key", "realm"]
dependencies: ["database/00-realm-model.md", "database/01-policy-system.md"]
urgency: "medium"
size: "1000 words"
sections: ["entity-relationship-diagram", "key-relationships", "composite-keys", "realm-boundaries", "cardinality-notes"]
status: "active"

==> copilot/Memory-Bank/reference/02-policy-examples.md <==
---
file: reference/02-policy-examples.md
purpose: "Real-world policy hierarchy examples: Schönherz, conference, deep nesting"
triggers: ["designing policy structure", "understanding escalation", "testing policy system"]
keywords: ["policy", "example", "hierarchy", "escalation", "schönherz", "conference", "real-world"]
dependencies: ["database/01-policy-system.md", "database/02-group-hierarchy.md"]
urgency: "low"
size: "1000 words"
sections: ["schönherz-hierarchy", "conference-hierarchy", "deep-nesting", "cascading-examples", "permission-matrix"]
status: "active"

==> copilot/Memory-Bank/reference/03-glossary.md <==
---
file: reference/03-glossary.md
purpose: "Terminology glossary for pek-infinity architecture, policies, and system design"
triggers: ["confused about terminology", "onboarding new developer", "architectural discussion"]
keywords: ["glossary", "terms", "definitions", "realm", "federation", "hub", "worker-instance", "policy", "cascade", "mvp"]
dependencies: []
urgency: "low"
size: "800 words"
sections: ["core-concepts", "architecture-terms", "policy-terms", "database-terms", "performance-terms"]
status: "active"

==> copilot/Memory-Bank/reference/04-quick-reference.md <==
---
file: reference/04-quick-reference.md
purpose: "One-page summary, key commands, PR checklist, critical rules"
triggers: ["before submitting PR", "quick lookup", "first-time context"]
keywords: ["checklist", "summary", "reference", "quick", "rules"]
dependencies: ["all architecture/*", "all rules/*"]
urgency: "high"
size: "500 words"
status: "active"
created: "2025-10-20"

==> copilot/Memory-Bank/rejected/00-rest-endpoints-in-mvp.md <==
---
file: rejected/00-rest-endpoints-in-mvp.md
purpose: "Why REST not chosen for MVP. When REST will be added (worker instances)"
triggers: ["architectural discussion", "comparing REST vs tRPC", "worker planning"]
keywords: ["REST", "tRPC", "API", "resource", "HTTP", "endpoint", "MVP", "worker"]
dependencies: ["architecture/04-routing-aggregation.md", "decisions/00-mvp-vs-worker.md"]
urgency: "medium"
size: "900 words"
sections: ["decision-summary", "why-not-rest-for-mvp", "trpc-advantages", "when-rest-needed", "migration-plan", "comparison-table"]
status: "active"

==> copilot/Memory-Bank/rejected/01-service-realm-awareness.md <==
---
file: rejected/01-service-realm-awareness.md
purpose: "Why services DON'T know realm (detailed rejection with consequences)"
triggers: ["service design decision", "code review", "scalability question"]
keywords: ["service", "realm", "parameter", "awareness", "injection", "DI", "coupling"]
dependencies: ["rules/02-service-purity.md", "gotchas/01-migration-blockers.md"]
urgency: "high"
size: "1000 words"
sections: ["decision", "rejected-approach", "why-rejected", "correct-approach", "comparison", "consequences"]
status: "active"

==> copilot/Memory-Bank/rules/00-realm-isolation.md <==
---
file: rules/00-realm-isolation.md
purpose: "MUST: Every query filters by realmId. Verification method, examples, test cases"
triggers: ["code review", "writing database query", "debugging data leakage"]
keywords: ["realm", "isolation", "filter", "query", "data-leakage", "must-follow"]
dependencies: ["database/00-realm-model.md", "architecture/00-federation-model.md"]
urgency: "critical"
enforcement: "must-follow"
size: "2000 words"
check-command: "grep -r 'findMany\\|findUnique\\|findFirst' src/domains/ | grep -v realmId"

==> copilot/Memory-Bank/rules/01-auth-enforcement.md <==
---
file: rules/01-auth-enforcement.md
purpose: "MUST: Auth checks in middleware, not handlers. Error handling, response codes, middleware order critical"
triggers: ["code review for auth", "implementing permission check", "debugging permission bypass"]
keywords: ["auth", "middleware", "enforcement", "handler", "layer", "401", "403"]
dependencies: ["implementation/03-auth-guards.md", "architecture/01-auth-system.md"]
urgency: "critical"
enforcement: "must-follow"
size: "1500 words"
sections: ["the-rule", "why-it-matters", "middleware-order", "error-codes", "bad-examples", "good-examples", "testing", "checklist"]

==> copilot/Memory-Bank/rules/02-service-purity.md <==
---
file: rules/02-service-purity.md
purpose: "MUST: Services realm-agnostic for MVP + worker-instance reuse"
triggers: ["implementing service", "code review for service", "adding realm parameter"]
keywords: ["service", "purity", "realm-agnostic", "DI", "reusable", "MVP", "worker-instance"]
dependencies: ["architecture/02-service-patterns.md", "decisions/03-why-services-are-realm-agnostic.md"]
urgency: "critical"
enforcement: "must-follow"
size: "1500 words"
sections: ["the-rule", "why-it-matters", "what-services-do", "where-realm-comes-from", "bad-examples", "good-examples", "mvp-vs-worker-instance", "testing", "checklist"]

==> copilot/Memory-Bank/rules/03-schema-validation.md <==
---
file: rules/03-schema-validation.md
purpose: "MUST: Zod schemas satisfy Prisma types. Type safety, prevention of silent bugs"
triggers: ["creating schema", "code review for types", "debugging type mismatch"]
keywords: ["Zod", "schema", "Prisma", "type", "satisfy", "validation", "safety"]
dependencies: ["implementation/04-domain-structure.md", "gotchas/00-common-mistakes.md"]
urgency: "high"
enforcement: "must-follow"
size: "1000 words"
sections: ["the-rule", "why-it-matters", "how-to-use", "bad-examples", "good-examples", "checking-alignment", "testing", "checklist"]

==> copilot/Memory-Bank/rules/04-parent-validation.md <==
---
file: rules/04-parent-validation.md
purpose: "MUST: Validate parent group exists and is not archived. Prevent orphaned groups"
triggers: ["group creation", "group update", "parentId assignment"]
keywords: ["parent", "validation", "archived", "orphan", "hierarchy", "constraint"]
dependencies: ["implementation/03-auth-guards.md", "gotchas/01-migration-blockers.md"]
urgency: "high"
enforcement: "must-follow"
size: "800 words"
sections: ["the-rule", "why-it-matters", "implementation", "bad-examples", "good-examples", "testing", "checklist"]
</memory-bank>
# GitHub Copilot Instructions

This document provides a set of rules and guidelines for GitHub Copilot to follow when assisting with development tasks in this repository. The goal is to ensure that Copilot's actions are safe, predictable, and helpful.

---

## 1. Interacting with Terminal Commands

- **Anticipate Interactivity**: When using `run_in_terminal`, be aware that some CLI commands are interactive and will require user input (e.g., `npm init`, `nest generate resource`). If a command prompts for input, present it to the user and ask for the necessary information before proceeding.
- **Background Tasks**: For long-running processes like development servers or watch scripts, use the `isBackground: true` option in `run_in_terminal` and inform the user that the task is running in the background.

---

## 2. Asking Clarifying Questions

- **Seek Clarity**: If a request is ambiguous, or if a command requires parameters that have not been provided, ask the user for clarification.
- **Provide Options**: When asking for clarification, provide a list of options whenever possible to make it easier for the user to respond. If a tool is available to ask follow-up questions with options, prefer using it.
- **No Assumptions**: Do not make assumptions about implementation details, command parameters (e.g., `--no-spec`), or desired outcomes.

---

## 3. Verification & Error Handling

- **Verify All Actions**: After running a command or editing a file, verify that the action was successful and produced the expected outcome.
  - For terminal commands, inspect the exit code and output
  - For file edits, use `read_file` to confirm changes were applied correctly
  - Use `get_errors` to check for any new errors or warnings introduced by your changes
- **Report Failures**: If a tool call fails or a command returns an error, report the failure to the user, explain what went wrong, and ask how to proceed.
- **Respect any changes were made. Do not retry the operation unless the user asks you to.

---

## 4. Using Git Tools

- **Absolute Paths**: When using git-related tools, always provide the absolute path to the repository.
- **Confirm Destructive Actions**: Never push changes to a remote repository or perform potentially destructive actions (e.g., `git reset --hard`, force-pushing) without explicit confirmation from the user.

---

## 5. Code Formatting and Linting

- **Respect Project Style**: Adhere to the existing coding style and conventions of the project.
- **Use Project Linters**: Apply project-configured linters or formatters (Biome, ESLint, Prettier, etc.) after making changes. If no configuration exists, use `biome check --fix {path}`.
- **Fix Issues**: Run linter/formatter before changes are considered complete to catch any auto-fixable issues.

---

## 6. Using the Memory Bank

The memory bank (`/.github/copilot/Memory-Bank/`) is the **single source of truth** for architectural decisions, patterns, and constraints. Always consult it before making assumptions.

### 6.0 Memory Bank Frontmatters Are Auto-Loaded

Frontmatters from all memory bank files are **automatically loaded at the start of every task**. This provides the "index" of all architectural knowledge immediately.

If you didn't receive this, then real all frontmatters using `head -n 10 .github/copilot/Memory-Bank/**/*.md`

**Your approach:**

1. **Scan the loaded frontmatters** for relevance using metadata:
   - `purpose:` - What this file documents
   - `triggers:` - When to consult it
   - `keywords:` - Search terms
   - `dependencies:` - Related files to check
   - `status:` - active, archived, or deprecated
   - First sentence - Quick summary

2. **Lazily load full files** only if frontmatter indicates relevance to your task

3. **Never assume** architecture, patterns, or decisions without consulting memory first

This maximizes context efficiency: you work with the "index" of knowledge immediately available, then drill into specifics as needed.

### 6.1 Memory Bank Structure

The memory bank is organized into:

- **README.md** - Navigation hub and quick-start by task
- **Architecture/** - System design patterns and federation model
- **Database/** - Schema, realm isolation, policy system
- **Decisions/** - Architectural choices and rationale
- **Implementation/** - Templates and code patterns
- **Rules/** - **MUST FOLLOW BEFORE ANY PR**
- **Gotchas/** - Learn from past mistakes
- **Rejected/** - Why certain approaches weren't chosen
- **Reference/** - Glossary, diagrams, and quick reference

### 6.2 How to Use the Memory Bank

**Your workflow:**

1. **Read the README** (`Memory-Bank/README.md`) to find your task category and recommended files
2. **Scan loaded frontmatters** for relevance using metadata (purpose, triggers, keywords, dependencies)
3. **Lazily load full files** only when frontmatter indicates relevance to your task
4. **Never assume** architecture, patterns, or decisions without consulting memory first

### 6.3 Common Patterns (Copy From Memory Bank)

**Never write patterns from scratch.** Reference and adapt from:

- tRPC procedure: `implementation/01-trpc-procedures.md` (has real example code)
- Service class: `implementation/00-service-layer.md` (has template with DI)
- Auth guard: `implementation/03-auth-guards.md` (has validation code)
- Domain structure: `implementation/04-domain-structure.md` (file organization)

**Process before writing code:**
1. Define task
2. Consult memory bank (README → relevant files)
3. Find pattern/rule/example
4. Stop and rephrase user request in clear format to enhance clarity for both coding agents and human readers. This ensures the request is unambiguous, actionable, and aligned with best practices for coding tasks.
5. Write code based on pattern
6. Check gotchas for mistakes
7. Run rules checklist before PR

---

## 7. Saving Agent Memory (All Tools)

Even if you're using Copilot, Claude Code, Cursor, Gemini CLI, or another AI agent, **you MUST persist learnings between sessions** by updating memory bank files.

### When to Save Memory

Update the memory bank immediately if:
- ✅ You learned new architectural patterns or conventions
- ✅ You received user feedback or corrections
- ✅ You discovered antipatterns or "smells"
- ✅ You solved a complex problem with reusable patterns
- ✅ You clarified ambiguous requirements

### Memory Update Checklist

Before updating memory, verify:
- ✅ Changes are documented clearly with examples
- ✅ Cross-references to related files are included
- ✅ Frontmatter metadata is updated
- ✅ Status and timestamps are current

### Correcting Memory Immediately

If the user corrects you about architecture, scope, or documented patterns:
1. ✅ Acknowledge the correction immediately
2. ✅ Update relevant memory bank files right away (don't wait for session end)
3. ✅ Update all cross-references and frontmatter `updated:` timestamp

This ensures all future agents get accurate information.

---

## 8. Task Planning and Progress

- **Use Todo List**: Use the task/todo list tool to create and manage a todo list for the current task.
- **Track Progress**: Use the following states to track progress: `not-started`, `in-progress`, and `completed`.
