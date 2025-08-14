"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, Lock, Globe, Download, Trash2, Edit, Eye, EyeOff, ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

interface PackageFile {
  name: string
  size: number
  downloadUrl: string
}

interface UserPackage {
  id: string
  name: string
  type: "public" | "private"
  files: PackageFile[]
  uploadDate: string
  downloads: number
  isUnlocked?: boolean
}

function PackagesContent() {
  const { user } = useAuth()
  const [packages, setPackages] = useState<UserPackage[]>([
    {
      id: "1",
      name: "react-utils",
      type: "public",
      files: [
        { name: "hooks.js", size: 2048, downloadUrl: "#" },
        { name: "components.jsx", size: 4096, downloadUrl: "#" },
      ],
      uploadDate: "2h ago",
      downloads: 15,
    },
    {
      id: "2",
      name: "api-keys",
      type: "private",
      files: [
        { name: "config.env", size: 512, downloadUrl: "#" },
        { name: "secrets.json", size: 1024, downloadUrl: "#" },
        { name: "database.sql", size: 8192, downloadUrl: "#" },
      ],
      uploadDate: "1d ago",
      downloads: 3,
      isUnlocked: false,
    },
    {
      id: "3",
      name: "docker-setup",
      type: "public",
      files: [
        { name: "Dockerfile", size: 1024, downloadUrl: "#" },
        { name: "docker-compose.yml", size: 2048, downloadUrl: "#" },
      ],
      uploadDate: "3d ago",
      downloads: 42,
    },
  ])

  const [selectedPackage, setSelectedPackage] = useState<UserPackage | null>(null)
  const [secretKey, setSecretKey] = useState("")
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [unlockError, setUnlockError] = useState("")
  const [isUnlocking, setIsUnlocking] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).anime) {
      const anime = (window as any).anime

      // Terminal boot sequence
      anime({
        targets: ".packages-container",
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 1000,
        easing: "easeOutQuart",
      })

      // Matrix-style package loading
      anime({
        targets: ".package-card",
        opacity: [0, 1],
        translateY: [20, 0],
        rotateX: [90, 0],
        duration: 800,
        easing: "easeOutQuart",
        delay: anime.stagger(150, { start: 400 }),
      })

      // Glitch effect on tabs
      anime({
        targets: ".tab-trigger",
        opacity: [0.5, 1],
        duration: 200,
        loop: true,
        direction: "alternate",
        delay: anime.stagger(100),
      })
    }
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i]
  }

  const getTotalSize = (files: PackageFile[]) => {
    const total = files.reduce((sum, file) => sum + file.size, 0)
    return formatFileSize(total)
  }

  const handleUnlockPrivatePackage = async (packageId: string) => {
    setIsUnlocking(true)
    setUnlockError("")

    // Animate unlock attempt
    if (typeof window !== "undefined" && (window as any).anime) {
      const anime = (window as any).anime
      anime({
        targets: ".unlock-spinner",
        rotate: [0, 360],
        duration: 1000,
        loop: true,
        easing: "linear",
      })
    }

    setTimeout(() => {
      if (secretKey === "private123") {
        setPackages((prev) => prev.map((pkg) => (pkg.id === packageId ? { ...pkg, isUnlocked: true } : pkg)))
        setSecretKey("")
        setSelectedPackage(null)

        // Success animation
        if (typeof window !== "undefined" && (window as any).anime) {
          const anime = (window as any).anime
          anime({
            targets: `[data-package-id="${packageId}"]`,
            backgroundColor: ["#374151", "#10b981", "#374151"],
            duration: 1000,
            easing: "easeOutQuart",
          })
        }
      } else {
        setUnlockError("access_denied: invalid_key")
      }
      setIsUnlocking(false)
    }, 1500)
  }

  const handleDeletePackage = (packageId: string) => {
    if (confirm("rm -rf package? [y/N]")) {
      if (typeof window !== "undefined" && (window as any).anime) {
        const anime = (window as any).anime
        anime({
          targets: `[data-package-id="${packageId}"]`,
          opacity: [1, 0],
          scale: [1, 0.8],
          rotateX: [0, 90],
          duration: 600,
          easing: "easeInQuart",
          complete: () => {
            setPackages((prev) => prev.filter((pkg) => pkg.id !== packageId))
          },
        })
      } else {
        setPackages((prev) => prev.filter((pkg) => pkg.id !== packageId))
      }
    }
  }

  const handleDownloadFile = (fileName: string) => {
    if (typeof window !== "undefined" && (window as any).anime) {
      const anime = (window as any).anime
      anime({
        targets: `[data-file="${fileName}"]`,
        scale: [1, 0.9, 1],
        backgroundColor: ["#374151", "#10b981", "#374151"],
        duration: 400,
        easing: "easeOutQuart",
      })
    }
    alert(`wget ${fileName}...`)
  }

  const publicPackages = packages.filter((pkg) => pkg.type === "public")
  const privatePackages = packages.filter((pkg) => pkg.type === "private")

  return (
    <div className="min-h-screen bg-slate-900 text-green-400">
      <nav className="border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard">
                <h1 className="text-2xl font-mono font-bold text-green-400">$ sender</h1>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300 font-mono">user: {user?.name}</span>
              <Link href="/dashboard">
                <Button variant="ghost" className="font-mono text-green-400 hover:bg-slate-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  cd ../
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="packages-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-mono font-bold text-green-400 mb-2">$ ls packages/</h1>
              <p className="text-slate-300 font-mono">manage uploaded packages and files</p>
            </div>
            <Link href="/upload">
              <Button className="bg-green-600 hover:bg-green-700 font-mono">
                <Plus className="h-4 w-4 mr-2" />
                upload()
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-800 border border-slate-700">
              <TabsTrigger
                value="all"
                className="tab-trigger font-mono text-slate-300 data-[state=active]:bg-green-600 data-[state=active]:text-slate-900"
              >
                all ({packages.length})
              </TabsTrigger>
              <TabsTrigger
                value="public"
                className="tab-trigger font-mono text-slate-300 data-[state=active]:bg-green-600 data-[state=active]:text-slate-900"
              >
                public ({publicPackages.length})
              </TabsTrigger>
              <TabsTrigger
                value="private"
                className="tab-trigger font-mono text-slate-300 data-[state=active]:bg-green-600 data-[state=active]:text-slate-900"
              >
                private ({privatePackages.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    package={pkg}
                    onUnlock={() => setSelectedPackage(pkg)}
                    onDelete={() => handleDeletePackage(pkg.id)}
                    onDownload={handleDownloadFile}
                    formatFileSize={formatFileSize}
                    getTotalSize={getTotalSize}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="public">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicPackages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    package={pkg}
                    onUnlock={() => setSelectedPackage(pkg)}
                    onDelete={() => handleDeletePackage(pkg.id)}
                    onDownload={handleDownloadFile}
                    formatFileSize={formatFileSize}
                    getTotalSize={getTotalSize}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="private">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {privatePackages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    package={pkg}
                    onUnlock={() => setSelectedPackage(pkg)}
                    onDelete={() => handleDeletePackage(pkg.id)}
                    onDownload={handleDownloadFile}
                    formatFileSize={formatFileSize}
                    getTotalSize={getTotalSize}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {packages.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-mono font-medium text-green-400 mb-2">$ ls: no packages found</h3>
              <p className="text-slate-400 font-mono mb-6">initialize first package upload</p>
              <Link href="/upload">
                <Button className="bg-green-600 hover:bg-green-700 font-mono">
                  <Plus className="h-4 w-4 mr-2" />
                  upload()
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!selectedPackage} onOpenChange={() => setSelectedPackage(null)}>
        <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="font-mono text-green-400">$ unlock --private</DialogTitle>
            <DialogDescription className="font-mono text-slate-400">
              authenticate: "{selectedPackage?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {unlockError && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-500/30">
                <AlertDescription className="font-mono text-red-400">{unlockError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="unlock-key" className="font-mono text-slate-300">
                secret_key:
              </Label>
              <div className="relative">
                <Input
                  id="unlock-key"
                  type={showSecretKey ? "text" : "password"}
                  placeholder="enter_secret_key"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="font-mono bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                >
                  {showSecretKey ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedPackage(null)}
                className="flex-1 font-mono bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                cancel
              </Button>
              <Button
                onClick={() => selectedPackage && handleUnlockPrivatePackage(selectedPackage.id)}
                disabled={isUnlocking || !secretKey.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 font-mono"
              >
                {isUnlocking ? (
                  <span>
                    unlocking<span className="unlock-spinner inline-block ml-1">⟳</span>
                  </span>
                ) : (
                  "unlock()"
                )}
              </Button>
            </div>
            <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <p className="text-xs text-slate-400 font-mono mb-1">// demo credentials:</p>
              <p className="text-xs text-slate-300 font-mono">secret_key: "private123"</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface PackageCardProps {
  package: UserPackage
  onUnlock: () => void
  onDelete: () => void
  onDownload: (fileName: string) => void
  formatFileSize: (bytes: number) => string
  getTotalSize: (files: PackageFile[]) => string
}

function PackageCard({ package: pkg, onUnlock, onDelete, onDownload, formatFileSize, getTotalSize }: PackageCardProps) {
  const canViewFiles = pkg.type === "public" || pkg.isUnlocked

  return (
    <Card
      className="package-card border-slate-700 bg-slate-800 hover:border-green-400/50 transition-all duration-300"
      data-package-id={pkg.id}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="font-mono text-lg truncate text-green-400">{pkg.name}</CardTitle>
            <CardDescription className="font-mono text-slate-400">{pkg.uploadDate}</CardDescription>
          </div>
          <Badge
            variant={pkg.type === "public" ? "default" : "secondary"}
            className={`ml-2 font-mono ${
              pkg.type === "public" ? "bg-green-600 text-slate-900" : "bg-slate-700 text-slate-300 border-slate-600"
            }`}
          >
            {pkg.type === "public" ? (
              <>
                <Globe className="h-3 w-3 mr-1" />
                public
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 mr-1" />
                private
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-slate-400 font-mono">
          <span>{pkg.files.length} files</span>
          <span>{getTotalSize(pkg.files)}</span>
          <span>{pkg.downloads} dl</span>
        </div>

        {canViewFiles ? (
          <div className="space-y-2">
            <h4 className="font-mono font-medium text-green-400 text-sm">files[]:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {pkg.files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs bg-slate-700/50 p-2 rounded border border-slate-600"
                  data-file={file.name}
                >
                  <span className="font-mono text-slate-300 truncate flex-1">{file.name}</span>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="font-mono text-slate-500">{formatFileSize(file.size)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDownload(file.name)}
                      className="h-6 w-6 p-0 text-green-400 hover:bg-green-400/10"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Lock className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-mono mb-3">access_denied: locked</p>
            <Button
              size="sm"
              onClick={onUnlock}
              variant="outline"
              className="font-mono bg-transparent border-green-400/30 text-green-400 hover:bg-green-400/10"
            >
              unlock()
            </Button>
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-slate-700">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 font-mono bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Edit className="h-4 w-4 mr-1" />
            edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="flex-1 font-mono bg-transparent border-red-500/30 text-red-400 hover:bg-red-400/10"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            rm
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PackagesPage() {
  return (
    <ProtectedRoute>
      <PackagesContent />
    </ProtectedRoute>
  )
}
