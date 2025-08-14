"use client"

import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Settings, LogOut, Plus, Lock } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

function DashboardContent() {
  const { user, logout } = useAuth()

  useEffect(() => {
    // Anime.js animations
    if (typeof window !== "undefined" && (window as any).anime) {
      const anime = (window as any).anime

      anime({
        targets: ".dashboard-card",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        easing: "easeOutQuart",
        delay: anime.stagger(100),
      })
    }
  }, [])

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-cyan-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-heading font-bold text-primary">Sender</h1>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-body">
                Welcome, {user?.name}
                {user?.isAdmin && (
                  <span className="ml-2 px-2 py-1 bg-accent/10 text-accent rounded-full text-xs">Admin</span>
                )}
              </span>
              <Button variant="ghost" onClick={handleLogout} className="font-body">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 font-body">Manage your packages and account settings</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="dashboard-card border-gray-200 hover:border-primary/30 transition-colors cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-heading text-lg">Upload Package</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="font-body text-center mb-4">
                Upload new files to share publicly or privately
              </CardDescription>
              <Link href="/upload">
                <Button className="w-full bg-primary hover:bg-primary/90 font-body">Start Upload</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="dashboard-card border-gray-200 hover:border-primary/30 transition-colors cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Package className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="font-heading text-lg">My Packages</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="font-body text-center mb-4">
                View and manage all your uploaded packages
              </CardDescription>
              <Link href="/packages">
                <Button variant="outline" className="w-full font-body bg-transparent">
                  View Packages
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="dashboard-card border-gray-200 hover:border-primary/30 transition-colors cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-heading text-lg">Retrieve Package</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="font-body text-center mb-4">
                Access private packages with name and key
              </CardDescription>
              <Link href="/retrieve">
                <Button variant="outline" className="w-full font-body bg-transparent">
                  Retrieve
                </Button>
              </Link>
            </CardContent>
          </Card>

          {user?.isAdmin && (
            <Card className="dashboard-card border-gray-200 hover:border-accent/30 transition-colors cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Settings className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="font-heading text-lg">Admin Panel</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="font-body text-center mb-4">Manage all packages and users</CardDescription>
                <Link href="/admin">
                  <Button
                    variant="outline"
                    className="w-full font-body bg-transparent border-accent text-accent hover:bg-accent/5"
                  >
                    Admin Panel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="font-heading">Recent Packages</CardTitle>
              <CardDescription className="font-body">Your recently uploaded packages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-body font-medium">Sample Package</p>
                    <p className="text-sm text-gray-500 font-body">Public • 2 hours ago</p>
                  </div>
                  <Button size="sm" variant="outline" className="bg-transparent">
                    View
                  </Button>
                </div>
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-body">No packages yet</p>
                  <Link href="/upload">
                    <Button className="mt-4 bg-primary hover:bg-primary/90 font-body">Upload Your First Package</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="font-heading">Account Overview</CardTitle>
              <CardDescription className="font-body">Your account statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-body text-gray-600">Total Packages</span>
                  <span className="font-body font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-gray-600">Public Packages</span>
                  <span className="font-body font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-gray-600">Private Packages</span>
                  <span className="font-body font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-gray-600">Account Type</span>
                  <span className="font-body font-semibold">{user?.isAdmin ? "Admin" : "User"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
