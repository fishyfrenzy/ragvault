"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  PlusCircle,
  Tag,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings,
  MoreHorizontal,
  FileDown,
  Search,
  SlidersHorizontal,
  MoreVertical,
  Upload,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Eye,
  Filter,
  Grid3X3,
  Image as ImageIcon,
  Import,
  Plus,
  Trash,
  UserPlus,
  Users,
  Share,
  FolderPlus,
  FolderOpen,
  Pencil,
  Layers,
  Folder,
  Trash2,
  FolderIcon,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CldImage } from "next-cloudinary"
import {
  Command,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

// Types
interface TShirt {
  id: number
  name: string
  licensing: string[]  // Changed from string to string[]
  year: number
  condition: string
  size: string
  tags: string[]
  image: string | null
  description: string
  date_added: string
  estimated_value: number
  listing_status: string
  price: number | null
  user_id: string
  collections: Collection[]
}

// Update Collection type to match database schema
type Collection = {
  id: number
  name: string
  user_id: string
  is_default?: boolean
}

type TShirtImage = {
  image_url: string
  is_primary: boolean
}

type TShirtCollection = {
  collection: Collection
}

// Add this type definition after your other types
type TShirtCollectionJunction = {
  t_shirt_id: number
  collection_id: number
  added_at: string
  collection: Collection
}

type SortDirection = "asc" | "desc" | null
type SortField = string | null

// Listing Status Badge Component
const ListingStatusBadge = ({
  status,
  price,
  itemId,
  onStatusChange,
}: {
  status: string
  price: number | null
  itemId: number
  onStatusChange: (itemId: number, newStatus: string, price?: number) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isForSaleDialogOpen, setIsForSaleDialogOpen] = useState(false)
  const [salePrice, setSalePrice] = useState(price ? price.toString() : "")
  // Track the current status locally
  const [currentStatus, setCurrentStatus] = useState(status)
  const [currentPrice, setCurrentPrice] = useState(price)

  // Update local state when props change
  useEffect(() => {
    setCurrentStatus(status)
    setCurrentPrice(price)
    setSalePrice(price ? price.toString() : "")
  }, [status, price])

  const handleStatusChange = (newStatus: string) => {
    setIsOpen(false)

    if (newStatus === "For Sale") {
      setIsForSaleDialogOpen(true)
    } else {
      // Update local state immediately
      setCurrentStatus(newStatus)
      setCurrentPrice(null)
      // Then update parent state and database
      onStatusChange(itemId, newStatus)
    }
  }

  const handleSetPrice = () => {
    const priceValue = Number.parseFloat(salePrice)
    if (!isNaN(priceValue) && priceValue > 0) {
      // Update local state immediately
      setCurrentStatus("For Sale")
      setCurrentPrice(priceValue)
      // Then update parent state and database
      onStatusChange(itemId, "For Sale", priceValue)
      setIsForSaleDialogOpen(false)
    }
  }

  const getStatusStyle = () => {
    switch (currentStatus) {
      case "For Sale":
        return "bg-emerald-500/80 hover:bg-emerald-600/80 text-white border-transparent"
      case "Taking Offers":
        return "bg-blue-500/80 hover:bg-blue-600/80 text-white border-transparent"
      case "Public":
        return "bg-teal-400/80 hover:bg-teal-500/80 text-white border-transparent"
      case "NFS":
        return "bg-teal-400/80 hover:bg-teal-500/80 text-white border-transparent"
      case "Private":
        return "bg-rose-500/80 hover:bg-rose-600/80 text-white border-transparent"
      default:
        return "bg-gray-400/80 hover:bg-gray-500/80 text-white border-transparent"
    }
  }

  // Display "Not For Sale" instead of "Public"
  const displayStatus = currentStatus === "Public" ? "Not For Sale" : currentStatus

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Badge className={`cursor-pointer ${getStatusStyle()}`}>
            {displayStatus}
            {currentStatus === "For Sale" && currentPrice && <span className="ml-1">${currentPrice}</span>}
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-0">
          <div className="py-1">
            <button
              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${currentStatus === "For Sale" ? "bg-muted/50" : ""}`}
              onClick={() => handleStatusChange("For Sale")}
            >
              For Sale
            </button>
            <button
              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${currentStatus === "Taking Offers" ? "bg-muted/50" : ""}`}
              onClick={() => handleStatusChange("Taking Offers")}
            >
              Taking Offers
            </button>
            <button
              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${currentStatus === "Public" ? "bg-muted/50" : ""}`}
              onClick={() => handleStatusChange("Public")}>
              Not For Sale
            </button>
            <button
              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${currentStatus === "Private" ? "bg-muted/50" : ""}`}
              onClick={() => handleStatusChange("Private")}>
              Private
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={isForSaleDialogOpen} onOpenChange={setIsForSaleDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Set Item For Sale</DialogTitle>
            <DialogDescription>Enter the price you want to sell this item for.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="sale-price">Sale Price ($)</Label>
                <Input
                  id="sale-price"
                  type="number"
                  placeholder="e.g., 150"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsForSaleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetPrice}>List For Sale</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Available table columns definition
const availableColumns = [
  { id: "image", name: "Image", sortable: false },
  { id: "name", name: "Name", sortable: true },
  { id: "licensing", name: "Licensing", sortable: true },  // Changed from 'brand' to 'licensing' to match database column
  { id: "year", name: "Year", sortable: true },
  { id: "size", name: "Size", sortable: true },
  { id: "condition", name: "Condition", sortable: true },
  { id: "listing_status", name: "Listing Status", sortable: true },
  { id: "tags", name: "Tags", sortable: false },
  { id: "date_added", name: "Date Added", sortable: true },
  { id: "estimated_value", name: "Value", sortable: true },
  { id: "actions", name: "Actions", sortable: false },
  {
    id: "collection",
    name: "Collection",
    sortable: true,
  },
]

// Remove tags from recommended collections
const recommendedCollections = [
  { id: 1, name: "90's Nostalgia", icon: "🕰️" },
  { id: 2, name: "Metal Bands", icon: "🤘" },
  { id: 3, name: "Harley & Motorcycles", icon: "🏍️" },
  { id: 4, name: "Vintage Logos", icon: "🏷️" },
  { id: 5, name: "Tour Shirts", icon: "🎸" },
  { id: 6, name: "80's Classics", icon: "📼" }
];

// Image Uploader Component
const ImageUploader = ({
  onImageUpload,
  defaultImage = "",
  className = ""
}: {
  onImageUpload: (imageUrl: string, file: File) => void
  defaultImage?: string
  className?: string
}) => {
  const [image, setImage] = useState<string>(defaultImage)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update image state when defaultImage prop changes
  useEffect(() => {
    if (defaultImage) {
      setImage(defaultImage)
    }
  }, [defaultImage])

  const handleImageChange = async (file: File) => {
    if (!file) return
    setIsLoading(true)

    try {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        setIsLoading(false)
        return
      }

      // Check file size (limit to 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('Image file is too large. Maximum size is 5MB')
        setIsLoading(false)
        return
      }

      // First create a local preview
      const reader = new FileReader()
      reader.onload = async (e) => {
        const localPreview = e.target?.result as string
        setImage(localPreview)
        
        // Then upload to Cloudinary via our API
        try {
          const formData = new FormData()
          formData.append('file', file)
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to upload image')
          }
          
          const data = await response.json()
          
          // Call the parent component's handler with the Cloudinary URL
          onImageUpload(data.url, file)
          toast.success('Image uploaded successfully')
        } catch (uploadError) {
          console.error('Image upload error:', uploadError)
          toast.error(uploadError instanceof Error ? uploadError.message : 'Failed to upload image')
          // Keep the local preview even if cloud upload failed
          onImageUpload(localPreview, file)
        } finally {
          setIsLoading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error handling image:', error)
      toast.error('Failed to process image')
      setIsLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0])
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files[0]) {
      handleImageChange(e.clipboardData.files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div 
      className={`relative border-2 border-dashed rounded-md transition-colors 
        ${isDragging ? 'border-primary bg-primary/5' : 'border-border'} 
        ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}
      onClick={handleClick}
      tabIndex={0}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="sr-only"
        accept="image/*"
        onChange={(e) => e.target.files && handleImageChange(e.target.files[0])}
      />
      
      {isLoading ? (
        <div className="flex items-center justify-center h-full w-full py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
        </div>
      ) : image ? (
        <div className="aspect-square relative overflow-hidden rounded-md">
          <Image 
            src={image} 
            alt="Uploaded preview" 
            fill 
            unoptimized={image.startsWith('data:')}
            className="object-cover"
          />
          <div className="absolute top-2 left-2 bg-green-600/80 text-white text-xs px-2 py-1 rounded-md">
            Image Selected
          </div>
          <button
            type="button"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-1 rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              setImage("")
              onImageUpload("", new File([], ""))
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Drag & drop an image here</p>
          <p className="text-xs text-muted-foreground">
            Or click to select • Paste from clipboard
          </p>
        </div>
      )}
    </div>
  )
}

export default function CollectionPage() {
  const supabase = createClientComponentClient()
  const [tshirts, setTshirts] = useState<TShirt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [selectedCollection, setSelectedCollection] = useState<string>("all")
  const [userCollections, setUserCollections] = useState<Collection[]>([])
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false)
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [addMode, setAddMode] = useState<"quick" | "detailed">("quick")
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  
  // Updated formItems type to include image properties
  type FormItem = {
    id: string;
    values: Record<string, any>;
    imageFile: File | null;
    imageUrl: string;
  };
  
  const [formItems, setFormItems] = useState<FormItem[]>([
    { id: Date.now().toString(), values: {}, imageFile: null, imageUrl: "" }
  ]);
  
  const [activeFilters, setActiveFilters] = useState<{
    licensing: string[]
    years: string[]
    conditions: string[]
    sizes: string[]
  }>({
    licensing: [],
    years: [],
    conditions: [],
    sizes: [],
  })

  // Sorting state
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(availableColumns.map((col) => col.id))

  // Column customization dialog state
  const [isColumnCustomizationOpen, setIsColumnCustomizationOpen] = useState(false)

  // Bulk actions state
  const [selectedItems, setSelectedItems] = useState<number[]>([])

  // Add state for optional fields
  const [optionalFields, setOptionalFields] = useState<{
    licensing: boolean  // Changed from 'Licensing' to 'brand' to match database column
    year: boolean
    condition: boolean
    size: boolean
    value: boolean
    tags: boolean
    description: boolean
    listing_status: boolean
    price: boolean
    collection: boolean
  }>({
    licensing: false,  // Changed from 'Licensing' to 'brand' to match database column
    year: false,
    condition: false,
    size: false,
    value: false,
    tags: false,
    description: false,
    listing_status: false,
    price: false,
    collection: false
  })

  // Toggle optional field visibility
  const toggleOptionalField = (field: keyof typeof optionalFields) => {
    setOptionalFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // Add this near the top of the component, after other state declarations
  const [formKey, setFormKey] = useState(0)

  // Add these state variables after your other useState declarations
  const [newCollectionName, setNewCollectionName] = useState("")
  const [newCollectionTags, setNewCollectionTags] = useState<string[]>([])
  const [newCollectionColor, setNewCollectionColor] = useState("#000000")
  const [isChangeCollectionOpen, setIsChangeCollectionOpen] = useState(false)
  const [selectedTshirt, setSelectedTshirt] = useState<TShirt | null>(null)
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("none")
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    name: true,
    licensing: true,
    year: true,
    condition: true,
    size: true,
    estimatedValue: true,
    dateAdded: true,
    listingStatus: true
  })
  
  // Available tags for collections
  const availableTags = useMemo(() => [
    "Vintage", "Concert", "Band", "Sports", "Movie", "TV Show", "Gaming", "Limited Edition"
  ], [])

  // Toggle a tag for the new collection
  const toggleCollectionTag = (tag: string) => {
    if (newCollectionTags.includes(tag)) {
      setNewCollectionTags(newCollectionTags.filter((t) => t !== tag))
    } else {
      setNewCollectionTags([...newCollectionTags, tag])
    }
  }

  // Initialize collections
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Fetch collections
        const { data: collectionsData, error: collectionsError } = await supabase
          .from('collections')
          .select('*')
          .eq('user_id', user.id)

        if (collectionsError) {
          console.error('Error fetching collections:', collectionsError.message);
          throw new Error(`Failed to fetch collections: ${collectionsError.message}`);
        }

        setUserCollections(collectionsData || [])

        // Fetch t-shirts with their collections and images
        const { data: tshirtsData, error: tshirtsError } = await supabase
          .from('t_shirts')
          .select(`
            *,
            t_shirt_collections (
              collection:collections (
                id,
                name,
                user_id,
                is_default
              )
            ),
            item_images (
              image_url,
              is_primary
            )
          `)
          .eq('user_id', user.id)
          .order('date_added', { ascending: false });

        if (tshirtsError) {
          console.error('Error fetching t-shirts:', tshirtsError.message);
          throw new Error(`Failed to fetch t-shirts: ${tshirtsError.message}`);
        }

        // Transform the data to match our TShirt type
        const transformedTshirts = (tshirtsData || []).map(shirt => ({
          ...shirt,
          collections: (shirt.t_shirt_collections || [])
            .filter((tc: any) => tc?.collection)
            .map((tc: any) => tc.collection),
          image: (shirt.item_images || [])[0]?.image_url || null
        }));

        setTshirts(transformedTshirts);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load collection';
        console.error('Error in fetchData:', errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Get unique values for filters
  const uniqueBrands = Array.from(new Set(tshirts.flatMap((shirt) => 
    typeof shirt.licensing === 'string' ? [shirt.licensing] : shirt.licensing
  )))
  const uniqueYears = Array.from(new Set(tshirts.map((shirt) => shirt.year?.toString() || '')))
  const uniqueConditions = Array.from(new Set(tshirts.map((shirt) => shirt.condition)))
  const uniqueSizes = Array.from(new Set(tshirts.map((shirt) => shirt.size)))

  // Get all unique tags
  const allTags = Array.from(new Set(tshirts.flatMap((shirt) => shirt.tags)))

  // Filter t-shirts based on search query and selected collection
  const filteredTshirts = useMemo(() => {
    let filtered = [...tshirts];
    
    // Filter by collection
      if (selectedCollection !== "all") {
      filtered = filtered.filter(
        (tshirt) => tshirt.collections.some(collection => collection.id.toString() === selectedCollection)
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((tshirt) => {
        const searchLower = searchQuery.toLowerCase();
        const licensingValues = typeof tshirt.licensing === 'string' ? [tshirt.licensing] : tshirt.licensing;
        return tshirt.name.toLowerCase().includes(searchLower) ||
          licensingValues.some(l => l.toLowerCase().includes(searchLower)) ||
          tshirt.tags.some(tag => tag.toLowerCase().includes(searchLower));
      });
    }
    
    return filtered;
  }, [tshirts, selectedCollection, searchQuery, /* other dependencies */]);

  // Sort the filtered t-shirts
  const sortedTshirts = useMemo(() => {
    if (!sortField || !sortDirection) {
      return filteredTshirts
    }

    return [...filteredTshirts].sort((a, b) => {
      // Handle different field types
      let valueA = a[sortField as keyof typeof a]
      let valueB = b[sortField as keyof typeof b]

      // Handle null values
      if (valueA === null && valueB === null) return 0
      if (valueA === null) return 1
      if (valueB === null) return -1

      // Special handling for string comparisons (case-insensitive)
      if (typeof valueA === "string" && typeof valueB === "string") {
        valueA = valueA.toLowerCase()
        valueB = valueB.toLowerCase()
      }

      // Compare values based on sort direction
      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0
      }
    })
  }, [filteredTshirts, sortField, sortDirection])

  // Handle sorting
  const handleSort = (field: string) => {
    // Check if the field is sortable
    const column = availableColumns.find((col) => col.id === field)
    if (!column?.sortable) return

    // Update sort state
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortField(null)
        setSortDirection(null)
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle column visibility toggle
  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns((prev) => {
      if (prev.includes(columnId)) {
        // Don't allow removing all columns
        if (prev.length === 1) return prev
        return prev.filter((id) => id !== columnId)
      } else {
        return [...prev, columnId]
      }
    })
  }

  // Handle creating a new collection
  const handleCreateCollection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Validate collection name
      if (!newCollectionName.trim()) {
        toast.error('Please enter a collection name')
        return
      }

      // Prevent naming conflicts with "All Shirts" view
      if (newCollectionName.trim().toLowerCase() === "all shirts") {
        toast.error('Cannot create a collection named "All Shirts"')
        return
      }

      console.log("Creating collection:", {
        name: newCollectionName.trim(),
        user_id: user.id
      })

      const { data: newCollection, error } = await supabase
        .from('collections')
        .insert({
          name: newCollectionName.trim(),
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      // Update local state
      setUserCollections(prev => [...prev, newCollection])
      setNewCollectionName('')
      setIsNewCollectionOpen(false)
      toast.success('Collection created successfully')
    } catch (error) {
      console.error('Error creating collection:', error)
      if (error instanceof Error) {
        toast.error(`Error creating collection: ${error.message}`)
      } else {
      toast.error('Failed to create collection')
      }
    }
  }

  // Toggle a tag for the new collection
  const toggleTag = (tag: string) => {
    if (newCollectionTags.includes(tag)) {
      setNewCollectionTags(newCollectionTags.filter((t) => t !== tag))
    } else {
      setNewCollectionTags([...newCollectionTags, tag])
    }
  }

  // Toggle a filter
  const toggleFilter = (type: "licensing" | "years" | "conditions" | "sizes", value: string) => {  // Changed from "brand" to "licensing" to match state object
    setActiveFilters((prev) => {
      const current = [...prev[type]]
      if (current.includes(value)) {
        return { ...prev, [type]: current.filter((v) => v !== value) }
      } else {
        return { ...prev, [type]: [...current, value] }
      }
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({
      licensing: [],  // Changed from 'brand' to 'licensing' to match database column
      years: [],
      conditions: [],
      sizes: [],
    })
    setSearchQuery("")
  }

  // Reset column visibility to default
  const resetColumnVisibility = () => {
    setVisibleColumns(availableColumns.map((col) => col.id))
  }

  // Add this function to handle listing status changes
  const handleListingStatusChange = async (tshirtId: number, newStatus: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let updateData: { listing_status: string; price?: number | null } = {
        listing_status: newStatus
      }

      // If status is "For Sale", prompt for price
      if (newStatus === "For Sale") {
        const priceInput = prompt("Enter sale price ($):")
        if (!priceInput) return // Cancel if no price entered
        const price = parseFloat(priceInput)
        if (isNaN(price) || price < 0) {
          toast.error("Please enter a valid price")
          return
        }
        updateData.price = price
      } else {
        updateData.price = null // Clear price if not for sale
      }

      // Update the local state immediately to show changes
      setTshirts((prev) =>
        prev.map((tshirt) =>
          tshirt.id === tshirtId
            ? {
                ...tshirt,
                listing_status: newStatus,
                price: updateData.price !== undefined ? updateData.price : tshirt.price,
              }
            : tshirt
        )
      )
      
      // Update the database
      const { error } = await supabase
        .from('t_shirts')
        .update(updateData)
        .eq('id', tshirtId)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success(`Status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating listing status:', error)
      toast.error('Failed to update listing status')
      
      // Revert the local state on error
      const originalTshirt = tshirts.find(t => t.id === tshirtId);
      if (originalTshirt) {
        setTshirts((prev) =>
          prev.map((tshirt) =>
            tshirt.id === tshirtId ? originalTshirt : tshirt
          )
        )
      }
    }
  }

  // Handle item selection for bulk actions
  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId)
      } else {
        return [...prev, itemId]
      }
    })
  }

  // Handle select all items
  const toggleSelectAll = () => {
    if (selectedItems.length === sortedTshirts.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(sortedTshirts.map((shirt) => shirt.id))
    }
  }

  // Export to CSV function
  const exportToCSV = () => {
    // Filter to selected items or use all if none selected
    const itemsToExport =
      selectedItems.length > 0 ? sortedTshirts.filter((shirt) => selectedItems.includes(shirt.id)) : sortedTshirts

    // Create CSV content
    const csvHeader = "ID,Name,Licensing,Year,Condition,Size,Tags,Date Added,Estimated Value,Listing Status\n"
    const csvContent = itemsToExport
      .map((shirt) => {
        return `${shirt.id},"${shirt.name}","${shirt.licensing.join("|")}",${shirt.year},"${shirt.condition}","${shirt.size}","${shirt.tags.join("|")}","${shirt.date_added}",${shirt.estimated_value},"${shirt.listing_status}"`
      })
      .join("\n")

    // Create and download the CSV file
    const csv = csvHeader + csvContent
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `t-shirt-collection-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle bulk status change
  const handleBulkStatusChange = async (newStatus: string) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // If setting to "For Sale", handle individual prices
      if (newStatus === "For Sale") {
        // Get selected items
        const selectedTshirts = tshirts.filter(t => selectedItems.includes(t.id));
        
        // Create a map to track prices for each item
        const itemPrices = new Map<number, number | null>();
        
        // Ask for price for each item
        for (const shirt of selectedTshirts) {
          const priceInput = prompt(`Enter sale price for "${shirt.name}" ($):`);
          
          // If user cancels for any item, abort the entire operation
          if (priceInput === null) {
            setIsLoading(false);
            return;
          }
          
          const parsedPrice = priceInput ? parseFloat(priceInput) : null;
          if (priceInput && (isNaN(parsedPrice!) || parsedPrice! < 0)) {
            toast.error(`Invalid price for "${shirt.name}". Please enter a valid number.`);
            setIsLoading(false);
            return;
          }
          
          // Store the price
          itemPrices.set(shirt.id, parsedPrice);
        }
        
        // Update each item individually with its specific price
        for (const [itemId, price] of itemPrices.entries()) {
          const { error } = await supabase
            .from('t_shirts')
            .update({ 
              listing_status: newStatus,
              price: price 
            })
            .eq('id', itemId)
            .eq('user_id', user.id);
            
          if (error) throw error;
        }
        
        toast.success(`Updated ${selectedItems.length} items to "For Sale" status with individual prices`);
      } else {
        // For other statuses, update all items at once
        const { error } = await supabase
          .from('t_shirts')
          .update({ 
            listing_status: newStatus,
            price: null // Clear price if not for sale
          })
          .in('id', selectedItems)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        toast.success(`Updated ${selectedItems.length} items to "${newStatus}" status`);
      }
      
      // Clear selection after action
      setSelectedItems([]);
    } catch (error) {
      console.error('Error updating items:', error);
      toast.error('Failed to update items');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete ${selectedItems.length} selected items? This cannot be undone.`)) {
      return;
    }
    
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Delete all selected items
      const { error } = await supabase
        .from('t_shirts')
        .delete()
        .in('id', selectedItems)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Success message
      toast.success(`Deleted ${selectedItems.length} items successfully`);
      
      // Update the local state to remove the deleted items
      setTshirts(prev => prev.filter(shirt => !selectedItems.includes(shirt.id)));
      
      // Clear selection after action
      setSelectedItems([]);
    } catch (error) {
      console.error('Error deleting items:', error);
      toast.error('Failed to delete items');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick add item
  const handleQuickAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      const form = e.target as HTMLFormElement;
      
      // Filter out any empty items
      const filteredItems = formItems.filter((item, index) => {
        const nameInput = document.getElementById(`item-${item.id}-name`) as HTMLInputElement;
        return nameInput && nameInput.value.trim() !== '';
      });
      
      if (filteredItems.length === 0) {
        toast.error("Please enter at least one item name");
        setIsLoading(false);
        return;
      }
      
      // Process each item
      for (const item of filteredItems) {
        const nameInput = document.getElementById(`item-${item.id}-name`) as HTMLInputElement;
        const collectionSelect = document.getElementById(`item-${item.id}-collection`) as HTMLSelectElement;
        const listingStatusSelect = document.getElementById(`item-${item.id}-listing-status`) as HTMLSelectElement;
        const conditionSelect = document.getElementById(`item-${item.id}-condition`) as HTMLSelectElement;
        const sizeSelect = document.getElementById(`item-${item.id}-size`) as HTMLSelectElement;
        const yearInput = document.getElementById(`item-${item.id}-year`) as HTMLInputElement;
        const licensingInput = document.getElementById(`item-${item.id}-licensing`) as HTMLInputElement;
        const estimatedValueInput = document.getElementById(`item-${item.id}-value`) as HTMLInputElement;
        const descriptionInput = document.getElementById(`item-${item.id}-description`) as HTMLTextAreaElement;
        const tagsInput = document.getElementById(`item-${item.id}-tags`) as HTMLInputElement;
        
        const name = nameInput?.value.trim();
        const collectionId = collectionSelect?.value;
        const listingStatus = listingStatusSelect?.value || 'Public';
        const condition = conditionSelect?.value || '';
        const size = sizeSelect?.value || '';
        const year = yearInput?.value ? parseInt(yearInput.value) : null;
        const licensing = licensingInput?.value ? licensingInput.value.split(',').map(l => l.trim()) : [];
        const estimatedValue = estimatedValueInput?.value ? parseFloat(estimatedValueInput.value) : 0;
        const description = descriptionInput?.value || '';
        const tags = tagsInput?.value ? tagsInput.value.split(',').map(tag => tag.trim()) : [];
        
        if (!name) continue;

        // Create the t-shirt record
        const newItem = {
          name,
          licensing,
          year: year || null, // Ensure year is null if not provided
          condition,
          size,
          description,
          estimated_value: estimatedValue,
          tags,
          listing_status: listingStatus,
          price: null,
          user_id: user.id,
          date_added: new Date().toISOString()
        };

        // Insert the t-shirt
        const { data: tshirtData, error: insertError } = await supabase
          .from('t_shirts')
          .insert(newItem)
          .select()
          .single();

        if (insertError) {
          console.error('Error adding item:', insertError);
          toast.error(`Error adding "${name}": ${insertError.message}`);
          continue;
        }

        // Handle collection assignment
        if (collectionId && collectionId !== "") {
          const { error: collectionError } = await supabase
            .from('t_shirt_collections')
            .insert({
              t_shirt_id: tshirtData.id,
              collection_id: parseInt(collectionId)
            });

          if (collectionError) {
            console.error('Error adding to collection:', collectionError);
            toast.error(`Added "${name}" but failed to add to collection`);
          }
        }

        let imageUrl = null;

        // Handle image upload if there's an image
        if (item.imageFile) {
          try {
            const formData = new FormData();
            formData.append('file', item.imageFile);
            
            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to upload image');
            }
            
            const data = await response.json();
            imageUrl = data.url;
            
            // Add image to item_images table
            const { error: imageError } = await supabase
              .from('item_images')
              .insert({
                t_shirt_id: tshirtData.id,
                image_url: imageUrl,
                is_primary: true
              });

            if (imageError) {
              console.error('Error adding image:', imageError);
              toast.error(`Added "${name}" but failed to add image`);
            }
          } catch (uploadError) {
            console.error('Error uploading image:', uploadError);
            toast.error(`Added "${name}" but failed to upload image`);
          }
        }

        // Update local state with the correct collection and image
        const selectedCollectionObj = collectionId ? userCollections.find(c => c.id.toString() === collectionId) : null;
        const newTshirt = {
          ...tshirtData,
          collections: selectedCollectionObj ? [selectedCollectionObj] : [],
          image: imageUrl || "https://sdmntprwestus.oaiusercontent.com/files/00000000-b1a8-5230-9a33-8d0232019a5f/raw?se=2025-03-28T20%3A31%3A18Z&sp=r&sv=2024-08-04&sr=b&scid=8157505d-4747-5ad1-bef6-3270ff39e9bf&skoid=aa8389fc-fad7-4f8c-9921-3c583664d512&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-03-28T19%3A09%3A20Z&ske=2025-03-29T19%3A09%3A20Z&sks=b&skv=2024-08-04&sig=EKWBNrvKR19KQvKAkGwBhLXv4nVPQrbzGghlzr/ctnA%3D"
        };
        
        setTshirts(prev => [newTshirt, ...prev]);
      }
      
      // Reset form
      setFormItems([{ id: Date.now().toString(), values: {}, imageFile: null, imageUrl: "" }]);
      setFormKey(prev => prev + 1);
      setIsQuickAddOpen(false);
      toast.success(`Added ${filteredItems.length} item${filteredItems.length > 1 ? 's' : ''} successfully`);
    } catch (error) {
      console.error('Error adding items:', error);
      toast.error('Failed to add items');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding new item
  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      const form = e.target as HTMLFormElement;
      const formElements = form.elements as HTMLFormControlsCollection & {
        'item-name': HTMLInputElement;
        'item-licensing'?: HTMLInputElement;
        'item-year'?: HTMLInputElement;
        'item-condition'?: HTMLSelectElement;
        'item-size'?: HTMLSelectElement;
        'item-description'?: HTMLTextAreaElement;
        'item-value'?: HTMLInputElement;
        'item-tags'?: HTMLInputElement;
        'item-listing-status'?: HTMLSelectElement;
        'item-price'?: HTMLInputElement;
      };

      // Required field
      const name = formElements['item-name'].value;

      // Optional fields with null checks
      const licensing = optionalFields.licensing ? (formElements['item-licensing']?.value || '').split(',').map(l => l.trim()) : [];
      const year = optionalFields.year ? parseInt(formElements['item-year']?.value || '0') || null : null;
      const condition = optionalFields.condition ? formElements['item-condition']?.value || '' : '';
      const size = optionalFields.size ? formElements['item-size']?.value || '' : '';
      const description = optionalFields.description ? formElements['item-description']?.value || '' : '';
      const estimated_value = optionalFields.value ? parseFloat(formElements['item-value']?.value || '0') : null;
      const tags = optionalFields.tags ? (formElements['item-tags']?.value || '').split(",").map((tag: string) => tag.trim()) : [];
      const listing_status = optionalFields.listing_status ? formElements['item-listing-status']?.value || 'Public' : 'Public';
      const price = optionalFields.price ? parseFloat(formElements['item-price']?.value || '0') : null;

      // Create the new item object
      const newItem = {
        name,
        licensing,
        year,
        condition,
        size,
        description,
        estimated_value,
        tags,
        listing_status,
        price,
        user_id: user.id,
        date_added: new Date().toISOString(),
        image: itemImage || "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80"
      };

      // Insert the t-shirt
      const { data: tshirtData, error: insertError } = await supabase
        .from('t_shirts')
        .insert(newItem)
        .select()
        .single();

      if (insertError) throw insertError;

      // If a collection is selected (not "all"), add to that collection
      if (selectedCollection !== "all") {
        const { error: collectionError } = await supabase
          .from('t_shirt_collections')
          .insert({
            t_shirt_id: tshirtData.id,
            collection_id: parseInt(selectedCollection)
          });

        if (collectionError) {
          console.error('Error adding to collection:', collectionError);
          toast.error(`Added "${name}" but failed to add to collection`);
        }
      }

      // Update local state
      const newTshirt = {
        ...tshirtData,
        collections: selectedCollection !== "all" 
          ? [userCollections.find(c => c.id.toString() === selectedCollection)!]
          : []
      };
      
      setTshirts(prev => [newTshirt, ...prev]);
      setIsAddItemOpen(false);
      toast.success('Item added successfully');
      
      // Reset form
      form.reset();
      setOptionalFields({
        licensing: false,
        year: false,
        condition: false,
        size: false,
        value: false,
        tags: false,
        description: false,
        listing_status: false,
        price: false,
        collection: false
      });
      // Clear image state
      setItemImage("");
      setItemImageFile(null);
    } catch (error) {
      console.error('Error adding item:', error);
      if (error instanceof Error) {
        toast.error(`Error adding item: ${error.message}`);
      } else {
        toast.error('Failed to add item');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add these state variables
  const [itemImage, setItemImage] = useState<string>("");
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);

  // Handle collection change
  const handleCollectionChange = async (collectionId: string) => {
    if (!selectedTshirt) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (collectionId === 'none') {
        // Remove from all collections
        const { error } = await supabase
          .from('t_shirt_collections')
          .delete()
          .eq('t_shirt_id', selectedTshirt.id);

        if (error) throw error;

        // Update local state
        setTshirts(prev => prev.map(t => 
          t.id === selectedTshirt.id 
            ? { ...t, collections: [] }
            : t
        ));

        toast.success('Moved to All Shirts');
      } else {
        // Add to the selected collection
        const { error } = await supabase
          .from('t_shirt_collections')
          .insert({
            t_shirt_id: selectedTshirt.id,
            collection_id: parseInt(collectionId)
          });

        if (error) throw error;

        // Get the collection details
        const collection = userCollections.find(c => c.id.toString() === collectionId);
        
        // Update local state
        setTshirts(prev => prev.map(t => 
          t.id === selectedTshirt.id 
            ? { ...t, collections: [...t.collections, collection!] }
            : t
        ));

        toast.success(`Moved to ${collection?.name}`);
      }
      
      setIsChangeCollectionOpen(false);
    } catch (error) {
      console.error('Error updating t-shirt collection:', error);
      toast.error('Failed to update collection');
    }
  };

  // Handle bulk collection move
  const handleBulkCollectionMove = async (collectionId: string | null) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      if (collectionId === null) {
        // Remove selected items from all collections
        const { error } = await supabase
          .from('t_shirt_collections')
          .delete()
          .in('t_shirt_id', selectedItems);
        
        if (error) throw error;
        
        // Update local state
        setTshirts(prev => prev.map(t => 
          selectedItems.includes(t.id)
            ? { ...t, collections: [] }
            : t
        ));
        
        toast.success(`Moved ${selectedItems.length} items to All Shirts`);
      } else {
        // Add selected items to the collection
        const bulkInsert = selectedItems.map(tshirtId => ({
          t_shirt_id: tshirtId,
          collection_id: parseInt(collectionId)
        }));
        
        const { error } = await supabase
          .from('t_shirt_collections')
          .insert(bulkInsert);
        
        if (error) throw error;
        
        // Get the collection details
        const collection = userCollections.find(c => c.id.toString() === collectionId);
        
        // Update local state
        setTshirts(prev => prev.map(t => 
          selectedItems.includes(t.id)
            ? { ...t, collections: [...t.collections, collection!] }
            : t
        ));
        
        toast.success(`Moved ${selectedItems.length} items to ${collection?.name}`);
      }
      
      // Clear selection after successful move
      setSelectedItems([]);
    } catch (error) {
      console.error('Error moving items:', error);
      toast.error('Failed to move items');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete collection
  const handleDeleteCollection = async (collectionId: string) => {
    try {
      const collection = userCollections.find(c => c.id.toString() === collectionId);
      if (!collection) return;

      // First remove all t-shirt associations
      const { error: deleteAssociationsError } = await supabase
        .from('t_shirt_collections')
        .delete()
        .eq('collection_id', collection.id);

      if (deleteAssociationsError) throw deleteAssociationsError;

      // Then delete the collection
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collection.id);

      if (error) throw error;

      // Update local state
      setUserCollections(prev => prev.filter(c => c.id.toString() !== collectionId));
      
      // Update t-shirts state to remove the deleted collection
      setTshirts(prev => prev.map(t => ({
        ...t,
        collections: t.collections.filter(c => c.id.toString() !== collectionId)
      })));
      
      // If we were viewing the deleted collection, switch to "All Shirts"
      if (selectedCollection === collectionId) {
        setSelectedCollection("all");
      }

      toast.success(`Collection deleted`);
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error('Failed to delete collection');
    }
  };

  // Add these computed values after other state declarations
  const isAllSelected = useMemo(() => {
    return sortedTshirts.length > 0 && selectedItems.length === sortedTshirts.length;
  }, [sortedTshirts.length, selectedItems.length]);

  // Add this function after other function declarations
  const toggleAllItems = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(sortedTshirts.map((shirt) => shirt.id));
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-col gap-6">
          <div>
            {/* Collection title and selector */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">My Collection</h1>
              <p className="text-muted-foreground">Manage and organize your t-shirt collection</p>
              
              {/* Collections row */}
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
                <Button
                  variant={selectedCollection === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCollection("all")}
                  className="whitespace-nowrap"
                >
                  <Layers className="mr-2 h-4 w-4" /> All Shirts
                </Button>
                
                {userCollections.map((collection) => (
                  <div key={collection.id} className="flex items-center gap-1">
                    <div className="relative flex items-center">
                      <Button
                        variant={selectedCollection === collection.id.toString() ? "default" : "outline"}
                        onClick={() => setSelectedCollection(collection.id.toString())}
                        className="whitespace-nowrap"
                      >
                        {collection.name}
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-1 hover:bg-accent absolute right-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Collection Settings</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${collection.name}"? This cannot be undone.`)) {
                                handleDeleteCollection(collection.id.toString())
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Collection
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => setIsNewCollectionOpen(true)}
                  className="whitespace-nowrap"
                >
                  <Plus className="mr-2 h-4 w-4" /> New Collection
                </Button>
              </div>
            </div>

            {/* Collection title */}
            <div className="mb-6">
              {selectedCollection === "all" ? (
                <h2 className="text-2xl font-bold">All Shirts ({filteredTshirts.length})</h2>
              ) : (
                <>
                  {(() => {
                    const collection = userCollections.find(
                      (c) => c.id.toString() === selectedCollection
                    );
                    if (collection) {
                      const itemCount = filteredTshirts.length;
                      return (
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-bold">
                            {collection.name} ({itemCount})
                          </h2>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </>
              )}
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, licensing, or tags..."  // Changed from "brand" to "licensing"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter
                    {Object.values(activeFilters).some((arr) => arr.length > 0) && (
                      <Badge
                        variant="secondary"
                        className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center"
                      >
                        {Object.values(activeFilters).reduce((acc, arr) => acc + arr.length, 0)}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Licensing</DropdownMenuLabel>  {/* Changed from "Filter by Brand" to "Filter by Licensing" */}
                  <DropdownMenuSeparator />
                  {uniqueBrands.map((brand) => (  // Changed from uniqueLicensing to uniqueBrands and brand to licensing
                    <DropdownMenuItem key={brand} onClick={() => toggleFilter("licensing", brand)}>  // Changed from "brand" to "licensing"
                      <Checkbox
                        checked={activeFilters.licensing.includes(brand)}  // Changed from brands to licensing
                        className="mr-2"
                        onCheckedChange={() => toggleFilter("licensing", brand)}  // Changed from "brand" to "licensing"
                      />
                      {brand} 
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Year</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {uniqueYears.map((year) => (
                    <DropdownMenuItem key={year} onClick={() => toggleFilter("years", year)}>
                      <Checkbox
                        checked={activeFilters.years.includes(year)}
                        className="mr-2"
                        onCheckedChange={() => toggleFilter("years", year)}
                      />
                      {year}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Condition</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {uniqueConditions.map((condition) => (
                    <DropdownMenuItem key={condition} onClick={() => toggleFilter("conditions", condition)}>
                      <Checkbox
                        checked={activeFilters.conditions.includes(condition)}
                        className="mr-2"
                        onCheckedChange={() => toggleFilter("conditions", condition)}
                      />
                      {condition}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Size</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {uniqueSizes.map((size) => (
                    <DropdownMenuItem key={size} onClick={() => toggleFilter("sizes", size)}>
                      <Checkbox
                        checked={activeFilters.sizes.includes(size)}
                        className="mr-2"
                        onCheckedChange={() => toggleFilter("sizes", size)}
                      />
                      {size}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    key="clear-all-filters"
                    onClick={clearFilters}
                    disabled={!Object.values(activeFilters).some((arr) => arr.length > 0)}
                  >
                    Clear All Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="flex items-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <rect width="7" height="7" x="3" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="14" rx="1" />
                    <rect width="7" height="7" x="3" y="14" rx="1" />
                  </svg>
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="flex items-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                  List
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsColumnCustomizationOpen(true)}
                  className="flex items-center gap-1"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Customize Columns
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsQuickAddOpen(true)}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Quick Add
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredTshirts.length} item{filteredTshirts.length !== 1 ? "s" : ""} found
              </div>
            </div>

            {/* Active filters */}
            {(Object.values(activeFilters).some((arr) => arr.length > 0) || searchQuery) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span>Search: {searchQuery}</span>
                    <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => setSearchQuery("")}>
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </Badge>
                )}

                {activeFilters.licensing.map((brand) => (  // Changed from 'brand' to 'licensing' to match database column
                  <Badge key={brand} variant="secondary" className="flex items-center gap-1">
                    <span>Licensing: {brand}</span>  // Changed from 'Brand' to 'Licensing'
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => toggleFilter("licensing", brand)}  // Changed from "brand" to "licensing"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </Badge>
                ))}

                {activeFilters.years.map((year) => (
                  <Badge key={year} variant="secondary" className="flex items-center gap-1">
                    <span>Year: {year}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => toggleFilter("years", year)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </Badge>
                ))}

                {activeFilters.conditions.map((condition) => (
                  <Badge key={condition} variant="secondary" className="flex items-center gap-1">
                    <span>Condition: {condition}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => toggleFilter("conditions", condition)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </Badge>
                ))}

                {activeFilters.sizes.map((size) => (
                  <Badge key={size} variant="secondary" className="flex items-center gap-1">
                    <span>Size: {size}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => toggleFilter("sizes", size)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </Badge>
                ))}

                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
            )}

            {/* Bulk Actions Bar - Only shows when items are selected */}
            {selectedItems.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50 shadow-lg">
                <div className="container mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} selected
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedItems([])}
                      className="text-muted-foreground"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <FolderPlus className="h-4 w-4" />
                          Move to Collection
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleBulkCollectionMove(null)}>
                          Remove from Collection
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {userCollections.map((collection) => (
                          <DropdownMenuItem 
                            key={collection.id} 
                            onClick={() => handleBulkCollectionMove(collection.id.toString())}
                          >
                            {collection.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          Change Status
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleBulkStatusChange("Public")}>
                          Not For Sale
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkStatusChange("Private")}>
                          Private
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkStatusChange("For Sale")}>
                          For Sale
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkStatusChange("Taking Offers")}>
                          Taking Offers
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={exportToCSV} 
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleBulkDelete}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* T-shirt grid/list */}
            {sortedTshirts.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {sortedTshirts.map((shirt) => (
                    <div key={shirt.id}>
                      <Card
                        className={`overflow-hidden ${selectedItems.includes(shirt.id) ? "ring-2 ring-primary/40" : ""}`}
                      >
                        <Link href={`/items/${shirt.id}`}>
                        <div className="relative aspect-square">
                            {shirt.image ? (
                              <Image
                                src={shirt.image}
                              alt={shirt.name}
                                fill
                                className="object-cover"
                            />
                          ) : (
                            <Image
                                src="/placeholder.svg"
                              alt={shirt.name}
                              fill
                              className="object-cover"
                            />
                          )}
                          <div 
                            className="absolute top-2 left-2 z-10"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <Checkbox
                              checked={selectedItems.includes(shirt.id)}
                              onCheckedChange={() => toggleItemSelection(shirt.id)}
                              aria-label={`Select ${shirt.name}`}
                              className="bg-background/80 backdrop-blur-sm border-muted"
                            />
                          </div>
                        </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium truncate hover:text-primary transition-colors">{shirt.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {Array.isArray(shirt.licensing) ? shirt.licensing.join(', ') : shirt.licensing} • {shirt.year}
                            </p>
                        </CardContent>
                        </Link>
                      </Card>
                    </div>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-4 py-3"><Checkbox checked={isAllSelected} onCheckedChange={toggleAllItems} aria-label="Select all items"/></th>
                            {visibleColumns.map((column) => (
                              <th key={column} className="px-4 py-3 text-left font-medium">
                                {column.charAt(0).toUpperCase() + column.slice(1)}
                            </th>
                            ))}
                            <th className="px-4 py-3"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {sortedTshirts.map((shirt) => (
                            <tr key={shirt.id} className={`hover:bg-muted/50 ${selectedItems.includes(shirt.id) ? "bg-primary/5" : ""}`}>
                              <td className="px-4 py-3">
                                <div
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                >
                                  <Checkbox
                                    checked={selectedItems.includes(shirt.id)}
                                    onCheckedChange={() => toggleItemSelection(shirt.id)}
                                    aria-label={`Select ${shirt.name}`}
                                  />
                                </div>
                              </td>
                              {visibleColumns.includes("image") && (
                                <td className="px-4 py-3">
                                  <Link href={`/items/${shirt.id}`}>
                                  <div className="h-12 w-12 relative rounded overflow-hidden">
                                      {shirt.image ? (
                                        <Image
                                          src={shirt.image}
                                        alt={shirt.name}
                                          fill
                                          className="object-cover"
                                      />
                                    ) : (
                                      <Image
                                          src="/placeholder.svg"
                                        alt={shirt.name}
                                        fill
                                        className="object-cover"
                                      />
                                    )}
                                  </div>
                                  </Link>
                                </td>
                              )}
                              {visibleColumns.includes("name") && (
                                <td className="px-4 py-3 max-w-[180px]">
                                  <Link href={`/items/${shirt.id}`} className="hover:text-primary transition-colors">
                                    <div className="font-medium truncate" title={shirt.name}>{shirt.name}</div>
                                  <div className="text-xs text-muted-foreground line-clamp-1">{shirt.description}</div>
                                  </Link>
                                </td>
                              )}
                              {visibleColumns.includes("licensing") && (
                                <td className="px-4 py-3">
                                  {Array.isArray(shirt.licensing) ? shirt.licensing.join(', ') : shirt.licensing}
                                </td>
                              )}
                              {visibleColumns.includes("year") && (
                                <td className="px-4 py-3">{shirt.year}</td>
                              )}
                              {visibleColumns.includes("size") && (
                                <td className="px-4 py-3">{shirt.size}</td>
                              )}
                              {visibleColumns.includes("condition") && (
                                <td className="px-4 py-3">{shirt.condition}</td>
                              )}
                              {visibleColumns.includes("listing_status") && (
                                <td className="px-4 py-3">
                                  <ListingStatusBadge
                                    status={shirt.listing_status}
                                    price={shirt.price}
                                    itemId={shirt.id}
                                    onStatusChange={handleListingStatusChange}
                                  />
                                </td>
                              )}
                              {visibleColumns.includes("tags") && (
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap gap-1">
                                    {shirt.tags.map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </td>
                              )}
                              {visibleColumns.includes("date_added") && (
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                  {new Date(shirt.date_added).toLocaleDateString()}
                                </td>
                              )}
                              {visibleColumns.includes("estimated_value") && (
                                <td className="px-4 py-3">
                                  {shirt.estimated_value ? `$${shirt.estimated_value.toFixed(2)}` : '-'}
                                </td>
                              )}
                              {visibleColumns.includes("collection") && (
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap gap-1">
                                    {shirt.collections.length > 0 ? (
                                      shirt.collections.map((collection) => (
                                        <Badge 
                                          key={collection.id} 
                                          variant="outline" 
                                          className="text-xs cursor-pointer hover:bg-accent"
                                          onClick={() => setSelectedCollection(collection.id.toString())}
                                        >
                                          {collection.name}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-muted-foreground text-xs">All Shirts</span>
                                    )}
                                  </div>
                                </td>
                              )}
                              {visibleColumns.includes("actions") && (
                                <td className="px-4 py-3">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => {
                                        setSelectedTshirt(shirt);
                                        setSelectedCollectionId(shirt.collections[0]?.id.toString() || "none");
                                        setIsChangeCollectionOpen(true);
                                      }}>
                                        <FolderPlus className="h-4 w-4 mr-2" />
                                        Move to Collection
                                      </DropdownMenuItem>
                                      <DropdownMenuItem asChild>
                                        <Link href={`/items/${shirt.id}`}>
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Details
                                        </Link>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 text-lg text-muted-foreground">
                  Hmmm, looks like your collection is empty!
                </div>
                <div className="text-sm text-muted-foreground">
                  Click the Quick Add button above to add your first item.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={isAddItemOpen} onOpenChange={(open) => {
        setIsAddItemOpen(open);
        if (!open) {
          setItemImage("");
          setItemImageFile(null);
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Add a detailed item to your collection.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow pr-4 max-h-[60vh] overflow-y-auto">
            <form id="add-item-form" onSubmit={handleAddItem}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="item-name">Item Name*</Label>
                  <Input
                    id="item-name"
                    name="item-name"
                    placeholder="e.g., Metallica 'Black Album' Tour Tee"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Item Image</Label>
                    <ImageUploader
                      defaultImage={itemImage}
                      onImageUpload={(imageUrl, file) => {
                        setItemImage(imageUrl);
                        setItemImageFile(file);
                      }}
                      className="h-[250px]"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="item-listing-status">Listing Status*</Label>
                      <select
                        id="item-listing-status"
                        name="item-listing-status"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="Public"
                      >
                        <option value="Public">Not For Sale</option>
                        <option value="Private">Private</option>
                        <option value="For Sale">For Sale</option>
                        <option value="Taking Offers">Taking Offers</option>
                      </select>
                    </div>

                    {/* Optional Fields */}
                    {optionalFields.licensing && (
                      <div className="grid gap-2">
                        <Label htmlFor="item-brand">Brand</Label>
                        <Input
                          id="item-brand"
                          name="item-brand"
                          placeholder="e.g., Metallica, Harley Davidson"
                        />
                      </div>
                    )}

                    {optionalFields.year && (
                      <div className="grid gap-2">
                        <Label htmlFor="item-year">Year</Label>
                        <Input
                          id="item-year"
                          name="item-year"
                          type="number"
                          placeholder="e.g., 1991"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Fields */}
                <div className="grid gap-4 mt-2">
                  {optionalFields.condition && (
                    <div className="grid gap-2">
                      <Label htmlFor="item-condition">Condition</Label>
                      <select
                        id="item-condition"
                        name="item-condition"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="Mint">Mint</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                      </select>
                    </div>
                  )}

                  {optionalFields.size && (
                    <div className="grid gap-2">
                      <Label htmlFor="item-size">Size</Label>
                      <select
                        id="item-size"
                        name="item-size"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                        <option value="XXXL">XXXL</option>
                      </select>
                    </div>
                  )}

                  {optionalFields.value && (
                    <div className="grid gap-2">
                      <Label htmlFor="item-value">Estimated Value ($)</Label>
                      <Input
                        id="item-value"
                        name="item-value"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  {optionalFields.tags && (
                    <div className="grid gap-2">
                      <Label htmlFor="item-tags">Tags (comma separated)</Label>
                      <Input
                        id="item-tags"
                        name="item-tags"
                        placeholder="e.g., vintage, 90s, rock, concert"
                      />
                    </div>
                  )}

                  {optionalFields.description && (
                    <div className="grid gap-2">
                      <Label htmlFor="item-description">Description</Label>
                      <Textarea
                        id="item-description"
                        name="item-description"
                        placeholder="Enter description here..."
                        className="min-h-[100px]"
                      />
                    </div>
                  )}
                </div>

                {/* Optional Field Buttons */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {!optionalFields.licensing && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleOptionalField("licensing")} 
                      className="text-xs py-1"
                    >
                      + Licensing
                    </Button>
                  )}
                  
                  {!optionalFields.year && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleOptionalField("year")} 
                      className="text-xs py-1"
                    >
                      + Year
                    </Button>
                  )}
                  
                  {!optionalFields.condition && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleOptionalField("condition")} 
                      className="text-xs py-1"
                    >
                      + Condition
                    </Button>
                  )}
                  
                  {!optionalFields.size && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleOptionalField("size")} 
                      className="text-xs py-1"
                    >
                      + Size
                    </Button>
                  )}
                  
                  {!optionalFields.value && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleOptionalField("value")} 
                      className="text-xs py-1"
                    >
                      + Estimated Value
                    </Button>
                  )}
                  
                  {!optionalFields.tags && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleOptionalField("tags")} 
                      className="text-xs py-1"
                    >
                      + Tags
                    </Button>
                  )}
                  
                  {!optionalFields.description && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleOptionalField("description")} 
                      className="text-xs py-1"
                    >
                      + Description
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                const form = document.getElementById("add-item-form") as HTMLFormElement;
                if (form) form.requestSubmit();
              }} 
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isChangeCollectionOpen} onOpenChange={setIsChangeCollectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to Collection</DialogTitle>
            <DialogDescription>Choose a collection to move this t-shirt to</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select
              value={selectedCollectionId}
              onValueChange={handleCollectionChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All Items</SelectItem>
                {userCollections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id.toString()}>
                    <div className="flex items-center gap-2">
                      {collection.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Add Dialog */}
      <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Quick Add Items</DialogTitle>
            <DialogDescription>
              Quickly add multiple items to your collection
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow pr-4 max-h-[70vh] overflow-y-auto">
            <form onSubmit={handleQuickAdd}>
              <div className="space-y-6 py-4">
                {formItems.map((item, index) => (
                  <div key={item.id}>
                    <div className="grid gap-4">
                      {/* Required Fields */}
                      <div className="grid gap-2">
                        <Label htmlFor={`item-${item.id}-name`}>Item Name*</Label>
                        <Input
                          id={`item-${item.id}-name`}
                          placeholder="e.g., Metallica 'Black Album' Tour Tee"
                          required
                        />
                      </div>

                      {/* Image Upload */}
                      <div className="grid gap-2">
                        <Label>Item Image</Label>
                        <ImageUploader
                          onImageUpload={(imageUrl, file) => {
                            // Update the formItem with the image data
                            setFormItems(prev => prev.map(formItem => 
                              formItem.id === item.id 
                                ? { ...formItem, imageUrl, imageFile: file }
                                : formItem
                            ));
                          }}
                          defaultImage={item.imageUrl}
                          className="h-[200px]"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor={`item-${item.id}-listing-status`}>Status*</Label>
                        <select
                          id={`item-${item.id}-listing-status`}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          required
                        >
                          <option value="Public">Not For Sale</option>
                          <option value="Private">Private</option>
                          <option value="For Sale">For Sale</option>
                          <option value="Taking Offers">Taking Offers</option>
                        </select>
                      </div>

                      {/* Optional Fields */}
                      {optionalFields.collection && (
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor={`item-${item.id}-collection`}>Collection</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleOptionalField("collection")}
                              className="h-6 w-6 p-0 hover:bg-accent hover:text-accent-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <select
                            id={`item-${item.id}-collection`}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          >
                            <option value="">None</option>
                            {userCollections.map((collection) => (
                              <option key={collection.id} value={collection.id}>
                                {collection.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {optionalFields.condition && (
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor={`item-${item.id}-condition`}>Condition</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleOptionalField("condition")}
                              className="h-6 w-6 p-0 hover:bg-accent hover:text-accent-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <select
                            id={`item-${item.id}-condition`}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          >
                            <option value="">Select condition</option>
                            <option value="Mint">Mint</option>
                            <option value="Excellent">Excellent</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                            <option value="Poor">Poor</option>
                          </select>
                        </div>
                      )}

                      {optionalFields.size && (
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor={`item-${item.id}-size`}>Size</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleOptionalField("size")}
                              className="h-6 w-6 p-0 hover:bg-accent hover:text-accent-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <select
                            id={`item-${item.id}-size`}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
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
                      )}

                      {optionalFields.year && (
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor={`item-${item.id}-year`}>Year</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleOptionalField("year")}
                              className="h-6 w-6 p-0 hover:bg-accent hover:text-accent-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            id={`item-${item.id}-year`}
                            type="number"
                            placeholder="e.g., 1991"
                          />
                        </div>
                      )}

                      {optionalFields.value && (
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor={`item-${item.id}-value`}>Value ($)</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleOptionalField("value")}
                              className="h-6 w-6 p-0 hover:bg-accent hover:text-accent-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            id={`item-${item.id}-value`}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                          />
                        </div>
                      )}

                      {optionalFields.licensing && (
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor={`item-${item.id}-licensing`}>Licensing (comma separated)</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleOptionalField("licensing")}
                              className="h-6 w-6 p-0 hover:bg-accent hover:text-accent-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            id={`item-${item.id}-licensing`}
                            placeholder="e.g., Metallica, Harley Davidson"
                          />
                        </div>
                      )}

                      {optionalFields.tags && (
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor={`item-${item.id}-tags`}>Tags (comma separated)</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleOptionalField("tags")}
                              className="h-6 w-6 p-0 hover:bg-accent hover:text-accent-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            id={`item-${item.id}-tags`}
                            placeholder="e.g., vintage, 90s, rock, concert"
                          />
                        </div>
                      )}

                      {optionalFields.description && (
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor={`item-${item.id}-description`}>Description</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleOptionalField("description")}
                              className="h-6 w-6 p-0 hover:bg-accent hover:text-accent-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            id={`item-${item.id}-description`}
                            placeholder="Enter description here..."
                          />
                        </div>
                      )}

                      {/* Optional Field Buttons */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {!optionalFields.collection && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => toggleOptionalField("collection")} 
                            className="text-xs py-1"
                          >
                            + Collection
                          </Button>
                        )}
                        {!optionalFields.licensing && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => toggleOptionalField("licensing")} 
                            className="text-xs py-1"
                          >
                            + Licensing
                          </Button>
                        )}
                        {!optionalFields.year && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => toggleOptionalField("year")} 
                            className="text-xs py-1"
                          >
                            + Year
                          </Button>
                        )}
                        {!optionalFields.condition && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => toggleOptionalField("condition")} 
                            className="text-xs py-1"
                          >
                            + Condition
                          </Button>
                        )}
                        {!optionalFields.size && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => toggleOptionalField("size")} 
                            className="text-xs py-1"
                          >
                            + Size
                          </Button>
                        )}
                        {!optionalFields.value && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => toggleOptionalField("value")} 
                            className="text-xs py-1"
                          >
                            + Value
                          </Button>
                        )}
                        {!optionalFields.tags && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => toggleOptionalField("tags")} 
                            className="text-xs py-1"
                          >
                            + Tags
                          </Button>
                        )}
                        {!optionalFields.description && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => toggleOptionalField("description")} 
                            className="text-xs py-1"
                          >
                            + Description
                          </Button>
                        )}
                      </div>
                    </div>
                    {index < formItems.length - 1 && (
                      <div className="relative mt-6">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Item {index + 2}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <DialogFooter>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormItems(prev => [...prev, { id: Date.now().toString(), values: {}, imageFile: null, imageUrl: "" }])}
                  >
                    Add Another Item
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Items"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* New Collection Dialog */}
      <Dialog open={isNewCollectionOpen} onOpenChange={setIsNewCollectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription>
              Create a new collection to organize your items
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="collection-name">Collection Name*</Label>
              <Input
                id="collection-name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Enter collection name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={newCollectionTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCollectionTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewCollectionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCollection} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Collection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customize Columns Dialog */}
      <Dialog open={isColumnCustomizationOpen} onOpenChange={setIsColumnCustomizationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customize Columns</DialogTitle>
            <DialogDescription>
              Choose which columns to display in the list view
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {availableColumns.map((column) => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`column-${column.id}`}
                  checked={visibleColumns.includes(column.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setVisibleColumns(prev => [...prev, column.id])
                    } else {
                      // Don't allow removing all columns
                      if (visibleColumns.length === 1) return
                      setVisibleColumns(prev => prev.filter(id => id !== column.id))
                    }
                  }}
                />
                <Label htmlFor={`column-${column.id}`}>
                  {column.name}
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetColumnVisibility}>Reset to Default</Button>
            <Button variant="outline" onClick={() => setIsColumnCustomizationOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


