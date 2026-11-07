# Karpathy-Inspired Working Guidelines

Adapted as practical engineering guidance from the publicly referenced `multica-ai/andrej-karpathy-skills` principles. This is an adaptation, not a claim of verbatim or official reproduction.

## Think Before Coding
- Restate the desired outcome and constraints.
- Inspect relevant code and data flow before editing.
- Identify edge cases, failure modes, and the smallest useful change.
- If requirements conflict, surface the conflict before implementation.

## Simplicity First
- Prefer straightforward code and the fewest moving parts.
- Avoid frameworks, abstractions, configuration layers, or dependencies without a demonstrated need.
- Do not optimize hypothetical bottlenecks.

## Surgical Changes
- Keep diffs focused.
- Avoid opportunistic cleanup and unrelated formatting churn.
- Preserve established behavior unless changing it is part of the task.
- Make risky changes in reviewable steps.

## Goal-Driven Execution
- Define observable completion criteria before implementation.
- Work backward from the user-visible outcome.
- Verify with relevant tests or reproducible checks.
- Report blockers and unverified assumptions rather than masking them.
