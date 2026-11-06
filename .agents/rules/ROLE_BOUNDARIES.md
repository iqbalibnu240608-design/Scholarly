# Role Boundaries — Frontend and Backend

## Purpose
This project is developed by separate frontend and backend responsibilities. Each contributor/agent must work only within its assigned responsibility unless the project owner explicitly authorizes a cross-boundary task.

## Frontend responsibility
The frontend role owns:
- UI implementation, page layouts, reusable components, styling, responsive behavior, and accessibility.
- Client-side routing and navigation.
- Client-side form state and validation presentation.
- API integration from the client side using the agreed API contract.
- Loading, empty, error, success, and permission-related UI states.
- Frontend tests, visual checks, and frontend documentation.

The frontend role must NOT:
- Create, modify, or run database migrations.
- Modify backend controllers, models, services, middleware, server routes, or backend business logic.
- Change authentication/authorization implementation on the server.
- Invent API endpoints, request fields, response fields, or status codes.
- Change backend environment variables, server configuration, or deployment infrastructure.
- Bypass missing backend functionality with fake success responses or fabricated production data.

If the API is missing or unclear, record the gap and request a contract/decision from the backend owner. Use mocks only for isolated UI development, label them clearly, and remove or replace them when the real API contract is available.

## Backend responsibility
The backend role owns:
- Server-side routes/endpoints, controllers, services, business logic, validation, and authorization.
- Database schema, migrations, models, relationships, and data integrity.
- API request/response contracts and error semantics.
- Server-side tests, security, logging, and backend documentation.

The backend role must NOT:
- Rewrite frontend pages, styles, components, or client routing.
- Change visual design or frontend state management.
- Make unilateral changes to frontend assumptions without communicating the API contract.
- Return fabricated data as if it were persisted or real.

## Shared contract and integration
Frontend and backend coordinate through documented API contracts. Before integration, agree on:
- Endpoint and HTTP method.
- Authentication requirements and permission rules.
- Request parameters/body and validation rules.
- Response schema and data types.
- Pagination/filter/sort conventions where relevant.
- Error response shape and HTTP status codes.
- Loading, empty, and edge-case behavior expected by the UI.

Store or link the agreed contract in the existing project documentation location. Do not create duplicate competing API specifications.

## Cross-boundary changes
If a task appears to require changes outside the assigned role:
1. Stop before editing the other layer.
2. Explain why the change is needed.
3. Identify the owning role.
4. Propose the exact contract or handoff needed.
5. Wait for owner approval or the responsible role's implementation.

## Working in an existing repository
- Inspect the actual folder structure before deciding which files belong to frontend or backend.
- Do not assume a folder name or framework; verify it.
- Avoid editing shared configuration unless the task clearly belongs to the assigned role and is approved.
- Keep changes focused and report every touched file.
