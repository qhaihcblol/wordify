"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { quizAPI } from "@/lib/api"
import type { QuizSession } from "@/types"
import { ArrowLeft, CheckCircle, RotateCcw, Target, Trophy, X } from "lucide-react"
import { useEffect, useState } from "react"

interface QuizResultProps {
  sessionId: string
  onBack: () => void
  onRetakeQuiz: () => void
}

export function QuizResult({ sessionId, onBack, onRetakeQuiz }: QuizResultProps) {
  const [session, setSession] = useState<QuizSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSession()
  }, [sessionId])

  const loadSession = async () => {
    try {
      const sessionData = await quizAPI.getQuizSession(sessionId)
      setSession(sessionData)
    } catch (error) {
      console.error("Failed to load quiz session:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getPerformanceMessage = (accuracy: number) => {
    if (accuracy >= 90) return { message: "Outstanding!", color: "text-green-600", emoji: "🏆" }
    if (accuracy >= 80) return { message: "Excellent!", color: "text-blue-600", emoji: "🎉" }
    if (accuracy >= 70) return { message: "Good Job!", color: "text-purple-600", emoji: "👏" }
    if (accuracy >= 60) return { message: "Not Bad!", color: "text-yellow-600", emoji: "👍" }
    return { message: "Keep Practicing!", color: "text-orange-600", emoji: "💪" }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading results...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <X className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h2>
            <p className="text-gray-600 mb-6">The quiz session could not be loaded.</p>
            <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Topics
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Use mapped values from API (already converted from snake_case to camelCase)
  const correctAnswers = session.correctAnswers
  const incorrectAnswers = session.incorrectAnswers
  const performance = getPerformanceMessage(session.accuracy)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Topics</span>
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold" style={{ color: session.topicColor }}>
              Quiz Results
            </h1>
            <p className="text-gray-600">{session.topicName}</p>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Main Result Card */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-6 rounded-full text-white shadow-lg" style={{ backgroundColor: session.topicColor }}>
                <Trophy className="h-12 w-12" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete! {performance.emoji}</CardTitle>
            <p className={`text-xl font-semibold ${performance.color}`}>{performance.message}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-3xl font-bold text-blue-600">{session.score}</div>
                <div className="text-sm text-blue-700">Score</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="text-3xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-green-700">Correct</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="text-3xl font-bold text-red-600">{incorrectAnswers}</div>
                <div className="text-sm text-red-700">Incorrect</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-3xl font-bold text-purple-600">{formatTime(session.timeSpent)}</div>
                <div className="text-sm text-purple-700">Time</div>
              </div>
            </div>

            {/* Accuracy Progress */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Accuracy</span>
                <span className="text-2xl font-bold" style={{ color: session.topicColor }}>
                  {Math.round(session.accuracy)}%
                </span>
              </div>
              <Progress value={session.accuracy} className="h-3" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={onRetakeQuiz} variant="outline" className="flex-1 h-12 text-base font-medium">
                <RotateCcw className="mr-2 h-5 w-5" />
                Retake Quiz
              </Button>
              <Button
                onClick={onBack}
                className="flex-1 h-12 text-base font-medium text-white"
                style={{ backgroundColor: session.topicColor }}
              >
                <Target className="mr-2 h-5 w-5" />
                Try Another Topic
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Question Review</CardTitle>
            <p className="text-gray-600">Review your answers and learn from mistakes</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {session.questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg border ${question.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        Q{index + 1}
                      </Badge>
                      {question.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <Badge
                      className="text-xs"
                      style={{
                        backgroundColor: `${session.topicColor}20`,
                        color: session.topicColor,
                        borderColor: session.topicColor,
                      }}
                    >
                      {question.vocabulary.difficulty}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">{question.vocabulary.meaning}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Correct Answer: </span>
                        <span className="font-medium text-green-600">{question.correctAnswer}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Your Answer: </span>
                        <span className={`font-medium ${question.isCorrect ? "text-green-600" : "text-red-600"}`}>
                          {question.userAnswer}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Pronunciation: </span>
                        <span className="font-medium text-gray-700">{question.vocabulary.pronunciation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
