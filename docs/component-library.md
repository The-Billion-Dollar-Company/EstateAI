# Component Library

Inventory of reusable components. Check here before building anything new. shadcn primitives live in `client/src/components/ui/`; app components in `client/src/components/`.

## shadcn/ui primitives (installed via CLI, do not hand-edit except tokens)

button, input, textarea, select, checkbox, radio-group, switch, slider, form, label, card, badge, avatar, dialog, sheet, drawer, dropdown-menu, popover, tooltip, tabs, accordion, table, skeleton, toast (sonner), pagination, breadcrumb, command, calendar, carousel, separator, scroll-area

## Layout

| Component | Notes |
|---|---|
| `AppShell` | header + outlet + footer |
| `Header` / `MobileNav` | sticky nav, auth-aware menu |
| `Footer` | static links |
| `DashboardLayout` | sidebar + content, role-aware nav items |
| `PageHeader` | h1 + breadcrumbs + actions slot |
| `Section` | consistent vertical rhythm wrapper |

## Property

| Component | Notes |
|---|---|
| `PropertyCard` | THE atomic unit — image, price, title, location, specs, badge, save button. Variants: `default`, `horizontal`, `compact` (assistant chat) |
| `PropertyGrid` | responsive grid + skeleton + empty state |
| `PropertyGallery` | main image, thumbs, lightbox |
| `SpecIcons` | beds/baths/sqft icon row |
| `AmenityList` | icon grid of amenities |
| `PropertyMap` / `MapMarker` | Leaflet wrapper; single-pin and cluster modes |
| `PriceTag` | BDT formatting, /mo for rent |
| `StatusBadge` | active/pending/sold/rented colors |
| `SaveButton` | heart toggle w/ optimistic update |

## Search

`SearchBar` (hero + header variants), `FilterSidebar` (sheet on mobile), `FilterChips`, `SortSelect`, `MapToggle`, `ResultsCount`

## Booking & Reviews

`BookingPanel` (sticky, detail page), `VisitScheduler` (calendar + slots), `NegotiationThread`, `BookingStatusBadge`, `ReviewList`, `ReviewForm` (star input), `RatingStars`

## AI Assistant

`ChatLayout`, `MessageList`, `MessageBubble`, `StreamingMessage`, `PropertyRecCard` (compact card inside replies), `SuggestedPrompts`, `ChatInput`, `TypingIndicator`, `ConversationSidebar`

## Dashboard

`StatCard`, `ListingsTable`, `BookingRequestsTable`, `PropertyForm` (multi-step wizard: basics → location → media → amenities → review), `MediaUploader` (drag-drop, Cloudinary), `ApprovalQueue` (admin)

## Shared

`EmptyState`, `ErrorState`, `ConfirmDialog`, `UserAvatar`, `PasswordStrength`, `CountUp`, `Logo`

## Rules

- New component only if no variant of an existing one fits — extend with a `variant` prop first.
- Every component: typed props, sensible defaults, no data fetching inside presentational components (fetch in pages/hooks, pass down).
- Update this file when adding a component.
