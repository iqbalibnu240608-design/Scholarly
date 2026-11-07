# Mandatory Agent Workflow

These instructions apply to every Antigravity task in this repository.

## Start of every task/session
1. Read `.agents/AGENTS.md` completely.
2. Read relevant `.agents/rules/` files and applicable `.agents/skills/` instructions.
3. Read the relevant project context, architecture, design, API contract, and flow documents.
4. Identify the assigned role (frontend or backend) and the requested task scope.
5. Inspect the current repository state before editing. Do not rely on old assumptions.

## Before implementation
1. Restate the requested outcome and scope.
2. List the files/layers expected to change.
3. Check that each change belongs to the assigned role.
4. Identify missing requirements or API contract details.
5. If the task crosses role boundaries or conflicts with existing rules, stop and ask for clarification/approval.
6. Make a small implementation plan before editing.

## During implementation
- Follow `.agents/AGENTS.md`, rules, skills, project docs, and design tokens.
- Treat these documents as persistent project instructions, not optional suggestions.
- Do not bypass a rule because a shortcut is faster.
- Do not silently change scope, stack, dependencies, architecture, API contract, or business behavior.
- Keep changes minimal and focused.
- Never claim a test, build, or integration passed unless it was actually run and its result observed.

## Before finishing every task
1. Review the diff and list changed files.
2. Run relevant checks that are available and safe for the assigned role.
3. Report checks run and their actual results; distinguish not-run from failed.
4. Note API dependencies, blockers, assumptions, and handoffs to the other role.
5. Confirm that no out-of-scope backend/frontend files were changed.
6. Verify active git branch with `git branch --show-current` before pushing; never push `.agents/` to `production` (follow `.agents/rules/GIT_BRANCHING_POLICY.md`).

## Conflict handling
If user instructions, repository state, and `.agents/` rules conflict:
- Do not silently choose an interpretation.
- Explain the conflict and ask the owner which instruction should take precedence.
- Never ignore `.agents/` instructions without explicit owner approval.

## No automatic permission escalation
Reading `.agents/` does not authorize broad refactors or edits. Follow the requested scope and wait for approval for additional work.
