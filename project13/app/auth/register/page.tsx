"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const { register, user } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminCode: "", // Added admin code field
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).anime) {
      const anime = (window as any).anime

      anime({
        targets: ".auth-card",
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        easing: "easeOutQuart",
      })

      // Matrix-style text animation
      anime({
        targets: ".terminal-text",
        opacity: [0, 1],
        translateX: [-20, 0],
        duration: 600,
        delay: anime.stagger(100),
        easing: "easeOutQuart",
      })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("error: passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("error: password must be >= 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const success = await register(formData.name, formData.email, formData.password, formData.adminCode)
      if (success) {
        if (formData.adminCode === "1729") {
          if (typeof window !== "undefined" && (window as any).anime) {
            const anime = (window as any).anime
            anime({
              targets: ".admin-success",
              scale: [0, 1.1, 1],
              opacity: [0, 1],
              duration: 800,
              easing: "easeOutBack",
            })
          }
        }
        router.push("/dashboard")
      } else {
        setError("error: registration failed")
      }
    } catch (err) {
      setError("error: system failure")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-green-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-green-400 hover:text-green-300 font-mono mb-4 terminal-text"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            cd ../
          </Link>
          <h1 className="text-3xl font-mono font-bold text-green-400 terminal-text">$ useradd --new</h1>
          <p className="text-slate-300 font-mono mt-2 terminal-text">initialize new user account</p>
        </div>

        <Card className="auth-card border-slate-700 bg-slate-800 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-mono text-center text-green-400">register.sh</CardTitle>
            <CardDescription className="text-center font-mono text-slate-400">creating user profile...</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-500/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-mono text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="font-mono text-slate-300">
                  username:
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="enter_username"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="font-mono bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-mono text-slate-300">
                  email:
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="font-mono bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-mono text-slate-300">
                  password:
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="enter_password"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    className="font-mono bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-mono text-slate-300">
                  confirm_password:
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="confirm_password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="font-mono bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminCode" className="font-mono text-slate-300">
                  admin_code: <span className="text-slate-500">(optional)</span>
                </Label>
                <Input
                  id="adminCode"
                  type="text"
                  placeholder="enter_admin_code"
                  value={formData.adminCode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, adminCode: e.target.value }))}
                  className="font-mono bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500"
                />
                <p className="text-xs text-slate-500 font-mono">// enter 1729 for admin privileges</p>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 font-mono" disabled={isLoading}>
                {isLoading ? "creating_user..." : "register()"}
              </Button>

              {formData.adminCode === "1729" && (
                <div className="admin-success text-center p-2 bg-yellow-900/20 border border-yellow-500/30 rounded">
                  <p className="text-yellow-400 font-mono text-sm">⚡ admin privileges will be granted</p>
                </div>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400 font-mono">
                existing_user?{" "}
                <Link href="/auth/login" className="text-green-400 hover:text-green-300 font-medium">
                  login()
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
