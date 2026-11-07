# Agent Operating System

This folder is the project's working agreement and source of truth for AI-assisted engineering.
Keep project artifacts, reports, diagrams, generated knowledge, and tooling inside `.agents/`.
Do not move or scaffold application code into `.agents/`; respect the repository's existing layout.

## 1. Instruction priority
Apply instructions in this order:
1. Explicit project-owner decisions and approved scope.
2. Current project PRD, requirements, ADRs, and acceptance criteria.
3. This operating system and its rules/skills.
4. Existing codebase conventions and verified tool documentation.
5. Agent assumptions.
If two authoritative artifacts conflict, stop the affected work, record the conflict, and ask only the smallest blocking question. Never silently choose a direction that changes product scope, security, data ownership, or user roles.

## 2. Start-of-task protocol
- Read `rules/core-principles.md`, `rules/karpathy-guidelines.md`, and the relevant project context/requirements.
- Inspect the existing repository before proposing structure or changing code.
- Identify the task mode: discovery/planning, implementation, review, debugging, or release.
- Route to only the skills needed for the task.
- Check installed tool/runtime versions and current project scripts before using commands or adding dependencies.
- Distinguish confirmed facts, assumptions, proposals, and unresolved decisions.

## 3. Clarification budget
Make sensible, reversible assumptions where safe and document them.
Ask no more than three clarification questions in one information-gathering session. Ask only questions that materially block correctness, safety, or product direction. Prefer one concise question at a time; do not re-ask decisions already recorded in project docs.

## 4. Planning and approval gates
- For a new project, first establish problem, target users, actors/roles, outcomes, scope, constraints, and acceptance criteria.
- Map requirements to user journeys, permissions, data, UI states, API contracts, and tests where applicable.
- For role-based systems, define a permission matrix and enforce authorization on the server. Frontend route guards are UX, never the security boundary.
- Mark P0/P1/later and explicit out-of-scope items.
- Do not begin substantial implementation until the owner approves the relevant scope and plan, unless explicitly asked to prototype.
- Record material decisions in an ADR/decision log with status and consequences.

## 5. Implementation principles
- Think before coding; understand the actual problem and existing code.
- Choose the simplest design that satisfies approved requirements.
- Make surgical, task-scoped changes; avoid unrelated refactors, migrations, scaffolding, or dependency additions.
- Preserve existing patterns unless there is evidence they are defective.
- Prefer clear boundaries and feature ownership; avoid cross-feature internal coupling.
- Model loading, empty, success, validation, permission-denied, not-found, and failure states.
- Never fake persistence, API success, loading, permissions, or interactive behavior.
- Do not expose secrets, private files, or privileged data. Validate and authorize on the server.

## 6. Quality and verification
- Trace each important requirement to acceptance criteria and a verification method.
- Run the narrowest relevant checks first, then broader checks when practical.
- Verify build, types, lint, tests, and critical user flows using commands actually present in the repository.
- Do not claim a check passed unless it was run and its result observed.
- If a check cannot run, state why and what remains unverified.
- Review changed files for regressions, dead code, debug output, accessibility, responsive behavior, and security implications.

## 7. Documentation and knowledge
Keep `.agents/` artifacts synchronized with approved implementation changes.
Update requirements, architecture/API/data docs, flows, design decisions, and QA coverage only where affected.
Graphify or other generated knowledge is evidence-backed output, not an authority over source code. Regenerate only with the documented tool and report what was actually generated.
Keep reports concise and include changed files, checks run, outcomes, known gaps, and next action.

## 8. Completion report
Every substantial task ends with:
- Outcome and scope completed.
- Key files changed.
- Verification performed and observed results.
- Unverified areas / known risks.
- Follow-up work or owner decision needed.

## 9. Visual reference and theme rules
- Treat `.agents/assets/design-references/` as visual inspiration only: Novus for landing pages, Flowize AI for SaaS/product overview patterns, and NexaAdmin for admin/data-management patterns.
- The owner's earlier project description is preliminary, not a complete product specification. Never infer the full feature set, roles, or architecture from it or from the reference images.
- Before proposing visual changes, inspect the actual repository's brand assets, CSS variables, Tailwind/theme configuration, fonts, component library, and existing pages.
- Aim for a cohesive blue/indigo + white/cool-neutral visual system, with restrained lavender accents and gradients. Use `.agents/design/COLOR_PALETTE.md` as candidate guidance, not an instruction to overwrite an approved existing brand palette.
- Keep semantic color tokens centralized. Do not scatter arbitrary HEX values through components.
- Match visual patterns to actual page purpose: landing pages, overview screens, and admin/data screens may use different layouts while sharing the same design tokens.
- Do not copy reference logos, exact text, proprietary assets, or pixel-identical layouts.
- During initial setup, audit and document first. Do not rewrite application code, change functionality, add dependencies, or replace the existing brand without owner approval.

## 10. Mandatory role separation
- Follow `.agents/rules/ROLE_BOUNDARIES.md` for every task. Frontend work stays in the frontend layer; backend work stays in the backend layer.
- Frontend owns UI, components, styling, client routing/state, accessibility, frontend tests, and client-side API integration. It does not own database migrations, server routes, controllers, models, backend business logic, or server authorization.
- Backend owns server endpoints, business logic, validation, authentication/authorization implementation, database schema/migrations/models, and backend tests. It does not own frontend UI, styles, components, or client routing.
- Both roles coordinate through an explicit, documented API contract. Never invent endpoints, payloads, response fields, or status codes.
- If a task crosses the assigned role boundary, stop, explain the dependency, propose a handoff, and wait for owner approval.
## 11. Mandatory instruction loading on every task
- At the beginning of EVERY Antigravity task/session, read this `.agents/AGENTS.md`, `.agents/WORKFLOW.md`, relevant `.agents/rules/`, relevant `.agents/skills/`, and applicable project/design/API documents.
- Treat `.agents/` as persistent mandatory project instructions, not optional reference material.
- Before editing, confirm task scope, assigned role, expected files, and any API dependencies.
- Before finishing, review the diff, report changed files, and report only checks actually run.
- Never silently bypass, weaken, or ignore `.agents/` rules. If instructions conflict or are unclear, stop and ask the project owner.

## 12. Git Branching & Push Policy
- Follow `.agents/rules/GIT_BRANCHING_POLICY.md` strictly for all git branches and push operations.
- **`production`**: Contains ONLY core application code (`frontend/`, `backend/`, and essential root files). NEVER push or merge `.agents/` into the `production` branch.
- **`development`**: Main team collaboration branch. Contains all code AND the full `.agents/` instruction suite so teammates who clone the repository can immediately instruct their AI with their assigned role (e.g., Backend-only).
- Always verify your active branch with `git branch --show-current` before running `git push`. Never force-push to `development` or `production`.
