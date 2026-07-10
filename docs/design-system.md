# Design System

Single source of truth for visual tokens. Implemented as CSS variables in `client/src/index.css` and mapped in `tailwind.config.ts`. shadcn/ui components inherit these tokens.

## Brand

Modern, trustworthy, premium-but-approachable. Real estate = big decisions; UI must feel calm and credible. Whitespace over decoration.

## Colors (HSL, shadcn convention)

| Token | Light | Usage |
|---|---|---|
| `--background` | 0 0% 100% | page bg |
| `--foreground` | 224 20% 12% | body text |
| `--primary` | 174 62% 38% (teal) | CTAs, links, active states |
| `--primary-foreground` | 0 0% 100% | text on primary |
| `--secondary` | 220 14% 96% | subtle bg, secondary buttons |
| `--accent` | 38 92% 55% (amber) | badges, highlights, ratings — sparingly |
| `--muted` | 220 14% 96% / fg 220 9% 45% | skeletons, secondary text |
| `--destructive` | 0 72% 51% | errors, delete |
| `--border` | 220 13% 91% | borders, dividers |
| `--ring` | 174 62% 38% | focus rings |

Dark mode: invert neutrals (`--background` 224 25% 8%), keep primary/accent hues, raise lightness ~8% for contrast. Support via `class` strategy.

Semantic extras: `--success` 152 60% 40%, `--warning` 38 92% 50%, `--info` 210 90% 55%.

## Typography

- Font: `Inter` (UI) via fontsource; `font-sans` default. Optional display font `Plus Jakarta Sans` for hero headings only.
- Scale: `text-xs 12 / sm 14 / base 16 / lg 18 / xl 20 / 2xl 24 / 3xl 30 / 4xl 36 / 5xl 48`.
- Headings: `font-semibold tracking-tight`. Body: `text-base leading-7 text-foreground`. Secondary: `text-sm text-muted-foreground`.
- Line length ≤ 72ch for prose.

## Spacing & Radius

- Spacing: Tailwind 4-px scale only. Section padding `py-16 md:py-24`. Card padding `p-4 md:p-6`. Gaps: grid `gap-6`, stacks `space-y-4`.
- Radius: `--radius: 0.75rem`. Cards/inputs `rounded-lg`, buttons `rounded-md`, pills/badges `rounded-full`, images `rounded-lg overflow-hidden`.

## Elevation

- Default cards: `border` + `shadow-sm`.
- Hover/lifted: `shadow-md`. Modals/popovers: `shadow-lg`.
- Never stack heavy shadows; prefer borders in dense UI (tables, dashboards).

## Iconography

`lucide-react` only. Sizes 16 (inline), 20 (buttons/nav), 24 (feature). `stroke-width={2}`. Icon + text always gap-2.

## Imagery

- Property photos 16:10, `object-cover`, Cloudinary `f_auto,q_auto,w_<size>`.
- Fallback: muted bg + Building icon. Never broken-image glyphs.

## Do / Don't

- Do use tokens (`bg-primary`) — never raw hex in components.
- Do keep one accent per view; amber is seasoning, not sauce.
- Don't introduce new grays; use the neutral scale.
- Don't use gradients except the hero overlay (`from-black/60 to-transparent` on imagery).
