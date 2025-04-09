"use client"

import type React from "react"
import { Suspense } from 'react'

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
import { XCircleIcon } from '@heroicons/react/24/outline'

// Ensure we have the correct URL format
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
if (!supabaseUrl?.startsWith('https://')) {
  console.error('Invalid Supabase URL format:', supabaseUrl)
}

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastAttempt, setLastAttempt] = useState<number>(0)
  const [attemptCount, setAttemptCount] = useState(0)
  const [cooldownEnd, setCooldownEnd] = useState<number>(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const redirectTo = searchParams.get('redirectTo') || '/collection'
  const error = searchParams.get('error')

  // Load attempt count from localStorage on mount
  useEffect(() => {
    const storedAttemptCount = localStorage.getItem('loginAttemptCount')
    const storedLastAttempt = localStorage.getItem('lastLoginAttempt')
    const storedCooldownEnd = localStorage.getItem('loginCooldownEnd')
    
    if (storedAttemptCount && storedLastAttempt) {
      const lastAttemptTime = parseInt(storedLastAttempt)
      const now = Date.now()
      
      // Reset attempts if more than 5 minutes have passed
      if (now - lastAttemptTime > 300000) {
        localStorage.removeItem('loginAttemptCount')
        localStorage.removeItem('lastLoginAttempt')
        localStorage.removeItem('loginCooldownEnd')
      } else {
        setAttemptCount(parseInt(storedAttemptCount))
        setLastAttempt(lastAttemptTime)
        if (storedCooldownEnd) {
          setCooldownEnd(parseInt(storedCooldownEnd))
        }
      }
    }
  }, [])

  // Check if we're in cooldown
  useEffect(() => {
    if (cooldownEnd > 0) {
      const now = Date.now()
      if (now >= cooldownEnd) {
        setCooldownEnd(0)
        localStorage.removeItem('loginCooldownEnd')
      }
    }
  }, [cooldownEnd])

  // Log Supabase configuration
  useEffect(() => {
    console.log('Supabase Configuration:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })
  }, [])

  // Check for error params
  useEffect(() => {
    if (error) {
      console.log('URL error param:', error)
      if (error === 'auth_callback_failed') {
        toast.error('Authentication failed. Please try again.')
      } else if (error === 'session_error') {
        toast.error('Session error. Please sign in again.')
      }
    }
  }, [error])

  // Check if user is already logged in
  useEffect(() => {
    let mounted = true
    const checkSession = async () => {
      if (!mounted) return
      console.log('Checking session...')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (!mounted) return
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
    return () => {
      mounted = false
    }
  }, [router, supabase, redirectTo])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (isLoading) return
    
    const now = Date.now()
    
    // Check if we're in cooldown
    if (now < cooldownEnd) {
      const timeLeft = Math.ceil((cooldownEnd - now) / 1000)
      toast.error(`Please wait ${timeLeft} seconds before trying again.`)
      return
    }

    // Check if we're making too many attempts
    if (now - lastAttempt < 2000) { // 2 second cooldown between attempts
      toast.error('Please wait a moment before trying again')
      return
    }

    // Check if we've made too many attempts in the last 5 minutes
    if (attemptCount >= 5) {
      const cooldownTime = Math.min(300000, Math.pow(2, attemptCount - 4) * 60000) // Exponential backoff
      const newCooldownEnd = now + cooldownTime
      setCooldownEnd(newCooldownEnd)
      localStorage.setItem('loginCooldownEnd', newCooldownEnd.toString())
      const minutes = Math.ceil(cooldownTime / 60000)
      toast.error(`Too many attempts. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`)
      return
    }
    
    setIsLoading(true)
    setLastAttempt(now)
    const newAttemptCount = attemptCount + 1
    setAttemptCount(newAttemptCount)
    
    // Store attempt count in localStorage
    localStorage.setItem('loginAttemptCount', newAttemptCount.toString())
    localStorage.setItem('lastLoginAttempt', now.toString())
    
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
        } else if (error.message.includes('rate limit')) {
          console.error('Rate limit error:', error)
          const cooldownTime = Math.min(300000, Math.pow(2, newAttemptCount - 4) * 60000)
          const newCooldownEnd = now + cooldownTime
          setCooldownEnd(newCooldownEnd)
          localStorage.setItem('loginCooldownEnd', newCooldownEnd.toString())
          const minutes = Math.ceil(cooldownTime / 60000)
          toast.error(`Rate limit reached. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`)
        } else {
          toast.error('Failed to sign in. Please check your credentials.')
        }
        return
      }

      if (data?.session) {
        console.log('Session established, refreshing and redirecting...')
        // Clear attempt count on successful login
        localStorage.removeItem('loginAttemptCount')
        localStorage.removeItem('lastLoginAttempt')
        localStorage.removeItem('loginCooldownEnd')
        toast.success('Signed in successfully')
        router.refresh()
        router.push(redirectTo)
      } else {
        console.error('No session after successful sign in')
        toast.error('Failed to establish session')
      }
    } catch (error) {
      console.error('Unexpected sign in error:', error)
      if (error instanceof Error) {
        toast.error(`An unexpected error occurred: ${error.message}`)
      } else {
        toast.error('An unexpected error occurred')
      }
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
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error === 'OAuthSignin' && 'Error signing in with OAuth provider'}
                    {error === 'OAuthCallback' && 'Error during OAuth callback'}
                    {error === 'OAuthCreateAccount' && 'Error creating OAuth account'}
                    {error === 'EmailCreateAccount' && 'Error creating email account'}
                    {error === 'Callback' && 'Error during callback'}
                    {error === 'OAuthAccountNotLinked' && 'Account not linked'}
                    {error === 'EmailSignin' && 'Error signing in with email'}
                    {error === 'CredentialsSignin' && 'Invalid credentials'}
                    {error === 'SessionRequired' && 'Please sign in to access this page'}
                    {!error && 'An error occurred during authentication'}
                  </h3>
                </div>
              </div>
            </div>
          )}
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
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}

