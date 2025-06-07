export interface User {
  id: string
  email: string
  name: string
  username?: string
  first_name?: string
  last_name?: string
  role: "admin" | "user"
  status?: "active" | "suspended" | "banned" | "pending"
  bio?: string
  location?: string
  website?: string
  language?: string
  timezone?: string
  avatar?: string
  total_quizzes?: number
  words_learned?: number
  average_score?: number
  date_joined?: string
}

export interface Admin {
  id: string
  email: string
  name: string
  role: "admin"
}

export interface RegularUser {
  id: string
  email: string
  name: string
  role: "user"
}

export interface Topic {
  id: string
  name: string
  description: string
  color: string
  vocabulary_count: number
  created_at: string
}

export interface Vocabulary {
  id: string
  topicId: string
  word: string
  pronunciation: string
  meaning: string
  example: string
  imageUrl?: string
  difficulty: "easy" | "medium" | "hard"
}

export interface UserProgress {
  id: string
  userId: string
  topicId: string
  vocabularyId: string
  status: "learning" | "mastered" | "review"
  correctCount: number
  totalAttempts: number
  lastStudied: string
}

export interface FlashCard {
  vocabulary: Vocabulary
  isFlipped: boolean
}

export interface QuizQuestion {
  id: string
  vocabulary: Vocabulary
  options: string[]
  correctAnswer: string
  userAnswer?: string
  isCorrect?: boolean
}

export interface QuizSession {
  id: string
  userId?: string
  topicId?: string
  topicName: string
  topicColor: string
  questions: QuizQuestion[]
  score: number
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  timeSpent: number
  completedAt: string
  accuracy: number
}

export interface QuizResult {
  sessionId: string
  score: number
  totalQuestions: number
  accuracy: number
  timeSpent: number
  correctAnswers: number
  incorrectAnswers: number
}
