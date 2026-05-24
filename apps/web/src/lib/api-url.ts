const DEFAULT_PUBLIC_API_URL = 'http://localhost:4000/api';

function normalizeUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/+$/, '');
}

export function publicApiUrl() {
  return normalizeUrl(process.env.NEXT_PUBLIC_API_URL) ?? DEFAULT_PUBLIC_API_URL;
}

export function serverApiUrl() {
  return normalizeUrl(process.env.INTERNAL_API_URL) ?? publicApiUrl();
}
