import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('Auth callback triggered')
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/collection'
  
  console.log('Auth callback params:', {
    hasCode: !!code,
    redirectTo,
    fullUrl: request.url
  })

  if (code) {
    const supabase = createRouteHandlerClient({ cookies }, {
      cookieOptions: {
        name: "sb-auth-token",
        domain: requestUrl.hostname,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
      }
    })

    try {
      console.log('Exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      console.log('Exchange result:', { success: !!data?.session, error })
      
      if (error) throw error

      // Set the auth cookie
      const response = NextResponse.redirect(new URL(redirectTo, request.url))
      
      // Ensure the session is properly set
      if (data?.session) {
        await supabase.auth.setSession(data.session)
      }

      console.log('Auth successful, redirecting to:', redirectTo)
      return response
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL(`/login?error=auth_callback_failed`, request.url))
    }
  } else {
    console.log('No code provided in callback')
    return NextResponse.redirect(new URL(`/login?error=no_code`, request.url))
  }
} 