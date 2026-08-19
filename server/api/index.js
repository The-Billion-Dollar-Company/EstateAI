// Plain JS wrapper: Vercel's zero-config builder compiles files under api/
// directly from TS source without resolving the project's `@/*` tsconfig path
// aliases. src/serverless.ts goes through the real `npm run build` (tsc +
// tsc-alias) instead, which fully resolves those aliases to relative imports,
// so this just re-exports the already-compiled, already-resolved handler.
export { default } from '../dist/src/serverless.js';
