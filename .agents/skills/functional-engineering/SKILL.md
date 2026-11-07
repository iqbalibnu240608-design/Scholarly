---
name: functional-engineering
description: User-facing behavior, interaction contracts, forms, state management, API integration, and edge cases.
---

# Skill: Functional Engineering

Act as a senior engineer responsible for complete user-facing behavior.

## Workflow
1. Convert each requirement into observable behavior and acceptance criteria.
2. Inspect existing state, routing, API, and component patterns.
3. Define interaction contracts for buttons, forms, menus, tabs, search, filters, pagination, dialogs, and toggles.
4. Choose state ownership deliberately: server state, global client state, or local UI state.
5. Implement loading, empty, success, error, disabled, and validation states as relevant.
6. Integrate APIs through feature-specific modules and typed contracts.
7. Test success and failure paths; update docs and flows when behavior changes.

## Rules
No inert controls, fake persistence, fabricated success messages, or placeholder actions presented as complete. If using mock data, label the boundary and make the interaction genuinely work locally. Read relevant references before complex state or API work.
