// API configuration for Django backend integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("auth-token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorData: any = {}
    try {
      errorData = await response.json()
    } catch (jsonError) {
      console.warn("Failed to parse error response as JSON:", jsonError)
    }
    
    // Only log server errors (5xx) and unexpected client errors
    // Don't log expected client errors like:
    // - Validation errors (400 with field errors)
    // - Auth errors (401 with detail message) 
    // - Permission errors (403 with detail message)
    // - Duplicate entries (400 with field errors)
    // - Account status issues (400 with detail message)
    const shouldLogError = response.status >= 500 || 
                          (response.status >= 400 && response.status < 500 && 
                           !errorData?.detail && !errorData?.non_field_errors && 
                           !errorData?.message && Object.keys(errorData).length === 0)
    
    if (shouldLogError) {
      console.error("API Error Response:", {
        status: response.status,
        url: response.url,
        errorData
      })
    }
    
    // Handle Django REST framework validation errors format: {"field_name": ["error message"]}
    let errorMessage = `HTTP error! status: ${response.status}`
    
    if (errorData.detail) {
      errorMessage = errorData.detail
    } else if (errorData.message) {
      errorMessage = errorData.message
    } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
      errorMessage = errorData.non_field_errors[0]
    } else if (typeof errorData === 'object' && errorData !== null && Object.keys(errorData).length > 0) {
      // Handle field-specific errors from Django REST framework
      const fieldErrors = []
      for (const [field, errors] of Object.entries(errorData)) {
        if (Array.isArray(errors) && errors.length > 0) {
          // Improve error message format - just show the error without field name prefix for better UX
          fieldErrors.push(errors[0])
        }
      }
      if (fieldErrors.length > 0) {
        errorMessage = fieldErrors.join(', ')
      } else {
        errorMessage = JSON.stringify(errorData)
      }
    }
    
    throw new Error(errorMessage)
  }
  
  // Handle responses that might not have JSON content (like 204 No Content)
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  } else {
    // Return empty object for responses without JSON content
    return {}
  }
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    return handleResponse(response)
  },

  register: async (name: string, email: string, password: string) => {
    const [firstName, ...lastNameParts] = name.split(" ")
    const lastName = lastNameParts.join(" ")

    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        username: email.split("@")[0],
        first_name: firstName,
        last_name: lastName,
        password,
        password_confirm: password,
      }),
    })
    return handleResponse(response)
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  updateProfile: async (profileData: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    })
    return handleResponse(response)
  },

  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    })
    return handleResponse(response)
  },
}

// User Management API (Admin only)
export const userManagementAPI = {
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      headers: getAuthHeaders(),
    })
    const data = await handleResponse(response)
    return data.results || data
  },

  getUserDetails: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  updateUserStatus: async (userId: string, action: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/status/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ action }),
    })
    return handleResponse(response)
  },

  deleteUser: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/delete/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  getUserStats: async () => {
    const response = await fetch(`${API_BASE_URL}/users/stats/`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },
}

// Topics API
export const topicsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/topics/`, {
      headers: getAuthHeaders(),
    })
    const data = await handleResponse(response)
    return data.results || data
  },

  create: async (topic: { name: string; description: string; color: string }) => {
    const response = await fetch(`${API_BASE_URL}/topics/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(topic),
    })
    return handleResponse(response)
  },

  update: async (id: string, topic: Partial<{ name: string; description: string; color: string }>) => {
    const response = await fetch(`${API_BASE_URL}/topics/${id}/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(topic),
    })
    return handleResponse(response)
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/topics/${id}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },
}

// Vocabulary API
export const vocabularyAPI = {
  getByTopic: async (topicId: string) => {
    const response = await fetch(`${API_BASE_URL}/vocabulary/topic/${topicId}/`, {
      headers: getAuthHeaders(),
    })
    const data = await handleResponse(response)
    return data.results || data || []
  },

  create: async (vocabulary: {
    topicId: string
    word: string
    pronunciation: string
    meaning: string
    example: string
    difficulty: "easy" | "medium" | "hard"
  }) => {
    const response = await fetch(`${API_BASE_URL}/vocabulary/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        topic: vocabulary.topicId,
        word: vocabulary.word,
        pronunciation: vocabulary.pronunciation,
        meaning: vocabulary.meaning,
        example: vocabulary.example,
        difficulty: vocabulary.difficulty,
      }),
    })
    return handleResponse(response)
  },

  update: async (
    id: string,
    vocabulary: Partial<{
      word: string
      pronunciation: string
      meaning: string
      example: string
      difficulty: "easy" | "medium" | "hard"
    }>,
  ) => {
    const response = await fetch(`${API_BASE_URL}/vocabulary/${id}/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(vocabulary),
    })
    return handleResponse(response)
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/vocabulary/${id}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },
}

// Progress API
export const progressAPI = {
  getUserProgress: async (userId: string, topicId: string) => {
    const response = await fetch(`${API_BASE_URL}/progress/?topic_id=${topicId}`, {
      headers: getAuthHeaders(),
    })
    const data = await handleResponse(response)
    return data.results || data || []
  },

  updateProgress: async (vocabularyId: string, isCorrect: boolean) => {
    const response = await fetch(`${API_BASE_URL}/progress/update/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        vocabulary_id: vocabularyId,
        is_correct: isCorrect,
      }),
    })
    return handleResponse(response)
  },

  getTopicProgressSummary: async (topicId: string) => {
    const response = await fetch(`${API_BASE_URL}/progress/topic/${topicId}/summary/`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },
}

// Quiz API
export const quizAPI = {
  generateQuiz: async (topicId: string, questionCount = 10) => {
    const response = await fetch(`${API_BASE_URL}/quizzes/generate/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        topic_id: topicId,
        question_count: questionCount,
      }),
    })
    const data = await handleResponse(response)
    // Map backend snake_case to frontend camelCase
    return data.questions.map((question: any) => ({
      ...question,
      correctAnswer: question.correct_answer
    }))
  },

  submitQuiz: async (userId: string, topicId: string, questions: any[], timeSpent: number) => {
    // Convert frontend camelCase to backend snake_case
    const formattedQuestions = questions.map(question => ({
      id: question.id,
      vocabulary: question.vocabulary,
      options: question.options,
      correct_answer: question.correctAnswer,
      user_answer: question.userAnswer,
      is_correct: question.isCorrect
    }))
    
    const payload = {
      topic_id: topicId,
      questions: formattedQuestions,
      time_spent: timeSpent,
    }
    
    const response = await fetch(`${API_BASE_URL}/quizzes/submit/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })
    const data = await handleResponse(response)
    return data.session
  },

  getQuizHistory: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/quizzes/history/`, {
      headers: getAuthHeaders(),
    })
    const data = await handleResponse(response)
    const sessions = data.results || data || []
    
    // Map backend snake_case to frontend camelCase
    return sessions.map((session: any) => ({
      ...session,
      topicName: session.topic_name,
      topicColor: session.topic_color,
      timeSpent: session.time_spent,
      totalQuestions: session.total_questions,
      correctAnswers: session.correct_answers,
      incorrectAnswers: session.incorrect_answers,
      completedAt: session.completed_at
    }))
  },

  getQuizSession: async (sessionId: string) => {
    const response = await fetch(`${API_BASE_URL}/quizzes/${sessionId}/`, {
      headers: getAuthHeaders(),
    })
    const data = await handleResponse(response)
    
    // Map backend snake_case to frontend camelCase
    return {
      ...data,
      topicName: data.topic_name,
      topicColor: data.topic_color,
      timeSpent: data.time_spent,
      totalQuestions: data.total_questions,
      correctAnswers: data.correct_answers,
      incorrectAnswers: data.incorrect_answers,
      completedAt: data.completed_at,
      questions: data.questions?.map((question: any) => ({
        ...question,
        correctAnswer: question.correct_answer || question.correctAnswer,
        userAnswer: question.user_answer || question.userAnswer,
        isCorrect: question.is_correct !== undefined ? question.is_correct : question.isCorrect
      })) || []
    }
  },

  getQuizStats: async () => {
    const response = await fetch(`${API_BASE_URL}/quizzes/stats/`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },
}
