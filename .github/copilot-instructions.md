# GitHub Copilot Instructions

This document provides a set of rules and guidelines for GitHub Copilot to follow when assisting with development tasks in this repository. The goal is to ensure that Copilot's actions are safe, predictable, and helpful.

---

## 1. Interacting with Terminal Commands

- **Anticipate Interactivity**: When using `run_in_terminal`, be aware that some CLI commands are interactive and will require user input (e.g., `npm init`, `nest generate resource`).
- **Handle Prompts**: If a command prompts for input, present the prompt to the user and ask for the necessary information before proceeding.
- **Avoid Repetition**: Do not repeatedly execute a command that is waiting for input. Instead, analyze the terminal output for prompts and seek clarification from the user.
- **Background Tasks**: For long-running processes like development servers or watch scripts, use the `isBackground: true` option in `run_in_terminal` and inform the user that the task is running in the background.

---

## 2. Asking Clarifying Questions

- **Seek Clarity**: If a request is ambiguous, or if a command requires parameters that have not been provided, ask the user for clarification.
- **Provide Options**: When asking for clarification, provide a list of options whenever possible to make it easier for the user to respond. If a tool is available to ask follow-up questions with options, prefer using it.
- **No Assumptions**: Do not make assumptions about implementation details, command parameters (e.g., `--no-spec`), or desired outcomes.
- **Document Scope Before Creating**: Never generate documents >100 lines without explicit user approval. Ask first: "This could be a 20-line checklist or 500-line guide. Which?" Start small, expand only if requested.

---

## 3. Using Git Tools

- **Absolute Paths**: When using git-related tools, always provide the absolute path to the repository.
- **Confirm Destructive Actions**: Never push changes to a remote repository or perform potentially destructive actions (e.g., `git reset --hard`, force-pushing) without explicit confirmation from the user.

---

## 4. Verifying Results

- **Verify All Actions**: After running a command or editing a file, always verify that the action was successful and produced the expected outcome.
- **Check Command Output**: For terminal commands, inspect the exit code and output to confirm success.
- **Verify File Edits**: After editing a file, use `read_file` to confirm that the changes were applied correctly.
- **Check for Errors**: Use the `get_errors` tool to check for any new errors or warnings introduced by your changes and attempt to fix them.

---

## 5. Handling Failures and User Denials

- **Report Failures**: If a tool call fails or a command returns an error, report the failure to the user, explain what went wrong, and ask how to proceed.
- **Respect User Denials**: If the user denies a requested operation, do not assume any changes were made. Do not retry the operation unless the user asks you to.

---

## 6. Code Formatting and Linting

- **Respect Project Style**: Adhere to the existing coding style and conventions of the project.
- **Use Project Linters**: If the project has configuration files for linters or formatters (like Biome, ESLint, or Prettier), use them to format and lint the code. otherwise fall back to `biome check --fix {path}`
- **Fix Issues**: Run the linter and/or formatter after making changes and before committing to fix any auto-fixable issues.

---

## 7. Using the Memory Bank

The memory bank (`/.github/copilot/Memory-Bank/`) is the **single source of truth** for architectural decisions, patterns, and constraints. Always consult it before making assumptions.

### 7.0 Critical First Step: Load All Frontmatters Into Memory

**At the START of EVERY task, you MUST:**

1. **Read all memory file frontmatters** (first 10 lines of each file)
   ```bash
   head -n 10 .github/copilot/Memory-Bank/**/*.md
   ```
   This takes seconds and loads ~30 files × 10 lines = ~300 lines into context.

2. **Scan for relevance** using metadata:
   - `purpose:` - What this file documents
   - `triggers:` - When to consult it
   - `keywords:` - Search terms
   - `dependencies:` - Related files to check
   - `status:` - active, archived, or deprecated
   - First sentence - Quick summary

3. **Lazily load full files** only if frontmatter indicates relevance to your task

4. **Never assume** architecture, patterns, or decisions without consulting memory first

This approach maximizes context efficiency: you get the "index" of all knowledge immediately, then drill into specifics as needed.

### 7.1 Memory Bank Structure

The memory bank is organized into **5 categories** (31 files, ~42,700 words):

**README.md** - Navigation hub and quick-start by task
**Architecture/**
**Database/**
**Decisions/**
**Implementation/**
**Rules/** - **MUST FOLLOW BEFORE ANY PR**
**Gotchas/** - Learn from mistakes
**Rejected/** - Why certain approaches aren't used
**Reference/**

### 7.2 How to Use the Memory Bank

**Before starting ANY task:**

1. **Read the README** (`Memory-Bank/README.md`)
   - Find your task category (implementing feature, debugging, designing)
   - Follow the recommended file reading order

2. **Consult relevant files** (lazy-load strategy)
   - Use `head -n 15` on files to read frontmatter
   - Frontmatter includes: purpose, triggers, keywords, dependencies
   - Load full content only if relevant

3. **Example: Implementing a new domain (Group)**
   ```
   Step 1: Read Memory-Bank/README.md
   → "I'm implementing a new domain feature"
   → Follow recommended files:
   
   Step 2: Read implementation/00-service-layer.md (template)
   Step 3: Read implementation/01-trpc-procedures.md (pattern)
   Step 4: Read implementation/02-serverfn-routing.md (pattern)
   Step 5: Read rules/ files (validation checklist)
   Step 6: Check gotchas/00-common-mistakes.md (catch mistakes early)
   ```

4. **Example: Debugging permissions issue**
   ```
   Step 1: Check gotchas/00-common-mistakes.md
   → Most permission bugs are in this list
   
   Step 2: Read rules/01-auth-enforcement.md
   → Verify middleware order is correct
   
   Step 3: Read architecture/01-auth-system.md
   → Understand policy snapshots and caching
   
   Step 4: Check reference/00-request-flows.md
   → Trace request through system
   ```

### 7.4 Common Patterns (Copy From Memory Bank)

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

## 8. Saving Agent Memory (All Tools)

Even if you're using Copilot, Claude Code, Cursor, Gemini CLI, or another AI agent, **you MUST persist learnings between sessions** by updating memory bank files.

### When to Save Memory

After every session, update the memory bank if:
- ✅ You learned new architectural patterns or conventions
- ✅ You received user feedback or corrections
- ✅ You discovered antipatterns or "smells"
- ✅ You solved a complex problem with reusable patterns
- ✅ You clarified ambiguous requirements
- ✅ **You received explicit corrections from the user (fix immediately, don't wait until end of session)**

### Memory Update Checklist

Before ending a session, verify:
- [ ] Did I document any NEW patterns or decisions?
- [ ] Did I receive feedback that should update existing memory?
- [ ] Did I discover antipatterns or "gotchas" worth recording?
- [ ] Did I update the `updated:` timestamp?
- [ ] Did I add cross-references to related files?
- [ ] Did I fix any inaccurate or outdated information in memory?

### Correcting Memory Immediately

**If the user corrects you about architecture, scope, or documented patterns:**
1. Acknowledge the correction
2. Update the relevant memory bank files immediately
3. Do NOT wait until end of session
4. Update all cross-references to reflect the correction
5. Update frontmatter `updated:` timestamp

**Example:**
- User: "tRPC is Year 2+, not MVP"
- Action: Update `implementation/01-trpc-procedures.md` immediately with status and cross-references
- Result: Future agents get accurate information

**Failure to do this breaks continuity for all future sessions and agents.**

---

## 9. Task Planning and Progress

- **Use Todo List**: Use the `manage_todo_list` tool to create and manage a todo list for the current task.
- **Track Progress**: Use the following states to track progress: `not-started`, `in-progress`, and `completed`.
