import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is not signed in and the current path is protected, redirect to /login
    if (!session && request.nextUrl.pathname.startsWith('/collection')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // If user is signed in
    if (session) {
      // Check if user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile check error:', profileError)
        return res
      }

      // If user doesn't have a profile and is not on the username setup page,
      // redirect to username setup
      if (!profile && request.nextUrl.pathname !== '/username-setup') {
        return NextResponse.redirect(new URL('/username-setup', request.url))
      }

      // If user has a profile and is on the username setup page,
      // redirect to collection
      if (profile && request.nextUrl.pathname === '/username-setup') {
        return NextResponse.redirect(new URL('/collection', request.url))
      }

      // If user is signed in and the current path is /login or /register, redirect to /collection
      if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') {
        return NextResponse.redirect(new URL('/collection', request.url))
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: ['/collection/:path*', '/login', '/register'],
} 