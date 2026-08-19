import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    // Force external integrations off so tests are deterministic and never touch a
    // developer's real .env credentials (dotenv won't override these preset keys).
    env: {
      NODE_ENV: 'test',
      FIREBASE_PROJECT_ID: '',
      FIREBASE_CLIENT_EMAIL: '',
      FIREBASE_PRIVATE_KEY: '',
      GEMINI_API_KEY: '',
      MONGODB_URI: '',
    },
    setupFiles: ['./src/test/setup.ts'],
  },
});
