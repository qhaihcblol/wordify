from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import UserProgress
from .serializers import UserProgressSerializer
from topics.models import Topic
from vocabulary.models import Vocabulary


class UserProgressListView(generics.ListAPIView):
    serializer_class = UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Disable pagination for user progress

    def get_queryset(self):
        user = self.request.user
        topic_id = self.request.query_params.get("topic_id")

        queryset = UserProgress.objects.filter(user=user).select_related(
            "vocabulary", "topic"
        )

        if topic_id:
            queryset = queryset.filter(topic_id=topic_id)

        return queryset


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def update_progress(request):
    user = request.user
    vocabulary_id = request.data.get("vocabulary_id")
    is_correct = request.data.get("is_correct", False)

    try:
        vocabulary = Vocabulary.objects.get(id=vocabulary_id)
    except Vocabulary.DoesNotExist:
        return Response(
            {"error": "Vocabulary not found"}, status=status.HTTP_404_NOT_FOUND
        )

    progress, created = UserProgress.objects.get_or_create(
        user=user, vocabulary=vocabulary, defaults={"topic": vocabulary.topic}
    )

    progress.update_progress(is_correct)

    return Response(
        {"success": True, "progress": UserProgressSerializer(progress).data}
    )


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def topic_progress_summary(request, topic_id):
    user = request.user

    try:
        topic = Topic.objects.get(id=topic_id)
    except Topic.DoesNotExist:
        return Response({"error": "Topic not found"}, status=status.HTTP_404_NOT_FOUND)

    # Get all vocabulary in this topic
    total_vocabulary = Vocabulary.objects.filter(topic=topic).count()

    # Get user's progress for this topic
    progress_stats = UserProgress.objects.filter(user=user, topic=topic).aggregate(
        mastered=Count("id", filter=Q(status="mastered")),
        learning=Count("id", filter=Q(status="learning")),
        not_started=Count("id", filter=Q(status="not_started")),
    )

    # Calculate not started count
    studied_count = (
        progress_stats["mastered"]
        + progress_stats["learning"]
        + progress_stats["not_started"]
    )
    not_started_count = total_vocabulary - studied_count

    return Response(
        {
            "topic_id": topic_id,
            "topic_name": topic.name,
            "total_vocabulary": total_vocabulary,
            "mastered": progress_stats["mastered"],
            "learning": progress_stats["learning"],
            "not_started": not_started_count,
            "completion_percentage": (
                (progress_stats["mastered"] / total_vocabulary * 100)
                if total_vocabulary > 0
                else 0
            ),
        }
    )
