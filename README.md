# Next 15 Atomic Scaffold

> NOTE: Using `next@canary` placeholder until 15.5 stable is published.

## Features

- App Router (`app/` directory) with Server Components
- Atomic Design folders (atoms, molecules, organisms, templates, sections)
- Redux Toolkit store with example slice
- TypeScript strict configuration with path aliases
- Turbopack dev script: `yarn dev`

## Scripts

- `dev` - Run development server with Turbopack
- `build` - Production build
- `start` - Start built app
- `lint` - ESLint
- `test` - Placeholder

## Path Aliases

Configured in `tsconfig.json` for atomic layers and shared utilities.

## Next Steps

- Install dependencies: `yarn install`
- Add real tests (Jest / React Testing Library)
- Expand slices and features as needed

## Atomic Design

Each layer increases complexity/abstraction. Sections compose templates + organisms for page segments.

## Redux Usage

Wraps App in `StoreProvider` (client component) from `layout.tsx`.

## Server Components

`app/page.tsx` demonstrates async data fetch (`getTime`).
