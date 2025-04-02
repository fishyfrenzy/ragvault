"use client"

import React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, ShirtIcon, ShoppingBag, MessageSquare, BookOpen, Vault, History, User as UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [lastProfileFetch, setLastProfileFetch] = useState<number>(0)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null)
      if (session?.user) {
        console.log('User ID:', session.user.id)
        fetchProfile(session.user.id)
      } else {
        setUsername(null)
        setAvatarUrl(null)
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setUsername(null)
        setAvatarUrl(null)
      }
      setIsLoading(false)
    })

    return () => {
      mounted = false;
      subscription.unsubscribe()
    }
  }, [supabase])

  const fetchProfile = async (userId: string) => {
    try {
      // Rate limit profile fetches to once every 2 seconds
      const now = Date.now();
      if (now - lastProfileFetch < 2000) {
        return;
      }
      setLastProfileFetch(now);

      console.log('Fetching profile for user:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error.message, error.details, error.hint)
        return
      }

      setUsername(data?.username || null)
      setAvatarUrl(data?.avatar_url || null)
    } catch (err) {
      console.error('Error in fetchProfile:', err)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh() // Refresh server components
    router.push('/login')
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo as home button */}
          <Link href="/" className="flex items-center space-x-2">
            <Vault className="h-6 w-6" />
            <span className="font-bold text-xl hidden sm:inline-block">RagVault</span>
          </Link>
          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Collection Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    onClick={() => router.push('/collection')}
                    className="flex items-center gap-2"
                  >
                    <ShirtIcon className="h-4 w-4" />
                    Collection
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            onClick={(e) => {
                              e.preventDefault()
                              router.push('/collection')
                            }}
                            href="/collection"
                          >
                            <ShirtIcon className="h-12 w-12 mb-4 text-primary/70" />
                            <div className="mb-2 mt-4 text-lg font-medium">My Collection</div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Manage and organize your t-shirt collection with detailed tracking
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/collection?view=grid" onClick={(e) => {
                        e.preventDefault()
                        router.push('/collection?view=grid')
                      }} title="Grid View">
                        Browse your collection in a visual grid layout
                      </ListItem>
                      <ListItem href="/collection?view=list" onClick={(e) => {
                        e.preventDefault()
                        router.push('/collection?view=list')
                      }} title="List View">
                        See your collection in a detailed spreadsheet view
                      </ListItem>
                      <ListItem href="/collection/add" onClick={(e) => {
                        e.preventDefault()
                        router.push('/collection/add')
                      }} title="Add Item">
                        Add a new t-shirt to your collection
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* The Vault Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    onClick={() => router.push('/vault')}
                    className="flex items-center gap-2"
                  >
                    <History className="h-4 w-4" />
                    The Vault
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            onClick={(e) => {
                              e.preventDefault()
                              router.push('/vault')
                            }}
                            href="/vault"
                          >
                            <History className="h-12 w-12 mb-4 text-primary/70" />
                            <div className="mb-2 mt-4 text-lg font-medium">The Vault</div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              The definitive wiki-style database of t-shirts with detailed information
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/vault?category=band" onClick={(e) => {
                        e.preventDefault()
                        router.push('/vault?category=band')
                      }} title="Band Tees">
                        Explore iconic t-shirts from bands across different music genres
                      </ListItem>
                      <ListItem href="/vault?category=movie" onClick={(e) => {
                        e.preventDefault()
                        router.push('/vault?category=movie')
                      }} title="Movie Tees">
                        Discover promotional and collectible t-shirts from classic films
                      </ListItem>
                      <ListItem href="/vault/contribute" onClick={(e) => {
                        e.preventDefault()
                        router.push('/vault/contribute')
                      }} title="Contribute">
                        Help build the database by adding your knowledge and research
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Marketplace Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    onClick={() => router.push('/marketplace')}
                    className="flex items-center gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Marketplace
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            onClick={(e) => {
                              e.preventDefault()
                              router.push('/marketplace')
                            }}
                            href="/marketplace"
                          >
                            <ShoppingBag className="h-12 w-12 mb-4 text-primary/70" />
                            <div className="mb-2 mt-4 text-lg font-medium">Marketplace</div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Buy, sell, and trade t-shirts with other collectors
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/marketplace?tab=buy" onClick={(e) => {
                        e.preventDefault()
                        router.push('/marketplace?tab=buy')
                      }} title="Buy">
                        Browse t-shirts for sale
                      </ListItem>
                      <ListItem href="/marketplace?tab=sell" onClick={(e) => {
                        e.preventDefault()
                        router.push('/marketplace?tab=sell')
                      }} title="Sell">
                        List your t-shirts for sale
                      </ListItem>
                      <ListItem href="/marketplace?tab=iso" onClick={(e) => {
                        e.preventDefault()
                        router.push('/marketplace?tab=iso')
                      }} title="In Search Of">
                        Find specific t-shirts you're looking for
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Forums Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    onClick={() => router.push('/forums')}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Forums
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            onClick={(e) => {
                              e.preventDefault()
                              router.push('/forums')
                            }}
                            href="/forums"
                          >
                            <MessageSquare className="h-12 w-12 mb-4 text-primary/70" />
                            <div className="mb-2 mt-4 text-lg font-medium">Forums</div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Join discussions with other t-shirt enthusiasts
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/forums?tab=recent" onClick={(e) => {
                        e.preventDefault()
                        router.push('/forums?tab=recent')
                      }} title="Recent Discussions">
                        See the latest topics and conversations
                      </ListItem>
                      <ListItem href="/forums?tab=categories" onClick={(e) => {
                        e.preventDefault()
                        router.push('/forums?tab=categories')
                      }} title="Categories">
                        Browse discussions by category
                      </ListItem>
                      <ListItem href="/forums?tab=popular" onClick={(e) => {
                        e.preventDefault()
                        router.push('/forums?tab=popular')
                      }} title="Popular">
                        View the most active and popular threads
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Blog Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    onClick={() => router.push('/blog')}
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Blog
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            onClick={(e) => {
                              e.preventDefault()
                              router.push('/blog')
                            }}
                            href="/blog"
                          >
                            <BookOpen className="h-12 w-12 mb-4 text-primary/70" />
                            <div className="mb-2 mt-4 text-lg font-medium">Blog</div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Articles, guides, and news about vintage t-shirts
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/blog/category/guides" onClick={(e) => {
                        e.preventDefault()
                        router.push('/blog/category/guides')
                      }} title="Guides">
                        Learn about collecting, authenticating, and caring for t-shirts
                      </ListItem>
                      <ListItem href="/blog/category/history" onClick={(e) => {
                        e.preventDefault()
                        router.push('/blog/category/history')
                      }} title="History">
                        Explore the history of iconic t-shirts and designs
                      </ListItem>
                      <ListItem href="/blog/category/trends" onClick={(e) => {
                        e.preventDefault()
                        router.push('/blog/category/trends')
                      }} title="Trends">
                        Stay up to date with the latest trends in vintage t-shirts
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={username || 'User avatar'}
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{username || 'Set Username'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/collection">My Collection</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="grid gap-4 py-4">
                <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                  <Vault className="h-6 w-6" />
                  <span className="font-bold text-xl">RagVault</span>
                </Link>
                <div className="grid gap-2">
                  <Link href="/collection" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <ShirtIcon className="mr-2 h-4 w-4" />
                      Collection
                    </Button>
                  </Link>
                  <Link href="/vault" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <History className="mr-2 h-4 w-4" />
                      The Vault
                    </Button>
                  </Link>
                  <Link href="/marketplace" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Marketplace
                    </Button>
                  </Link>
                  <Link href="/forums" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Forums
                    </Button>
                  </Link>
                  <Link href="/blog" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Blog
                    </Button>
                  </Link>
                  {!user && (
                    <>
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Sign in
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setIsOpen(false)}>
                        <Button className="w-full">Sign up</Button>
                      </Link>
                    </>
                  )}
                  {user && (
                    <>
                      <Link href="/profile" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          Profile
                        </Button>
                      </Link>
                      <Button variant="ghost" className="w-full justify-start">
                        Sign out
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

