import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, History } from "lucide-react"

export default function ContributionSuccessPage() {
  return (
    <div className="container py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-6 dark:bg-green-900/20">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Contribution Submitted!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for contributing to The Vault! Your submission has been received and will be reviewed by our
          moderators. This process usually takes 1-2 business days.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/vault">
              <History className="mr-2 h-4 w-4" /> Return to Vault
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/vault/contribute">Submit Another</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

