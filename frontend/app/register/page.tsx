"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { RegisterForm } from "@/components/auth/register-form"
import { useAuth } from "@/contexts/auth-context"
import { BookOpen, Trophy, Globe, Zap, Target, Star } from "lucide-react"

export default function RegisterPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading Wordify...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="flex min-h-screen">
        {/* Left Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Wordify</h1>
              </div>
              <p className="text-gray-600">Start your vocabulary learning journey</p>
            </div>

            <RegisterForm onToggleMode={() => router.push("/login")} />
          </div>
        </div>

        {/* Right Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-emerald-700 to-blue-800 p-12 flex-col justify-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-16 right-16 w-40 h-40 bg-white rounded-full"></div>
            <div className="absolute bottom-16 left-16 w-28 h-28 bg-white rounded-full"></div>
            <div className="absolute top-1/3 left-1/3 w-20 h-20 bg-white rounded-full"></div>
            <div className="absolute bottom-1/3 right-1/3 w-12 h-12 bg-white rounded-full"></div>
          </div>

          <div className="relative z-10 max-w-md">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Wordify</h1>
            </div>

            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Start your vocabulary mastery journey today
            </h2>

            <p className="text-green-100 text-lg mb-8 leading-relaxed">
              Join thousands of learners who are expanding their English vocabulary with our proven learning methods and
              interactive tools.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">1000+</div>
                <div className="text-green-100 text-xs">Words</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">8+</div>
                <div className="text-green-100 text-xs">Topics</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">95%</div>
                <div className="text-green-100 text-xs">Success</div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-green-100">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Target className="h-5 w-5" />
                </div>
                <span>Personalized learning paths</span>
              </div>
              <div className="flex items-center space-x-3 text-green-100">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Globe className="h-5 w-5" />
                </div>
                <span>Multiple difficulty levels</span>
              </div>
              <div className="flex items-center space-x-3 text-green-100">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Zap className="h-5 w-5" />
                </div>
                <span>Smart learning algorithm</span>
              </div>
              <div className="flex items-center space-x-3 text-green-100">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Trophy className="h-5 w-5" />
                </div>
                <span>Achievement system</span>
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-green-100 text-sm italic">
                "Wordify helped me improve my vocabulary significantly. The interactive approach makes learning fun!"
              </p>
              <p className="text-green-200 text-xs mt-2">- Sarah, English Learner</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
