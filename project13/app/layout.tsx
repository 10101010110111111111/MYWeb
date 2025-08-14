import type React from "react"
import type { Metadata } from "next"
import { JetBrains_Mono, Source_Code_Pro } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import { ContentProvider } from "@/contexts/content-context"
import "./globals.css"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
})

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-code-pro",
})

export const metadata: Metadata = {
  title: "Sender - File Sharing for Developers",
  description: "Simple, fast file sharing platform built for developers.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${sourceCodePro.variable} antialiased`}>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
      </head>
      <body className="bg-gray-900 text-gray-100 font-mono">
        <AuthProvider>
          <ContentProvider>{children}</ContentProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
