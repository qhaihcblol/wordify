"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { progressAPI, vocabularyAPI } from "@/lib/api"
import type { Topic, Vocabulary } from "@/types"
import { ArrowLeft, BookOpen, Clock, RotateCcw, Target, Trophy } from "lucide-react"
import { useEffect, useState } from "react"
import { Flashcard } from "./flashcard"

interface LearningSessionProps {
  topic: Topic
  onBack: () => void
}

export function LearningSession({ topic, onBack }: LearningSessionProps) {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [sessionStats, setSessionStats] = useState({
    totalTime: 0,
    averageTime: 0,
    startTime: Date.now(),
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadVocabulary()
  }, [topic.id])

  useEffect(() => {
    if (!sessionComplete && vocabulary.length > 0) {
      const interval = setInterval(() => {
        setSessionStats((prev) => ({
          ...prev,
          totalTime: Math.floor((Date.now() - prev.startTime) / 1000),
        }))
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [sessionComplete, vocabulary.length])

  const loadVocabulary = async () => {
    try {
      const data = await vocabularyAPI.getByTopic(topic.id)
      setVocabulary(data)
      setSessionStats((prev) => ({ ...prev, startTime: Date.now() }))
    } catch (error) {
      console.error("Failed to load vocabulary:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async (correct: boolean) => {
    if (correct) {
      setCorrectAnswers((prev) => prev + 1)
    }

    // Update progress
    if (user) {
      try {
        await progressAPI.updateProgress(vocabulary[currentIndex].id, correct)
      } catch (error) {
        console.error("Failed to update progress:", error)
      }
    }

    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      const totalTime = Math.floor((Date.now() - sessionStats.startTime) / 1000)
      setSessionStats((prev) => ({
        ...prev,
        totalTime,
        averageTime: Math.floor(totalTime / vocabulary.length),
      }))
      setSessionComplete(true)
    }
  }

  const restartSession = () => {
    setCurrentIndex(0)
    setCorrectAnswers(0)
    setSessionComplete(false)
    setSessionStats({
      totalTime: 0,
      averageTime: 0,
      startTime: Date.now(),
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading vocabulary...</p>
        </div>
      </div>
    )
  }

  if (vocabulary.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Vocabulary Found</h2>
            <p className="text-gray-600 mb-6">This topic doesn't have any vocabulary yet.</p>
            <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Topics
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (sessionComplete) {
    const accuracy = Math.round((correctAnswers / vocabulary.length) * 100)
    const performance = accuracy >= 80 ? "Excellent!" : accuracy >= 60 ? "Good Job!" : "Keep Practicing!"
    const performanceColor = accuracy >= 80 ? "text-green-600" : accuracy >= 60 ? "text-blue-600" : "text-orange-600"

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-yellow-100 rounded-full">
                <Trophy className="h-12 w-12 text-yellow-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Session Complete!</CardTitle>
            <p className={`text-xl font-semibold ${performanceColor}`}>{performance}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-green-700">Correct</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
                <div className="text-sm text-blue-700">Accuracy</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">{formatTime(sessionStats.totalTime)}</div>
                <div className="text-sm text-purple-700">Total Time</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="text-2xl font-bold text-orange-600">{formatTime(sessionStats.averageTime)}</div>
                <div className="text-sm text-orange-700">Avg/Word</div>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Session Summary</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Topic:</span>
                  <span className="font-medium" style={{ color: topic.color }}>
                    {topic.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Words Studied:</span>
                  <span className="font-medium">{vocabulary.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Words Mastered:</span>
                  <span className="font-medium text-green-600">{correctAnswers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Need More Practice:</span>
                  <span className="font-medium text-orange-600">{vocabulary.length - correctAnswers}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={restartSession} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Practice Again
              </Button>
              <Button onClick={onBack} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Topics
              </Button>
            </div>
          </CardContent>
        </Card>
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
              {topic.name}
            </h1>
            <p className="text-gray-600 text-sm">{topic.description}</p>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatTime(sessionStats.totalTime)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4" />
              <span>{correctAnswers} correct</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="max-w-4xl mx-auto">
        <Flashcard
          vocabulary={vocabulary[currentIndex]}
          onNext={handleNext}
          currentIndex={currentIndex}
          totalCount={vocabulary.length}
        />
      </div>
    </div>
  )
}
