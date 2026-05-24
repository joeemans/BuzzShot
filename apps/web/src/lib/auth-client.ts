'use client';

import type { ApiEnvelope, AuthUser, LoginInput, RegisterInput } from '@buzzshot/shared';
import { publicApiUrl } from './api-url';

const API_URL = publicApiUrl();

type AuthSession = {
  user: AuthUser;
  accessToken: string;
};

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export async function login(input: LoginInput) {
  return authRequest('/auth/login', input);
}

export async function register(input: RegisterInput) {
  return authRequest('/auth/register', input);
}

export async function refreshSession() {
  const session = await authRequest('/auth/refresh');
  return session;
}

export async function logout() {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
  setAccessToken(null);
}

export function googleAuthUrl(returnTo: string) {
  return `${API_URL}/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await requestWithAuth(path, init);
  if (response.status === 204) return null as T;

  if (!response.ok) {
    throw new Error(await errorMessage(response));
  }

  const payload = (await response.json()) as ApiEnvelope<T> | T;
  return typeof payload === 'object' && payload !== null && 'data' in payload
    ? (payload as ApiEnvelope<T>).data
    : (payload as T);
}

async function requestWithAuth(path: string, init: RequestInit) {
  if (!accessToken) {
    try {
      await refreshSession();
    } catch {
      setAccessToken(null);
    }
  }

  let response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });

  if (response.status === 401) {
    try {
      await refreshSession();
      response = await fetch(`${API_URL}${path}`, {
        ...init,
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...init.headers,
        },
      });
    } catch {
      setAccessToken(null);
    }
  }

  return response;
}

async function authRequest(path: string, body?: unknown) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    throw new Error(await errorMessage(response));
  }

  const payload = (await response.json()) as ApiEnvelope<AuthSession>;
  setAccessToken(payload.data.accessToken);
  return payload.data;
}

async function errorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(payload.message)) return payload.message[0] ?? 'Authentication failed.';
    return payload.message ?? 'Authentication failed.';
  } catch {
    return 'Authentication failed.';
  }
}
