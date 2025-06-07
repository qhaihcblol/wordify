"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/contexts/auth-context"
import { BookOpen, Sparkles, BarChart3, Zap } from "lucide-react"

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading Wordify...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 p-12 flex-col justify-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full"></div>
          </div>

          <div className="relative z-10 max-w-md">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Wordify</h1>
            </div>

            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Welcome back to your vocabulary mastery journey
            </h2>

            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Continue expanding your English vocabulary with our intelligent learning system designed for rapid
              progress.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">1000+</div>
                <div className="text-blue-100 text-sm">Vocabulary Words</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">8+</div>
                <div className="text-blue-100 text-sm">Learning Topics</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-blue-100">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span>Interactive flashcard system</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <span>Advanced progress tracking</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Zap className="h-5 w-5" />
                </div>
                <span>Adaptive learning algorithm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Wordify</h1>
              </div>
              <p className="text-gray-600">Master English vocabulary with ease</p>
            </div>

            <LoginForm onToggleMode={() => router.push("/register")} />
          </div>
        </div>
      </div>
    </div>
  )
}
