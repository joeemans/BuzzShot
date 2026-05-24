import { cookies } from 'next/headers';
import type { ApiEnvelope, AuthUser } from '@buzzshot/shared';
import { serverApiUrl } from './api-url';

const API_URL = serverApiUrl();

export async function getCurrentUser() {
  const cookieHeader = (await cookies()).toString();
  if (!cookieHeader) return null;

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Cookie: cookieHeader,
      },
    });

    if (!response.ok) return null;
    const payload = (await response.json()) as ApiEnvelope<AuthUser>;
    return payload.data;
  } catch {
    return null;
  }
}
