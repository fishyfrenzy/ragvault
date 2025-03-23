import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "../styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Toaster } from "sonner"
import ClientLayout from "@/components/client-layout"
import DevMenu from '@/components/DevMenu'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RagVault - Your T-Shirt Collection",
  description: "Catalog, trade, and discuss your t-shirt collection",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ClientLayout>
            <div className="flex min-h-screen flex-col">
              <Header />
              <div className="flex flex-1">
                <DevMenu />
                <main className="flex-1">{children}</main>
              </div>
              <Footer />
            </div>
          </ClientLayout>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}