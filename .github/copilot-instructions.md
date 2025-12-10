<!-- this is auto generated, do not edit manually -->
<memory-bank>
==> memory-bank/architecture/data-flow.md <==
---
purpose: "Visual reference: request flows, auth flows, policy cascade, error handling paths"
triggers: ["understanding request lifecycle", "tracing bug through system", "architectural review"]
keywords: ["flow", "diagram", "sequence", "request", "auth", "policy", "cascade", "response"]
importance: "medium"
size: "1200 words"
status: "active"
created: "2025-10-20"
updated: "2025-11-27"





---

==> memory-bank/architecture/data-modeling.md <==
---
purpose: "Guide on mapping Database Tables to Zod Schemas and DTOs"
triggers: ["creating new domain", "adding database fields"]
keywords: ["prisma", "zod", "dto", "schema", "modeling"]
importance: "high"
size: "400 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/architecture/middleware.md <==
---
purpose: "Middleware stack order and guard responsibilities"
triggers: ["implementing middleware", "debugging auth failures", "adding new guard"]
keywords: ["middleware", "guard", "stack", "order", "jwtGuard", "authGuard"]
importance: "critical"
size: "800 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/architecture/service-layer.md <==
---
purpose: "Copy-paste service template with DI pattern; what goes in service, what doesn't, testing in isolation"
triggers: ["implementing new domain", "code review for service layer", "understanding DI pattern"]
keywords: ["service", "dependency-injection", "tsyringe", "injectable", "template", "testing"]
importance: "critical"
size: "1500 words"
status: "active"
created: "2025-10-20"
updated: "2025-11-27"





---

==> memory-bank/architecture/testing.md <==
---
purpose: "Canonical guide for testing strategies and patterns"
triggers: ["writing tests", "debugging tests"]
keywords: ["testing", "vitest", "mocking", "unit test", "integration test"]
importance: "high"
size: "1300 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/auth/login-flow.md <==
---
purpose: "Complete JWT flow, auth guards, and permission system"
triggers: ["implementing auth", "designing login flow", "debugging permissions"]
keywords: ["JWT", "auth", "policy", "guard", "cookie", "oauth"]
importance: "critical"
size: "700 tokens"
status: "active"
created: "2025-10-20"
updated: "2025-11-27"





---

==> memory-bank/auth/permissions.md <==
---
purpose: "Policy, Statement, PolicyAssignment models; hierarchy with delegation, cascading escalation, permission grants"
triggers: ["adding permissions", "debugging access denied", "cascading on subgroup creation"]
keywords: ["policy", "statement", "assignment", "hierarchy", "delegation", "cascading", "permission", "resource"]
importance: "high"
size: "2000 tokens"
status: "active"
created: "2025-10-20"
updated: "2025-11-27"





---

==> memory-bank/auth/session.md <==
---
purpose: "Explain session management and cookies"
triggers: ["debugging session", "security audit"]
keywords: ["auth", "session", "cookie", "jwt"]
importance: "medium"
size: "200 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/evaluation/guidelines.md <==
---
purpose: "Rules for what counts as points"
triggers: ["creating guidelines", "disputing points"]
keywords: ["evaluation", "guidelines", "rules"]
importance: "nice to know"
size: "150 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/evaluation/scoring.md <==
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

==> memory-bank/evaluation/sheets-integration.md <==
---
purpose: "Explain the sync with Google Sheets"
triggers: ["configuring sheets", "debugging sync"]
keywords: ["evaluation", "sheets", "google", "sync"]
importance: "probably needed"
size: "200 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/external/prisma.md <==
---
purpose: "Guide for Prisma usage"
triggers: ["database migration", "querying"]
keywords: ["prisma", "database", "orm"]
importance: "probably needed"
size: "0 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/external/tanstack-form.md <==
---
purpose: "Guide for TanStack Form usage"
triggers: ["building forms"]
keywords: ["form", "tanstack", "validation"]
importance: "probably needed"
size: "0 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/external/tanstack-query.md <==
---
purpose: "Guide for TanStack Query usage"
triggers: ["fetching data", "caching"]
keywords: ["query", "tanstack", "cache"]
importance: "probably needed"
size: "0 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/external/tanstack-start.md <==
---
purpose: "Guide for TanStack Start usage"
triggers: ["routing", "server actions"]
keywords: ["start", "tanstack", "framework"]
importance: "probably needed"
size: "0 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/external/zod.md <==
---
purpose: "Guide for Zod usage"
triggers: ["validation", "schema definition"]
keywords: ["zod", "validation", "schema"]
importance: "probably needed"
size: "0 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/gotchas/serverfn-responses.md <==
---
purpose: "GOTCHA: serverFn handlers must return json() wrapped responses"
triggers: ["serverFn returns undefined", "middleware chain breaks", "test failures"]
keywords: ["serverFn", "json", "Response", "TanStack", "handler"]
importance: "high"
size: "200 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/group/creation.md <==
---
purpose: "Rules for creating organizations and subgroups"
triggers: ["creating group", "onboarding organization"]
keywords: ["group", "creation", "organization", "subgroup"]
importance: "probably needed"
size: "400 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/group/hierarchy.md <==
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

==> memory-bank/group/roles.md <==
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

==> memory-bank/group/structure.md <==
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

==> memory-bank/membership/management.md <==
---
purpose: "Manage group memberships"
triggers: ["joining group", "leaving group", "approving members"]
keywords: ["membership", "join", "leave", "approval"]
importance: "must know"
size: "200 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/reference/glossary.md <==
---
purpose: "Terminology glossary for pek-infinity architecture, policies, and system design"
triggers: ["confused about terminology", "onboarding new developer", "architectural discussion"]
keywords: ["glossary", "terms", "definitions", "realm", "federation", "hub", "worker-instance", "policy", "cascade", "mvp"]
importance: "low"
size: "800 words"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/rejected/00-rest-endpoints-in-mvp.md <==
---
purpose: "Why REST not chosen for MVP. When REST will be added (worker instances)"
triggers: ["architectural discussion", "comparing REST vs tRPC", "worker planning"]
keywords: ["REST", "tRPC", "API", "resource", "HTTP", "endpoint", "MVP", "worker"]
dependencies: ["architecture/04-routing-aggregation.md", "decisions/00-mvp-vs-worker.md"]
urgency: "medium"
size: "900 words"
sections: ["decision-summary", "why-not-rest-for-mvp", "trpc-advantages", "when-rest-needed", "migration-plan", "comparison-table"]
status: "active"




---


==> memory-bank/rules/auth-enforcement.md <==
---
purpose: "MUST: Auth checks in middleware, not handlers. Error handling, response codes, middleware order critical"
triggers: ["code review for auth", "implementing permission check", "debugging permission bypass"]
keywords: ["auth", "middleware", "enforcement", "handler", "layer", "401", "403"]
importance: "critical"
size: "600 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/rules/domain-structure.md <==
---
purpose: "MUST: Organize code by domain, not technology layer"
triggers: ["creating new feature", "organizing code", "file structure"]
keywords: ["domain", "DDD", "structure", "organization", "colocation"]
importance: "high"
size: "300 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/rules/frontmatter.md <==
---
purpose: "Enforce frontmatter format"
triggers: ["creating documentation", "updating docs"]
keywords: ["frontmatter", "format", "rules"]
importance: "must know"
size: "100 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/rules/group-validation.md <==
---
purpose: "MUST: Validate parent group exists and is not archived. Prevent orphaned groups"
triggers: ["group creation", "group update", "parentId assignment"]
keywords: ["parent", "validation", "archived", "orphan", "hierarchy", "constraint"]
importance: "high"
size: "800 words"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/rules/naming.md <==
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

==> memory-bank/rules/performance.md <==
---
purpose: "MUST: Prevent N+1, cascading queries, and serial awaits. Performance is a feature."
triggers: ["code review", "database design", "implementing list endpoint", "policy logic"]
keywords: ["performance", "N+1", "query", "cascade", "optimization", "redis", "caching"]
importance: "critical"
size: "1500 words"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/rules/schema-validation.md <==
---
purpose: "MUST: Zod schemas satisfy Prisma types. Type safety, prevention of silent bugs"
triggers: ["creating schema", "code review for types", "debugging type mismatch"]
keywords: ["Zod", "schema", "Prisma", "type", "satisfy", "validation", "safety"]
importance: "high"
size: "200 tokens"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/rules/service-purity.md <==
---
purpose: "MUST: Services realm-agnostic for MVP + worker-instance reuse"
triggers: ["implementing service", "code review for service", "adding realm parameter"]
keywords: ["service", "purity", "realm-agnostic", "DI", "reusable", "MVP", "worker-instance"]
importance: "critical"
size: "200 words"
status: "active"
created: "2025-11-27"
updated: "2025-11-27"





---

==> memory-bank/ui-native-design/activity-sheets.md <==
---
purpose: "Specify the activity heatmap sheet design and behavior"
triggers: ["activity sheet", "heatmap", "user activity"]
keywords: ["heatmap", "sheet", "activity", "semester", "sticky"]
importance: "high"
size: "600 words"
status: "active"
created: "2025-12-10"
updated: "2025-12-10"





---

==> memory-bank/ui-native-design/group-profile.md <==
---
purpose: "Document the Group Profile layout and interactions"
triggers: ["group profile", "ui design", "member list"]
keywords: ["group", "profile", "layout", "members", "hierarchy"]
importance: "critical"
size: "1000 words"
status: "active"
created: "2025-12-10"
updated: "2025-12-10"





---

==> memory-bank/ui-native-design/members-and-actions.md <==
---
purpose: "Define member list filtering, sorting, and quick actions"
triggers: ["member list", "filter", "actions"]
keywords: ["members", "filter", "role", "state", "optimistic"]
importance: "high"
size: "800 words"
status: "active"
created: "2025-12-10"
updated: "2025-12-10"





---

==> memory-bank/ui-native-design/shell-navigation.md <==
---
purpose: "Define the app shell and navigation patterns for the native design"
triggers: ["navigation design", "bottom bar", "sheet stack"]
keywords: ["shell", "navigation", "bottom bar", "sheets"]
importance: "critical"
size: "800 words"
status: "active"
created: "2025-12-10"
updated: "2025-12-10"





---

==> memory-bank/ui-native-design/ui-vision.md <==
---
purpose: "Define the design philosophy shift from Bootstrap Admin to Native/Linear"
triggers: ["UI refactor", "design review", "component updates"]
keywords: ["design", "native", "linear", "phonebook", "search-first"]
importance: "critical"
size: "1000 tokens"
status: "active"
created: "2025-12-10"
updated: "2025-12-10"





---

==> memory-bank/ui-native-design/user-profile.md <==
---
purpose: "Document the User Profile layout and interactions"
triggers: ["user profile", "ui design", "contact icons"]
keywords: ["user", "profile", "layout", "contacts", "heatmap"]
importance: "critical"
size: "900 words"
status: "active"
created: "2025-12-10"
updated: "2025-12-10"





---

==> memory-bank/user/profile.md <==
---
purpose: "User and Profile models; single profile in hub across federation, privacy scope restrictions"
triggers: ["implementing user queries", "designing profile access", "handling federated users", "privacy boundaries"]
keywords: ["user", "profile", "federation", "privacy", "scope", "basic-profile", "full-profile", "external-account"]
importance: "high"
size: "500 tokens"
status: "active"
created: "2025-10-20"
updated: "2025-11-27"





---
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
- **DO NOT** add comments that repeat what the code already clearly expresses. These "noise comments" add no value and clutter the codebase.

### Bad Examples
```typescript
// Group ID format: [a-zA-Z]@[a-zA-Z0-9_-]  ← Redundant: regex shows this
export const GroupIdSchema = z.string().regex(/^[a-zA-Z]@[a-zA-Z0-9_-]+$/);
```

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

### 6.1 How to Use the Memory Bank

**Your workflow:**

1. **Read the README** (`Memory-Bank/README.md`) to find your task category and recommended files
2. **Scan loaded frontmatters** for relevance using metadata (purpose, triggers, keywords, dependencies)
3. **Lazily load full files** only when frontmatter indicates relevance to your task
4. **Never assume** architecture, patterns, or decisions without consulting memory first

### 6.2 Common Patterns (Copy From Memory Bank)

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

## 8. Agent Workflow & Memory Updates

### When to Update Memory

**IMMEDIATELY after implementing a feature and all tests pass:**

1. **✅ Feature Implementation Complete**
   - Code is written and working
   - All tests pass (`npm test` or equivalent)
   - No linting errors
   - Feature is ready for PR

2. **✅ Update Memory Bank**
   - Add new patterns to `implementation/` files
   - Document gotchas in `gotchas/` files  
   - Update examples in existing files
   - Add cross-references between related files

3. **✅ Update Frontmatters**
   - Add new `keywords:` for discoverability
   - Update `updated:` timestamp
   - Add new `triggers:` if applicable
   - Update `dependencies:` if new relationships exist

**Why update immediately?**
- **Memory updates are NOT a side task** - they are as or more important than the user task itself
- **Future agents get accurate information** - prevents repeating mistakes
- **Knowledge compounds** - each implementation builds on previous ones
- **Prevents drift** - keeps documentation in sync with code
- **Enables consistency** - all agents follow the same patterns

### Memory Update Checklist

Before submitting PR with new feature:
- [ ] All tests pass
- [ ] Memory bank updated with new patterns
- [ ] Examples in memory bank match implementation
- [ ] Frontmatters updated with new keywords/triggers
- [ ] Cross-references added to related files

---

## 9. Task Planning and Progress

- **Use Todo List**: Use the task/todo list tool to create and manage a todo list for the current task.
- **Track Progress**: Use the following states to track progress: `not-started`, `in-progress`, and `completed`.
