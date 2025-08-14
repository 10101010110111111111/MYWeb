"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useContent } from "@/contexts/content-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Edit, Save, ArrowLeft, Shield, Type, FileText, Megaphone, Eye } from "lucide-react"
import Link from "next/link"

interface EditingContent {
  key: string
  content: string
}

function ContentManagementContent() {
  const { user } = useAuth()
  const { content, updateContent, toggleAnnouncement } = useContent()
  const [editingContent, setEditingContent] = useState<EditingContent | null>(null)
  const [editValue, setEditValue] = useState("")

  useEffect(() => {
    // Anime.js animations
    if (typeof window !== "undefined" && (window as any).anime) {
      const anime = (window as any).anime

      anime({
        targets: ".content-container",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        easing: "easeOutQuart",
      })

      anime({
        targets: ".content-card",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: "easeOutQuart",
        delay: anime.stagger(100, { start: 300 }),
      })
    }
  }, [])

  const handleEdit = (key: string, currentContent: string) => {
    setEditingContent({ key, content: currentContent })
    setEditValue(currentContent)
  }

  const handleSave = () => {
    if (editingContent) {
      updateContent(editingContent.key, editValue)
      setEditingContent(null)
      setEditValue("")
    }
  }

  const handleCancel = () => {
    setEditingContent(null)
    setEditValue("")
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "heading":
        return <Type className="h-4 w-4" />
      case "description":
        return <FileText className="h-4 w-4" />
      case "announcement":
        return <Megaphone className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "heading":
        return "bg-blue-100 text-blue-800"
      case "description":
        return "bg-green-100 text-green-800"
      case "announcement":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-cyan-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin">
                <h1 className="text-2xl font-heading font-bold text-primary">Sender</h1>
              </Link>
              <Badge className="ml-3 bg-accent text-white font-body">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-body">Welcome, {user?.name}</span>
              <Link href="/admin">
                <Button variant="ghost" className="font-body">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="content-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">Content Management</h1>
              <p className="text-gray-600 font-body">Manage dynamic content across the platform</p>
            </div>
            <Link href="/" target="_blank">
              <Button variant="outline" className="font-body bg-transparent">
                <Eye className="h-4 w-4 mr-2" />
                Preview Site
              </Button>
            </Link>
          </div>

          <div className="grid gap-6">
            {content.map((item) => (
              <Card key={item.id} className="content-card border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>{getTypeIcon(item.type)}</div>
                      <div>
                        <CardTitle className="font-heading text-lg capitalize">{item.key.replace(/_/g, " ")}</CardTitle>
                        <CardDescription className="font-body">
                          {item.type} • Last updated {item.lastUpdated}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.type === "announcement" && (
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`toggle-${item.id}`} className="font-body text-sm">
                            Active
                          </Label>
                          <Switch
                            id={`toggle-${item.id}`}
                            checked={item.isActive}
                            onCheckedChange={() => toggleAnnouncement(item.key)}
                          />
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item.key, item.content)}
                        className="font-body bg-transparent"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-body text-gray-700 whitespace-pre-wrap">
                      {item.content || <span className="text-gray-400 italic">No content</span>}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-heading font-semibold text-blue-900 mb-2">Prismic.io Integration</h3>
            <p className="text-sm text-blue-800 font-body mb-4">
              This content management system simulates integration with Prismic.io. In a production environment, content
              would be fetched from Prismic.io's API and cached for optimal performance.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm font-body">
              <div>
                <span className="font-medium text-blue-900">Features:</span>
                <ul className="list-disc list-inside text-blue-800 mt-1 space-y-1">
                  <li>Dynamic content updates</li>
                  <li>Real-time preview</li>
                  <li>Content versioning</li>
                </ul>
              </div>
              <div>
                <span className="font-medium text-blue-900">Content Types:</span>
                <ul className="list-disc list-inside text-blue-800 mt-1 space-y-1">
                  <li>Headings and titles</li>
                  <li>Descriptions and body text</li>
                  <li>Announcement banners</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Content Dialog */}
      <Dialog open={!!editingContent} onOpenChange={() => setEditingContent(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Content</DialogTitle>
            <DialogDescription className="font-body">
              Update the content for "{editingContent?.key.replace(/_/g, " ")}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content-edit" className="font-body">
                Content
              </Label>
              <Textarea
                id="content-edit"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="font-body min-h-32"
                placeholder="Enter content..."
              />
              <p className="text-xs text-gray-500 font-body">
                Use \n for line breaks in headings. HTML is not supported.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCancel} className="flex-1 font-body bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 font-body">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ContentManagementPage() {
  return (
    <ProtectedRoute adminOnly>
      <ContentManagementContent />
    </ProtectedRoute>
  )
}
