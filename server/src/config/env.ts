import 'dotenv/config';
import { z } from 'zod';

/**
 * An optional env var: a blank value in .env (`KEY=`) is treated as absent rather
 * than as an empty string, so unfilled keys don't fail validation.
 */
function optional(min = 1) {
  return z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().min(min).optional(),
  );
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  // Comma-separated list of allowed production/preview origins (e.g. the Vercel
  // client URL). Any http(s)://localhost:* or 127.0.0.1:* origin is always allowed
  // on top of this, so local frontend dev works regardless of this value.
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  // All optional; unset/blank keys simply disable the related feature.
  MONGODB_URI: optional(),
  JWT_ACCESS_SECRET: optional(32),
  JWT_REFRESH_SECRET: optional(32),
  // LLM for the assistant. Gemini is the configured provider; a blank key makes
  // the assistant fall back to its grounded keyword template.
  GEMINI_API_KEY: optional(),
  GEMINI_MODEL: z.string().min(1).default('gemini-2.5-flash'),
  VOYAGE_API_KEY: optional(),
  VOYAGE_MODEL: z.string().min(1).default('voyage-3'),
  CLOUDINARY_CLOUD_NAME: optional(),
  CLOUDINARY_API_KEY: optional(),
  CLOUDINARY_API_SECRET: optional(),
  // Firebase Admin — enables "Sign in with Google" when all three are set.
  FIREBASE_PROJECT_ID: optional(),
  FIREBASE_CLIENT_EMAIL: optional(),
  FIREBASE_PRIVATE_KEY: optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration — ${issues}`);
  }
  return parsed.data;
}

export const env = loadEnv();
