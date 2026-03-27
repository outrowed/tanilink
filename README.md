# TaniLink Frontend

TaniLink is a frontend-only marketplace and sourcing workflow prototype built with React, Vite, and TypeScript. The app combines ingredient discovery, AI-assisted sourcing, buyer checkout, account management, and seller-side operational tooling on top of seeded JSON resources and browser-persisted local state.

## Product Surface

The current app includes:

- ingredient marketplace browsing and product detail pages
- AI planner and search-driven sourcing flows
- basket review and buyer-only checkout
- buyer account pages for transactions, settings, and inbox
- seller-only hub pages for inventory analytics, routing, and store management

## Stack

- React
- Vite
- TypeScript
- CSS Modules
- Radix UI primitives where used
- Recharts
- Vitest
- pnpm

## Routes

Primary route groups from `src/App.tsx`:

- Public:
  - `/`
  - `/auth`
  - `/marketplace`
  - `/basket`
  - `/products/:slug`
  - `/search`
- Buyer-only:
  - `/checkout`
- Authenticated account:
  - `/account`
  - `/account/transactions`
  - `/account/settings`
  - `/account/inbox`
- Seller-only:
  - `/seller`
  - `/seller/store`
  - `/seller/routing`
  - `/seller/ingredients/:slug`

Compatibility redirects also exist for older paths such as `/catalog` and `/planner`.

## Development

```bash
pnpm install
pnpm dev
```

Available commands:

- `pnpm dev`: start the local development server
- `pnpm dev:host`: expose the dev server on the local network
- `pnpm lint`: run eslint
- `pnpm build`: run the TypeScript build and Vite production build
- `pnpm test`: run the Vitest regression suite
- `pnpm preview`: preview the production build locally

Alias scripts also exist:

- `pnpm start` mirrors `pnpm dev`
- `pnpm build:prod` mirrors `pnpm build`
- `pnpm preview:host` mirrors `pnpm preview --host`

## Data and State

Runtime seed resources are loaded from `public/resources` by `MockDataProvider`:

- `marketplace.json`
- `account.json`
- `auth.json`
- `seller.json`

The app then layers browser-local persistence on top of those resources for:

- authentication session and local sign-up accounts
- selected user location
- basket contents
- buyer-created checkout transactions
- seller-managed store and listing state
- UI preferences such as dismissed preview warnings

The repo is frontend-only. Backend APIs and server-side persistence are not wired yet.

## Layout and UI

The app shell is composed through `AppLayout` and `AppNavbar`, including:

- a dismissible preview warning bar
- a sticky navbar
- a location switcher attached to the navbar shell

Route-level pages use the shared `PageSurface` layout helpers for the standard page background, content width, and sticky sidebar offsets.

## Deployment

GitHub Pages deployment is configured in `.github/workflows/deploy-pages.yml`.

- the workflow builds on pushes to `master`
- the deploy job publishes from `master`
- `dist/index.html` is copied to `dist/404.html` so client-side routes work as an SPA on Pages

## Notes

- Path alias `@` points to `src`
- Marketplace and seller data are intentionally connected, so seller-side listing changes affect buyer-facing product and planner views
- The app opens with a preset seller session by default unless the user has explicitly logged out

## License

This project is licensed under the GNU General Public License v3.0 or later. See [LICENSE](/home/taruna/git/tanilink/LICENSE).
