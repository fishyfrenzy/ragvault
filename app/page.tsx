import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight,
  ShoppingBag,
  MessageSquare,
  Users,
  Cog,
  Calendar,
  ThumbsUp,
  Clock,
  ChevronRight,
  Tag,
  Eye,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Combined Hero Section with Features */}
      <section className="w-full py-12 md:py-24 lg:py-32 relative">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-SvFGlRwLuuNHCPILNMt2WXPu47tXtl.png"
            alt="Collection of vintage t-shirts"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 to-background/70 backdrop-blur-sm"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center space-y-8 text-center mb-12">
            <div className="space-y-4 max-w-[800px]">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">RagVault</h1>
                <p className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                  Catalog. Collect. Connect.
                </p>
              </div>
              <p className="text-muted-foreground md:text-xl">
                Join a community-built database where every tee tells a story. Track, collect, and connect with fellow
                enthusiasts.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Button asChild size="lg">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <Card className="bg-background/90 backdrop-blur-sm border-primary/10 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-medium">Collection Management</CardTitle>
                <Cog className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Catalog your t-shirts with detailed information, photos, and condition notes.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/collection" className="text-sm text-primary flex items-center">
                  View Collection <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
            <Card className="bg-background/90 backdrop-blur-sm border-primary/10 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-medium">Marketplace</CardTitle>
                <ShoppingBag className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Buy, sell, or trade t-shirts with other collectors. Create ISO listings for items you want.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/marketplace" className="text-sm text-primary flex items-center">
                  Browse Marketplace <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
            <Card className="bg-background/90 backdrop-blur-sm border-primary/10 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-medium">Community</CardTitle>
                <MessageSquare className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Join discussions, share knowledge, and connect with other t-shirt enthusiasts.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/forums" className="text-sm text-primary flex items-center">
                  Join Forums <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Shirt of the Day Section */}
      <section className="w-full py-12 md:py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-8 items-center bg-gradient-to-r from-background via-primary/5 to-background rounded-xl p-6 shadow-lg">
            <div className="md:w-1/2">
              <div className="flex items-center gap-2 mb-4">
                <Badge
                  variant="outline"
                  className="text-sm font-medium bg-primary/10 text-primary border-primary/20 px-3 py-1 text-base animate-pulse"
                >
                  Shirt of the Day
                </Badge>
                <span className="text-sm text-muted-foreground">Featured on {new Date().toLocaleDateString()}</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight mb-4">
                Vintage Metallica 'And Justice For All' Tour Tee 1988
              </h2>
              <p className="text-muted-foreground mb-6">
                Original 1988 Metallica 'And Justice For All' tour t-shirt. Shows some fading and minor cracking in the
                print, but overall in good condition for its age. A rare find for any metal band collector.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary">metal</Badge>
                <Badge variant="secondary">band</Badge>
                <Badge variant="secondary">vintage</Badge>
                <Badge variant="secondary">80s</Badge>
                <Badge variant="secondary">tour</Badge>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-2xl font-bold">$250</div>
                <Badge>Good Condition</Badge>
                <Badge variant="outline">Size L</Badge>
              </div>
              <div className="flex gap-3">
                <Button size="lg" asChild className="text-lg px-8 py-6">
                  <Link href="/marketplace/item/1">View Details</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg">
                  <ShoppingBag className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="aspect-square relative rounded-lg overflow-hidden border shadow-lg ring-2 ring-primary/20 ring-offset-2 shadow-primary/20">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yr2uKgVsWY81kE9b6gq3hnBPbyoEH9.png"
                  alt="Vintage Metallica And Justice For All T-Shirt"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-background rounded-full p-3 shadow-lg border">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Discussion Section */}
      <section className="w-full py-12 md:py-16 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2 order-2 md:order-1">
              <div className="bg-background rounded-lg p-6 shadow-md border">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarImage
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                      alt="vintage_lover"
                    />
                    <AvatarFallback>VL</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">vintage_lover</div>
                    <div className="text-sm text-muted-foreground">Posted 2 days ago</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">Best way to store vintage t-shirts?</h3>
                <p className="text-muted-foreground mb-4">
                  I've been collecting vintage band tees for years and I'm worried about preserving them properly.
                  What's the best way to store them to prevent damage? Should I fold them, hang them, or use some other
                  method?
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MessageSquare className="mr-1 h-4 w-4" />
                      24 replies
                    </div>
                    <div className="flex items-center">
                      <Eye className="mr-1 h-4 w-4" />
                      342 views
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="mr-1 h-4 w-4" />
                      56 likes
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/forums/topic/1">
                      Join Discussion <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 order-1 md:order-2">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="text-sm font-medium bg-primary/10 text-primary border-primary/20">
                  Trending Discussion
                </Badge>
                <span className="text-sm text-muted-foreground">Hot topic in Collection Care</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Join the Conversation</h2>
              <p className="text-muted-foreground mb-6">
                Connect with fellow collectors, share your expertise, and learn from others in our active community
                forums. Discover tips, tricks, and best practices for maintaining your valuable collection.
              </p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href="/forums">
                    <MessageSquare className="mr-2 h-4 w-4" /> Browse Forums
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/forums/topic/1">View This Topic</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Preview Section */}
      <section className="w-full py-12 md:py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="text-sm font-medium bg-primary/10 text-primary border-primary/20">
                  Featured Article
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" /> 5 min read
                </div>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                The Rise of Vintage Band Tees as Fashion Statements
              </h2>
              <p className="text-muted-foreground mb-6">
                From concert memorabilia to high-fashion runways, vintage band t-shirts have transcended their original
                purpose to become coveted fashion items. Explore how these pieces of music history have evolved into
                status symbols and investment pieces.
              </p>
              <div className="flex items-center gap-3 mb-6">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
                    alt="Sarah Johnson"
                  />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">Sarah Johnson</div>
                  <div className="text-xs text-muted-foreground">Fashion Historian</div>
                </div>
              </div>
              <Button asChild>
                <Link href="/blog/vintage-band-tees-fashion">
                  Read Full Article <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="md:w-1/2">
              <div className="relative rounded-lg overflow-hidden shadow-lg border">
                <div className="aspect-video relative">
                  <Image
                    src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                    alt="Vintage band t-shirts hanging on a rack"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-background/80 backdrop-blur-sm text-foreground">
                    <Tag className="mr-1 h-3 w-3" /> Fashion
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Join Our Community</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Connect with thousands of t-shirt collectors around the world.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-medium"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Join <span className="font-medium">5,000+</span> collectors
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href="/register">
                <Users className="mr-2 h-4 w-4" /> Join Now
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

