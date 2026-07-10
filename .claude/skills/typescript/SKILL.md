---
name: typescript
description: Enforce strict, expressive TypeScript on both client and server. Use when defining types, fixing type errors, typing API contracts, or reviewing type safety.
---

# TypeScript

Strict mode is on; keep it meaningful, not ceremonial. Rules from `docs/coding-standards.md`:

## Core rules

- No `any`. Use `unknown` + type guards; `// any: <reason>` comment if truly unavoidable.
- No `as` casting to silence errors — fix the type at the source. `satisfies` for literal validation.
- No enums → `as const` + union:
  ```ts
  export const PROPERTY_TYPES = ['apartment', 'house', 'land', 'commercial'] as const;
  export type PropertyType = (typeof PROPERTY_TYPES)[number];
  ```
- zod-first contracts: schema is truth, types inferred:
  ```ts
  export const createPropertySchema = z.object({ ... });
  export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
  ```
- Discriminated unions for state: `{ status: 'idle' } | { status: 'error'; error: AppErrorShape }` — never boolean soup.
- Exported functions: explicit return types.

## API typing pattern

Shared shapes live in `types/api.ts` on both sides (kept in sync manually until a shared package exists):

```ts
export interface ApiResponse<T> { success: true; data: T; meta?: PaginationMeta }
export interface ApiError { success: false; error: { message: string; code: string } }
```

Client axios wrapper is generic: `api.get<Property[]>('/properties')` returns typed data or throws typed error.

## Fixing type errors

Diagnose the root, not the symptom: read the full error bottom-up, check if the type or the code is wrong, prefer narrowing (`if ('geo' in location)`) and helper predicates (`isApiError(e)`). Never `@ts-ignore`; `@ts-expect-error` with comment only in tests.
