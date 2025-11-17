---
file: README.md
purpose: "Memory bank navigation hub, index for all agent knowledge, and agent workflow instructions"
triggers: ["starting new session", "unsure where to find information", "implementing features", "updating memory"]
keywords: ["index", "navigation", "guide", "memory", "agent workflow", "memory updates"]
status: "active"
version: "1.0"
created: 2025-10-22
mvp-scope: "reference"
phase: "All phases"
updated: "2025-11-17"
---

# PÉK Infinity Memory Bank

This memory bank documents architectural decisions, implementation patterns, validation rules, and gotchas for the pek-infinity full-stack application. It's designed for intelligent lazy-loading by agents: only frontmatters are loaded initially; content is loaded on-demand based on task context.

## 🚀 Start Here

**New to this codebase?** → Read `00-SYNTHETIC-MEMORY.md` first for the big picture (5-minute read)

**Working on MVP tasks?** → Look for files marked `mvp-scope: "current"` in frontmatter
**Planning future features?** → Look for files marked `mvp-scope: "future"` in frontmatter

## Quick Start by Task

**I'm implementing a new domain feature (MVP):**
1. `00-SYNTHETIC-MEMORY.md` (big picture overview)
2. `implementation/00-service-layer.md` (service template)
3. `implementation/02-serverfn-routing.md` (MVP routing pattern) ⭐
4. `implementation/04-domain-structure.md` (file organization)
5. `rules/` (validation checks before PR)

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
1. `00-SYNTHETIC-MEMORY.md` (⭐ START HERE - ultra-concise overview)
2. `architecture/00-federation-model.md` (why hub + worker-instance)
3. `decisions/00-mvp-vs-worker-instance.md` (what's in MVP vs later)
4. `decisions/01-future-roadmap.md` (detailed future plans)

**I'm questioning a design decision:**
1. `decisions/` (why we chose this)
2. `rejected/` (alternatives and why they were rejected)

**I'm planning future federation work:**
1. `decisions/01-future-roadmap.md` (detailed timeline and phases)
2. `architecture/00-federation-model.md` (federation architecture)
3. `implementation/01-trpc-procedures.md` (future tRPC patterns)

## File Index with Summaries

### Core Documents

| File | Purpose | MVP Scope | Size |
|------|---------|-----------|------|
| `00-SYNTHETIC-MEMORY.md` | ⭐ Ultra-concise big picture overview | Reference | 500w |
| `README.md` | This file - navigation and index | Reference | - |

### Architecture (Why things are designed this way)

| File | Purpose | MVP Scope | Size |
|------|---------|-----------|------|
| `00-federation-model.md` | Hub + worker instances, BFF routing | Future | 1500w |
| `01-auth-system.md` | JWT, policy snapshots, caching strategy | Current | 2500w |
| `02-service-patterns.md` | Service layer, realm-agnostic design | Current | 2000w |
| `03-middleware-layering.md` | MVP vs worker-instance middleware stacks | Future | 1500w |
| `04-routing-aggregation.md` | serverFn routing and response combining | Future | 1500w |

### Database (Schema, models, relationships)

| File | Purpose | MVP Scope | Size |
|------|---------|-----------|------|
| `00-realm-model.md` | Realm concept, realmId fields, constraints | Current | 1500w |
| `01-policy-system.md` | Policy hierarchy, statements, audit trail | Current | 2000w |
| `02-group-hierarchy.md` | Group structure, cascading escalation | Current | 1500w |
| `03-user-profile-federation.md` | User profiles, federation considerations | Future | 1200w |

### Decisions (What we chose and why)

| File | Purpose | MVP Scope | Size |
|------|---------|-----------|------|
| `00-mvp-vs-worker-instance.md` | Feature matrix, scope, timeline | Future | 2000w |
| `01-future-roadmap.md` | ⭐ Detailed future plans and timeline | Future | 2500w |

### Implementation (Copy-paste templates and patterns)

| File | Purpose | MVP Scope | Size |
|------|---------|-----------|------|
| `00-service-layer.md` | Service template, DI pattern | Current | 1500w |
| `01-trpc-procedures.md` | ⚠️ Future: Procedure template, validation | Future | 2000w |
| `02-serverfn-routing.md` | ⭐ MVP: serverFn + routing pattern | Current | 2000w |
| `03-auth-guards.md` | Auth middleware implementations | Current | 1500w |
| `04-domain-structure.md` | File organization and exports | Current | 1000w |

### Rules (Must-follow enforcement rules)

| File | Purpose | MVP Scope | Enforcement |
|------|---------|-----------|-------------|
| `00-realm-isolation.md` | Filter all queries by realmId | Current | MUST |
| `01-auth-enforcement.md` | Auth in middleware, not handler | Current | MUST |
| `02-service-purity.md` | Services don't know realm | Current | MUST |
| `03-schema-validation.md` | Zod schemas satisfy Prisma | Current | MUST |
| `04-parent-validation.md` | Parent can't be archived | Current | MUST |

### Gotchas (What can go wrong and why)

| File | Purpose | MVP Scope | Severity |
|------|---------|-----------|----------|
| `00-common-mistakes.md` | Patterns agents often violate | Current | HIGH |
| `01-migration-blockers.md` | What breaks if rules violated | Current | CRITICAL |
| `02-performance-gotchas.md` | Optimization warnings | Current | MEDIUM |

### Rejected (Patterns we considered and rejected)

| File | Purpose | MVP Scope | Status |
|------|---------|-----------|--------|
| `00-rest-endpoints-in-mvp.md` | Why tRPC not REST now | Future | Archived |
| `01-service-realm-awareness.md` | Why services don't know realm | Future | Archived |

### Reference (Visual guides, examples, glossary)

| File | Purpose | MVP Scope | Type |
|------|---------|-----------|------|
| `00-request-flows.md` | ASCII diagrams of request paths | Future | Diagrams |
| `01-er-diagram.md` | Database entity relationships | Future | Diagrams |
| `02-policy-examples.md` | Real-world policy hierarchies | Future | Examples |
| `03-glossary.md` | Terminology and definitions | Current | Reference |
| `04-quick-reference.md` | One-page summary and checklist | Current | Cheat sheet |

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
status: "active|archived|deprecated"
mvp-scope: "current|future|mixed|reference"
phase: "MVP 1.0|Phase 1|Phase 2+|All phases"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
---
```

**New in v1.1:**
- `mvp-scope`: Indicates whether content is relevant for current MVP work (`current`), future federation (`future`), both (`mixed`), or always relevant (`reference`)
- `phase`: Maps to roadmap phases (see `decisions/01-future-roadmap.md`)

**Fields with special meaning:**
- `mvp-scope: "current"` → Implement these patterns NOW for MVP
- `mvp-scope: "future"` → Reference for understanding, implement in Phase 1+
- `mvp-scope: "mixed"` → Parts relevant now, parts for later (read carefully)
- `phase` → Aligns with `decisions/01-future-roadmap.md` timeline

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

## Agent Workflow & Memory Updates

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

## Maintenance

- **Update frequency**: High. As new patterns emerge, add to `gotchas/00-common-mistakes.md`
- **Archival**: When a decision is reversed, mark file `status: archived` with rejection reason
- **Cross-references**: Always update related files when major changes occur
- **Size targets**: Keep individual files under 3000 words for readability
