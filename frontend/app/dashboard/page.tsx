"use client"

import { TopicManagement } from "@/components/admin/topic-management"
import { LearningSession } from "@/components/learning/learning-session"
import { QuizHistory } from "@/components/quiz/quiz-history"
import { QuizResult } from "@/components/quiz/quiz-result"
import { QuizSession } from "@/components/quiz/quiz-session"
import { QuizSetup } from "@/components/quiz/quiz-setup"
import { TopicSelection } from "@/components/user/topic-selection"
import { useAuth } from "@/contexts/auth-context"
import type { Topic } from "@/types"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type ViewMode = "topics" | "learning" | "quiz-setup" | "quiz" | "quiz-result" | "quiz-history"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>("topics")
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [quizSessionId, setQuizSessionId] = useState<string | null>(null)
  const [quizConfig, setQuizConfig] = useState<{
    questionCount: number
    mode: "multiple-choice" | "typing"
  } | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0) // Add refresh trigger state

  useEffect(() => {
    if (!user && !loading) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic)
    setViewMode("learning")
  }

  const handleStartQuiz = (topic: Topic) => {
    setSelectedTopic(topic)
    setViewMode("quiz-setup")
  }

  const handleQuizSetupComplete = (questionCount: number, mode: "multiple-choice" | "typing") => {
    setQuizConfig({ questionCount, mode })
    setViewMode("quiz")
  }

  const handleQuizComplete = (sessionId: string) => {
    setQuizSessionId(sessionId)
    setViewMode("quiz-result")
  }

  const handleBackToTopics = () => {
    setSelectedTopic(null)
    setQuizSessionId(null)
    setQuizConfig(null)
    setViewMode("topics")
    // Trigger data refresh when returning to topics to show updated progress
    setRefreshTrigger(prev => prev + 1)
  }

  const handleRetakeQuiz = () => {
    if (selectedTopic) {
      setViewMode("quiz-setup")
    }
  }

  const handleViewQuizHistory = () => {
    setViewMode("quiz-history")
  }

  const handleViewQuizResult = (sessionId: string) => {
    setQuizSessionId(sessionId)
    setViewMode("quiz-result")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {user.role === "admin" ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage topics, vocabulary, and users</p>
            </div>
            <TopicManagement />
          </div>
        ) : (
          <>
            {viewMode === "topics" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h1>
                  <p className="text-gray-600">Continue your vocabulary learning journey</p>
                </div>
                <TopicSelection
                  onSelectTopic={handleSelectTopic}
                  onStartQuiz={handleStartQuiz}
                  onViewQuizHistory={handleViewQuizHistory}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            )}

            {viewMode === "learning" && selectedTopic && (
              <LearningSession topic={selectedTopic} onBack={handleBackToTopics} />
            )}

            {viewMode === "quiz-setup" && selectedTopic && (
              <QuizSetup topic={selectedTopic} onBack={handleBackToTopics} onStartQuiz={handleQuizSetupComplete} />
            )}

            {viewMode === "quiz" && selectedTopic && quizConfig && (
              <QuizSession
                topic={selectedTopic}
                questionCount={quizConfig.questionCount}
                mode={quizConfig.mode}
                onBack={handleBackToTopics}
                onComplete={handleQuizComplete}
              />
            )}

            {viewMode === "quiz-result" && quizSessionId && (
              <QuizResult sessionId={quizSessionId} onBack={handleBackToTopics} onRetakeQuiz={handleRetakeQuiz} />
            )}

            {viewMode === "quiz-history" && (
              <QuizHistory onBack={handleBackToTopics} onViewResult={handleViewQuizResult} />
            )}
          </>
        )}
      </main>
    </div>
  )
}
