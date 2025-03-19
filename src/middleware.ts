import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('Middleware - Processing request:', {
    path: req.nextUrl.pathname,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    // Refresh session if expired
    const { data: { session } } = await supabase.auth.getSession();

    // If user is authenticated and tries to access login/signup, redirect to home
    if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
      console.log('Middleware - Authenticated user accessing auth page, redirecting to home', {
        timestamp: new Date().toISOString()
      });
      return NextResponse.redirect(new URL('/', req.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware - Error processing request:', {
      error,
      path: req.nextUrl.pathname,
      timestamp: new Date().toISOString()
    });
    return res;
  }
}

export const config = {
  matcher: [
    '/login',
    '/signup'
  ],
}; 