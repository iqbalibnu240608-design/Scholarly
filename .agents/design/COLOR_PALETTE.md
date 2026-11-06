# Color Palette — Blue / White Reference Direction

## Palette intent
Build a coherent palette inspired by the cool blue, indigo, white, and soft lavender tones in the supplied references. The exact final colors must be checked against the existing project branding and current UI before approval.

## Suggested starting tokens
These are starting candidates, not mandatory final values:
- Primary blue: `#356DF3`
- Deep indigo: `#4F46E5`
- Soft lavender: `#EEF0FF`
- Page background: `#F7F8FC`
- Surface / card: `#FFFFFF`
- Primary text: `#111827`
- Secondary text: `#64748B`
- Border: `#E5E7EB`
- Success: `#16A36A`
- Warning: `#D99A22`
- Danger: `#DC4C4C`
- Info: `#3185E8`

## Semantic tokens
Map the chosen values to the project's actual token format:
`background`, `surface`, `surface-elevated`, `text-primary`, `text-secondary`, `text-muted`, `border`, `primary`, `primary-hover`, `primary-subtle`, `secondary`, `accent`, `success`, `warning`, `danger`, and `info`.

## Rules
- Inspect existing CSS variables, Tailwind theme, component tokens, and brand assets before proposing replacements.
- Prefer semantic tokens over hard-coded colors in components.
- Use one primary blue consistently; use indigo/lavender as supporting accents.
- Maintain sufficient contrast for text, icons, controls, and focus indicators.
- Never use color alone to convey status; pair it with text or icons.
- Avoid excessive gradients, neon glow, glassmorphism, and saturated backgrounds.
- If the project already has an approved brand palette, preserve it and harmonize the reference direction rather than replacing it without approval.
- Document final approved HEX values and their usage after owner review.
