"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"

export default function UsernameSetup() {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingProfile, setIsCheckingProfile] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Check if user already has a profile
    const checkProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()

        if (profile) {
          router.push('/collection')
        }
      } catch (error) {
        console.error('Profile check error:', error)
        toast.error('Failed to check profile status')
      } finally {
        setIsCheckingProfile(false)
      }
    }
    checkProfile()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!username.trim()) return

    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single()

      if (existingUser) {
        toast.error('Username is already taken')
        return
      }

      // Create profile with username
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username,
          email: user.email
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        toast.error('Failed to create profile')
        return
      }

      toast.success('Profile created successfully')
      router.push('/collection')
    } catch (error) {
      console.error('Username setup error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingProfile) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Loading...</h1>
            <p className="text-sm text-muted-foreground">Please wait while we check your profile status</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Choose a username</h1>
          <p className="text-sm text-muted-foreground">This will be your unique identifier on the platform</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating profile..." : "Create profile"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
} 