import { NextResponse, type NextRequest } from 'next/server';

const protectedRoutes = [
  '/favorites',
  '/feed',
  '/for-you',
  '/lists/new',
  '/settings',
  '/watched',
  '/watchlist',
];

const refreshCookieName = process.env.REFRESH_TOKEN_COOKIE_NAME ?? 'buzzshot_refresh';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!isProtected || request.cookies.has(refreshCookieName)) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/favorites/:path*', '/feed/:path*', '/for-you/:path*', '/lists/new', '/settings/:path*', '/watched/:path*', '/watchlist/:path*'],
};
