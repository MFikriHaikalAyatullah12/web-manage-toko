import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if user is accessing login page
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  // Check if user is logged in by looking at the request headers or cookies
  // Since we're using localStorage, we'll handle this on the client side
  // This middleware just ensures the login page is accessible
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};