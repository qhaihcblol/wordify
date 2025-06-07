from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import models
from django.db.models import Avg, Count
from random import sample, shuffle
from .models import QuizSession
from .serializers import QuizSessionSerializer, QuizSubmissionSerializer
from topics.models import Topic
from vocabulary.models import Vocabulary
from progress.models import UserProgress


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def generate_quiz(request):
    topic_id = request.data.get("topic_id")
    question_count = request.data.get("question_count", 10)

    try:
        topic = Topic.objects.get(id=topic_id)
    except Topic.DoesNotExist:
        return Response({"error": "Topic not found"}, status=status.HTTP_404_NOT_FOUND)

    # Get all vocabulary for this topic
    vocabulary_list = list(Vocabulary.objects.filter(topic=topic))

    if len(vocabulary_list) < question_count:
        question_count = len(vocabulary_list)

    if question_count == 0:
        return Response(
            {"error": "No vocabulary found for this topic"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Randomly select vocabulary for questions
    selected_vocabulary = sample(vocabulary_list, question_count)

    questions = []
    for i, vocab in enumerate(selected_vocabulary):
        # Get wrong answers from other vocabulary in the same topic
        wrong_answers = [v.word for v in vocabulary_list if v.id != vocab.id]
        wrong_options = sample(wrong_answers, min(3, len(wrong_answers)))

        # Create options with correct answer
        options = [vocab.word] + wrong_options
        shuffle(options)

        question = {
            "id": f"q{i+1}",
            "vocabulary": {
                "id": vocab.id,
                "word": vocab.word,
                "pronunciation": vocab.pronunciation,
                "meaning": vocab.meaning,
                "example": vocab.example,
                "difficulty": vocab.difficulty,
            },
            "options": options,
            "correct_answer": vocab.word,
        }
        questions.append(question)

    return Response({"questions": questions})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def submit_quiz(request):
    try:
        serializer = QuizSubmissionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Invalid data", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        topic_id = serializer.validated_data["topic_id"]
        questions = serializer.validated_data["questions"]
        time_spent = serializer.validated_data["time_spent"]

        try:
            topic = Topic.objects.get(id=topic_id)
        except Topic.DoesNotExist:
            return Response(
                {"error": "Topic not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Calculate score and accuracy
        correct_count = sum(1 for q in questions if q.get("is_correct", False))
        total_questions = len(questions)
        score = (
            round((correct_count / total_questions) * 100) if total_questions > 0 else 0
        )
        accuracy = (correct_count / total_questions) * 100 if total_questions > 0 else 0

        # Create quiz session
        quiz_session = QuizSession.objects.create(
            user=user,
            topic=topic,
            questions_data=questions,
            score=score,
            total_questions=total_questions,
            time_spent=time_spent,
            accuracy=accuracy,
        )

        # Update user progress for each vocabulary
        for i, question in enumerate(questions):
            try:
                vocabulary_data = question.get("vocabulary", {})
                vocabulary_id = vocabulary_data.get("id")
                # Handle both snake_case and camelCase
                is_correct = question.get(
                    "is_correct", question.get("isCorrect", False)
                )

                if not vocabulary_id:
                    continue

                vocabulary = Vocabulary.objects.get(id=vocabulary_id)
                progress, created = UserProgress.objects.get_or_create(
                    user=user,
                    vocabulary=vocabulary,
                    defaults={"topic": vocabulary.topic},
                )
                progress.update_progress(is_correct)

            except Vocabulary.DoesNotExist:
                continue
            except Exception as e:
                continue

        return Response({"session": QuizSessionSerializer(quiz_session).data})

    except Exception as e:
        return Response(
            {"error": "Internal server error"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class QuizHistoryView(generics.ListAPIView):
    serializer_class = QuizSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Disable pagination for quiz history

    def get_queryset(self):
        return QuizSession.objects.filter(user=self.request.user).select_related(
            "topic"
        )


class QuizSessionDetailView(generics.RetrieveAPIView):
    serializer_class = QuizSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return QuizSession.objects.filter(user=self.request.user).select_related(
            "topic"
        )


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def quiz_stats(request):
    user = request.user

    quiz_sessions = QuizSession.objects.filter(user=user)

    if not quiz_sessions.exists():
        return Response(
            {
                "total_quizzes": 0,
                "average_score": 0,
                "best_score": 0,
                "total_time_spent": 0,
                "topics_studied": 0,
            }
        )

    stats = quiz_sessions.aggregate(
        total_quizzes=Count("id"),
        average_score=Avg("score"),
        best_score=models.Max("score"),
        total_time_spent=models.Sum("time_spent"),
        topics_studied=Count("topic", distinct=True),
    )

    return Response(
        {
            "total_quizzes": stats["total_quizzes"],
            "average_score": (
                round(stats["average_score"], 1) if stats["average_score"] else 0
            ),
            "best_score": stats["best_score"] or 0,
            "total_time_spent": stats["total_time_spent"] or 0,
            "topics_studied": stats["topics_studied"],
        }
    )
