# Frontend Engineering Standard

## Default preference
React + TypeScript + Vite, Tailwind CSS, shadcn/ui where useful plus project-specific custom components, React Router, TanStack Query, Axios, React Hook Form + Zod, Zustand only for justified shared client state, Vitest + React Testing Library, and Playwright E2E.

These are defaults, not permission to replace an existing suitable stack. Do not introduce Next.js by default. Rendering preference: SPA, with selective prerendering only for public pages where SEO or initial delivery justifies it.

## Architecture
Use feature-based organization. Keep route composition in the app layer; business logic in feature modules; reusable cross-feature code in shared. Promote a component to shared when it is genuinely reused (normally by at least two features), not speculatively.

Suggested shape, adapt to project scale:
- `src/app/`: router, layouts, guards, providers
- `src/features/<feature>/`: api, components, hooks, services, validation, types, constants, index
- `src/shared/`: reusable components, form controls, feedback, config, hooks, services, utils, types
- `src/styles/`, `src/main.tsx`

Pages should compose feature components and route metadata; avoid burying business logic in route components. Expose intentional feature APIs through public exports. Avoid cross-feature imports into another feature's private internals.

## State and data
- TanStack Query for remote/server state.
- React Hook Form + Zod for forms and schema validation.
- Zustand only for genuinely shared client state.
- Local component state for local UI concerns.
- Derive values rather than duplicating state.
- Do not use `useEffect` + `useState` as a substitute for a server-state cache.
- Type API request and response contracts; align them with backend behavior.

## Components and UX
- One component should have a clear responsibility.
- Consider splitting components above ~200 lines when complexity warrants it; this is a review signal, not a hard limit.
- Provide relevant loading, empty, error, success, disabled, and validation states.
- Use semantic HTML, keyboard-accessible interactions, visible focus, and appropriate labels.
- Use responsive layouts based on content and real device constraints.
- Avoid `any` unless justified and documented.

## API and errors
- Keep API calls in feature API/service modules, not scattered through page components.
- Centralize HTTP configuration and error normalization.
- Handle 401, 403, 404, 409, 422, and 5xx according to product requirements; do not impose redirects/toasts blindly.
- Keep secrets server-side; only expose explicitly public environment variables.

## Assets, metadata, quality
- Use the framework-appropriate image strategy; for Vite, do not use Next.js `next/image`.
- Keep static assets in the project's public/assets convention.
- Define public-page metadata using a lightweight compatible approach when needed; do not add a heavy framework solely for metadata.
- Run the relevant typecheck, lint, unit tests, and build scripts available in the project.
- Do not leave debug logs or unexplained warnings in changed code.
- Use conventional commit prefixes when the repository follows that convention.
