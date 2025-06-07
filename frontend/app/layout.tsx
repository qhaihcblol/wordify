import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { PublicNavbar } from "@/components/layout/public-navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Wordify - English Vocabulary Learning",
  description: "Master English vocabulary with interactive flashcards and topic-based learning",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <PublicNavbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
