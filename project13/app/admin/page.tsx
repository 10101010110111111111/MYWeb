"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Package, Users, Download, Trash2, Search, ArrowLeft, Shield, Globe, Lock, Activity, Edit3 } from "lucide-react"
import Link from "next/link"

interface AdminPackage {
  id: string
  name: string
  type: "public" | "private"
  author: string
  authorEmail: string
  files: number
  totalSize: number
  downloads: number
  uploadDate: string
  lastAccessed: string
}

interface AdminUser {
  id: string
  name: string
  email: string
  packagesCount: number
  totalDownloads: number
  joinDate: string
  lastActive: string
  isAdmin: boolean
}

function AdminContent() {
  const { user } = useAuth()
  const [packages, setPackages] = useState<AdminPackage[]>([
    {
      id: "1",
      name: "My Public Documents",
      type: "public",
      author: "John Doe",
      authorEmail: "john@example.com",
      files: 2,
      totalSize: 3072576,
      downloads: 15,
      uploadDate: "2 hours ago",
      lastAccessed: "30 minutes ago",
    },
    {
      id: "2",
      name: "Private Project Files",
      type: "private",
      author: "Jane Smith",
      authorEmail: "jane@example.com",
      files: 3,
      totalSize: 5632048,
      downloads: 3,
      uploadDate: "1 day ago",
      lastAccessed: "2 hours ago",
    },
    {
      id: "3",
      name: "Design Assets",
      type: "public",
      author: "Mike Johnson",
      authorEmail: "mike@example.com",
      files: 2,
      totalSize: 1063936,
      downloads: 42,
      uploadDate: "3 days ago",
      lastAccessed: "1 hour ago",
    },
    {
      id: "4",
      name: "Confidential Reports",
      type: "private",
      author: "Sarah Wilson",
      authorEmail: "sarah@example.com",
      files: 5,
      totalSize: 8192000,
      downloads: 1,
      uploadDate: "1 week ago",
      lastAccessed: "3 days ago",
    },
  ])

  const [users, setUsers] = useState<AdminUser[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      packagesCount: 1,
      totalDownloads: 15,
      joinDate: "2 weeks ago",
      lastActive: "30 minutes ago",
      isAdmin: false,
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      packagesCount: 1,
      totalDownloads: 3,
      joinDate: "1 month ago",
      lastActive: "2 hours ago",
      isAdmin: false,
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      packagesCount: 1,
      totalDownloads: 42,
      joinDate: "3 weeks ago",
      lastActive: "1 hour ago",
      isAdmin: false,
    },
    {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah@example.com",
      packagesCount: 1,
      totalDownloads: 1,
      joinDate: "2 months ago",
      lastActive: "3 days ago",
      isAdmin: false,
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPackage, setSelectedPackage] = useState<AdminPackage | null>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    // Anime.js animations
    if (typeof window !== "undefined" && (window as any).anime) {
      const anime = (window as any).anime

      anime({
        targets: ".admin-container",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        easing: "easeOutQuart",
      })

      anime({
        targets: ".stat-card",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: "easeOutQuart",
        delay: anime.stagger(100, { start: 300 }),
      })
    }
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDeletePackage = (packageId: string) => {
    if (confirm("Are you sure you want to delete this package? This action cannot be undone.")) {
      setPackages((prev) => prev.filter((pkg) => pkg.id !== packageId))
      setSelectedPackage(null)
    }
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user and all their packages? This action cannot be undone.")) {
      setUsers((prev) => prev.filter((user) => user.id !== userId))
      setPackages((prev) => prev.filter((pkg) => pkg.authorEmail !== users.find((u) => u.id === userId)?.email))
      setSelectedUser(null)
    }
  }

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.authorEmail.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPackages = packages.length
  const publicPackages = packages.filter((pkg) => pkg.type === "public").length
  const privatePackages = packages.filter((pkg) => pkg.type === "private").length
  const totalUsers = users.length
  const totalDownloads = packages.reduce((sum, pkg) => sum + pkg.downloads, 0)
  const totalStorage = packages.reduce((sum, pkg) => sum + pkg.totalSize, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-cyan-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard">
                <h1 className="text-2xl font-heading font-bold text-primary">Sender</h1>
              </Link>
              <Badge className="ml-3 bg-accent text-white font-body">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin/content">
                <Button variant="outline" className="font-body bg-transparent">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Content Management
                </Button>
              </Link>
              <span className="text-sm text-gray-600 font-body">Welcome, {user?.name}</span>
              <Link href="/dashboard">
                <Button variant="ghost" className="font-body">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="admin-container">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 font-body">Manage all packages, users, and system settings</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="stat-card border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body font-medium">Total Packages</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading font-bold">{totalPackages}</div>
                <p className="text-xs text-muted-foreground font-body">
                  {publicPackages} public, {privatePackages} private
                </p>
              </CardContent>
            </Card>

            <Card className="stat-card border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground font-body">Active users</p>
              </CardContent>
            </Card>

            <Card className="stat-card border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body font-medium">Total Downloads</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading font-bold">{totalDownloads}</div>
                <p className="text-xs text-muted-foreground font-body">All time</p>
              </CardContent>
            </Card>

            <Card className="stat-card border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-body font-medium">Storage Used</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading font-bold">{formatFileSize(totalStorage)}</div>
                <p className="text-xs text-muted-foreground font-body">Total storage</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search packages or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-body"
              />
            </div>
          </div>

          <Tabs defaultValue="packages" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="packages" className="font-body">
                All Packages ({filteredPackages.length})
              </TabsTrigger>
              <TabsTrigger value="users" className="font-body">
                All Users ({filteredUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="packages">
              <div className="space-y-4">
                {filteredPackages.map((pkg) => (
                  <Card key={pkg.id} className="border-gray-200 hover:border-primary/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-heading font-semibold text-lg truncate">{pkg.name}</h3>
                            <Badge variant={pkg.type === "public" ? "default" : "secondary"} className="font-body">
                              {pkg.type === "public" ? (
                                <>
                                  <Globe className="h-3 w-3 mr-1" />
                                  Public
                                </>
                              ) : (
                                <>
                                  <Lock className="h-3 w-3 mr-1" />
                                  Private
                                </>
                              )}
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 font-body">
                            <div>
                              <span className="font-medium">Author:</span> {pkg.author}
                            </div>
                            <div>
                              <span className="font-medium">Files:</span> {pkg.files}
                            </div>
                            <div>
                              <span className="font-medium">Size:</span> {formatFileSize(pkg.totalSize)}
                            </div>
                            <div>
                              <span className="font-medium">Downloads:</span> {pkg.downloads}
                            </div>
                            <div>
                              <span className="font-medium">Uploaded:</span> {pkg.uploadDate}
                            </div>
                            <div>
                              <span className="font-medium">Last accessed:</span> {pkg.lastAccessed}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPackage(pkg)}
                            className="font-body bg-transparent"
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="font-body bg-transparent text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="border-gray-200 hover:border-primary/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-heading font-semibold text-lg">{user.name}</h3>
                            {user.isAdmin && (
                              <Badge className="bg-accent text-white font-body">
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                          </div>
                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 font-body">
                            <div>
                              <span className="font-medium">Email:</span> {user.email}
                            </div>
                            <div>
                              <span className="font-medium">Packages:</span> {user.packagesCount}
                            </div>
                            <div>
                              <span className="font-medium">Downloads:</span> {user.totalDownloads}
                            </div>
                            <div>
                              <span className="font-medium">Joined:</span> {user.joinDate}
                            </div>
                            <div>
                              <span className="font-medium">Last active:</span> {user.lastActive}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUser(user)}
                            className="font-body bg-transparent"
                          >
                            View Details
                          </Button>
                          {!user.isAdmin && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(user.id)}
                              className="font-body bg-transparent text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Package Details Dialog */}
      <Dialog open={!!selectedPackage} onOpenChange={() => setSelectedPackage(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Package Details</DialogTitle>
            <DialogDescription className="font-body">
              Detailed information about "{selectedPackage?.name}"
            </DialogDescription>
          </DialogHeader>
          {selectedPackage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm font-body">
                <div>
                  <span className="font-medium text-gray-900">Package Name:</span>
                  <p className="text-gray-600">{selectedPackage.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Type:</span>
                  <p className="text-gray-600 capitalize">{selectedPackage.type}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Author:</span>
                  <p className="text-gray-600">{selectedPackage.author}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Email:</span>
                  <p className="text-gray-600">{selectedPackage.authorEmail}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Files:</span>
                  <p className="text-gray-600">{selectedPackage.files}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Total Size:</span>
                  <p className="text-gray-600">{formatFileSize(selectedPackage.totalSize)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Downloads:</span>
                  <p className="text-gray-600">{selectedPackage.downloads}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Upload Date:</span>
                  <p className="text-gray-600">{selectedPackage.uploadDate}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPackage(null)}
                  className="flex-1 font-body bg-transparent"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleDeletePackage(selectedPackage.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-body"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Package
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">User Details</DialogTitle>
            <DialogDescription className="font-body">
              Detailed information about "{selectedUser?.name}"
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm font-body">
                <div>
                  <span className="font-medium text-gray-900">Name:</span>
                  <p className="text-gray-600">{selectedUser.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Email:</span>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Packages:</span>
                  <p className="text-gray-600">{selectedUser.packagesCount}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Total Downloads:</span>
                  <p className="text-gray-600">{selectedUser.totalDownloads}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Join Date:</span>
                  <p className="text-gray-600">{selectedUser.joinDate}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Last Active:</span>
                  <p className="text-gray-600">{selectedUser.lastActive}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Account Type:</span>
                  <p className="text-gray-600">{selectedUser.isAdmin ? "Administrator" : "Regular User"}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 font-body bg-transparent"
                >
                  Close
                </Button>
                {!selectedUser.isAdmin && (
                  <Button
                    onClick={() => handleDeleteUser(selectedUser.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-body"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete User
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminContent />
    </ProtectedRoute>
  )
}
