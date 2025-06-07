from django.urls import path
from .views import (
    generate_quiz,
    submit_quiz,
    QuizHistoryView,
    QuizSessionDetailView,
    quiz_stats,
)

urlpatterns = [
    path("generate/", generate_quiz, name="generate-quiz"),
    path("submit/", submit_quiz, name="submit-quiz"),
    path("history/", QuizHistoryView.as_view(), name="quiz-history"),
    path("stats/", quiz_stats, name="quiz-stats"),
    path("<int:pk>/", QuizSessionDetailView.as_view(), name="quiz-session-detail"),
]
