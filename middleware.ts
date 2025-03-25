import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // Check if the request is for protected routes
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/admin') || 
                          req.nextUrl.pathname.startsWith('/partner');
  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth');

  if (isProtectedRoute && !session) {
    // Redirect to login if trying to access protected route without session
    const redirectUrl = new URL('/auth/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && session) {
    // Redirect to appropriate dashboard if already logged in
    const userData = session.user.user_metadata;
    const redirectUrl = new URL(
      userData.role === 'admin' ? '/admin' : '/partner',
      req.url
    );
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/partner/:path*',
    '/auth/:path*',
  ],
};