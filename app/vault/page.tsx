"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Plus, Search, ShoppingBag, SlidersHorizontal } from "lucide-react"
import { ComingSoon } from "@/components/coming-soon"

// Mock data for marketplace listings
const mockListings = [
  {
    id: 1,
    title: "Vintage Nirvana 1992 Tour T-Shirt",
    seller: "vintage_collector",
    price: 250,
    condition: "Good",
    size: "L",
    location: "Seattle, WA",
    image: "/placeholder.svg?height=300&width=300",
    description: "Original Nirvana tour t-shirt from 1992. Some fading but overall in good condition.",
    tags: ["grunge", "band", "vintage", "concert"],
    listedDate: "2023-06-15",
    shipping: 12,
    type: "sale",
  },
  {
    id: 2,
    title: "Supreme Box Logo Tee 2018",
    seller: "hypebeast99",
    price: 180,
    condition: "Excellent",
    size: "M",
    location: "New York, NY",
    image: "/placeholder.svg?height=300&width=300",
    description: "Supreme Box Logo t-shirt from the 2018 collection. Worn only a few times, excellent condition.",
    tags: ["streetwear", "hypebeast", "limited"],
    listedDate: "2023-07-20",
    shipping: 8,
    type: "sale",
  },
  {
    id: 3,
    title: "Metallica Master of Puppets Original",
    seller: "metalhead",
    price: 300,
    condition: "Fair",
    size: "XL",
    location: "Los Angeles, CA",
    image: "/placeholder.svg?height=300&width=300",
    description: "Original Metallica Master of Puppets t-shirt from the 80s. Shows wear but still very collectible.",
    tags: ["metal", "band", "vintage", "concert"],
    listedDate: "2023-05-05",
    shipping: 15,
    type: "sale",
  },
  {
    id: 4,
    title: "Nike ACG Outdoor Series",
    seller: "outdoorgear",
    price: 45,
    condition: "Very Good",
    size: "L",
    location: "Portland, OR",
    image: "/placeholder.svg?height=300&width=300",
    description: "Nike ACG (All Conditions Gear) t-shirt from recent collection. Great for outdoor activities.",
    tags: ["sports", "outdoor", "modern"],
    listedDate: "2023-08-10",
    shipping: 5,
    type: "sale",
  },
  {
    id: 5,
    title: "ISO: Grateful Dead 1977 Tour Shirt",
    seller: "deadhead",
    price: null,
    condition: null,
    size: "Any",
    location: "San Francisco, CA",
    image: "/placeholder.svg?height=300&width=300",
    description:
      "Looking for any Grateful Dead tour shirt from the 1977 tour. Willing to pay top dollar for good condition.",
    tags: ["band", "vintage", "concert", "wanted"],
    listedDate: "2023-07-25",
    shipping: null,
    type: "iso",
  },
  {
    id: 6,
    title: "ISO: Run The Jewels Limited Edition",
    seller: "musicfan",
    price: null,
    condition: null,
    size: "M or L",
    location: "Chicago, IL",
    image: "/placeholder.svg?height=300&width=300",
    description:
      "Searching for the limited edition Run The Jewels shirt from their 2020 tour. Must be in good condition.",
    tags: ["hip-hop", "modern", "concert", "wanted"],
    listedDate: "2023-08-15",
    shipping: null,
    type: "iso",
  },
]

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("buy")

  // Filter the listings based on search query
  const filteredListings = mockListings.filter(
    (listing) =>
      listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const saleListings = filteredListings.filter((listing) => listing.type === "sale")
  const isoListings = filteredListings.filter((listing) => listing.type === "iso")

  return (
    <div className="container py-8 relative">
      <div className="opacity-30">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
            <p className="text-muted-foreground">Buy, sell, or find specific t-shirts you're looking for</p>
          </div>

          <Tabs defaultValue="buy" className="w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <TabsList>
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="iso">In Search Of</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search marketplace..."
                    className="pl-8 w-full sm:w-[200px] md:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="buy" className="mt-0">
              <div className="flex justify-end mb-4">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> List Item for Sale
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {saleListings.slice(0, 4).map((listing) => (
                  <Card key={listing.id} className="overflow-hidden flex flex-col">
                    <div className="relative aspect-square">
                      <Image
                        src={listing.image || "/placeholder.svg"}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
                      <CardDescription className="flex justify-between items-center">
                        <span>by {listing.seller}</span>
                        <Badge variant="outline">{listing.condition}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{listing.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <div className="text-lg font-bold">${listing.price}</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Heart className="h-4 w-4 mr-1" /> Save
                        </Button>
                        <Button size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" /> Contact
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ComingSoon
        title="Marketplace Coming Soon"
        description="Buy, sell, and trade t-shirts with collectors around the world. Find rare pieces and connect with sellers."
        icon={<ShoppingBag className="h-16 w-16 text-primary/70" />}
      />
    </div>
  )
}

