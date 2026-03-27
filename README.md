# TaniLink Frontend

Frontend-only mockup starter built with the current Vite + React + TypeScript stack, using CSS Modules for app styling and a small set of Radix-based UI primitives where needed.

## Stack

- Vite
- React
- TypeScript
- CSS Modules
- Radix UI primitives
- Vitest
- pnpm

## Development

```bash
pnpm install
pnpm dev
```

To preview from another device on the same network:

```bash
pnpm dev:host
```

## Quality Checks

```bash
pnpm lint
pnpm build
pnpm test
```

To preview the production build locally:

```bash
pnpm build
pnpm preview
```

## Notes

- This project is set up for UI prototyping and mockups.
- Backend integration is not wired yet.
- Path alias `@` points to `src`.
