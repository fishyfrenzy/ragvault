'use client'

import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
}

export function AddItemModal({ 
  open, 
  onOpenChange,
  onSubmit,
  isLoading 
}: AddItemModalProps) {
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New T-Shirt</DialogTitle>
          <DialogDescription>Add a new t-shirt to your collection.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add to Collection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 