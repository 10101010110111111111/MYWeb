"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  isAdmin: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, adminCode?: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const savedUser = localStorage.getItem("sender_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (email === "admin@sender.com" && password === "admin123") {
      const adminUser = {
        id: "admin",
        name: "Admin User",
        email: "admin@sender.com",
        isAdmin: true,
      }
      setUser(adminUser)
      localStorage.setItem("sender_user", JSON.stringify(adminUser))
      setIsLoading(false)
      return true
    } else if (email && password) {
      const regularUser = {
        id: "user_" + Date.now(),
        name: email.split("@")[0],
        email,
        isAdmin: false,
      }
      setUser(regularUser)
      localStorage.setItem("sender_user", JSON.stringify(regularUser))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const register = async (name: string, email: string, password: string, adminCode?: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const isAdmin = adminCode === "ADD_ME"

    const newUser = {
      id: "user_" + Date.now(),
      name,
      email,
      isAdmin,
    }

    setUser(newUser)
    localStorage.setItem("sender_user", JSON.stringify(newUser))
    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("sender_user")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
