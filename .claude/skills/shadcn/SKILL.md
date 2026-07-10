---
name: shadcn
description: Install, customize, and compose shadcn/ui components correctly. Use when adding UI primitives, building forms/dialogs/tables, or extending component variants.
---

# shadcn/ui

## Setup facts

- Components live in `client/src/components/ui/` — installed via `npx shadcn@latest add <name>`, never hand-written from memory.
- They read tokens from `index.css`/`tailwind.config.ts` — customize by changing tokens or variants, not by forking styles inline.
- Check `docs/component-library.md` for which primitives are already installed.

## Rules

1. **Add via CLI**: `cd client && npx shadcn@latest add dialog` — don't paste component source manually (versions drift).
2. **Extend with variants**: use `cva` variants inside the ui component (e.g., add a `premium` badge variant) rather than className overrides scattered around the app.
3. **Compose, don't fork**: `PropertyCard` wraps `Card`; `ConfirmDialog` wraps `AlertDialog`. App components in `components/`, primitives stay in `components/ui/`.
4. **Forms**: always `Form` (react-hook-form) + `zodResolver` + `FormField/FormItem/FormLabel/FormControl/FormMessage`. See forms skill.
5. **Toasts**: sonner via `toast()` util; success/error variants only.
6. **Dialogs vs Sheets vs Drawers**: Dialog = confirm/short form (desktop-centric); Sheet = filters/nav on mobile; Drawer = mobile bottom interactions (booking bar).

## Common compositions for this project

- Data table (dashboards): `Table` + TanStack Query pagination — keep sorting server-side.
- Multi-step wizard: `Tabs` value-controlled by form step state, progress indicator, per-step zod schema.
- Command palette (`Command`) reserved for future; don't add speculatively.
