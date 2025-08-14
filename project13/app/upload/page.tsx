"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, X, File, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UploadedFile {
  file: File
  id: string
  progress: number
  status: "pending" | "uploading" | "completed" | "error"
}

function UploadContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [packageType, setPackageType] = useState<"public" | "private">("public")
  const [packageName, setPackageName] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).anime) {
      const anime = (window as any).anime

      // Terminal boot sequence animation
      anime({
        targets: ".upload-container",
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 1000,
        easing: "easeOutQuart",
      })

      // Staggered card animations
      anime({
        targets: ".upload-card",
        opacity: [0, 1],
        translateX: [-50, 0],
        duration: 800,
        delay: anime.stagger(200),
        easing: "easeOutQuart",
      })
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)

    if (typeof window !== "undefined" && (window as any).anime) {
      const anime = (window as any).anime
      anime({
        targets: ".drop-zone",
        scale: [1, 1.02],
        duration: 200,
        easing: "easeOutQuart",
      })
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    if (typeof window !== "undefined" && (window as any).anime) {
      const anime = (window as any).anime
      anime({
        targets: ".drop-zone",
        scale: [1.02, 1],
        duration: 200,
        easing: "easeOutQuart",
      })
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)

    if (typeof window !== "undefined" && (window as any).anime) {
      const anime = (window as any).anime
      anime({
        targets: ".drop-zone",
        scale: [1.02, 1],
        backgroundColor: ["#10b981", "#374151"],
        duration: 600,
        easing: "easeOutQuart",
      })
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      addFiles(selectedFiles)
    }
  }

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      if (file.size > 50 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is 50MB.`)
        return false
      }
      return true
    })

    const uploadFiles: UploadedFile[] = validFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: "pending",
    }))

    setFiles((prev) => [...prev, ...uploadFiles])
    setError("")

    if (typeof window !== "undefined" && (window as any).anime) {
      const anime = (window as any).anime
      setTimeout(() => {
        anime({
          targets: ".file-item:last-child",
          opacity: [0, 1],
          translateX: [-30, 0],
          duration: 400,
          easing: "easeOutQuart",
        })
      }, 100)
    }
  }

  const removeFile = (id: string) => {
    if (typeof window !== "undefined" && (window as any).anime) {
      const anime = (window as any).anime
      anime({
        targets: `[data-file-id="${id}"]`,
        opacity: [1, 0],
        translateX: [0, 30],
        duration: 300,
        easing: "easeInQuart",
        complete: () => {
          setFiles((prev) => prev.filter((f) => f.id !== id))
        },
      })
    } else {
      setFiles((prev) => prev.filter((f) => f.id !== id))
    }
  }

  const simulateUpload = (fileId: string) => {
    return new Promise<void>((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15
        if (progress >= 100) {
          progress = 100
          setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: 100, status: "completed" } : f)))
          clearInterval(interval)
          resolve()
        } else {
          setFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, progress: Math.round(progress), status: "uploading" } : f)),
          )
        }
      }, 200)
    })
  }

  const handleUpload = async () => {
    if (!packageName.trim()) {
      setError("Please enter a package name")
      return
    }

    if (packageType === "private" && !secretKey.trim()) {
      setError("Please enter a secret key for private packages")
      return
    }

    if (files.length === 0) {
      setError("Please select at least one file")
      return
    }

    setIsUploading(true)
    setError("")

    try {
      for (const file of files) {
        await simulateUpload(file.id)
      }

      if (typeof window !== "undefined" && (window as any).anime) {
        const anime = (window as any).anime
        anime({
          targets: ".success-animation",
          scale: [0, 1.1, 1],
          opacity: [0, 1],
          rotate: [0, 360],
          duration: 800,
          easing: "easeOutBack",
        })
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/packages")
      }, 2000)
    } catch (err) {
      setError("Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center success-animation bg-slate-800 border-green-500/30">
          <CardHeader>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-400 font-mono">$ upload_complete</CardTitle>
            <CardDescription className="text-slate-300 font-mono">
              Package "{packageName}" [{packageType}] uploaded successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 font-mono mb-4">Redirecting to packages...</p>
            <Link href="/packages">
              <Button className="bg-green-600 hover:bg-green-700 font-mono">cd packages/</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="upload-container">
          <div className="mb-8">
            <h1 className="text-3xl font-mono font-bold text-green-400 mb-2">$ upload --package</h1>
            <p className="text-slate-300 font-mono">Initialize new package upload [public|private]</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-500/30">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-mono text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-slate-700 bg-slate-800 upload-card">
              <CardHeader>
                <CardTitle className="font-mono text-green-400">./files</CardTitle>
                <CardDescription className="font-mono text-slate-400">
                  drag_drop || browse_files (max: 50MB/file)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`drop-zone border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                    isDragOver
                      ? "border-green-400 bg-green-400/10"
                      : "border-slate-600 hover:border-green-400/50 hover:bg-slate-700/50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-lg font-mono font-medium text-slate-300 mb-2">drop files here</p>
                  <p className="text-sm text-slate-500 font-mono mb-4">or</p>
                  <label htmlFor="file-upload">
                    <Button
                      variant="outline"
                      className="cursor-pointer font-mono bg-transparent border-green-400/30 text-green-400 hover:bg-green-400/10"
                    >
                      browse_files()
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="*/*"
                    />
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-mono font-medium text-green-400">selected_files[]</h4>
                    {files.map((uploadFile) => (
                      <div
                        key={uploadFile.id}
                        data-file-id={uploadFile.id}
                        className="file-item flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                      >
                        <File className="h-5 w-5 text-slate-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono font-medium text-slate-200 truncate">
                            {uploadFile.file.name}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">{formatFileSize(uploadFile.file.size)}</p>
                          {uploadFile.status === "uploading" && (
                            <Progress value={uploadFile.progress} className="mt-2 h-2 bg-slate-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {uploadFile.status === "completed" && <CheckCircle className="h-5 w-5 text-green-400" />}
                          {uploadFile.status === "error" && <AlertCircle className="h-5 w-5 text-red-400" />}
                          {uploadFile.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(uploadFile.id)}
                              className="h-8 w-8 p-0 text-red-400 hover:bg-red-400/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800 upload-card">
              <CardHeader>
                <CardTitle className="font-mono text-green-400">./config</CardTitle>
                <CardDescription className="font-mono text-slate-400">package configuration settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="font-mono font-medium text-slate-300">package_type:</Label>
                  <RadioGroup
                    value={packageType}
                    onValueChange={(value) => setPackageType(value as "public" | "private")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" className="border-green-400 text-green-400" />
                      <Label htmlFor="public" className="font-mono cursor-pointer text-slate-300">
                        public
                      </Label>
                    </div>
                    <p className="text-sm text-slate-500 font-mono ml-6">// visible on homepage, anyone can download</p>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" className="border-green-400 text-green-400" />
                      <Label htmlFor="private" className="font-mono cursor-pointer text-slate-300">
                        private
                      </Label>
                    </div>
                    <p className="text-sm text-slate-500 font-mono ml-6">// requires name + secret_key for access</p>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package-name" className="font-mono text-slate-300">
                    package_name: *
                  </Label>
                  <Input
                    id="package-name"
                    placeholder="enter_package_name"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="font-mono bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  />
                  <p className="text-xs text-slate-500 font-mono">// unique identifier for package retrieval</p>
                </div>

                {packageType === "private" && (
                  <div className="space-y-2">
                    <Label htmlFor="secret-key" className="font-mono text-slate-300">
                      secret_key: *
                    </Label>
                    <Input
                      id="secret-key"
                      type="password"
                      placeholder="enter_secret_key"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      className="font-mono bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500"
                    />
                    <p className="text-xs text-slate-500 font-mono">// required for private package access</p>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={isUploading || files.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700 font-mono"
                >
                  {isUploading ? "uploading..." : `upload(${files.length})`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <UploadContent />
    </ProtectedRoute>
  )
}
