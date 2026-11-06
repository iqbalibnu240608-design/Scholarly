# Project Documentation Standard

Keep documentation in `.agents/`. Update documents when their contracts or decisions change; avoid duplicating the same information across files.

- `project/`: goals, scope, requirements, features, acceptance criteria, tasks, stack.
- `design/`: project-specific visual language and interaction rules.
- `architecture/`: system boundaries, frontend/backend design, data model, API contracts, ADRs.
- `flows/`: user, business, system, and exception flows plus FigJam source/link.
- `knowledge/`: codebase knowledge and Graphify output.
- `qa/`: test configuration, cases, and generated test artefacts.
- `reports/`: implementation, review, QA, and final reports.

For each non-trivial feature, document purpose, roles, route/API, states, permissions, validation, error behavior, dependencies, acceptance criteria, and test coverage as relevant.

Record decisions with date, context, options, decision, and consequences in `architecture/ADR/` when the decision is significant.

Do not commit secrets, personal data, raw production dumps, or unnecessarily large transient test artefacts.
