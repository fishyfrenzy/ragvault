'use client'

import { useState } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"

export default function AddItemPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [addedItemName, setAddedItemName] = useState("")

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('Not authenticated')

      // Get form values directly
      const form = e.target as HTMLFormElement
      const formElements = form.elements as HTMLFormControlsCollection & {
        name: HTMLInputElement
        brand: HTMLInputElement
        year: HTMLInputElement
        condition: HTMLSelectElement
        size: HTMLSelectElement
        description: HTMLTextAreaElement
        estimated_value: HTMLInputElement
        tags: HTMLInputElement
        listing_status: HTMLSelectElement
        price: HTMLInputElement
      }

      const name = formElements.name.value
      const brand = formElements.brand.value
      const year = parseInt(formElements.year.value)
      const condition = formElements.condition.value
      const size = formElements.size.value
      const description = formElements.description.value
      const estimated_value = parseFloat(formElements.estimated_value.value)
      const tags = formElements.tags.value.split(",").map((tag: string) => tag.trim())
      const listing_status = formElements.listing_status.value
      const price = formElements.price.value ? parseFloat(formElements.price.value) : null
      
      const newItem = {
        name,
        brand,
        year,
        condition,
        size,
        description,
        estimated_value,
        tags,
        listing_status,
        price,
        user_id: user.id,
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80" // Default image for now
      }

      const { data, error } = await supabase
        .from('t_shirts')
        .insert(newItem)
        .select()
        .single()

      if (error) throw error

      toast.success("Item added successfully")
      setAddedItemName(name)
      setShowSuccess(true)
      form.reset()
    } catch (error) {
      console.error('Error adding item:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Failed to add item")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fillSampleData = (form: HTMLFormElement) => {
    const formElements = form.elements as HTMLFormControlsCollection & {
      name: HTMLInputElement
      brand: HTMLInputElement
      year: HTMLInputElement
      condition: HTMLSelectElement
      size: HTMLSelectElement
      description: HTMLTextAreaElement
      estimated_value: HTMLInputElement
      tags: HTMLInputElement
      listing_status: HTMLSelectElement
      price: HTMLInputElement
    }
    
    formElements.name.value = "Metallica 'Master of Puppets' Tour Shirt"
    formElements.brand.value = "Metallica"
    formElements.year.value = "1986"
    formElements.condition.value = "Very Good"
    formElements.size.value = "L"
    formElements.description.value = "Original 1986 Metallica Master of Puppets tour shirt. Features the iconic album artwork on the front and tour dates on the back. Some natural fading but overall in great condition."
    formElements.estimated_value.value = "250"
    formElements.tags.value = "metal, band, vintage, 80s, tour, black"
    formElements.listing_status.value = "For Sale"
    formElements.price.value = "300"
  }

  const handleAddAnother = () => {
    setShowSuccess(false)
  }

  if (showSuccess) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Item Added Successfully!</h1>
          <p className="text-muted-foreground max-w-md mb-6">
            "{addedItemName}" has been added to your collection.
          </p>
          <div className="flex gap-4">
            <Button onClick={handleAddAnother} variant="outline">
              Add Another Item
            </Button>
            <Button onClick={() => router.push('/collection')}>
              View My Collection
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Add New T-Shirt</h1>
        <Button variant="outline" onClick={() => router.push('/collection')}>
          Cancel
        </Button>
      </div>
      
      <div className="bg-card rounded-lg border p-6">
        <form onSubmit={handleAddItem}>
          <div className="grid gap-4 py-4">
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={(e) => fillSampleData(e.currentTarget.form as HTMLFormElement)}
                className="mb-2"
              >
                Fill with Sample Data
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">T-Shirt Name</Label>
                <Input id="name" name="name" placeholder="e.g., Metallica 'Black Album' Tour Tee" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" name="brand" placeholder="e.g., Metallica, Nike, etc." required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" name="year" type="number" placeholder="e.g., 1992" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="condition">Condition</Label>
                <select
                  id="condition"
                  name="condition"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select condition</option>
                  <option value="Mint">Mint</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="size">Size</Label>
                <select
                  id="size"
                  name="size"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select size</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="XXXL">XXXL</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your t-shirt, including any notable features, history, or damage"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estimated_value">Estimated Value ($)</Label>
              <Input id="estimated_value" name="estimated_value" type="number" placeholder="e.g., 150" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input id="tags" name="tags" placeholder="e.g., metal, band, vintage, 90s, tour, black" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="listing_status">Listing Status</Label>
              <select
                id="listing_status"
                name="listing_status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
                <option value="For Sale">For Sale</option>
                <option value="Taking Offers">Taking Offers</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Sale Price ($)</Label>
              <Input id="price" name="price" type="number" placeholder="Required for 'For Sale' status" />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/collection')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add to Collection"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 