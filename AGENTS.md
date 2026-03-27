# AGENTS.md

## Purpose

This repository is a frontend-only TaniLink application built with React, Vite, TypeScript, CSS Modules, and a small set of Radix-based UI primitives. Use this file as the repo-specific operating guide for agentic AI contributors.

The app is not a generic starter anymore. It already contains:

- a public ingredient Marketplace
- an AI planner and search flow
- basket and buyer checkout
- buyer account pages
- seller analytics, routing, and store management

## Primary Commands

Use `pnpm`.

- `pnpm dev` starts the local app
- `pnpm dev:host` exposes the app on the local network
- `pnpm lint` runs eslint
- `pnpm build` runs the TypeScript build and Vite production build
- `pnpm test` runs the Vitest regression suite
- `pnpm preview` previews the production build

Before finishing non-trivial code changes, run:

```bash
pnpm lint
pnpm build
pnpm test
```

## Repo Map

- `src/pages`: route-level screens
- `src/components/layout`: app shell, navbar, page surface, floating location switcher
- `src/components/shared`: route guards and cross-page helpers
- `src/components/dashboard`: marketplace, seller, analytics, and chart components
- `src/components/ui`: reusable low-level UI primitives
- `src/context`: app-wide state providers
- `src/lib`: domain logic, seed transforms, ranking logic, and formatting helpers
- `src/test`: shared test setup and fixtures
- `public/resources/*.json`: seeded runtime resources loaded by `MockDataProvider`

## App Shell and Layout Rules

### 1. Treat `AppLayout` as the shell owner

`AppLayout` owns the global preview warning bar and mounts the shared navbar. Do not duplicate shell-level warnings or top-level framing in individual pages unless the feature is intentionally page-specific.

### 2. Keep the navbar shell consistent

`AppNavbar` owns:

- Marketplace and Seller Hub entry points
- the global search box
- basket access
- profile menu
- the location switcher attached below the header row

Do not move location or account controls into page-local implementations unless explicitly required.

### 3. Use the shared page surface

For route-level page layout, prefer:

- `PageSurface`
- `PageSection`
- `StickySidebar`

from `src/components/layout/PageSurface.tsx`.

Do not reintroduce duplicated page shell wrappers, page backgrounds, or per-page sticky offsets unless a page truly needs a unique variant.

## Data and State Rules

### 1. Treat `public/resources` as seeded inputs

`MockDataProvider` loads:

- `public/resources/marketplace.json`
- `public/resources/account.json`
- `public/resources/auth.json`
- `public/resources/seller.json`

These are seeded runtime inputs, not writable sources of truth. Do not add logic that writes back into them.

If a feature needs user-created or session-persistent state, store it through an existing provider backed by `localStorage`.

### 2. Reuse existing providers before adding new global state

Current provider composition in `src/App.tsx`:

1. `MockDataProvider`
2. `AuthProvider`
3. `LocationProvider`
4. `SellerProvider`
5. `BasketProvider`
6. `BuyerOrdersProvider`

Before adding another provider, check whether the new state belongs in one of these domains.

### 3. Understand the persistence split

The app combines seeded resources with browser-local state:

- auth session and local accounts
- selected location
- basket contents
- buyer-created transactions
- seller-managed store and listing state
- preview-warning dismissal

Keep that layering intact. Seeded resource data should remain read-only.

### 4. Default auth behavior is intentional

The app currently opens with the preset seller account session by default unless the user has explicitly logged out. Do not change that behavior unless requested.

## Route and Access Rules

Route behavior is intentionally split:

- public: landing, auth, Marketplace, basket, product pages, search
- buyer-only: checkout
- authenticated: account pages
- seller-only: seller hub, seller ingredient detail, seller routing, seller store

Use the existing guards in `src/components/shared`:

- `RequireAuth`
- `RequireBuyer`
- `RequireSeller`

If a flow is buyer-only or seller-only, enforce that both:

- in routing
- in the underlying state mutation path

Do not rely on UI-only hiding for access control.

## High-Risk Areas

### 1. Search planner state

`/search` is stateful. Keep these concerns separate:

- URL-driven state: `q`, `mode`, `category`, `preview`
- local UI state: seller sort mode, quantity inputs, animations, transient banners

Do not reintroduce remount behavior based on the full query string. Changing preview or filters should not wipe planner-local state.

### 2. Buyer order persistence

`BuyerOrdersProvider` layers user-created transactions on top of seeded account transactions. Keep seeded account data read-only and merge persisted buyer orders on top of it.

### 3. Seller overlays affect buyer views

Seller-managed listings and analytics are not isolated from the Marketplace. If you change seller listing structure, routing, pricing, or ranking logic, verify:

- product page seller panels
- search planner seller ranking
- basket snapshots
- buyer checkout line items
- seller hub analytics

## UI and Styling Conventions

### 1. Prefer CSS Modules

This repo uses `.module.css` files as the main styling system. Reuse existing module patterns before introducing another styling approach.

### 2. Reuse existing UI primitives

Before creating a new card, button, or layout pattern, check:

- `src/components/ui`
- `src/components/shared`
- `src/components/dashboard`

If a pattern already exists, extend it instead of duplicating it.

### 3. Preserve current terminology

User-facing copy should use:

- `Marketplace`, not `Catalog`
- `Buyer account` / `Seller account` where role labeling matters

Avoid reintroducing older naming in visible UI text unless explicitly requested.

### 4. Preserve the current visual language

The app already uses:

- warm neutral page surfaces
- rounded cards and soft borders
- a sticky navbar shell with attached location switcher
- chart-heavy marketplace and seller analytics views

Match existing spacing, tone, and structure before inventing a new presentation style.

## Testing Expectations

Use:

- `vitest`
- `@testing-library/react`
- `@testing-library/user-event`

Focus tests on behavior, not snapshots. Prioritize:

- route guard behavior
- query-param state stability
- buyer/seller flow restrictions
- provider mutation behavior
- interaction-heavy screens such as search, basket, checkout, and seller tools

When adding a stateful feature, add at least one regression test if the change affects routing, persistence, or multi-step UI.

## Change Strategy for Agents

When making changes:

1. inspect the existing pattern first
2. reuse the nearest existing abstraction
3. keep modifications scoped
4. validate the affected flows end to end
5. prefer fixing root causes over page-specific overrides

Good examples in this repo:

- shared route guards instead of per-page auth checks
- `PageSurface` instead of duplicated shell CSS
- provider-backed persistence instead of page-local `localStorage` logic

If a change touches layout, auth, routing, or persistence, inspect the provider, route guard, and shared layout layer before editing the page itself. In this repo, the correct fix is often one layer lower than the first symptom.

## Commit Style

Use lowercase conventional commits without scopes.

Examples:

- `feat: add buyer checkout flow`
- `fix: preserve planner state across preview changes`
- `refactor: share page surface across app pages`
- `test: add search planner regression coverage`

Avoid scoped formats such as `feat(search): ...` unless explicitly requested.
