# AGENTS.md

## Purpose

This repository is a frontend-only TaniLink application built with React, Vite, TypeScript, CSS Modules, and a small set of Radix-based UI primitives. Use this file as the default operating guide for agentic AI contributors working in this codebase.

## Primary Commands

Use `pnpm`.

- `pnpm dev` starts the local app
- `pnpm lint` runs eslint
- `pnpm build` runs the TypeScript build and Vite production build
- `pnpm test` runs the Vitest regression suite

Before finishing non-trivial code changes, run:

```bash
pnpm lint
pnpm build
pnpm test
```

## Repo Map

- `src/pages`: route-level screens
- `src/components/layout`: app shell and shared page-surface layout
- `src/components/shared`: route guards and cross-page UI helpers
- `src/components/dashboard`: marketplace, chart, seller, and analytics components
- `src/components/ui`: low-level reusable UI primitives
- `src/context`: app-wide state providers
- `src/lib`: domain models, data builders, ranking logic, formatting helpers
- `src/test`: test setup and shared fixtures
- `public/resources/*.json`: seed resources loaded at runtime

## Architectural Rules

### 1. Treat `public/resources` as seeded inputs

`MockDataProvider` loads:

- `public/resources/marketplace.json`
- `public/resources/account.json`
- `public/resources/auth.json`
- `public/resources/seller.json`

These files are runtime seed resources. Do not add app logic that writes back into them. If a feature needs user-created or session-persistent state, store it in a context provider backed by `localStorage`, following the existing auth, basket, buyer-order, seller, or location patterns.

### 2. Reuse existing providers before creating new global state

Current app-level providers are composed in `src/App.tsx` in this order:

1. `MockDataProvider`
2. `AuthProvider`
3. `LocationProvider`
4. `SellerProvider`
5. `BasketProvider`
6. `BuyerOrdersProvider`

Before adding another provider, check whether the feature belongs in one of the existing state domains.

### 3. Preserve role boundaries

Route behavior is intentionally split:

- public: landing, auth, marketplace, basket, product, search
- buyer-only: checkout
- authenticated: account pages
- seller-only: seller hub, seller ingredient detail, seller routing, seller store

Use the existing guards in `src/components/shared`:

- `RequireAuth`
- `RequireBuyer`
- `RequireSeller`

Do not bypass buyer/seller restrictions in page logic or provider APIs. If a flow is buyer-only, enforce that both in routing and in the underlying state mutation layer.

### 4. Keep the search planner stable across query-string changes

`/search` is a stateful screen. Keep these concerns separate:

- URL-driven state: `q`, `mode`, `category`, `preview`
- local UI state: seller sort mode, quantity inputs, animation state, transient banners

Do not reintroduce route keying or remount behavior based on the full query string. Changing preview/filter params should not wipe planner-local UI state.

### 5. Use the shared page shell

For route-level page layout, prefer:

- `PageSurface`
- `PageSection`
- `StickySidebar`

from `src/components/layout/PageSurface.tsx`.

Do not copy page shell backgrounds, max-width wrappers, or sticky offsets into each page module unless there is a clear variant reason. Shared layout drift has already caused spacing and sticky regressions in this repo.

## UI and Styling Conventions

### 1. Prefer CSS Modules for page/component styling

This codebase primarily uses `.module.css` files, not inline style systems for feature work. Reuse existing module patterns before adding new styling approaches.

### 2. Reuse UI primitives

Before creating a one-off button/card/layout pattern, check:

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
- sticky navbar with a floating location switch
- chart-heavy marketplace and seller analytics views

Match existing spacing, tone, and component structure before inventing a new presentation style.

## Routing and Page Patterns

Important route structure in `src/App.tsx`:

- `/` -> planner landing
- `/marketplace`
- `/basket`
- `/products/:slug`
- `/search`
- `/checkout` -> buyer-only
- `/account/*` -> authenticated
- `/seller/*` -> seller-only

When adding a new route:

- place it under the correct guard
- keep redirects explicit
- update any related navbar/account/seller navigation entry points

## Data and Domain Guidelines

### 1. Marketplace and seller data are connected

Consumer marketplace views depend on seller-managed listing overlays. If you change seller listing structure or ranking logic, verify:

- product page seller panels
- planner seller ranking
- seller hub analytics
- basket / checkout line-item snapshots

### 2. Buyer orders are persisted separately from seeded account data

`BuyerOrdersProvider` extends seeded account transactions with user-created orders. Keep seeded resource data read-only and merge persisted user-created orders on top of it.

### 3. Default auth behavior is intentional

The app currently opens with the preset seller account session by default unless the user has explicitly logged out. Do not change that behavior unless requested.

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

1. Inspect the existing pattern first
2. Reuse the nearest existing abstraction
3. Keep modifications scoped
4. Validate the affected flows end to end
5. Prefer fixing root causes over adding page-specific overrides

Good examples in this repo:

- shared route guards instead of per-page auth checks
- `PageSurface` instead of duplicated page shell CSS
- provider-backed persistence instead of ad hoc `localStorage` usage inside pages

## Commit Style

Use lowercase conventional commits without scopes.

Examples:

- `feat: add buyer checkout flow`
- `fix: preserve planner state across preview changes`
- `refactor: share page surface across app pages`
- `test: add search planner regression coverage`

Avoid scoped formats such as `feat(search): ...` unless explicitly requested.

## When Unsure

If a change touches layout, auth, routing, or persisted state, inspect the relevant provider, route guard, and shared layout component before editing the page itself. In this repo, the correct fix is often one layer lower than the first symptom.
