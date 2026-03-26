# Page Overview

This document summarizes the page-level flow of the application and links directly to the page components under [pages](src/pages).

## Public Pages

### [`PlannerLanding.tsx`](src/pages/PlannerLanding.tsx) (`/`)

The homepage is the AI-first landing experience. Its purpose is to help users start with an intent such as a dish, menu, or supply bundle instead of forcing them to browse ingredients manually. Functionally, it centers the shared search box, uses the current selected user location to personalize the messaging, and acts as the main entry point into either marketplace search or AI-assisted planning.

### [`SearchPlanner.tsx`](src/pages/SearchPlanner.tsx) (`/search`)

This page is the unified search results surface for both normal marketplace search and AI planning. Its purpose is to let users search directly for ingredients while also being able to expand compatible queries into multi-ingredient planning workflows. Functionally, it reads query parameters from the URL, shows marketplace matches, optionally activates an AI bundle plan, lets users preview ingredient detail from the right side, sorts sellers, and allows direct basket additions from the seller panel.

### [`Dashboard.tsx`](src/pages/Dashboard.tsx) (`/marketplace`)

This page is the ingredient marketplace browser. Its purpose is to give users a catalog-style view of all market-tracked ingredients so they can filter, compare, and open more detailed product pages. Functionally, it responds to query-string search and category filters, renders product cards from the marketplace data layer, and routes each card into the corresponding product detail page.

### [`ProductPage.tsx`](src/pages/ProductPage.tsx) (`/products/:slug`)

This is the detailed ingredient page for buyers. Its purpose is to show the market view of a single ingredient, including price behavior and seller recommendations for the user’s selected location. Functionally, it presents the interactive price chart, highlights the best seller candidate, lets users sort sellers by smart match, distance, price, or rating, and supports quantity selection plus basket addition for each seller offer.

### [`BasketPage.tsx`](src/pages/BasketPage.tsx) (`/basket`)

This page is the buyer basket review screen. Its purpose is to consolidate selected ingredient lines before any future checkout flow and let users compare seller choices in one place. Functionally, it lists basket lines, supports quantity changes and item removal, computes summary values such as subtotal and seller count, and provides clear paths back to the marketplace or homepage when the basket is empty.

### [`AuthPage.tsx`](src/pages/AuthPage.tsx) (`/auth`)

This page is the shared sign-in and sign-up gateway. Its purpose is to authenticate both buyer and seller users and route them into the correct protected areas of the application. Functionally, it supports login and account creation modes, displays preset demo accounts for fast access, handles redirect targets from protected routes, and transitions authenticated users into the account area automatically.

## Buyer Account Pages

### [`AccountPage.tsx`](src/pages/AccountPage.tsx) (`/account`)

This page is the buyer account hub and the main protected landing screen after authentication. Its purpose is to centralize user identity, recent account-level metrics, and navigation into the rest of the account tools. Functionally, it shows account summary cards, links into transactions, settings, and inbox, and for seller-role users it also exposes a condensed seller-hub summary and entry points into seller tools.

### [`AccountTransactionsPage.tsx`](src/pages/AccountTransactionsPage.tsx) (`/account/transactions`)

This page is the order history and delivery tracking screen. Its purpose is to let users inspect their purchase history and understand the delivery progress of each order in more detail. Functionally, it filters transactions by status, keeps a selected transaction in focus, shows order items and totals, and renders a delivery timeline with granular state updates.

### [`AccountSettingsPage.tsx`](src/pages/AccountSettingsPage.tsx) (`/account/settings`)

This page is the account management surface. Its purpose is to gather static account configuration controls into one screen so the application has a clear settings destination even before deeper account-management flows exist. Functionally, it renders grouped settings sections, presents placeholder action buttons for future controls, and includes a direct logout action for ending the current session.

### [`AccountInboxPage.tsx`](src/pages/AccountInboxPage.tsx) (`/account/inbox`)

This page is the account messaging and support inbox. Its purpose is to centralize seller updates and support communication into a single reviewable interface. Functionally, it shows a conversation list, keeps one thread selected at a time, renders read-only message history, highlights unread states, and includes a disabled reply composer to indicate future chat behavior.

## Seller Pages

### [`SellerHubPage.tsx`](src/pages/SellerHubPage.tsx) (`/seller`)

This page is the seller analytics hub. Its purpose is to give store owners a store-level view of ingredient performance before they drill into specific listings. Functionally, it shows top-level KPIs, supports status/category/stock filtering, renders listing-level analytics cards, keeps filtered averages in the aside, exposes a statistics guide dialog, and routes sellers deeper into ingredient detail, routing, and store setup workflows.

### [`SellerStorePage.tsx`](src/pages/SellerStorePage.tsx) (`/seller/store`)

This page is the seller store configuration area. Its purpose is to manage the operational data that powers seller presence across the marketplace, including store identity, locations, delivery options, and new ingredient registrations. Functionally, it lets sellers edit the store profile, add and remove warehouse locations, manage delivery methods, and register new ingredient listings against existing marketplace products.

### [`SellerIngredientPage.tsx`](src/pages/SellerIngredientPage.tsx) (`/seller/ingredients/:slug`)

This page is the dedicated seller detail screen for a single ingredient listing. Its purpose is to combine listing control and deep analytics for one seller-managed product so pricing and inventory decisions can be made with context. Functionally, it edits live price, stock, handling time, warehouse location, and delivery options, while also rendering sales analytics, rating analytics, and a snapshot of listing-specific performance.

### [`SellerRoutingPage.tsx`](src/pages/SellerRoutingPage.tsx) (`/seller/routing`)

This page is the multi-warehouse routing board for sellers. Its purpose is to help store operators assign ingredient listings to the correct warehouse or fulfillment location visually. Functionally, it groups listings by location, shows per-column routing summaries, supports drag-and-drop reassignment between warehouse columns, highlights low-stock listings, and links each routing card back to the relevant seller ingredient page.
