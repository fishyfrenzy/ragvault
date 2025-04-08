"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  MoreHorizontal,
  Share2,
  Heart,
  Pencil,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

// Types
interface TShirt {
  id: number
  name: string
  licensing: string[]
  year: number
  condition: string
  size: string
  tags: string[]
  image: string | null
  description: string
  date_added: string
  date_acquired: string
  acquired_from: string
  purchase_price: number
  estimated_value: number
  listing_status: string
  price: number | null
  user_id: string
  collections: Collection[]
  item_images: ItemImage[]
  measurements: {
    chest: string
    length: string
    shoulders: string
    sleeves: string
  }
}

interface Collection {
  id: number
  name: string
  user_id: string
  is_default?: boolean
}

interface ItemImage {
  id: number
  t_shirt_id: number
  image_url: string
  is_primary: boolean
}

export default function ItemDetailPage() {
  const supabase = createClientComponentClient()
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  // State
  const [tshirt, setTshirt] = useState<TShirt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    licensing: [] as string[],
    year: 0,
    condition: "",
    size: "",
    tags: [] as string[],
    estimated_value: 0,
    listing_status: "",
    price: null as number | null,
    date_acquired: "",
    acquired_from: "",
    purchase_price: 0,
    measurements: {
      chest: "",
      length: "",
      shoulders: "",
      sleeves: ""
    }
  })

  // Fetch t-shirt data
  useEffect(() => {
    const fetchTshirt = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: tshirtData, error } = await supabase
          .from('t_shirts')
          .select(`
            *,
            collections:t_shirt_collections(collection:collections(*)),
            item_images(*)
          `)
          .eq('id', id)
          .single()

        if (error) throw error

        if (!tshirtData) {
          router.push('/collection')
          return
        }

        // Transform collections data
        const transformedTshirt = {
          ...tshirtData,
          collections: tshirtData.collections
            .map((tc: any) => tc.collection)
            .filter(Boolean),
          measurements: tshirtData.measurements || {
            chest: "Not specified",
            length: "Not specified",
            shoulders: "Not specified",
            sleeves: "Not specified"
          }
        }

        setTshirt(transformedTshirt)
        setEditForm({
          name: transformedTshirt.name,
          description: transformedTshirt.description,
          licensing: transformedTshirt.licensing,
          year: transformedTshirt.year,
          condition: transformedTshirt.condition,
          size: transformedTshirt.size,
          tags: transformedTshirt.tags,
          estimated_value: transformedTshirt.estimated_value,
          listing_status: transformedTshirt.listing_status,
          price: transformedTshirt.price,
          date_acquired: transformedTshirt.date_acquired,
          acquired_from: transformedTshirt.acquired_from,
          purchase_price: transformedTshirt.purchase_price,
          measurements: transformedTshirt.measurements || {
            chest: "",
            length: "",
            shoulders: "",
            sleeves: ""
          }
        })
      } catch (error) {
        console.error('Error fetching t-shirt:', error)
        toast.error('Failed to load t-shirt details')
        router.push('/collection')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTshirt()
  }, [id, supabase, router])

  // Handle edit submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Not authenticated')
        return
      }

      // Validate required fields
      if (!editForm.name) {
        toast.error('Name is required')
        return
      }

      // Format the data properly
      const updateData = {
        name: editForm.name,
        description: editForm.description || '',
        licensing: Array.isArray(editForm.licensing) ? editForm.licensing : [],
        year: editForm.year || null,
        condition: editForm.condition || '',
        size: editForm.size || '',
        tags: Array.isArray(editForm.tags) ? editForm.tags : [],
        estimated_value: editForm.estimated_value || 0,
        listing_status: editForm.listing_status || 'Private',
        price: editForm.price,
        date_acquired: editForm.date_acquired || null,
        acquired_from: editForm.acquired_from || '',
        purchase_price: editForm.purchase_price || 0,
        measurements: {
          chest: editForm.measurements?.chest || '',
          length: editForm.measurements?.length || '',
          shoulders: editForm.measurements?.shoulders || '',
          sleeves: editForm.measurements?.sleeves || ''
        }
      }

      const { data, error } = await supabase
        .from('t_shirts')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      if (error) {
        console.error('Supabase error:', error)
        toast.error(error.message || 'Failed to update t-shirt')
        return
      }

      // Update local state with the returned data
      if (data && data[0]) {
        setTshirt(prev => prev ? { ...prev, ...data[0] } : null)
        setIsEditOpen(false)
        toast.success('T-shirt updated successfully')
      }
    } catch (error) {
      console.error('Error updating t-shirt:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('t_shirts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('T-shirt deleted successfully')
      router.push('/collection')
    } catch (error) {
      console.error('Error deleting t-shirt:', error)
      toast.error('Failed to delete t-shirt')
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Skeleton className="aspect-square rounded-lg w-full" />
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!tshirt) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <h2 className="text-2xl font-bold">T-shirt not found</h2>
          <Button onClick={() => router.push('/collection')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Collection
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/collection" className="hover:text-foreground">
            Collection
          </Link>
          <span>/</span>
          <span className="text-foreground">{tshirt.name}</span>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column - Images */}
          <div className="lg:col-span-5">
            <div className="relative aspect-square rounded-lg overflow-hidden border mb-4">
              <Image
                src={tshirt.item_images[activeImageIndex]?.image_url || "/placeholder.svg"}
                alt={tshirt.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                  {tshirt.condition}
                </Badge>
              </div>
              {/* Navigation arrows */}
              {tshirt.item_images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-background/40 backdrop-blur-sm text-foreground"
                    onClick={() => setActiveImageIndex((prev) => 
                      prev > 0 ? prev - 1 : tshirt.item_images.length - 1
                    )}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-background/40 backdrop-blur-sm text-foreground"
                    onClick={() => setActiveImageIndex((prev) => 
                      prev < tshirt.item_images.length - 1 ? prev + 1 : 0
                    )}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {tshirt.item_images.map((image, index) => (
                <button
                  key={image.id}
                  className={`relative w-16 h-16 rounded-md overflow-hidden border-2 ${
                    index === activeImageIndex ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <Image
                    src={image.image_url}
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
                <span>Favorite</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4 mr-1" />
                    <span>More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Item
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Right column - Details */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">{tshirt.name}</h1>
              <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="outline">{tshirt.year}</Badge>
              <Badge variant="outline">{tshirt.size}</Badge>
              <Badge variant={tshirt.listing_status === "For Sale" ? "default" : "outline"}>
                {tshirt.listing_status}
              </Badge>
            </div>

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="related">Related</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 pt-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">Description</h2>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(true)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <p className="text-muted-foreground">{tshirt.description}</p>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">Acquisition Details</h2>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(true)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Date Acquired</h3>
                      <p>{tshirt.date_acquired}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Acquired From</h3>
                      <p>{tshirt.acquired_from}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Purchase Price</h3>
                      <p>${tshirt.purchase_price}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Current Estimated Value</h3>
                      <p>${tshirt.estimated_value}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">Measurements & Materials</h2>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(true)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Chest (Pit to Pit)</h3>
                      <p>{tshirt.measurements?.chest || "Not specified"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Length</h3>
                      <p>{tshirt.measurements?.length || "Not specified"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Shoulders</h3>
                      <p>{tshirt.measurements?.shoulders || "Not specified"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Sleeves</h3>
                      <p>{tshirt.measurements?.sleeves || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-2">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {tshirt.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="pt-4">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Notes</h2>
                  <p className="text-muted-foreground">No notes added yet.</p>
                </div>
              </TabsContent>

              <TabsContent value="related" className="pt-4">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Related Items</h2>
                  <p className="text-muted-foreground">No related items found.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit T-Shirt Details</DialogTitle>
              <DialogDescription>
                Make changes to your t-shirt here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[80vh]">
              <div className="space-y-6 p-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="licensing">Licensing (comma-separated)</Label>
                    <Input
                      id="licensing"
                      value={editForm.licensing.join(', ')}
                      onChange={(e) => setEditForm({ ...editForm, licensing: e.target.value.split(',').map(s => s.trim()) })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={editForm.year}
                        onChange={(e) => setEditForm({ ...editForm, year: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="size">Size</Label>
                      <Select
                        value={editForm.size}
                        onValueChange={(value) => setEditForm({ ...editForm, size: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      value={editForm.condition}
                      onValueChange={(value) => setEditForm({ ...editForm, condition: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Mint", "Excellent", "Very Good", "Good", "Fair", "Poor"].map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Acquisition Details */}
                  <div className="grid gap-4">
                    <h3 className="text-lg font-semibold">Acquisition Details</h3>
                    <div className="grid gap-2">
                      <Label htmlFor="date_acquired">Date Acquired</Label>
                      <Input
                        id="date_acquired"
                        type="date"
                        value={editForm.date_acquired}
                        onChange={(e) => setEditForm({ ...editForm, date_acquired: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="acquired_from">Acquired From</Label>
                      <Input
                        id="acquired_from"
                        value={editForm.acquired_from}
                        onChange={(e) => setEditForm({ ...editForm, acquired_from: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="purchase_price">Purchase Price ($)</Label>
                      <Input
                        id="purchase_price"
                        type="number"
                        value={editForm.purchase_price}
                        onChange={(e) => setEditForm({ ...editForm, purchase_price: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* Measurements */}
                  <div className="grid gap-4">
                    <h3 className="text-lg font-semibold">Measurements</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="chest">Chest (Pit to Pit)</Label>
                        <Input
                          id="chest"
                          value={editForm.measurements.chest}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            measurements: { ...editForm.measurements, chest: e.target.value }
                          })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="length">Length</Label>
                        <Input
                          id="length"
                          value={editForm.measurements.length}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            measurements: { ...editForm.measurements, length: e.target.value }
                          })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="shoulders">Shoulders</Label>
                        <Input
                          id="shoulders"
                          value={editForm.measurements.shoulders}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            measurements: { ...editForm.measurements, shoulders: e.target.value }
                          })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="sleeves">Sleeves</Label>
                        <Input
                          id="sleeves"
                          value={editForm.measurements.sleeves}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            measurements: { ...editForm.measurements, sleeves: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={editForm.tags.join(', ')}
                      onChange={(e) => setEditForm({ ...editForm, tags: e.target.value.split(',').map(s => s.trim()) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="estimated_value">Estimated Value ($)</Label>
                    <Input
                      id="estimated_value"
                      type="number"
                      value={editForm.estimated_value}
                      onChange={(e) => setEditForm({ ...editForm, estimated_value: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="listing_status">Listing Status</Label>
                    <Select
                      value={editForm.listing_status}
                      onValueChange={(value) => setEditForm({ ...editForm, listing_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Public">Not For Sale</SelectItem>
                        <SelectItem value="Private">Private</SelectItem>
                        <SelectItem value="For Sale">For Sale</SelectItem>
                        <SelectItem value="Taking Offers">Taking Offers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {editForm.listing_status === "For Sale" && (
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={editForm.price || ""}
                        onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                      />
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="px-6 pb-6">
              <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this t-shirt
              and remove it from your collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

