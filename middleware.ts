import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Cache session checks for 5 seconds
const SESSION_CACHE_DURATION = 5000
let lastSessionCheck = 0
let cachedSession: { hasSession: boolean; error: any } | null = null

// List of paths that don't need session checks
const PUBLIC_PATHS = [
  '/_next',
  '/api',
  '/static',
  '/favicon.ico',
  '/login',
  '/register',
  '/forgot-password',
  '/auth/callback'
]

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip session check for public routes
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    // Check if we have a cached session that's still valid
    const now = Date.now()
    if (cachedSession && (now - lastSessionCheck) < SESSION_CACHE_DURATION) {
      if (!cachedSession.hasSession) {
        return redirectToLogin(request)
      }
      return res
    }

    // Perform new session check
    const { data: { session }, error } = await supabase.auth.getSession()
    const sessionCheck = { hasSession: !!session, error }

    // Cache the result
    lastSessionCheck = now
    cachedSession = sessionCheck

    if (error) {
      // If it's a rate limit error, allow the request to proceed
      if (error.message?.includes('rate limit')) {
        console.warn('Rate limit hit in middleware, allowing request to proceed')
        return res
      }
      return redirectToLogin(request)
    }

    if (!session) {
      return redirectToLogin(request)
    }

    return res
  } catch (error: any) {
    // If it's a rate limit error, allow the request to proceed
    if (error.message?.includes('rate limit')) {
      console.warn('Rate limit hit in middleware, allowing request to proceed')
      return NextResponse.next()
    }
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

function redirectToLogin(request: NextRequest) {
  const redirectUrl = new URL('/login', request.url)
  const currentPath = request.nextUrl.pathname
  if (currentPath !== '/login') {
    redirectUrl.searchParams.set('redirectTo', currentPath)
  }
  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 