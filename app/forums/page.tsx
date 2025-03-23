"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock3, Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForumsPage() {
  // Sample forum topics for background
  const sampleTopics = [
    {
      id: 1,
      title: "Best way to store vintage t-shirts?",
      author: "ThreadHunter75",
      category: "Collection Care",
      content: "I've been collecting vintage band tees for years and I'm worried about preserving them properly.",
    },
    {
      id: 2,
      title: "Authentication check: 1994 Nirvana tee",
      author: "GrungeArchive",
      category: "Authentication",
      content: "I recently purchased what was sold to me as an original 1994 Nirvana In Utero tour t-shirt.",
    },
    {
      id: 3,
      title: "Supreme F/W 2023 Discussion Thread",
      author: "BoxLogoVault",
      category: "Streetwear",
      content: "Let's discuss the upcoming Supreme Fall/Winter 2023 collection.",
    },
  ]

  return (
    <div className="container py-8 relative">
      {/* Background content */}
      <div className="opacity-30">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Forums</h1>
          <p className="text-muted-foreground">Join discussions with other t-shirt enthusiasts</p>
        </div>

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-muted rounded-md">Recent Discussions</button>
            <button className="px-3 py-2 rounded-md">Categories</button>
            <button className="px-3 py-2 rounded-md">Popular</button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search forums..." className="pl-8 w-[300px]" />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Topic
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {sampleTopics.map((topic) => (
            <Card key={topic.id}>
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{topic.title}</CardTitle>
                    <CardDescription className="mt-1">
                      <Badge variant="secondary" className="rounded-sm font-normal">
                        {topic.category}
                      </Badge>
                      <span className="text-xs ml-2">Started by {topic.author}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">{topic.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Overlay with coming soon message */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background flex flex-col items-center justify-center z-10">
        <div className="text-center max-w-2xl px-4">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">Forums Coming Soon</h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Join the conversation with fellow vintage t-shirt enthusiasts. Share knowledge, get authentications, and
            connect with the community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="gap-2">
              <Calendar className="h-5 w-5" />
              <span>Get Notified When Live</span>
            </Button>
            <Button size="lg" className="gap-2">
              <Clock3 className="h-5 w-5" />
              <span>Join Waitlist</span>
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-4">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Avatar key={i} className="border-2 border-background">
                  <AvatarFallback>{i}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">250+</span> collectors waiting to join
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

