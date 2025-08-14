"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Download, ArrowLeft, File, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

interface RetrievedPackage {
  name: string
  files: Array<{
    name: string
    size: number
    downloadUrl: string
  }>
  author: string
  uploadDate: string
}

export default function RetrievePage() {
  const [packageName, setPackageName] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [retrievedPackage, setRetrievedPackage] = useState<RetrievedPackage | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).anime) {
      const anime = (window as any).anime

      // Terminal typing effect
      anime({
        targets: ".retrieve-container",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        easing: "easeOutQuart",
      })

      // Blinking cursor effect
      anime({
        targets: ".cursor",
        opacity: [1, 0],
        duration: 800,
        loop: true,
        direction: "alternate",
        easing: "easeInOutQuad",
      })
    }
  }, [])

  const handleRetrieve = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!packageName.trim()) {
      setError("package_name required")
      setIsLoading(false)
      return
    }

    if (!secretKey.trim()) {
      setError("secret_key required")
      setIsLoading(false)
      return
    }

    if (typeof window !== "undefined" && (window as any).anime) {
      const anime = (window as any).anime
      anime({
        targets: ".loading-dots",
        opacity: [0.3, 1],
        duration: 500,
        loop: true,
        direction: "alternate",
        delay: anime.stagger(100),
      })
    }

    setTimeout(() => {
      if (packageName.toLowerCase() === "demo-private" && secretKey === "secret123") {
        const mockPackage: RetrievedPackage = {
          name: "demo-private",
          files: [
            { name: "config.json", size: 2048, downloadUrl: "#" },
            { name: "main.py", size: 4096, downloadUrl: "#" },
            { name: "README.md", size: 1024, downloadUrl: "#" },
          ],
          author: "dev_user",
          uploadDate: "2h ago",
        }
        setRetrievedPackage(mockPackage)

        if (typeof window !== "undefined" && (window as any).anime) {
          const anime = (window as any).anime
          anime({
            targets: ".package-reveal",
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 800,
            easing: "easeOutQuart",
            delay: 200,
          })

          // Animate file list
          anime({
            targets: ".file-entry",
            opacity: [0, 1],
            translateX: [-20, 0],
            duration: 400,
            delay: anime.stagger(100, { start: 600 }),
            easing: "easeOutQuart",
          })
        }
      } else {
        setError("invalid credentials")
      }
      setIsLoading(false)
    }, 1500)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i]
  }

  const handleDownload = (fileName: string) => {
    if (typeof window !== "undefined" && (window as any).anime) {
      const anime = (window as any).anime
      anime({
        targets: `[data-file="${fileName}"]`,
        scale: [1, 0.95, 1],
        backgroundColor: ["#374151", "#10b981", "#374151"],
        duration: 600,
        easing: "easeOutQuart",
      })
    }
    alert(`downloading ${fileName}...`)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-green-400">
      <nav className="border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-mono font-bold text-green-400">$ sender</h1>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" className="font-mono text-green-400 hover:bg-slate-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  cd ../
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="retrieve-container">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="text-3xl font-mono font-bold text-green-400 mb-2">
              $ retrieve --private<span className="cursor">_</span>
            </h1>
            <p className="text-slate-300 font-mono">access private package with credentials</p>
          </div>

          {!retrievedPackage ? (
            <Card className="border-slate-700 bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="font-mono text-center text-green-400">authenticate()</CardTitle>
                <CardDescription className="font-mono text-center text-slate-400">
                  package_name && secret_key required
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRetrieve} className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="bg-red-900/20 border-red-500/30">
                      <AlertDescription className="font-mono text-red-400">ERROR: {error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="package-name" className="font-mono text-slate-300">
                      package_name:
                    </Label>
                    <Input
                      id="package-name"
                      placeholder="enter_package_name"
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                      className="font-mono bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secret-key" className="font-mono text-slate-300">
                      secret_key:
                    </Label>
                    <div className="relative">
                      <Input
                        id="secret-key"
                        type={showSecretKey ? "text" : "password"}
                        placeholder="enter_secret_key"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        className="font-mono bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500 pr-10"
                        required
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

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 font-mono"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span>
                        authenticating
                        <span className="loading-dots">.</span>
                        <span className="loading-dots">.</span>
                        <span className="loading-dots">.</span>
                      </span>
                    ) : (
                      "authenticate()"
                    )}
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <p className="text-xs text-slate-400 font-mono mb-2">// demo credentials:</p>
                  <p className="text-xs text-slate-300 font-mono">package_name: "demo-private"</p>
                  <p className="text-xs text-slate-300 font-mono">secret_key: "secret123"</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="package-reveal border-slate-700 bg-slate-800 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-mono text-xl text-green-400">{retrievedPackage.name}</CardTitle>
                    <CardDescription className="font-mono text-slate-400">
                      author: {retrievedPackage.author} | uploaded: {retrievedPackage.uploadDate}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setRetrievedPackage(null)}
                    className="font-mono bg-transparent border-green-400/30 text-green-400 hover:bg-green-400/10"
                  >
                    new_search()
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono font-medium text-green-400">package_contents[]</h3>
                    <span className="text-sm text-slate-400 font-mono">{retrievedPackage.files.length} files</span>
                  </div>

                  <div className="space-y-3">
                    {retrievedPackage.files.map((file, index) => (
                      <div
                        key={index}
                        data-file={file.name}
                        className="file-entry flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                      >
                        <File className="h-5 w-5 text-slate-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono font-medium text-slate-200 truncate">{file.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{formatFileSize(file.size)}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(file.name)}
                          className="bg-green-600 hover:bg-green-700 font-mono"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          get
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <Button
                      onClick={() => {
                        retrievedPackage.files.forEach((file) => handleDownload(file.name))
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 font-mono"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      download_all()
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
