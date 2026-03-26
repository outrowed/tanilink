# TaniLink Frontend

Frontend-only mockup starter built with the current Vite + React + TypeScript stack, styled with Tailwind CSS and configured for shadcn/ui components.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS v4
- shadcn/ui
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
```

To preview the production build locally:

```bash
pnpm build
pnpm preview
```

## Notes

- This project is set up for UI prototyping and mockups.
- Backend integration is not wired yet.
- shadcn/ui aliases are configured through `components.json`.
- Path alias `@` points to `src`.
