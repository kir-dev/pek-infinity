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

## 7. Task Planning and Progress

- **Use Todo List**: Use the `manage_todo_list` tool to create and manage a todo list for the current task.
- **Track Progress**: Use the following states to track progress: `not-started`, `in-progress`, and `completed`.
