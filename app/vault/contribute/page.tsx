"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, BookOpen, History, Info, Upload, Search } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ContributePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("new")
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    year: "",
    category: "",
    description: "",
    longDescription: "",
    designer: "",
    material: "",
    printMethod: "",
    rarity: "",
    tags: "",
    sizes: [] as string[],
    variants: [] as string[],
    authenticityFeatures: "",
  })
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle checkbox changes for sizes
  const handleSizeToggle = (size: string) => {
    setFormData((prev) => {
      if (prev.sizes.includes(size)) {
        return { ...prev, sizes: prev.sizes.filter((s) => s !== size) }
      } else {
        return { ...prev, sizes: [...prev.sizes, size] }
      }
    })
  }

  // Handle checkbox changes for variants
  const handleVariantToggle = (variant: string) => {
    setFormData((prev) => {
      if (prev.variants.includes(variant)) {
        return { ...prev, variants: prev.variants.filter((v) => v !== variant) }
      } else {
        return { ...prev, variants: [...prev.variants, variant] }
      }
    })
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setImages((prev) => [...prev, ...newFiles])
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // In a real app, this would send the data to the server
    console.log("Form data:", formData)
    console.log("Images:", images)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      // Redirect to a success page or the vault
      router.push("/vault/contribute/success")
    }, 1500)
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Contribute to The Vault</h1>
          </div>
          <p className="text-muted-foreground">
            Help build the most comprehensive t-shirt database by contributing your knowledge and research.
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Before you contribute</AlertTitle>
          <AlertDescription>
            Please read our{" "}
            <Link href="/vault/guidelines" className="font-medium underline">
              contribution guidelines
            </Link>{" "}
            to ensure your submission meets our standards. All contributions are reviewed by moderators before being
            published.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="new">Add New T-Shirt</TabsTrigger>
            <TabsTrigger value="edit">Edit Existing Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Add a New T-Shirt to the Vault</CardTitle>
                <CardDescription>
                  Fill out the form below with as much detail as possible. The more information you provide, the more
                  valuable your contribution will be.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">T-Shirt Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., Metallica 'And Justice For All' Tour Tee"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand/Artist *</Label>
                        <Input
                          id="brand"
                          name="brand"
                          placeholder="e.g., Metallica, Nike, Supreme"
                          value={formData.brand}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Year *</Label>
                        <Input
                          id="year"
                          name="year"
                          type="number"
                          placeholder="e.g., 1988"
                          value={formData.year}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          name="category"
                          value={formData.category}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Band">Band</SelectItem>
                            <SelectItem value="Movie">Movie</SelectItem>
                            <SelectItem value="Streetwear">Streetwear</SelectItem>
                            <SelectItem value="Sportswear">Sportswear</SelectItem>
                            <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                            <SelectItem value="Television">Television</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Short Description *</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Brief description of the t-shirt (1-2 sentences)"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longDescription">Detailed Description *</Label>
                      <Textarea
                        id="longDescription"
                        name="longDescription"
                        placeholder="Provide a detailed description including history, significance, and any other relevant information"
                        value={formData.longDescription}
                        onChange={handleInputChange}
                        className="min-h-[200px]"
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Additional Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="designer">Designer/Creator</Label>
                        <Input
                          id="designer"
                          name="designer"
                          placeholder="e.g., Pushead, Nike Design Team"
                          value={formData.designer}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="material">Material</Label>
                        <Input
                          id="material"
                          name="material"
                          placeholder="e.g., 100% Cotton, 50/50 Cotton-Polyester Blend"
                          value={formData.material}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="printMethod">Print Method</Label>
                        <Input
                          id="printMethod"
                          name="printMethod"
                          placeholder="e.g., Screen Print, Direct to Garment, Heat Transfer"
                          value={formData.printMethod}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rarity">Rarity</Label>
                        <Select
                          name="rarity"
                          value={formData.rarity}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, rarity: value }))}
                        >
                          <SelectTrigger id="rarity">
                            <SelectValue placeholder="Select rarity level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Common">Common</SelectItem>
                            <SelectItem value="Uncommon">Uncommon</SelectItem>
                            <SelectItem value="Rare">Rare</SelectItem>
                            <SelectItem value="Very Rare">Very Rare</SelectItem>
                            <SelectItem value="Extremely Rare">Extremely Rare</SelectItem>
                            <SelectItem value="Limited Edition">Limited Edition</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma separated) *</Label>
                      <Input
                        id="tags"
                        name="tags"
                        placeholder="e.g., metal, band, vintage, 80s, tour, black"
                        value={formData.tags}
                        onChange={handleInputChange}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Add relevant tags to help users find this t-shirt. Include era, style, color, etc.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Available Sizes</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                        {["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size"].map((size) => (
                          <div key={size} className="flex items-center space-x-2">
                            <Checkbox
                              id={`size-${size}`}
                              checked={formData.sizes.includes(size)}
                              onCheckedChange={() => handleSizeToggle(size)}
                            />
                            <label
                              htmlFor={`size-${size}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {size}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Color Variants</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                        {["Black", "White", "Gray", "Red", "Blue", "Green", "Yellow", "Tie-Dye", "Other"].map(
                          (variant) => (
                            <div key={variant} className="flex items-center space-x-2">
                              <Checkbox
                                id={`variant-${variant}`}
                                checked={formData.variants.includes(variant)}
                                onCheckedChange={() => handleVariantToggle(variant)}
                              />
                              <label
                                htmlFor={`variant-${variant}`}
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {variant}
                              </label>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="authenticityFeatures">Authenticity Features</Label>
                      <Textarea
                        id="authenticityFeatures"
                        name="authenticityFeatures"
                        placeholder="List features that help identify authentic versions of this t-shirt (one per line)"
                        value={formData.authenticityFeatures}
                        onChange={handleInputChange}
                        className="min-h-[100px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Include details like tag style, stitching, print quality, etc. that help distinguish authentic
                        items from reproductions.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Images</h3>
                    <div className="space-y-2">
                      <Label htmlFor="images">Upload Images *</Label>
                      <div className="flex items-center justify-center border-2 border-dashed rounded-md p-6">
                        <div className="flex flex-col items-center">
                          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-1">Drag and drop images, or click to browse</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG or GIF, max 5MB each</p>
                          <input
                            id="images"
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => document.getElementById("images")?.click()}
                          >
                            Select Images
                          </Button>
                        </div>
                      </div>
                      {images.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">{images.length} image(s) selected:</p>
                          <ul className="text-sm text-muted-foreground list-disc pl-5 mt-1">
                            {images.map((image, index) => (
                              <li key={index}>{image.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Include clear images of the front, back, tags, and any notable details. Higher quality images
                        are preferred.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => router.push("/vault")}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Contribution"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edit" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit an Existing T-Shirt Entry</CardTitle>
                <CardDescription>
                  Search for a t-shirt entry to edit or improve. You can update information, add images, or correct
                  errors.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search for a t-shirt to edit..." className="pl-8" />
                  </div>

                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Search for a T-Shirt to Edit</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mt-2 mb-4">
                      Enter the name of a t-shirt in the search box above to find it and make your contribution.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="bg-muted rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Contribution Guidelines</h2>
          </div>
          <ul className="space-y-2 text-muted-foreground">
            <li>Provide accurate, well-researched information</li>
            <li>Include high-quality images that clearly show the t-shirt</li>
            <li>Cite sources for historical information when possible</li>
            <li>Be respectful and objective in your descriptions</li>
            <li>Do not include personal opinions or subjective judgments</li>
            <li>All contributions are reviewed by moderators before being published</li>
          </ul>
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link href="/vault/guidelines">Read Full Guidelines</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

