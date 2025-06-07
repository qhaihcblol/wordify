"use client"

import type { User } from "@/types"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem("auth-token")
    const userData = localStorage.getItem("user-data")

    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const { authAPI } = await import("@/lib/api")
    const response = await authAPI.login(email, password)

    localStorage.setItem("auth-token", response.token)
    localStorage.setItem("user-data", JSON.stringify(response.user))
    setUser(response.user)
  }

  const register = async (name: string, email: string, password: string) => {
    const { authAPI } = await import("@/lib/api")
    const response = await authAPI.register(name, email, password)

    localStorage.setItem("auth-token", response.token)
    localStorage.setItem("user-data", JSON.stringify(response.user))
    setUser(response.user)
  }

  const logout = () => {
    localStorage.removeItem("auth-token")
    localStorage.removeItem("user-data")
    setUser(null)
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading, setUser: updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
