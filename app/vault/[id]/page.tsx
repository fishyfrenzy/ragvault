"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  Flag,
  Heart,
  History,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Share2,
  ShoppingBag,
  Tag,
  ThumbsUp,
  User,
} from "lucide-react"

// Mock data for t-shirts in the vault
const mockTshirts = [
  {
    id: 1,
    name: "Metallica 'And Justice For All' Tour Tee",
    year: 1988,
    brand: "Metallica",
    category: "Band",
    image: "/placeholder.svg?height=300&width=300",
    additionalImages: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    description:
      "Original 1988 Metallica 'And Justice For All' tour t-shirt. One of the most iconic metal band shirts from the late 80s.",
    longDescription: `
      This is an original 1988 Metallica 'And Justice For All' tour t-shirt, one of the most iconic and sought-after metal band shirts from the late 80s. The shirt features the iconic Lady Justice artwork from the album cover on the front, with tour dates listed on the back.

      The 'And Justice For All' album was released on August 25, 1988, and was the band's fourth studio album. It was also the first album to feature bassist Jason Newsted, following the death of Cliff Burton. The album was a commercial and critical success, peaking at number 6 on the Billboard 200 and was certified 8× Platinum by the RIAA.

      The tour in support of the album ran from September 1988 to October 1989, covering North America, Europe, and Japan. This shirt was sold at venues during the North American leg of the tour.

      The original shirts from this tour are highly collectible due to their historical significance in metal culture and the iconic artwork.
    `,
    tags: ["metal", "band", "vintage", "80s", "tour", "black"],
    variants: ["Black", "White"],
    sizes: ["S", "M", "L", "XL"],
    averageValue: 250,
    rarity: "Rare",
    views: 1245,
    likes: 87,
    contributors: 12,
    lastUpdated: "2023-12-15",
    designer: "Pushead",
    material: "100% Cotton",
    printMethod: "Screen Print",
    marketplaceListings: [
      {
        id: 101,
        seller: "vintage_collector",
        condition: "Good",
        size: "L",
        price: 225,
        location: "Seattle, WA",
        description: "Original 1988 tour shirt. Some fading but overall in good condition.",
        images: ["/placeholder.svg?height=300&width=300"],
        listedDate: "2023-11-20",
      },
      {
        id: 102,
        seller: "metal_head",
        condition: "Very Good",
        size: "M",
        price: 275,
        location: "Los Angeles, CA",
        description: "Excellent condition with minimal wear. Original print still vibrant.",
        images: ["/placeholder.svg?height=300&width=300"],
        listedDate: "2023-12-05",
      },
      {
        id: 103,
        seller: "tshirt_archive",
        condition: "Fair",
        size: "XL",
        price: 180,
        location: "Chicago, IL",
        description: "Shows wear and some cracking in the print, but still a great collectible.",
        images: ["/placeholder.svg?height=300&width=300"],
        listedDate: "2024-01-10",
      },
      {
        id: 104,
        seller: "vintage_vault",
        condition: "Excellent",
        size: "L",
        price: 350,
        location: "New York, NY",
        description: "Near mint condition. Stored properly since purchase at the original tour.",
        images: ["/placeholder.svg?height=300&width=300"],
        listedDate: "2024-01-15",
      },
      {
        id: 105,
        seller: "concert_memorabilia",
        condition: "Good",
        size: "M",
        price: 230,
        location: "Austin, TX",
        description: "Original tour shirt with some fading. 100% authentic.",
        images: ["/placeholder.svg?height=300&width=300"],
        listedDate: "2024-01-18",
      },
    ],
    history: [
      {
        date: "2023-10-01",
        user: "vintage_expert",
        action: "Created entry",
        description: "Added basic information and first image",
      },
      {
        date: "2023-10-15",
        user: "metal_historian",
        action: "Updated description",
        description: "Added detailed information about the tour and album",
      },
      {
        date: "2023-11-05",
        user: "tshirt_collector",
        action: "Added images",
        description: "Uploaded additional photos showing front and back",
      },
      {
        date: "2023-12-15",
        user: "authentication_mod",
        action: "Verified information",
        description: "Confirmed details with multiple sources",
      },
    ],
    discussions: [
      {
        id: 1,
        user: "vintage_lover",
        userAvatar: "/placeholder.svg?height=40&width=40",
        date: "2023-10-10",
        content:
          "I have one of these from the original tour! The quality of these shirts was actually pretty good compared to other tour merch from that era.",
        replies: [
          {
            id: 11,
            user: "metal_historian",
            userAvatar: "/placeholder.svg?height=40&width=40",
            date: "2023-10-11",
            content:
              "Agreed! Metallica was one of the first bands to really invest in higher quality merchandise. The screen printing on these holds up remarkably well over time.",
          },
        ],
      },
      {
        id: 2,
        user: "tshirt_collector",
        userAvatar: "/placeholder.svg?height=40&width=40",
        date: "2023-11-15",
        content:
          "Does anyone know if there were different variants for different tour locations? I've seen some with slightly different back prints listing different dates.",
        replies: [
          {
            id: 21,
            user: "authentication_mod",
            userAvatar: "/placeholder.svg?height=40&width=40",
            date: "2023-11-16",
            content:
              "Yes, there were at least three different variants with different tour dates on the back. The European tour shirts also had a slightly different design with additional dates.",
          },
        ],
      },
    ],
    priceHistory: [
      { date: "2019-01", price: 150 },
      { date: "2020-01", price: 175 },
      { date: "2021-01", price: 200 },
      { date: "2022-01", price: 225 },
      { date: "2023-01", price: 240 },
      { date: "2024-01", price: 250 },
    ],
    authenticityFeatures: [
      "Original shirts have a single-stitch collar and sleeves",
      "Tag should read 'Made in USA' with no RN number",
      "Print has a slightly raised feel, indicating heavy ink application",
      "The black shirts were printed on Hanes Beefy-T blanks",
    ],
  },
  // Other t-shirts would be here
]

// Mock user data
const currentUser = {
  username: "tshirt_enthusiast",
  avatar: "/placeholder.svg?height=40&width=40",
}

export default function TshirtDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  // Find the t-shirt by ID
  const tshirt = mockTshirts.find((t) => t.id === id)

  // State for the active image
  const [activeImage, setActiveImage] = useState(0)

  // State for the discussion form
  const [newComment, setNewComment] = useState("")
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)

  // State for the edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editField, setEditField] = useState("")
  const [editValue, setEditValue] = useState("")

  // If t-shirt not found, show error
  if (!tshirt) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">T-Shirt Not Found</h1>
        <p className="text-muted-foreground mb-8">The t-shirt you're looking for doesn't exist in our vault.</p>
        <Button asChild>
          <Link href="/vault">Back to Vault</Link>
        </Button>
      </div>
    )
  }

  // Handle submitting a new comment
  const handleSubmitComment = () => {
    if (newComment.trim()) {
      // In a real app, this would send the comment to the server
      console.log("New comment:", newComment)
      setNewComment("")
      setIsCommentDialogOpen(false)
    }
  }

  // Handle submitting an edit
  const handleSubmitEdit = () => {
    if (editValue.trim()) {
      // In a real app, this would send the edit to the server
      console.log(`Edit ${editField}:`, editValue)
      setEditField("")
      setEditValue("")
      setIsEditDialogOpen(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/vault" className="hover:text-foreground">
            Vault
          </Link>
          <span>/</span>
          <Link href={`/vault?category=${tshirt.category.toLowerCase()}`} className="hover:text-foreground">
            {tshirt.category}
          </Link>
          <span>/</span>
          <span className="text-foreground">{tshirt.name}</span>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Images */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="relative aspect-square rounded-lg overflow-hidden border mb-4">
                <Image
                  src={activeImage === 0 ? tshirt.image : tshirt.additionalImages[activeImage - 1]}
                  alt={tshirt.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  className={`relative w-16 h-16 rounded-md overflow-hidden border-2 ${
                    activeImage === 0 ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => setActiveImage(0)}
                >
                  <Image src={tshirt.image || "/placeholder.svg"} alt={tshirt.name} fill className="object-cover" />
                </button>
                {tshirt.additionalImages.map((img, index) => (
                  <button
                    key={index}
                    className={`relative w-16 h-16 rounded-md overflow-hidden border-2 ${
                      activeImage === index + 1 ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => setActiveImage(index + 1)}
                  >
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`${tshirt.name} - View ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>Save</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Flag className="h-4 w-4" />
                  <span>Report</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Middle column - Details */}
          <div className="lg:col-span-1">
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold">{tshirt.name}</h1>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditField("description")
                          setEditValue(tshirt.longDescription)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Description
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditField("authenticityFeatures")
                          setEditValue(tshirt.authenticityFeatures.join("\n"))
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Authenticity Features
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Add Images
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{tshirt.year}</Badge>
                  <Badge variant="outline">{tshirt.brand}</Badge>
                  <Badge variant="outline">{tshirt.category}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{tshirt.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{tshirt.likes} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{tshirt.contributors} contributors</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold">Description</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditField("description")
                      setEditValue(tshirt.longDescription)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {tshirt.longDescription.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="mb-4 text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-xl font-semibold mb-4">Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Designer</h3>
                    <p>{tshirt.designer}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Material</h3>
                    <p>{tshirt.material}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Print Method</h3>
                    <p>{tshirt.printMethod}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Rarity</h3>
                    <p>{tshirt.rarity}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Available Sizes</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tshirt.sizes.map((size) => (
                        <Badge key={size} variant="outline">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Variants</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tshirt.variants.map((variant) => (
                        <Badge key={variant} variant="outline">
                          {variant}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold">Authenticity Features</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditField("authenticityFeatures")
                      setEditValue(tshirt.authenticityFeatures.join("\n"))
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {tshirt.authenticityFeatures.map((feature, index) => (
                    <li key={index} className="text-muted-foreground">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h2 className="text-xl font-semibold mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {tshirt.tags.map((tag) => (
                    <Link href={`/vault?tag=${tag}`} key={tag}>
                      <Badge variant="secondary" className="text-sm">
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Marketplace and additional info */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Tag className="mr-2 h-5 w-5" />
                    Market Value
                  </CardTitle>
                  <CardDescription>Current average market value</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${tshirt.averageValue}</div>
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Price History</h3>
                    <div className="h-32 w-full bg-muted rounded-md relative">
                      {/* Simple price history chart */}
                      <div className="absolute inset-0 flex items-end p-2">
                        {tshirt.priceHistory.map((point, index) => {
                          const height = (point.price / tshirt.priceHistory[tshirt.priceHistory.length - 1].price) * 100
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center" style={{ height: "100%" }}>
                              <div className="w-full bg-primary/60 rounded-sm" style={{ height: `${height}%` }}></div>
                              <span className="text-[10px] mt-1 text-muted-foreground">{point.date.split("-")[0]}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Marketplace Listings
                  </CardTitle>
                  <CardDescription>{tshirt.marketplaceListings.length} available for sale</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {tshirt.marketplaceListings.map((listing) => (
                      <div key={listing.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">${listing.price}</div>
                            <div className="text-sm text-muted-foreground">
                              {listing.size} • {listing.condition}
                            </div>
                          </div>
                          <Badge variant="outline">{listing.location}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{listing.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Listed {listing.listedDate}
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/marketplace/listing/${listing.id}`}>View Listing</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/marketplace?search=${encodeURIComponent(tshirt.name)}`}>View All Listings</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <History className="mr-2 h-5 w-5" />
                    Edit History
                  </CardTitle>
                  <CardDescription>Recent changes to this entry</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {tshirt.history.map((edit, index) => (
                      <div key={index} className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-medium">{edit.action}</div>
                          <div className="text-xs text-muted-foreground">{edit.date}</div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">{edit.description}</div>
                        <div className="text-xs text-muted-foreground">
                          by{" "}
                          <Link href={`/profile/${edit.user}`} className="text-primary hover:underline">
                            {edit.user}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Discussion section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Discussion</h2>
            <Button onClick={() => setIsCommentDialogOpen(true)}>
              <MessageSquare className="mr-2 h-4 w-4" /> Add Comment
            </Button>
          </div>

          <div className="space-y-6">
            {tshirt.discussions.map((discussion) => (
              <div key={discussion.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={discussion.userAvatar} alt={discussion.user} />
                    <AvatarFallback>{discussion.user[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-medium">
                        <Link href={`/profile/${discussion.user}`} className="hover:underline">
                          {discussion.user}
                        </Link>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {discussion.date}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{discussion.content}</p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-3 w-3 mr-1" /> Like
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-3 w-3 mr-1" /> Reply
                      </Button>
                    </div>

                    {/* Replies */}
                    {discussion.replies && discussion.replies.length > 0 && (
                      <div className="mt-4 pl-6 border-l space-y-4">
                        {discussion.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-3">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={reply.userAvatar} alt={reply.user} />
                              <AvatarFallback>{reply.user[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <div className="font-medium text-sm">
                                  <Link href={`/profile/${reply.user}`} className="hover:underline">
                                    {reply.user}
                                  </Link>
                                </div>
                                <div className="text-xs text-muted-foreground">{reply.date}</div>
                              </div>
                              <p className="text-sm text-muted-foreground">{reply.content}</p>
                              <div className="flex gap-2 mt-1">
                                <Button variant="ghost" size="sm">
                                  <ThumbsUp className="h-3 w-3 mr-1" /> Like
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Comment Dialog */}
        <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Comment</DialogTitle>
              <DialogDescription>Share your knowledge or ask a question about this t-shirt</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Write your comment here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCommentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitComment}>Post Comment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit {editField.charAt(0).toUpperCase() + editField.slice(1)}</DialogTitle>
              <DialogDescription>Make your contribution to improve this t-shirt entry</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder={`Edit the ${editField}...`}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="min-h-[300px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitEdit}>Submit Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

