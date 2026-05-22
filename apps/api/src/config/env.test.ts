import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.js';

const baseEnv = {
  DATABASE_URL: 'postgresql://buzzshot:buzzshot@localhost:5432/buzzshot?schema=public',
};

describe('validateEnv', () => {
  it('parses false boolean strings as false', () => {
    const env = validateEnv({
      ...baseEnv,
      COOKIE_SECURE: 'false',
      PASSWORD_RESET_TOKEN_LOGGING_ENABLED: 'false',
    });

    expect(env.COOKIE_SECURE).toBe(false);
    expect(env.PASSWORD_RESET_TOKEN_LOGGING_ENABLED).toBe(false);
  });

  it('rejects production with the development JWT secret', () => {
    expect(() =>
      validateEnv({
        ...baseEnv,
        NODE_ENV: 'production',
        API_URL: 'https://api.example.com',
        WEB_URL: 'https://www.example.com',
        COOKIE_SECURE: 'true',
      }),
    ).toThrow();
  });

  it('rejects production without secure refresh cookies', () => {
    expect(() =>
      validateEnv({
        ...baseEnv,
        NODE_ENV: 'production',
        API_URL: 'https://api.example.com',
        WEB_URL: 'https://www.example.com',
        COOKIE_SECURE: 'false',
        JWT_ACCESS_SECRET: 'x'.repeat(48),
      }),
    ).toThrow();
  });

  it('accepts production JWT settings with secure cookies and https origins', () => {
    const env = validateEnv({
      ...baseEnv,
      NODE_ENV: 'production',
      API_URL: 'https://api.example.com',
      WEB_URL: 'https://www.example.com',
      COOKIE_SECURE: 'true',
      JWT_ACCESS_SECRET: 'x'.repeat(48),
      JWT_ACCESS_ISSUER: 'buzzshot-api',
      JWT_ACCESS_AUDIENCE: 'buzzshot-web',
    });

    expect(env.JWT_ACCESS_SECRET).toHaveLength(48);
    expect(env.COOKIE_SECURE).toBe(true);
  });
});
