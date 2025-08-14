"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface ContentItem {
  id: string
  key: string
  type: "text" | "heading" | "description" | "announcement"
  content: string
  isActive: boolean
  lastUpdated: string
}

interface ContentContextType {
  content: ContentItem[]
  getContent: (key: string) => string
  updateContent: (key: string, newContent: string) => void
  toggleAnnouncement: (key: string) => void
  isLoading: boolean
}

const defaultContent: ContentItem[] = [
  {
    id: "1",
    key: "hero_title",
    type: "heading",
    content: "Securely Send,\nEffortlessly Share",
    isActive: true,
    lastUpdated: "2 hours ago",
  },
  {
    id: "2",
    key: "hero_subtitle",
    type: "description",
    content:
      "Experience peace of mind with every file transfer. Share public packages with the world or keep them private with secure access keys.",
    isActive: true,
    lastUpdated: "2 hours ago",
  },
  {
    id: "3",
    key: "features_title",
    type: "heading",
    content: "Your files, your rules",
    isActive: true,
    lastUpdated: "1 day ago",
  },
  {
    id: "4",
    key: "features_subtitle",
    type: "description",
    content: "Complete control over how you share and manage your files",
    isActive: true,
    lastUpdated: "1 day ago",
  },
  {
    id: "5",
    key: "packages_title",
    type: "heading",
    content: "Recently Shared Packages",
    isActive: true,
    lastUpdated: "3 days ago",
  },
  {
    id: "6",
    key: "packages_subtitle",
    type: "description",
    content: "Discover what others are sharing publicly",
    isActive: true,
    lastUpdated: "3 days ago",
  },
  {
    id: "7",
    key: "announcement_banner",
    type: "announcement",
    content: "🎉 New feature: Bulk file uploads now available! Upload multiple files at once.",
    isActive: false,
    lastUpdated: "1 hour ago",
  },
]

const ContentContext = createContext<ContentContextType | undefined>(undefined)

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<ContentItem[]>(defaultContent)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Simulate loading content from Prismic.io
    const savedContent = localStorage.getItem("sender_content")
    if (savedContent) {
      setContent(JSON.parse(savedContent))
    }
  }, [])

  const getContent = (key: string): string => {
    const item = content.find((item) => item.key === key && item.isActive)
    return item?.content || ""
  }

  const updateContent = (key: string, newContent: string) => {
    setContent((prev) =>
      prev.map((item) => (item.key === key ? { ...item, content: newContent, lastUpdated: "Just now" } : item)),
    )

    // Save to localStorage (simulating Prismic.io API call)
    const updatedContent = content.map((item) =>
      item.key === key ? { ...item, content: newContent, lastUpdated: "Just now" } : item,
    )
    localStorage.setItem("sender_content", JSON.stringify(updatedContent))
  }

  const toggleAnnouncement = (key: string) => {
    setContent((prev) =>
      prev.map((item) => (item.key === key ? { ...item, isActive: !item.isActive, lastUpdated: "Just now" } : item)),
    )

    // Save to localStorage
    const updatedContent = content.map((item) =>
      item.key === key ? { ...item, isActive: !item.isActive, lastUpdated: "Just now" } : item,
    )
    localStorage.setItem("sender_content", JSON.stringify(updatedContent))
  }

  return (
    <ContentContext.Provider value={{ content, getContent, updateContent, toggleAnnouncement, isLoading }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  const context = useContext(ContentContext)
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider")
  }
  return context
}
