/**
 * Next.js 16 Proxy (formerly middleware)
 *
 * This file runs on every request and can be used to rewrite, redirect,
 * or modify requests before they reach the page or API route.
 */

import { NextRequest, NextResponse } from 'next/server';

export default function proxy(request: NextRequest) {
  // Pass through all requests without modification
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
