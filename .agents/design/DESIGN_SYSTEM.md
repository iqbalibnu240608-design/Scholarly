# Design System — Reference-Aligned Theme

## Goal
Create a consistent visual language inspired by the supplied Novus, Flowize AI, and NexaAdmin references. The goal is visual consistency and quality, not copying their products or assuming the project's functionality.

## Visual principles
1. Blue/indigo foundation with white and cool-neutral surfaces.
2. Clear typography and visual hierarchy.
3. Consistent spacing, borders, radii, and subtle elevation.
4. Restrained gradients and decorative effects.
5. Responsive behavior across mobile, tablet, and desktop.
6. Accessibility and readable contrast.
7. Reusable components and semantic design tokens.

## Reference mapping
- Novus → landing-page composition and premium visual presentation.
- Flowize AI → product overview, metric presentation, and SaaS-style visual hierarchy.
- NexaAdmin → admin/data interfaces, navigation, tables, and charts.

Use only the patterns that suit each real page. Do not turn every page into a dashboard or every section into cards.

## Before changing the design
- Inspect the current repository and identify the existing design system, CSS variables, Tailwind configuration, fonts, UI library, and shared components.
- Identify which visual elements are already consistent and which are not.
- Prepare a proposed token map and list of affected components/pages.
- Preserve existing brand identity unless the owner approves a change.
- Do not modify application code during discovery/setup unless explicitly authorized.

## Tokens to standardize
- Colors: semantic palette in `COLOR_PALETTE.md`.
- Typography: font family, scale, weights, and line heights in `TYPOGRAPHY.md`.
- Spacing: page gutters, section gaps, component padding, and density in `SPACING_SYSTEM.md`.
- Components: buttons, fields, navigation, cards, tables, dialogs, badges, charts, and feedback states in `COMPONENT_GUIDELINES.md`.

## Quality bar
The result should feel like one coherent product, not a collection of unrelated templates. Landing pages can be expressive; operational screens must remain clear, efficient, and readable.
