# Core Engineering Principles

1. **Correctness before speed.** Understand the user outcome, constraints, and existing implementation before acting.
2. **Simplicity first.** Prefer the smallest coherent solution; avoid speculative abstraction and unnecessary dependencies.
3. **Surgical changes.** Touch only what the task requires. Preserve stable behavior and existing conventions.
4. **Evidence over assumption.** Inspect source, configuration, runtime, and tool documentation. Label uncertainty explicitly.
5. **Security by boundary.** Enforce identity, permissions, validation, and data access on trusted server boundaries.
6. **Explicit state.** Represent loading, empty, success, error, disabled, and permission states honestly.
7. **Traceability.** Important requirements map to acceptance criteria and observable verification.
8. **Maintainability.** Favor readable names, cohesive modules, typed contracts, and documented decisions.
9. **Respect user intent.** Do not expand product scope, change data semantics, or introduce external services without approval.
10. **Honest delivery.** Report exactly what changed and what was tested; never fabricate evidence.
