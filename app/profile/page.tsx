"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Edit, Heart, MessageSquare, Package, Settings, ShirtIcon, ShoppingBag, User, Mail, MapPin, Instagram, Twitter, Facebook, Link as LinkIcon, ArrowUp, ArrowDown, X } from "lucide-react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Profile {
  id: string
  username: string | null
  email: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  website: string | null
  instagram: string | null
  twitter: string | null
  facebook: string | null
  created_at: string
  updated_at: string
  show_email: boolean
  show_location: boolean
  show_website: boolean
  show_social: boolean
  collection_overview_preferences: {
    showTotalItems: boolean
    showEstimatedValue: boolean
    showLicensing: boolean
    showTags: boolean
    order: string[]
  }
  featured_shirts: number[]
  featured_collections: number[]
}

interface CollectionStats {
  totalItems: number
  totalValue: number
  licensing: { name: string; count: number }[]
  tags: { name: string; count: number }[]
}

interface TShirt {
  id: number
  name: string
  brand: string
  year: number
  condition: string
  size: string
  tags: string[]
  image: string | null
  description: string | null
  date_added: string
  estimated_value: number
  listing_status: string
  price: number | null
  user_id: string
  collection_id: number | null
  licensing: string
}

interface Collection {
  id: number
  name: string
  description: string | null
  user_id: string
  created_at: string
  updated_at: string
  icon: string | null
  color: string
}

export default function ProfilePage() {
  const [isFollowing, setIsFollowing] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<CollectionStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({})
  const [featuredShirts, setFeaturedShirts] = useState<TShirt[]>([])
  const [featuredCollections, setFeaturedCollections] = useState<Collection[]>([])
  const [isCollectionOverviewSettingsOpen, setIsCollectionOverviewSettingsOpen] = useState(false)
  const [isFeaturedShirtsOpen, setIsFeaturedShirtsOpen] = useState(false)
  const [isFeaturedCollectionsOpen, setIsFeaturedCollectionsOpen] = useState(false)
  const [tshirts, setTshirts] = useState<TShirt[]>([])
  const [userCollections, setUserCollections] = useState<Collection[]>([])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('Auth error:', userError)
        throw new Error('Authentication error: ' + userError.message)
      }
      
      if (!user) {
        throw new Error('No user found')
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB')
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      // Upload the file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      console.log('Uploading file:', {
        fileName,
        filePath,
        fileSize: file.size,
        fileType: file.type
      })

      // Try to upload directly
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error('Upload failed: ' + uploadError.message)
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      console.log('Got public URL:', publicUrl)

      // Update the profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        throw new Error('Failed to update profile: ' + updateError.message)
      }

      // Update the local state
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
      toast.success('Profile picture updated successfully')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update profile picture')
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) {
          console.error('Auth error:', userError)
          throw userError
        }
        
        if (!user) {
          console.log('No user found, redirecting to login')
          router.push('/login')
          return
        }

        console.log('Fetching profile for user:', user.id)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          throw profileError
        }

        if (!profileData) {
          console.error('No profile found for user:', user.id)
          throw new Error('Profile not found')
        }

        // Add default values for collection_overview_preferences if they don't exist
        const profileWithDefaults = {
          ...profileData,
          collection_overview_preferences: profileData.collection_overview_preferences || {
            showTotalItems: true,
            showEstimatedValue: true,
            showLicensing: true,
            showTags: true,
            order: ['totalItems', 'estimatedValue', 'licensing', 'tags']
          },
          featured_shirts: profileData.featured_shirts || [],
          featured_collections: profileData.featured_collections || []
        }

        console.log('Profile data:', profileWithDefaults)
        setProfile(profileWithDefaults)

        // Try to fetch collection stats, but don't throw if the table doesn't exist
        try {
          console.log('Fetching collection stats')
          const { data: items, error: itemsError } = await supabase
            .from('t_shirts')
            .select('*')
            .eq('user_id', user.id)

          if (itemsError) {
            console.warn('Collection stats not available:', itemsError)
            // Set default empty stats
            setStats({
              totalItems: 0,
              totalValue: 0,
              licensing: [],
              tags: []
            })
            return
          }

          console.log('Collection items:', items)
          const totalItems = items.length
          const totalValue = items.reduce((sum, item) => sum + (Number(item.estimated_value) || 0), 0)
          
          // Calculate licensing
          const licensingCounts = items.reduce((acc, item) => {
            acc[item.licensing] = (acc[item.licensing] || 0) + 1
            return acc
          }, {} as Record<string, number>)

          const licensing = Object.entries(licensingCounts).map(([name, count]) => ({
            name,
            count: count as number
          }))

          // Calculate tags
          const tagCounts = items.reduce((acc, item) => {
            item.tags.forEach((tag: string) => {
              acc[tag] = (acc[tag] || 0) + 1
            })
            return acc
          }, {} as Record<string, number>)

          const tags = Object.entries(tagCounts)
            .sort((a, b) => (b[1] as number) - (a[1] as number)) // Sort by count in descending order
            .slice(0, 10) // Take top 10 tags
            .map(([name, count]) => ({
              name,
              count: count as number
            }))

          const statsData = {
            totalItems,
            totalValue,
            licensing,
            tags
          }
          console.log('Stats data:', statsData)
          setStats(statsData)
        } catch (error) {
          console.warn('Collection stats not available:', error)
          // Set default empty stats
          setStats({
            totalItems: 0,
            totalValue: 0,
            licensing: [],
            tags: []
          })
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        if (err instanceof Error) {
          console.error('Error details:', err.message)
        }
        setError('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [router, supabase])

  const handleSave = async () => {
    if (!profile) return

    try {
      console.log('Updating profile with data:', editedProfile)
      
      // First, check if we have any changes to save
      if (Object.keys(editedProfile).length === 0) {
        console.log('No changes to save')
        setIsEditing(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(editedProfile)
        .eq('id', profile.id)
        .select()
        .single()

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }

      console.log('Profile updated successfully:', data)
      
      // Update local state with the returned data
      setProfile(data)
      setIsEditing(false)
      setEditedProfile({})
      toast.success('Profile updated successfully')
    } catch (err) {
      console.error('Error updating profile:', err)
      if (err instanceof Error) {
        console.error('Error details:', err.message)
        toast.error(err.message)
      } else {
        toast.error('Failed to update profile')
      }
      setError('Failed to update profile')
    }
  }

  const fetchFeaturedItems = async () => {
    if (!profile) return

    try {
      // Fetch featured shirts
      if (profile.featured_shirts?.length > 0) {
        const { data: shirts, error: shirtsError } = await supabase
          .from('t_shirts')
          .select('*')
          .in('id', profile.featured_shirts)

        if (!shirtsError && shirts) {
          setFeaturedShirts(shirts)
        }
      }

      // Fetch featured collections
      if (profile.featured_collections?.length > 0) {
        const { data: collections, error: collectionsError } = await supabase
          .from('collections')
          .select('*')
          .in('id', profile.featured_collections)

        if (!collectionsError && collections) {
          setFeaturedCollections(collections)
        }
      }
    } catch (error) {
      console.error('Error fetching featured items:', error)
    }
  }

  useEffect(() => {
    fetchFeaturedItems()
  }, [profile])

  const updateCollectionOverviewPreferences = async (preferences: Profile['collection_overview_preferences']) => {
    if (!profile) return

    try {
      console.log('Updating preferences with:', preferences)
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ collection_overview_preferences: preferences })
        .eq('id', profile.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating preferences:', error)
        throw new Error(`Failed to update preferences: ${error.message}`)
      }

      if (!data) {
        throw new Error('No data returned after updating preferences')
      }

      console.log('Successfully updated preferences:', data)
      setProfile(prev => prev ? { ...prev, collection_overview_preferences: preferences } : null)
      toast.success('Collection overview preferences updated successfully')
    } catch (error) {
      console.error('Error updating preferences:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update preferences')
    }
  }

  const updateFeaturedItems = async (type: 'shirts' | 'collections', ids: number[]) => {
    if (!profile) return

    try {
      console.log(`Updating featured ${type} with ids:`, ids)
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ [`featured_${type}`]: ids })
        .eq('id', profile.id)
        .select()
        .single()

      if (error) {
        console.error(`Error updating featured ${type}:`, error)
        throw new Error(`Failed to update featured ${type}: ${error.message}`)
      }

      if (!data) {
        throw new Error(`No data returned after updating featured ${type}`)
      }

      console.log(`Successfully updated featured ${type}:`, data)
      setProfile(prev => prev ? { ...prev, [`featured_${type}`]: ids } : null)
      toast.success(`Featured ${type} updated successfully`)
    } catch (error) {
      console.error(`Error updating featured ${type}:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to update featured ${type}`)
    }
  }

  useEffect(() => {
    const fetchTshirtsAndCollections = async () => {
      if (!profile) return

      // Fetch t-shirts
      const { data: shirts, error: shirtsError } = await supabase
        .from('t_shirts')
        .select('*')
        .eq('user_id', profile.id)

      if (!shirtsError && shirts) {
        setTshirts(shirts)
      }

      // Fetch collections
      const { data: collections, error: collectionsError } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', profile.id)

      if (!collectionsError && collections) {
        setUserCollections(collections)
      }
    }

    fetchTshirtsAndCollections()
  }, [profile])

  if (isLoading) {
  return (
    <div className="container py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
                </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center text-red-500">{error}</div>
        </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="container py-8">
      <Tabs defaultValue="my-profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-profile">My Profile</TabsTrigger>
          <TabsTrigger value="public-profile">Public Profile</TabsTrigger>
          </TabsList>

        <TabsContent value="my-profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Manage your personal details and preferences</CardDescription>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit Profile
              </Button>
                )}
            </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback>{profile.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div 
                      className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={handleAvatarClick}
                    >
                      <Edit className="h-6 w-6 text-white" />
                      </div>
                    )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                  />
                  </div>
                <div>
                  <h3 className="text-xl font-semibold">{profile.username || 'Set Username'}</h3>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
            </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editedProfile.username || profile.username || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Choose a username"
                    />
                        </div>

                  <div className="grid gap-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={editedProfile.full_name || profile.full_name || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Your full name"
                    />
                        </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                    />
                        </div>

                  <div className="grid gap-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editedProfile.bio || profile.bio || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself"
                      className="min-h-[100px]"
                    />
                        </div>
                        </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editedProfile.location || profile.location || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Where are you based?"
                    />
                        </div>

                  <div className="grid gap-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={editedProfile.website || profile.website || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, website: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Your personal website"
                    />
                        </div>

                  <div className="grid gap-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={editedProfile.instagram || profile.instagram || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, instagram: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Your Instagram username"
                    />
                        </div>

                  <div className="grid gap-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={editedProfile.twitter || profile.twitter || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, twitter: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Your Twitter username"
                    />
                      </div>

                  <div className="grid gap-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={editedProfile.facebook || profile.facebook || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, facebook: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Your Facebook username"
                    />
                    </div>
                        </div>
                        </div>

              {isEditing && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false)
                    setEditedProfile({})
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                        </div>
              )}
            </CardContent>
          </Card>

          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Collection Overview</CardTitle>
                <CardDescription>Statistics about your t-shirt collection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border p-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Total Items</h4>
                        <p className="text-2xl font-bold mt-1">{stats.totalItems}</p>
                        </div>
                      <div className="rounded-lg border p-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Estimated Value</h4>
                        <p className="text-2xl font-bold mt-1">${stats.totalValue.toLocaleString()}</p>
                        </div>
                        </div>

                    <div className="rounded-lg border p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Licensing</h4>
                      <div className="flex flex-wrap gap-2">
                        {stats.licensing.map((licensing) => (
                          <Badge key={licensing.name} variant="secondary" className="text-sm">
                            {licensing.name} ({licensing.count})
                          </Badge>
                        ))}
                        </div>
                        </div>
                      </div>

                  <div className="space-y-6">
                    <div className="rounded-lg border p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Top Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {stats.tags.map((tag) => (
                          <Badge key={tag.name} variant="secondary" className="text-sm">
                            {tag.name} ({tag.count})
                          </Badge>
                        ))}
                    </div>
                        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}
          </TabsContent>

        <TabsContent value="public-profile" className="space-y-6">
              <Card>
                <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control what information is visible to other users</CardDescription>
                </CardHeader>
            <CardContent className="space-y-6">
                  <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Email</Label>
                    <p className="text-sm text-muted-foreground">Display your email address on your public profile</p>
                  </div>
                  <Switch
                    checked={profile.show_email}
                    onCheckedChange={(checked) => setEditedProfile({ ...editedProfile, show_email: checked })}
                        />
                      </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Location</Label>
                    <p className="text-sm text-muted-foreground">Display your location on your public profile</p>
                      </div>
                  <Switch
                    checked={profile.show_location}
                    onCheckedChange={(checked) => setEditedProfile({ ...editedProfile, show_location: checked })}
                  />
                    </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Website</Label>
                    <p className="text-sm text-muted-foreground">Display your website on your public profile</p>
                  </div>
                  <Switch
                    checked={profile.show_website}
                    onCheckedChange={(checked) => setEditedProfile({ ...editedProfile, show_website: checked })}
                        />
                      </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Social Links</Label>
                    <p className="text-sm text-muted-foreground">Display your social media links on your public profile</p>
                      </div>
                  <Switch
                    checked={profile.show_social}
                    onCheckedChange={(checked) => setEditedProfile({ ...editedProfile, show_social: checked })}
                  />
                    </div>
                  </div>

              {Object.keys(editedProfile).length > 0 && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditedProfile({})}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              )}
            </CardContent>
              </Card>

              <Card>
                <CardHeader>
              <CardTitle>Public Profile Preview</CardTitle>
              <CardDescription>How your profile will appear to other users</CardDescription>
                </CardHeader>
                <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback>{profile.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{profile.username || 'Set Username'}</h3>
                  {profile.show_email && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4" />
                      {profile.email}
                    </p>
                  )}
                      </div>
                      </div>

              {profile.bio && (
                <p className="mt-4 text-sm text-muted-foreground">{profile.bio}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {profile.show_location && profile.location && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {profile.location}
                  </Badge>
                )}
                {profile.show_website && profile.website && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    {profile.website}
                  </Badge>
                )}
                    </div>

              {profile.show_social && (
                <div className="mt-4 flex gap-4">
                  {profile.instagram && (
                    <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {profile.twitter && (
                    <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {profile.facebook && (
                    <a href={`https://facebook.com/${profile.facebook}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                      </div>
              )}

              {stats && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Collection Overview</h3>
                    <Button variant="outline" size="sm" onClick={() => setIsCollectionOverviewSettingsOpen(true)}>
                      <Settings className="h-4 w-4 mr-2" /> Customize
                    </Button>
                      </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {profile.collection_overview_preferences.order.map((item) => {
                      switch (item) {
                        case 'totalItems':
                          return profile.collection_overview_preferences.showTotalItems && (
                            <div key="totalItems" className="rounded-lg border p-4">
                              <h4 className="text-sm font-medium text-muted-foreground">Total Items</h4>
                              <p className="text-2xl font-bold mt-1">{stats.totalItems}</p>
                    </div>
                          )
                        case 'estimatedValue':
                          return profile.collection_overview_preferences.showEstimatedValue && (
                            <div key="estimatedValue" className="rounded-lg border p-4">
                              <h4 className="text-sm font-medium text-muted-foreground">Estimated Value</h4>
                              <p className="text-2xl font-bold mt-1">${stats.totalValue.toLocaleString()}</p>
                  </div>
                          )
                        case 'licensing':
                          return profile.collection_overview_preferences.showLicensing && (
                            <div key="licensing" className="rounded-lg border p-4">
                              <h4 className="text-sm font-medium text-muted-foreground mb-3">Licensing</h4>
                              <div className="flex flex-wrap gap-2">
                                {stats.licensing.map((licensing) => (
                                  <Badge key={licensing.name} variant="secondary" className="text-sm">
                                    {licensing.name} ({licensing.count})
                                  </Badge>
                                ))}
            </div>
                      </div>
                          )
                        case 'tags':
                          return profile.collection_overview_preferences.showTags && (
                            <div key="tags" className="rounded-lg border p-4">
                              <h4 className="text-sm font-medium text-muted-foreground mb-3">Top Tags</h4>
                              <div className="flex flex-wrap gap-2">
                                {stats.tags.map((tag) => (
                                  <Badge key={tag.name} variant="secondary" className="text-sm">
                                    {tag.name} ({tag.count})
                                  </Badge>
                                ))}
                    </div>
                      </div>
                          )
                        default:
                          return null
                      }
                    })}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Featured Shirts</h3>
                  <Button variant="outline" size="sm" onClick={() => setIsFeaturedShirtsOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                    </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {featuredShirts.map((shirt) => (
                    <Card key={shirt.id} className="overflow-hidden">
                      <div className="relative aspect-square">
                        <Image
                          src={shirt.image || "/placeholder.svg"}
                          alt={shirt.name}
                          fill
                          className="object-cover"
                        />
                  </div>
                      <CardContent className="p-4">
                        <h4 className="font-medium truncate">{shirt.name}</h4>
                        <p className="text-sm text-muted-foreground">{shirt.licensing} • {shirt.year}</p>
                </CardContent>
              </Card>
                  ))}
            </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Featured Collections</h3>
                  <Button variant="outline" size="sm" onClick={() => setIsFeaturedCollectionsOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                    </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {featuredCollections.map((collection) => (
                    <Card key={collection.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {collection.icon ? (
                            <span className="text-2xl">{collection.icon}</span>
                          ) : (
                            <div className={`w-6 h-6 rounded-full ${collection.color}`}></div>
                          )}
                          <h4 className="font-medium">{collection.name}</h4>
                      </div>
                        <p className="text-sm text-muted-foreground">{collection.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

          {/* Collection Overview Settings Dialog */}
          <Dialog open={isCollectionOverviewSettingsOpen} onOpenChange={setIsCollectionOverviewSettingsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Customize Collection Overview</DialogTitle>
                <DialogDescription>Choose what to display and in what order</DialogDescription>
              </DialogHeader>
                    <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Display Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Total Items</span>
                      <Switch
                        checked={profile.collection_overview_preferences.showTotalItems}
                        onCheckedChange={(checked) => {
                          const newPrefs = {
                            ...profile.collection_overview_preferences,
                            showTotalItems: checked
                          }
                          updateCollectionOverviewPreferences(newPrefs)
                        }}
                      />
                        </div>
                    <div className="flex items-center justify-between">
                      <span>Estimated Value</span>
                      <Switch
                        checked={profile.collection_overview_preferences.showEstimatedValue}
                        onCheckedChange={(checked) => {
                          const newPrefs = {
                            ...profile.collection_overview_preferences,
                            showEstimatedValue: checked
                          }
                          updateCollectionOverviewPreferences(newPrefs)
                        }}
                      />
                          </div>
                    <div className="flex items-center justify-between">
                      <span>Licensing</span>
                      <Switch
                        checked={profile.collection_overview_preferences.showLicensing}
                        onCheckedChange={(checked) => {
                          const newPrefs = {
                            ...profile.collection_overview_preferences,
                            showLicensing: checked
                          }
                          updateCollectionOverviewPreferences(newPrefs)
                        }}
                      />
                        </div>
                    <div className="flex items-center justify-between">
                      <span>Tags</span>
                      <Switch
                        checked={profile.collection_overview_preferences.showTags}
                        onCheckedChange={(checked) => {
                          const newPrefs = {
                            ...profile.collection_overview_preferences,
                            showTags: checked
                          }
                          updateCollectionOverviewPreferences(newPrefs)
                        }}
                      />
                      </div>
                        </div>
                </div>
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <div className="space-y-2">
                    {profile.collection_overview_preferences.order.map((item, index) => (
                      <div key={item} className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newOrder = [...profile.collection_overview_preferences.order]
                            if (index > 0) {
                              [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]]
                              updateCollectionOverviewPreferences({
                                ...profile.collection_overview_preferences,
                                order: newOrder
                              })
                            }
                          }}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newOrder = [...profile.collection_overview_preferences.order]
                            if (index < newOrder.length - 1) {
                              [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
                              updateCollectionOverviewPreferences({
                                ...profile.collection_overview_preferences,
                                order: newOrder
                              })
                            }
                          }}
                          disabled={index === profile.collection_overview_preferences.order.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <span className="flex-1">{item}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newOrder = profile.collection_overview_preferences.order.filter(i => i !== item)
                            updateCollectionOverviewPreferences({
                              ...profile.collection_overview_preferences,
                              order: newOrder
                            })
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const newOrder = [...profile.collection_overview_preferences.order]
                        const availableItems = ['totalItems', 'estimatedValue', 'licensing', 'tags']
                          .filter(item => !newOrder.includes(item))
                        if (availableItems.length > 0) {
                          newOrder.push(availableItems[0])
                          updateCollectionOverviewPreferences({
                            ...profile.collection_overview_preferences,
                            order: newOrder
                          })
                        }
                      }}
                    >
                      Add Item
                    </Button>
                          </div>
                        </div>
                      </div>
            </DialogContent>
          </Dialog>

          {/* Featured Shirts Dialog */}
          <Dialog open={isFeaturedShirtsOpen} onOpenChange={setIsFeaturedShirtsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Featured Shirts</DialogTitle>
                <DialogDescription>Select shirts to showcase on your profile</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {tshirts.map((shirt) => (
                    <Card
                      key={shirt.id}
                      className={`overflow-hidden cursor-pointer ${
                        profile.featured_shirts.includes(shirt.id) ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => {
                        const newFeaturedShirts = profile.featured_shirts.includes(shirt.id)
                          ? profile.featured_shirts.filter(id => id !== shirt.id)
                          : [...profile.featured_shirts, shirt.id]
                        updateFeaturedItems('shirts', newFeaturedShirts)
                      }}
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={shirt.image || "/placeholder.svg"}
                          alt={shirt.name}
                          fill
                          className="object-cover"
                        />
                    </div>
                      <CardContent className="p-4">
                        <h4 className="font-medium truncate">{shirt.name}</h4>
                        <p className="text-sm text-muted-foreground">{shirt.licensing} • {shirt.year}</p>
                  </CardContent>
                </Card>
                  ))}
              </div>
            </div>
            </DialogContent>
          </Dialog>

          {/* Featured Collections Dialog */}
          <Dialog open={isFeaturedCollectionsOpen} onOpenChange={setIsFeaturedCollectionsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Featured Collections</DialogTitle>
                <DialogDescription>Select collections to showcase on your profile</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userCollections.map((collection) => (
                    <Card
                      key={collection.id}
                      className={`overflow-hidden cursor-pointer ${
                        profile.featured_collections.includes(collection.id) ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => {
                        const newFeaturedCollections = profile.featured_collections.includes(collection.id)
                          ? profile.featured_collections.filter(id => id !== collection.id)
                          : [...profile.featured_collections, collection.id]
                        updateFeaturedItems('collections', newFeaturedCollections)
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {collection.icon ? (
                            <span className="text-2xl">{collection.icon}</span>
                          ) : (
                            <div className={`w-6 h-6 rounded-full ${collection.color}`}></div>
                          )}
                          <h4 className="font-medium">{collection.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{collection.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </TabsContent>
        </Tabs>
    </div>
  )
}

