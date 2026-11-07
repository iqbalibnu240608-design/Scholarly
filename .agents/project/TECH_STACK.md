# Technology Stack

> Defaults are preferences, not mandates. Inspect the existing repository and confirm compatibility before changing it.

## Preferred defaults
- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- UI: shadcn/ui where useful + custom components
- Routing: React Router
- Server state: TanStack Query
- HTTP: Axios
- Forms: React Hook Form + Zod
- Shared client state: Zustand only when justified
- Unit/component tests: Vitest + React Testing Library
- E2E/browser QA: Playwright
- Rendering: SPA by default; selective prerender for public SEO-sensitive pages when justified
- Backend: Laravel
- Database: MySQL

## Project-specific overrides
- Existing stack:
- Required versions:
- Hosting/deployment:
- Constraints:
- Approved alternatives:

## Decision rule
Do not migrate a working stack just to match defaults. Explain material trade-offs and ask before introducing heavy frameworks or major migrations. Next.js is not the default for this system.
