import { afterEach, describe, expect, it } from 'vitest';
import { publicApiUrl, serverApiUrl } from './api-url';

const originalEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  INTERNAL_API_URL: process.env.INTERNAL_API_URL,
  API_PROXY_TARGET_URL: process.env.API_PROXY_TARGET_URL,
};

function restoreEnv(name: keyof typeof originalEnv) {
  const value = originalEnv[name];
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}

afterEach(() => {
  restoreEnv('NEXT_PUBLIC_API_URL');
  restoreEnv('INTERNAL_API_URL');
  restoreEnv('API_PROXY_TARGET_URL');
});

describe('api url helpers', () => {
  it('uses the same-origin API path in the browser when the public API URL is blank', () => {
    process.env.NEXT_PUBLIC_API_URL = '';
    process.env.INTERNAL_API_URL = '';
    process.env.API_PROXY_TARGET_URL = '';

    expect(publicApiUrl()).toBe('/api');
    expect(serverApiUrl()).toBe('http://localhost:4000/api');
  });

  it('uses a relative public API path for browser calls', () => {
    process.env.NEXT_PUBLIC_API_URL = ' /api/ ';
    process.env.INTERNAL_API_URL = '';
    process.env.API_PROXY_TARGET_URL = '';

    expect(publicApiUrl()).toBe('/api');
    expect(serverApiUrl()).toBe('http://localhost:4000/api');
  });

  it('keeps browser calls same-origin even when the proxy target is configured as an absolute URL', () => {
    process.env.NEXT_PUBLIC_API_URL = ' https://public.example.com/api/ ';
    process.env.INTERNAL_API_URL = '';
    process.env.API_PROXY_TARGET_URL = '';

    expect(publicApiUrl()).toBe('/api');
    expect(serverApiUrl()).toBe('https://public.example.com/api');
  });

  it('trims trailing slashes and prefers the internal API URL on the server', () => {
    process.env.NEXT_PUBLIC_API_URL = ' https://public.example.com/api/ ';
    process.env.INTERNAL_API_URL = ' https://internal.example.com/api/ ';
    process.env.API_PROXY_TARGET_URL = ' https://proxy.example.com/api/ ';

    expect(publicApiUrl()).toBe('/api');
    expect(serverApiUrl()).toBe('https://internal.example.com/api');
  });
});
