import type React from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock3 } from "lucide-react"

interface ComingSoonProps {
  title: string
  description: string
  icon?: React.ReactNode
  className?: string // Add this line to accept custom classes
}

export function ComingSoon({ title, description, icon, className = "" }: ComingSoonProps) {
  return (
    <div
      className={`absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background flex flex-col items-center z-10 ${className}`}
    >
      <div className="text-center max-w-2xl px-4">
        {icon && <div className="mb-6 flex justify-center">{icon}</div>}
        <h2 className="text-5xl md:text-6xl font-bold mb-6">{title}</h2>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8">{description}</p>
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
  )
}

