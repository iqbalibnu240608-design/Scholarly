# Backend Engineering Standard — Laravel + MySQL

This is the proposed reusable backend standard for this agent system. It is not sourced from the uploaded company frontend SOP. Adapt it to the installed Laravel version and existing repository conventions.

## Application design
- Keep controllers focused on HTTP orchestration: authorize, validate, call domain/application behavior, return a response.
- Use Form Requests for request validation when appropriate.
- Use Policies/Gates or explicit authorization for protected operations. Never rely only on frontend route guards.
- Use Eloquent relationships and eager loading to avoid N+1 queries.
- Use transactions when multiple writes must succeed or fail together.
- Use Services/Actions only when they clarify reusable or substantial business behavior; avoid creating layers for trivial CRUD.
- Use API Resources or a consistent response contract.
- Paginate potentially large collections and validate sorting/filter inputs.
- Use migrations for schema changes; avoid manual-only production schema edits.
- Add indexes based on query patterns and constraints, not guesswork.

## Security
- Validate all untrusted input.
- Enforce authorization on every protected resource/action.
- Protect mass assignment; define fillable/guarded intentionally.
- Hash passwords using framework facilities.
- Keep secrets in environment/config; never commit credentials.
- Avoid returning internal exception details or sensitive fields.
- Consider rate limiting, CSRF/CORS, file upload validation, and auditability where relevant.
- Use least privilege for database and service credentials.

## API behavior
- Define stable routes, methods, status codes, validation errors, pagination, and resource shapes.
- Keep frontend API contracts synchronized with backend implementation.
- Use consistent error handling and meaningful HTTP status codes.
- Avoid leaking database implementation details in public responses.

## Testing
- Feature-test authorization, validation, success, failure, and important edge cases.
- Unit-test complex domain rules.
- Use factories/seeders for deterministic test data.
- Test database constraints and transaction-sensitive behavior where practical.
- Do not claim tests passed unless they were executed.
