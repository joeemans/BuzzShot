import { z } from 'zod';

const developmentJwtSecret = 'development-access-secret-change-me';

const booleanEnv = z.preprocess((value) => {
  if (typeof value !== 'string') return value;

  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off', ''].includes(normalized)) return false;
  return value;
}, z.boolean());

function requireHttpsUrl(value: string, context: z.RefinementCtx, path: string) {
  if (value.startsWith('https://')) return;
  context.addIssue({
    code: 'custom',
    path: [path],
    message: `${path} must use https:// in production.`,
  });
}

function requireProductionRedisUrl(value: string, context: z.RefinementCtx) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'redis:' && url.protocol !== 'rediss:') {
      context.addIssue({
        code: 'custom',
        path: ['REDIS_URL'],
        message: 'REDIS_URL must use redis:// or rediss://.',
      });
    }
    if (['localhost', '127.0.0.1', '0.0.0.0', '[::1]'].includes(url.hostname)) {
      context.addIssue({
        code: 'custom',
        path: ['REDIS_URL'],
        message: 'REDIS_URL must point to a production Redis instance.',
      });
    }
  } catch {
    context.addIssue({
      code: 'custom',
      path: ['REDIS_URL'],
      message: 'REDIS_URL must be a valid Redis URL.',
    });
  }
}

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_PORT: z.coerce.number().int().positive().default(4000),
    API_URL: z.string().url().default('http://localhost:4000'),
    WEB_URL: z.string().url().default('http://localhost:3000'),
    CORS_ORIGINS: z.string().optional(),
    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().min(1).default('redis://localhost:6379'),
    JWT_ACCESS_SECRET: z.string().min(32).default(developmentJwtSecret),
    JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().min(60).max(3600).default(900),
    JWT_ACCESS_ISSUER: z.string().min(1).default('buzzshot-api'),
    JWT_ACCESS_AUDIENCE: z.string().min(1).default('buzzshot-web'),
    REFRESH_TOKEN_COOKIE_NAME: z.string().default('buzzshot_refresh'),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
    COOKIE_SECURE: booleanEnv.default(false),
    PASSWORD_RESET_TOKEN_LOGGING_ENABLED: booleanEnv.default(false),
    TMDB_API_BASE_URL: z.string().url().default('https://api.themoviedb.org/3'),
    TMDB_IMAGE_BASE_URL: z.string().url().default('https://image.tmdb.org/t/p'),
    TMDB_READ_ACCESS_TOKEN: z.string().optional(),
    TMDB_API_KEY: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CALLBACK_URL: z.string().optional(),
  })
  .superRefine((env, context) => {
    if (env.NODE_ENV !== 'production') return;

    if (env.JWT_ACCESS_SECRET === developmentJwtSecret) {
      context.addIssue({
        code: 'custom',
        path: ['JWT_ACCESS_SECRET'],
        message: 'Set a production JWT_ACCESS_SECRET.',
      });
    }

    if (!env.COOKIE_SECURE) {
      context.addIssue({
        code: 'custom',
        path: ['COOKIE_SECURE'],
        message: 'COOKIE_SECURE must be true in production.',
      });
    }

    if (env.PASSWORD_RESET_TOKEN_LOGGING_ENABLED) {
      context.addIssue({
        code: 'custom',
        path: ['PASSWORD_RESET_TOKEN_LOGGING_ENABLED'],
        message: 'Password reset token logging must stay disabled in production.',
      });
    }

    requireProductionRedisUrl(env.REDIS_URL, context);
    requireHttpsUrl(env.API_URL, context, 'API_URL');
    requireHttpsUrl(env.WEB_URL, context, 'WEB_URL');
    for (const origin of parseCorsOrigins(env.CORS_ORIGINS)) {
      requireHttpsUrl(origin, context, 'CORS_ORIGINS');
    }
    if (env.GOOGLE_CALLBACK_URL) {
      requireHttpsUrl(env.GOOGLE_CALLBACK_URL, context, 'GOOGLE_CALLBACK_URL');
    }
  });

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  return envSchema.parse(config);
}

export function parseCorsOrigins(value: string | undefined) {
  return (
    value
      ?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? []
  );
}
