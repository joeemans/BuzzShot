const DEFAULT_BROWSER_API_URL = '/api';
const DEFAULT_SERVER_API_URL = 'http://localhost:4000/api';

function normalizeUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/+$/, '');
}

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

export function publicApiUrl() {
  const configured = normalizeUrl(process.env.NEXT_PUBLIC_API_URL);
  return configured?.startsWith('/') ? configured : DEFAULT_BROWSER_API_URL;
}

export function serverApiUrl() {
  const internalUrl = normalizeUrl(process.env.INTERNAL_API_URL);
  if (internalUrl) return internalUrl;

  const proxyTargetUrl = normalizeUrl(process.env.API_PROXY_TARGET_URL);
  if (proxyTargetUrl) return proxyTargetUrl;

  const publicUrl = normalizeUrl(process.env.NEXT_PUBLIC_API_URL);
  if (publicUrl && isAbsoluteUrl(publicUrl)) return publicUrl;

  return DEFAULT_SERVER_API_URL;
}
