"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const { login, user } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    // Anime.js animation for form
    if (typeof window !== "undefined" && (window as any).anime) {
      const anime = (window as any).anime

      anime({
        targets: ".auth-card",
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        easing: "easeOutQuart",
      })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await login(formData.email, formData.password)
      if (success) {
        router.push("/dashboard")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-500/20 via-transparent to-cyan-500/20"></div>
        <div className="matrix-bg"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-green-400 hover:text-green-300 font-mono mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            cd ../
          </Link>
          <h1 className="text-3xl font-mono font-bold text-green-400 mb-2">$ ./login</h1>
          <p className="text-slate-400 font-mono text-sm">Authenticating user session...</p>
        </div>

        <Card className="auth-card bg-slate-800/90 border-green-500/30 shadow-2xl backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-mono text-center text-green-400">Access Terminal</CardTitle>
            <CardDescription className="text-center font-mono text-slate-400 text-sm">
              Enter credentials to establish connection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-900/50 border-red-500/50">
                  <AlertDescription className="font-mono text-red-300">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="font-mono text-green-400 text-sm">
                  user@sender:~$
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="font-mono bg-slate-700/50 border-green-500/30 text-green-300 placeholder:text-slate-500 focus:border-green-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-mono text-green-400 text-sm">
                  password:
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    className="font-mono bg-slate-700/50 border-green-500/30 text-green-300 placeholder:text-slate-500 focus:border-green-400 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-slate-600/50 text-slate-400 hover:text-green-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-500 font-mono text-slate-900 font-bold transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25"
                disabled={isLoading}
              >
                {isLoading ? "Connecting..." : "Execute Login"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400 font-mono">
                No account?{" "}
                <Link href="/auth/register" className="text-green-400 hover:text-green-300 font-bold transition-colors">
                  ./register
                </Link>
              </p>
            </div>

            <div className="mt-4 p-4 bg-slate-700/30 rounded-lg border border-green-500/20">
              <p className="text-xs text-green-400 font-mono mb-2">// Demo Access:</p>
              <p className="text-xs text-slate-300 font-mono">admin@sender.com : admin123</p>
              <p className="text-xs text-slate-300 font-mono">user@test.com : password</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
