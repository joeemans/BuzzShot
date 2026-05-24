import { afterEach, describe, expect, it } from 'vitest';
import { publicApiUrl, serverApiUrl } from './api-url';

const originalEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  INTERNAL_API_URL: process.env.INTERNAL_API_URL,
};

afterEach(() => {
  process.env.NEXT_PUBLIC_API_URL = originalEnv.NEXT_PUBLIC_API_URL;
  process.env.INTERNAL_API_URL = originalEnv.INTERNAL_API_URL;
});

describe('api url helpers', () => {
  it('falls back when the public API URL is blank', () => {
    process.env.NEXT_PUBLIC_API_URL = '';
    process.env.INTERNAL_API_URL = '';

    expect(publicApiUrl()).toBe('http://localhost:4000/api');
    expect(serverApiUrl()).toBe('http://localhost:4000/api');
  });

  it('trims trailing slashes and prefers the internal API URL on the server', () => {
    process.env.NEXT_PUBLIC_API_URL = ' https://public.example.com/api/ ';
    process.env.INTERNAL_API_URL = ' https://internal.example.com/api/ ';

    expect(publicApiUrl()).toBe('https://public.example.com/api');
    expect(serverApiUrl()).toBe('https://internal.example.com/api');
  });
});
