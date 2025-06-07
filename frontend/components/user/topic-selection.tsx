"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { progressAPI, topicsAPI } from "@/lib/api"
import type { Topic, UserProgress } from "@/types"
import { BookOpen, Brain, History, Play, Target, TrendingUp, Trophy } from "lucide-react"
import { useEffect, useState } from "react"

interface TopicSelectionProps {
  onSelectTopic: (topic: Topic) => void
  onStartQuiz: (topic: Topic) => void
  onViewQuizHistory: () => void
  refreshTrigger?: number // Add a prop to trigger data refresh
}

export function TopicSelection({ onSelectTopic, onStartQuiz, onViewQuizHistory, refreshTrigger }: TopicSelectionProps) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [progress, setProgress] = useState<Record<string, UserProgress[]>>({})
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadData()
  }, [user, refreshTrigger]) // Add refreshTrigger to dependencies

  const loadData = async () => {
    try {
      const topicsData = await topicsAPI.getAll()
      // Ensure topicsData is an array
      const topicsArray = Array.isArray(topicsData) ? topicsData : []
      setTopics(topicsArray)

      if (user && topicsArray.length > 0) {
        const progressData: Record<string, UserProgress[]> = {}
        for (const topic of topicsArray) {
          try {
            const topicProgressData = await progressAPI.getUserProgress(user.id, topic.id)
            progressData[topic.id] = topicProgressData
            console.log(`Loaded progress for topic ${topic.id}:`, topicProgressData)
          } catch (error) {
            console.error(`Failed to load progress for topic ${topic.id}:`, error)
            progressData[topic.id] = []
          }
        }
        setProgress(progressData)
        console.log('All progress data:', progressData)
      }
    } catch (error) {
      console.error("Failed to load data:", error)
      setTopics([]) // Set empty array as fallback
    } finally {
      setLoading(false)
    }
  }

  const getTopicProgress = (topicId: string) => {
    const topicProgress = progress[topicId] || []
    const topic = topics.find(t => t.id === topicId)
    const totalVocabularyCount = topic?.vocabulary_count || 0

    const masteredCount = topicProgress.filter((p) => p.status === "mastered").length
    const learningCount = topicProgress.filter((p) => p.status === "learning").length
    const studiedCount = topicProgress.length // Total words that have been studied (have progress records)
    const notStartedCount = totalVocabularyCount - studiedCount // Words not yet studied

    return {
      masteredCount,
      learningCount,
      notStartedCount,
      totalCount: totalVocabularyCount,
      percentage: totalVocabularyCount > 0 ? (masteredCount / totalVocabularyCount) * 100 : 0,
    }
  }

  const getProgressStatus = (percentage: number) => {
    if (percentage === 0) return { label: "Start Learning", color: "text-gray-500", bgColor: "bg-gray-100" }
    if (percentage < 30) return { label: "Beginner", color: "text-red-600", bgColor: "bg-red-100" }
    if (percentage < 70) return { label: "Learning", color: "text-yellow-600", bgColor: "bg-yellow-100" }
    if (percentage < 100) return { label: "Advanced", color: "text-blue-600", bgColor: "bg-blue-100" }
    return { label: "Mastered", color: "text-green-600", bgColor: "bg-green-100" }
  }

  const getTotalStats = () => {
    let totalMastered = 0
    let totalLearning = 0
    let totalNotStarted = 0
    let totalWords = 0

    topics.forEach(topic => {
      const { masteredCount, learningCount, notStartedCount, totalCount } = getTopicProgress(topic.id)
      totalMastered += masteredCount
      totalLearning += learningCount
      totalNotStarted += notStartedCount
      totalWords += totalCount
    })

    const overallProgress = totalWords > 0 ? Math.round((totalMastered / totalWords) * 100) : 0

    return { totalMastered, totalLearning, totalNotStarted, totalWords, overallProgress }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading your learning dashboard...</p>
        </div>
      </div>
    )
  }

  if (!topics || topics.length === 0) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center space-y-4">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-900">No Topics Available</h3>
          <p className="text-gray-600">There are no learning topics available at the moment.</p>
        </div>
      </div>
    )
  }

  const stats = getTotalStats()

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h2>
        <p className="text-gray-600 text-lg">Continue your vocabulary learning journey</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalWords}</div>
                <div className="text-blue-100 text-sm">Total Words</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Play className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalNotStarted}</div>
                <div className="text-gray-100 text-sm">Not Started</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalLearning}</div>
                <div className="text-yellow-100 text-sm">Learning</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalMastered}</div>
                <div className="text-green-100 text-sm">Mastered</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.overallProgress}%</div>
                <div className="text-orange-100 text-sm">Overall Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center">
        <Button
          onClick={onViewQuizHistory}
          variant="outline"
          className="flex items-center space-x-2 px-6 py-3 text-base font-medium"
        >
          <History className="h-5 w-5" />
          <span>View Quiz History</span>
        </Button>
      </div>

      {/* Topics Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Choose Your Learning Path</h3>
          <Badge variant="outline" className="text-sm">
            {topics.length} topics available
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => {
            const { masteredCount, learningCount, notStartedCount, totalCount, percentage } = getTopicProgress(topic.id)
            const status = getProgressStatus(percentage)

            return (
              <Card
                key={topic.id}
                className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-l-4 group"
                style={{ borderLeftColor: topic.color }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: topic.color }} />
                      <CardTitle className="text-lg font-bold">{topic.name}</CardTitle>
                    </div>
                    <Badge className={`${status.bgColor} ${status.color} border-0 text-xs font-medium`}>
                      {status.label}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm leading-relaxed line-clamp-2">
                    {topic.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-lg font-bold text-gray-900">{totalCount}</div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2">
                      <div className="text-lg font-bold text-blue-600">{notStartedCount}</div>
                      <div className="text-xs text-blue-700">Not Started</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2">
                      <div className="text-lg font-bold text-green-600">{masteredCount}</div>
                      <div className="text-xs text-green-700">Mastered</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-2">
                      <div className="text-lg font-bold text-yellow-600">{learningCount}</div>
                      <div className="text-xs text-yellow-700">Learning</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {percentage > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{Math.round(percentage)}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onSelectTopic(topic)}
                      className="flex-1 group-hover:shadow-md transition-all duration-200 font-medium"
                      style={{ backgroundColor: topic.color }}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {percentage === 0 ? "Start Learning" : percentage === 100 ? "Review Words" : "Continue Learning"}
                    </Button>
                    <Button
                      onClick={() => onStartQuiz(topic)}
                      variant="outline"
                      className="px-3 hover:bg-gray-50"
                      style={{ borderColor: topic.color, color: topic.color }}
                    >
                      <Brain className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
