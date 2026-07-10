# UI Guidelines

Page-level UX rules. Visual tokens live in `design-system.md`; motion in `animation-system.md`.

## Global Layout

- Max content width 1280px, centered, `px-4 md:px-6 lg:px-8`.
- Sticky header: logo, nav (Buy, Rent, Sell, AI Assistant), auth/avatar menu. Mobile: sheet drawer.
- Footer: links, contact, BUBT credit. Keep minimal.
- Every page: one clear `h1`, breadcrumbs on nested pages.

## Key Pages

**Landing** — hero with search bar (location + type + price), featured properties grid, "How it works" (3 steps), AI assistant teaser, stats strip, CTA. See `premium-landing` skill.

**Search results** — left filter sidebar (collapsible on mobile as bottom sheet), results grid 1/2/3 cols, map toggle (split view on lg+), sort dropdown, pagination, active-filter chips with clear-all. Skeletons while loading; friendly empty state with "Ask the AI assistant" CTA.

**Property detail** — gallery (main image + thumbs, lightbox), title/price/badges, spec icons row (beds, baths, sqft), description, amenities grid, map, reviews, owner card, sticky booking panel (visit scheduling / purchase request). Mobile: booking panel becomes a fixed bottom bar.

**AI Assistant** — chat layout, streaming responses, property recommendation cards inline in messages, suggested prompts for empty state, conversation history sidebar. See `rag-ui` skill.

**Dashboards** — sidebar nav layout. Owner: listings table (status, views, actions), booking requests, add-property wizard. Buyer: saved properties, my bookings, my reviews. Admin: stats cards, approval queue, user table.

**Auth pages** — centered card, max-w-md, social proof minimal, inline validation, password strength meter on register.

## Patterns

- Property card is the atomic unit: image (16:10), price bold, title, location w/ pin icon, spec icons, listingType badge, save-heart button. Identical everywhere.
- Forms: label above input, description below, error text red below (see `forms` skill). Multi-step for property creation.
- Loading: skeletons for content, spinner only inside buttons. Never blank screens.
- Empty states: icon + one sentence + primary action.
- Errors: toast for transient, inline for form fields, full-page only for route errors.
- Destructive actions: confirmation dialog, red primary button.
- Toasts bottom-right, auto-dismiss 5 s.

## Content Rules

- Prices: `৳ 45,00,000` (BDT lakh format) or `৳ 25,000/mo` for rent.
- Dates: `12 Mar 2026`. Relative for < 7 days ("3 days ago").
- Sentence case for headings and buttons. No ALL CAPS except tiny badges.
