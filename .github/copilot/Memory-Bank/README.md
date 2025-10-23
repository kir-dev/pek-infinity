---
file: README.md
purpose: "Memory bank navigation hub and index for all agent knowledge"
triggers: ["starting new session", "unsure where to find information"]
keywords: ["index", "navigation", "guide", "memory"]
status: "active"
version: "1.0"




---

# PÉK Infinity Memory Bank

This memory bank documents architectural decisions, implementation patterns, validation rules, and gotchas for the pek-infinity full-stack application. It's designed for intelligent lazy-loading by agents: only frontmatters are loaded initially; content is loaded on-demand based on task context.

## Quick Start by Task

**I'm implementing a new domain feature:**
1. `implementation/00-service-layer.md` (template)
2. `implementation/01-trpc-procedures.md` (template)
3. `implementation/02-serverfn-routing.md` (template)
4. `rules/` (validation checks before PR)

**I'm debugging permissions or auth:**
1. `architecture/01-auth-system.md` (understand the flow)
2. `rules/00-realm-isolation.md` (check for data leakage)
3. `rules/01-auth-enforcement.md` (check auth placement)
4. `gotchas/00-common-mistakes.md` (common permission bugs)

**I'm adding a database query:**
1. `database/00-realm-model.md` (must filter by realmId)
2. `rules/00-realm-isolation.md` (enforcement)
3. `gotchas/00-common-mistakes.md` (what breaks)

**I need to understand the big picture:**
1. `architecture/00-federation-model.md` (why hub + worker-instance)
2. `architecture/01-auth-system.md` (auth flow)
3. `decisions/00-mvp-vs-worker-instance.md` (what's in MVP vs later)
4. `reference/00-request-flows.md` (visual flows)

**I'm questioning a design decision:**
1. `decisions/` (why we chose this)
2. `rejected/` (alternatives and why they were rejected)

## File Index with Summaries

### Architecture (Why things are designed this way)

| File | Purpose | Size |
|------|---------|------|
| `00-federation-model.md` | Hub + worker instances, BFF routing | 1500w |
| `01-auth-system.md` | JWT, policy snapshots, caching strategy | 2500w |
| `02-service-patterns.md` | Service layer, realm-agnostic design | 2000w |
| `03-middleware-layering.md` | MVP vs worker-instance middleware stacks | 1500w |
| `04-routing-aggregation.md` | serverFn routing and response combining | 1500w |

### Database (Schema, models, relationships)

| File | Purpose | Size |
|------|---------|------|
| `00-realm-model.md` | Realm concept, realmId fields, constraints | 1500w |
| `01-policy-system.md` | Policy hierarchy, statements, audit trail | 2000w |
| `02-group-hierarchy.md` | Group structure, cascading escalation | 1500w |
| `03-user-profile-federation.md` | User profiles, federation considerations | 1200w |

### Decisions (What we chose and why)

| File | Purpose | Size |
|------|---------|------|
| `00-mvp-vs-worker-instance.md` | Feature matrix, scope, timeline | 2000w |
| `01-why-trpc-over-rest.md` | tRPC vs REST trade-offs | 1500w |
| `02-why-colocate-domains.md` | Single file per domain concept | 1200w |
| `03-why-services-are-realm-agnostic.md` | Service design principle | 1500w |

### Implementation (Copy-paste templates and patterns)

| File | Purpose | Size |
|------|---------|------|
| `00-service-layer.md` | Service template, DI pattern | 1500w |
| `01-trpc-procedures.md` | Procedure template, validation | 2000w |
| `02-serverfn-routing.md` | serverFn + routing pattern | 2000w |
| `03-auth-guards.md` | Auth middleware implementations | 1500w |
| `04-domain-structure.md` | File organization and exports | 1000w |

### Rules (Must-follow enforcement rules)

| File | Purpose | Enforcement |
|------|---------|-------------|
| `00-realm-isolation.md` | Filter all queries by realmId | MUST |
| `01-auth-enforcement.md` | Auth in middleware, not handler | MUST |
| `02-service-layer-purity.md` | Services don't know realm | MUST |
| `03-schema-validation.md` | Zod schemas satisfy Prisma | MUST |
| `04-parent-group-validation.md` | Parent can't be archived | MUST |

### Gotchas (What can go wrong and why)

| File | Purpose | Severity |
|------|---------|----------|
| `00-common-mistakes.md` | Patterns agents often violate | HIGH |
| `01-migration-blockers.md` | What breaks if rules violated | CRITICAL |
| `02-performance-gotchas.md` | Optimization warnings | MEDIUM |

### Rejected (Patterns we considered and rejected)

| File | Purpose | Status |
|------|---------|--------|
| `00-rest-endpoints-in-mvp.md` | Why tRPC not REST now | Archived |
| `01-service-realm-awareness.md` | Why services don't know realm | Archived |
| `02-auth-in-handler.md` | Why middleware not handler | Archived |

### Reference (Visual guides, examples, glossary)

| File | Purpose | Type |
|------|---------|------|
| `00-request-flows.md` | ASCII diagrams of request paths | Diagrams |
| `01-er-diagram.md` | Database entity relationships | Diagrams |
| `02-policy-examples.md` | Real-world policy hierarchies | Examples |
| `03-glossary.md` | Terminology and definitions | Reference |
| `04-quick-reference.md` | One-page summary and checklist | Cheat sheet |

## Frontmatter Format

Every file starts with YAML frontmatter designed for lazy-loading:

```yaml
---
file: path/to/file.md
purpose: "One-line summary of what this file teaches"
triggers: ["when you need this", "what problem it solves"]
keywords: ["searchable", "terms", "here"]
dependencies: ["other/files/to/read/first.md"]
urgency: "critical|high|medium|low"
size: "word count"
status: "active|archived"




---
```

Fields with extra blank lines below them are extensible for agent customization.

## Loading Strategy for Agents

1. **Frontmatter scan** (10-20 seconds)
   - Agent reads all `head -n 15` from all files
   - Builds map of: problem → solution files

2. **Dependency resolution** (automatic)
   - Agent checks `dependencies` field
   - Loads prerequisites first

3. **Content loading** (on-demand)
   - Agent loads full files only when needed
   - Respects `urgency` if token budget is tight

4. **Session persistence**
   - Agents can reference files by `file:` path
   - Later sessions load same structure

## Maintenance

- **Update frequency**: High. As new patterns emerge, add to `gotchas/00-common-mistakes.md`
- **Archival**: When a decision is reversed, mark file `status: archived` with rejection reason
- **Cross-references**: Always update related files when major changes occur
- **Size targets**: Keep individual files under 3000 words for readability

---

**Last updated**: 2025-10-20
**Version**: 1.0
**Maintained by**: Architecture team
