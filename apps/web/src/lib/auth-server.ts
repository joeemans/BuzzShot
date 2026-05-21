import { cookies } from 'next/headers';
import type { ApiEnvelope, AuthUser } from '@buzzshot/shared';

const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const API_URL = process.env.INTERNAL_API_URL ?? PUBLIC_API_URL;

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
