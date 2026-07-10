---
name: forms
description: Build validated, accessible forms — auth, property creation, booking, reviews, filters. Use for any form or input-heavy UI.
---

# Forms

Stack: react-hook-form + zod (`zodResolver`) + shadcn `Form` components. Every form follows this — no ad-hoc controlled inputs for multi-field forms.

## Recipe

```tsx
const schema = z.object({ email: z.string().email('Enter a valid email') });
const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: '' } });
// <Form {...form}> <FormField name="email" render={({ field }) => (
//   <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
```

Client zod schemas mirror server schemas (same rules, same messages where possible) — validation feels consistent, server remains authoritative.

## UX rules

- Label above input; helper text below; error replaces helper (red, via FormMessage).
- Validate on blur first, then on change after first error (`mode: 'onTouched'`).
- Submit: button shows inline spinner + disabled; whole-form errors as Alert at top AND focus moved to it; server field errors mapped back via `form.setError`.
- Never clear a form on failed submit. Success → toast + navigate or reset (context-dependent).
- Money inputs: numeric keyboard (`inputMode="numeric"`), BDT formatting on blur; area/beds/baths as steppers or selects, not free text.
- Multi-step (PropertyForm): per-step schema, back preserves values, step indicator, draft persistence (dashboard skill).

## Project forms inventory

register (password strength meter), login, property wizard, booking/visit (date+slot picker — disable past dates and taken slots), negotiation offer, review (star input = radio group), profile, search filters (special case: instant-apply, URL-synced, no submit button).

## A11y

FormLabel/FormMessage wiring is automatic — keep it. Required fields marked in the label text. Error summary focusable. Star rating: real radio inputs with labels ("4 stars"), not click-divs.
