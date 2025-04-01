import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  console.log('Middleware triggered for path:', req.nextUrl.pathname)
  
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res }, {
    cookieOptions: {
      name: "sb-auth-token",
      domain: req.nextUrl.hostname,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    }
  })

  try {
    // Refresh session if expired - required for Server Components
    console.log('Checking session in middleware...')
    const { data: { session }, error } = await supabase.auth.getSession()
    console.log('Middleware session check:', { hasSession: !!session, error })

    // Handle auth errors
    if (error) {
      console.error('Middleware auth error:', error)
      // Only redirect if it's not a rate limit error
      if (error.status !== 429) {
        return NextResponse.redirect(new URL('/login?error=session_error', req.url))
      }
      // For rate limit errors, just continue without redirecting
      return res
    }

    // If there's no session and the user is trying to access a protected route
    const isProtectedRoute = (
      req.nextUrl.pathname.startsWith('/profile') ||
      req.nextUrl.pathname.startsWith('/collection') ||
      req.nextUrl.pathname.startsWith('/settings')
    )

    if (!session && isProtectedRoute) {
      console.log('No session found for protected route:', req.nextUrl.pathname)
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      console.log('Redirecting to:', redirectUrl.toString())
      return NextResponse.redirect(redirectUrl)
    }

    // If there's a session and the user is trying to access auth pages
    const isAuthPage = (
      req.nextUrl.pathname.startsWith('/login') ||
      req.nextUrl.pathname.startsWith('/register')
    )

    if (session && isAuthPage) {
      console.log('User already authenticated, redirecting from auth page to collection')
      return NextResponse.redirect(new URL('/collection', req.url))
    }

    // Try to refresh the session
    if (session) {
      await supabase.auth.getUser()
    }

    console.log('Middleware completed normally')
    return res
  } catch (e: any) {
    console.error('Middleware error:', e)
    // Only redirect if it's not a rate limit error
    if (e.status !== 429) {
      return NextResponse.redirect(new URL('/login?error=middleware_error', req.url))
    }
    // For rate limit errors, just continue without redirecting
    return res
  }
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/collection/:path*',
    '/settings/:path*',
    '/login',
    '/register',
    '/auth/callback',
  ],
} 