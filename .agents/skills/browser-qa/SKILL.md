---
name: browser-qa
description: End-to-end browser QA, Playwright test conventions, visual inspection, regression testing, and verification.
---

# Skill: Browser QA

Verify the application as a user would, using the available browser and Playwright tooling.

## Workflow
1. Inspect package scripts, installed Playwright version, browser availability, and existing test conventions.
2. Use existing configuration first; do not create a competing test setup.
3. Map acceptance criteria to tests.
4. Test critical navigation, interactions, forms, permissions, and error paths.
5. Inspect desktop and mobile layouts in a real browser; capture screenshots when useful.
6. Review console errors, failed network requests, overflow, focus, and accessibility basics.
7. Fix regressions and rerun affected tests.
8. Record exact commands and results in `.agents/reports/`.

## Rules
- Never claim a test ran if it did not.
- Do not overwrite approved baselines without review.
- Treat screenshot diffs as signals requiring human/agent inspection, not automatic proof of correctness.
- Keep generated traces, videos, and reports scoped; avoid committing bulky transient output unless requested.
- Read `references/` for detailed test strategy.
