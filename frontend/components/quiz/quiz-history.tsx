"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { QuizSession } from "@/types"
import { quizAPI } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, Trophy, Clock, Target, Search, TrendingUp, Calendar, Eye, BarChart3 } from "lucide-react"

interface QuizHistoryProps {
  onBack: () => void
  onViewResult: (sessionId: string) => void
}

export function QuizHistory({ onBack, onViewResult }: QuizHistoryProps) {
  const [sessions, setSessions] = useState<QuizSession[]>([])
  const [filteredSessions, setFilteredSessions] = useState<QuizSession[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [filterBy, setFilterBy] = useState("all")
  const { user } = useAuth()

  useEffect(() => {
    loadQuizHistory()
  }, [user])

  useEffect(() => {
    filterAndSortSessions()
  }, [sessions, searchTerm, sortBy, filterBy])

  const loadQuizHistory = async () => {
    if (!user) return

    try {
      const history = await quizAPI.getQuizHistory(user.id)
      setSessions(history)
    } catch (error) {
      console.error("Failed to load quiz history:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortSessions = () => {
    let filtered = [...sessions]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((session) => session.topicName.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Performance filter
    if (filterBy !== "all") {
      filtered = filtered.filter((session) => {
        switch (filterBy) {
          case "excellent":
            return session.accuracy >= 90
          case "good":
            return session.accuracy >= 70 && session.accuracy < 90
          case "needs-improvement":
            return session.accuracy < 70
          default:
            return true
        }
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        case "score":
          return b.score - a.score
        case "accuracy":
          return b.accuracy - a.accuracy
        case "topic":
          return a.topicName.localeCompare(b.topicName)
        default:
          return 0
      }
    })

    setFilteredSessions(filtered)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getPerformanceBadge = (accuracy: number) => {
    if (accuracy >= 90) return { label: "Excellent", color: "bg-green-100 text-green-700 border-green-200" }
    if (accuracy >= 70) return { label: "Good", color: "bg-blue-100 text-blue-700 border-blue-200" }
    return { label: "Needs Practice", color: "bg-orange-100 text-orange-700 border-orange-200" }
  }

  const getOverallStats = () => {
    if (sessions.length === 0) return null

    const totalQuizzes = sessions.length
    const averageScore = Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / totalQuizzes)
    const averageAccuracy = Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / totalQuizzes)
    const totalTimeSpent = sessions.reduce((sum, s) => sum + s.timeSpent, 0)
    const bestScore = Math.max(...sessions.map((s) => s.score))

    return {
      totalQuizzes,
      averageScore,
      averageAccuracy,
      totalTimeSpent,
      bestScore,
    }
  }

  const stats = getOverallStats()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading quiz history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Quiz History</h1>
            <p className="text-gray-600">Track your learning progress over time</p>
          </div>
          <div className="w-24"></div> {/* Spacer */}
        </div>

        {/* Overall Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                    <div className="text-blue-100 text-sm">Total Quizzes</div>
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
                    <div className="text-2xl font-bold">{stats.bestScore}</div>
                    <div className="text-green-100 text-sm">Best Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.averageScore}</div>
                    <div className="text-purple-100 text-sm">Avg Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.averageAccuracy}%</div>
                    <div className="text-orange-100 text-sm">Avg Accuracy</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatTime(stats.totalTimeSpent)}</div>
                    <div className="text-indigo-100 text-sm">Total Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by topic name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="score">Score</SelectItem>
                    <SelectItem value="accuracy">Accuracy</SelectItem>
                    <SelectItem value="topic">Topic</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by performance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="excellent">Excellent (90%+)</SelectItem>
                    <SelectItem value="good">Good (70-89%)</SelectItem>
                    <SelectItem value="needs-improvement">Needs Practice (&lt;70%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Sessions List */}
        {filteredSessions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {sessions.length === 0 ? "No Quiz History" : "No Results Found"}
              </h3>
              <p className="text-gray-600 mb-4">
                {sessions.length === 0
                  ? "You haven't taken any quizzes yet. Start learning to see your progress here!"
                  : "Try adjusting your search or filter criteria."}
              </p>
              {sessions.length === 0 && (
                <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
                  Start Learning
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => {
              const performance = getPerformanceBadge(session.accuracy)

              return (
                <Card key={session.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: session.topicColor }} />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{session.topicName}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(session.completedAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(session.timeSpent)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Target className="h-4 w-4" />
                              <span>{session.totalQuestions} questions</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{session.score}</div>
                          <div className="text-sm text-gray-600">Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold" style={{ color: session.topicColor }}>
                            {Math.round(session.accuracy)}%
                          </div>
                          <div className="text-sm text-gray-600">Accuracy</div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className={`${performance.color} border`}>{performance.label}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewResult(session.id)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
