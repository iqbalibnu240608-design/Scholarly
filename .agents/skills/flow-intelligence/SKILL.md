---
name: flow-intelligence
description: Business process mapping, user journey flows, decision trees, exception paths, and FigJam diagrams.
---

# Skill: Flow Intelligence

Analyze and communicate how users, business processes, and software systems move through a feature.

## Workflow
1. Identify actors, goals, entry points, preconditions, and outcomes.
2. Map the happy path.
3. Add decisions with explicit branch labels and conditions.
4. Add alternate paths, cancellation, retries, validation failures, authorization failures, timeouts, and other relevant exceptions.
5. Distinguish user actions, system processes, external services, and data stores.
6. Validate that each path reaches a meaningful terminal state and that no connector is ambiguous.
7. Save editable/source documentation under `.agents/flows/`.
8. If Figma/FigJam MCP is available, create or update native editable FigJam objects and record the actual board URL and sections in `flows/figma/FIGMA_BOARD.md`.

## FigJam requirements
- Prefer one master board per project, organized into sections.
- Diagram must use readable labels, consistent shapes, clear direction, labeled branches, grouping, and uncluttered connectors.
- Create native editable nodes/connectors—not only an exported image—when the connected tool supports it.
- Mermaid may be maintained as text source, but is not a substitute for native FigJam objects.
- Verify the created board and link. If the tool is unavailable, produce diagram source and state that FigJam creation remains pending.

Read relevant references for diagram type and validation.
