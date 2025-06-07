"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { quizAPI } from "@/lib/api"
import type { QuizQuestion, Topic } from "@/types"
import { ArrowLeft, Brain, CheckCircle, Clock, Target, X } from "lucide-react"
import { useEffect, useState } from "react"

interface QuizSessionProps {
  topic: Topic
  questionCount: number
  mode: "multiple-choice" | "typing"
  onBack: () => void
  onComplete: (sessionId: string) => void
}

export function QuizSession({ topic, questionCount, mode, onBack, onComplete }: QuizSessionProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [typedAnswer, setTypedAnswer] = useState<string>("")
  const [showResult, setShowResult] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime] = useState(Date.now())
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    loadQuiz()
  }, [topic.id, questionCount])

  useEffect(() => {
    if (!loading && questions.length > 0) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [loading, questions.length, startTime])

  const loadQuiz = async () => {
    try {
      const quizQuestions = await quizAPI.generateQuiz(topic.id, questionCount)
      setQuestions(quizQuestions)
    } catch (error) {
      console.error("Failed to load quiz:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const handleTypedAnswerChange = (value: string) => {
    setTypedAnswer(value)
  }

  const handleSubmitAnswer = () => {
    const userAnswer = mode === "multiple-choice" ? selectedAnswer : typedAnswer.trim()

    if (!userAnswer) {
      return
    }

    // Update current question with user's answer
    const updatedQuestions = [...questions]
    const currentQuestion = updatedQuestions[currentQuestionIndex]

    if (!currentQuestion.correctAnswer) {
      console.error("Error: correctAnswer is undefined for current question")
      return
    }

    const isCorrect = userAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()

    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer,
      isCorrect,
    }
    setQuestions(updatedQuestions)

    setShowResult(true)
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
        setSelectedAnswer("")
        setTypedAnswer("")
        setShowResult(false)
      } else {
        // Quiz completed
        handleQuizComplete(updatedQuestions)
      }
    }, 2000)
  }

  const handleQuizComplete = async (finalQuestions: QuizQuestion[]) => {
    if (!user) return

    setSubmitting(true)
    try {
      const session = await quizAPI.submitQuiz(user.id, topic.id, finalQuestions, timeSpent)
      onComplete(session.id)
    } catch (error) {
      console.error("Failed to submit quiz:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const userAnswer = mode === "multiple-choice" ? selectedAnswer : typedAnswer.trim()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Preparing your quiz...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Quiz Available</h2>
            <p className="text-gray-600 mb-6">This topic doesn't have enough vocabulary for a quiz.</p>
            <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Submitting your quiz...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold" style={{ color: topic.color }}>
              {topic.name} Quiz
            </h1>
            <p className="text-gray-600 text-sm">
              {mode === "multiple-choice" ? "Choose the correct word" : "Type the correct word"}
            </p>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeSpent)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4" />
              <span>
                {currentQuestionIndex + 1}/{questions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Quiz Content */}
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Badge variant="outline" className="text-sm">
                Question {currentQuestionIndex + 1}
              </Badge>
              <Badge
                className="text-sm"
                style={{
                  backgroundColor: `${topic.color}20`,
                  color: topic.color,
                  borderColor: topic.color,
                }}
              >
                {currentQuestion.vocabulary.difficulty}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {mode === "multiple-choice" ? "Multiple Choice" : "Type Answer"}
              </Badge>
            </div>
            <CardTitle className="text-2xl text-gray-900">What word matches this definition?</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Definition */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
              <div className="flex items-center space-x-2 mb-3">
                <Brain className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Definition:</h3>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">{currentQuestion.vocabulary.meaning}</p>

              {/* Pronunciation hint */}
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Pronunciation:</span> {currentQuestion.vocabulary.pronunciation}
                </p>
              </div>
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {mode === "multiple-choice" ? "Choose the correct word:" : "Type the correct word:"}
              </h3>

              {mode === "multiple-choice" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === option
                    const isCorrect = option === currentQuestion.correctAnswer
                    const isIncorrect = showResult && isSelected && !isCorrect
                    const shouldHighlight = showResult && isCorrect

                    return (
                      <Button
                        key={index}
                        variant={isSelected ? "default" : "outline"}
                        className={`h-16 text-lg font-medium transition-all duration-200 ${showResult
                            ? shouldHighlight
                              ? "bg-green-500 hover:bg-green-600 text-white border-green-500"
                              : isIncorrect
                                ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                                : "opacity-50"
                            : isSelected
                              ? `text-white border-2`
                              : "hover:border-gray-300"
                          }`}
                        style={
                          isSelected && !showResult ? { backgroundColor: topic.color, borderColor: topic.color } : {}
                        }
                        onClick={() => !showResult && handleAnswerSelect(option)}
                        disabled={showResult}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{option}</span>
                          {showResult && shouldHighlight && <CheckCircle className="h-5 w-5 ml-2" />}
                          {showResult && isIncorrect && <X className="h-5 w-5 ml-2" />}
                        </div>
                      </Button>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      value={typedAnswer}
                      onChange={(e) => handleTypedAnswerChange(e.target.value)}
                      placeholder="Type your answer here..."
                      className="h-16 text-lg text-center font-medium"
                      disabled={showResult}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !showResult && typedAnswer.trim()) {
                          handleSubmitAnswer()
                        }
                      }}
                    />
                    {showResult && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${typedAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {typedAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase() ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <X className="h-5 w-5" />
                          )}
                          <span className="font-medium">
                            {typedAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
                              ? "Correct!"
                              : `Correct answer: ${currentQuestion.correctAnswer}`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {showResult && typedAnswer.toLowerCase() !== currentQuestion.correctAnswer.toLowerCase() && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Your answer: <span className="font-medium text-red-600">{typedAnswer}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Result Message */}
            {showResult && (
              <div
                className={`p-4 rounded-lg border ${(mode === "multiple-choice" ? selectedAnswer : typedAnswer.toLowerCase()) ===
                    (
                      mode === "multiple-choice"
                        ? currentQuestion.correctAnswer
                        : currentQuestion.correctAnswer.toLowerCase()
                    )
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                  }`}
              >
                <div className="flex items-center space-x-2">
                  {(mode === "multiple-choice" ? selectedAnswer : typedAnswer.toLowerCase()) ===
                    (mode === "multiple-choice"
                      ? currentQuestion.correctAnswer
                      : currentQuestion.correctAnswer.toLowerCase()) ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Excellent! That's correct!</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-800">
                        Not quite right. The correct answer is "{currentQuestion.correctAnswer}"
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Action Button */}
            {!showResult && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer}
                  size="lg"
                  className="px-8 py-3 text-base font-medium"
                  style={{ backgroundColor: userAnswer ? topic.color : undefined }}
                >
                  {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Submit Answer"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
