---
name: seo
description: Optimize discoverability and link previews — meta tags, Open Graph, structured data, semantic markup. Use for landing, search, and property detail pages.
---

# SEO

SPA caveat: this is client-rendered React; classic SEO is limited without SSR. Do what's achievable, document the rest as future work (SSR/prerender is out of scope for the capstone).

## Per-page meta (react-helmet-async)

- Unique `<title>` ≤ 60 chars and `<meta name="description">` ≤ 155 chars per route.
  - Detail: `"3-Bed Apartment in Dhanmondi — ৳45 Lakh | EstateAI"`
  - Search: reflect active filters: `"Apartments for Rent in Mirpur | EstateAI"`
- Canonical URL per route; search pages canonicalize to filtered URL (filters are meaningful).

## Social previews (Open Graph + Twitter)

`og:title`, `og:description`, `og:image` (property hero via Cloudinary 1200×630 transform), `og:type`, `twitter:card=summary_large_image`. Property links shared in chat apps must show the photo + price.

## Structured data (JSON-LD)

- Detail page: `RealEstateListing` (name, description, offers.price/priceCurrency, address, numberOfRooms, floorSize, image).
- Org: `Organization` + `WebSite` with `SearchAction` on landing.

## Semantics & crawlability

- Real `<a>`/`Link` for all navigation (no onClick-div navigation) — also an a11y rule.
- One h1 per page mirroring the title; descriptive image alts (double duty with a11y).
- `robots.txt` + generated `sitemap.xml` for static routes; noindex on dashboard/auth/assistant routes.
- Clean URLs: `/properties/dhanmondi-3-bed-apartment-<id>` (slug + id), redirects handled by id.

## Verify

Test previews with an OG debugger; validate JSON-LD with Google's Rich Results test; Lighthouse SEO ≥ 90.
