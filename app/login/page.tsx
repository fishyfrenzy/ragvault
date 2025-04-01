"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Cog } from "lucide-react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

// Ensure we have the correct URL format
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
if (!supabaseUrl?.startsWith('https://')) {
  console.error('Invalid Supabase URL format:', supabaseUrl)
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const redirectTo = searchParams.get('redirectTo') || '/collection'

  // Log Supabase configuration
  useEffect(() => {
    console.log('Supabase Configuration:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })
  }, [])

  // Check for error params
  useEffect(() => {
    const error = searchParams.get('error')
    console.log('URL error param:', error)
    if (error === 'auth_callback_failed') {
      toast.error('Authentication failed. Please try again.')
    } else if (error === 'session_error') {
      toast.error('Session error. Please sign in again.')
    }
  }, [searchParams])

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      console.log('Checking session...')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Session check result:', { 
          session: !!session, 
          error,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL 
        })
        if (error) {
          console.error('Session check error:', error)
          return
        }
        if (session) {
          console.log('Session found, redirecting to:', redirectTo)
          router.push(redirectTo)
        }
      } catch (error) {
        console.error('Session check failed:', error)
      }
    }
    checkSession()
  }, [router, supabase, redirectTo])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (isLoading) return
    
    setIsLoading(true)
    console.log('Starting sign in process...')

    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      console.log('Attempting sign in for email:', email)
      console.log('Using Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Sign in result:', { success: !!data?.session, error })

      if (error) {
        console.error('Sign in error:', error)
        if (error.message.includes('Email not confirmed')) {
          toast.error(
            'Please confirm your email address before signing in. Check your inbox for the confirmation link.',
            { duration: 6000 }
          )
          console.log('Attempting to resend confirmation email...')
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email,
          })
          if (!resendError) {
            toast.info('A new confirmation email has been sent.', { duration: 4000 })
          } else {
            console.error('Error resending confirmation:', resendError)
          }
        } else {
          toast.error('Failed to sign in. Please check your credentials.')
        }
        return
      }

      if (data?.session) {
        console.log('Session established, refreshing and redirecting...')
        toast.success('Signed in successfully')
        router.refresh()
        router.push(redirectTo)
      } else {
        console.error('No session after successful sign in')
        toast.error('Failed to establish session')
      }
    } catch (error) {
      console.error('Unexpected sign in error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      console.log('Starting Google sign in...')
      const redirectUrl = `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`
      console.log('Google sign in redirect URL:', redirectUrl)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      })

      console.log('Google sign in result:', { data, error })
      if (error) throw error
    } catch (error) {
      console.error('Google sign in error:', error)
      toast.error('Failed to sign in with Google')
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Cog className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to sign in</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input name="email" id="email" type="email" placeholder="name@example.com" autoComplete="email" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input name="password" id="password" type="password" autoComplete="current-password" required />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" name="remember" />
                    <Label htmlFor="remember" className="text-sm">Remember me</Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Sign in with Google
              </Button>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

