from rest_framework import generics, permissions
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Vocabulary
from .serializers import VocabularySerializer


class VocabularyListCreateView(generics.ListCreateAPIView):
    serializer_class = VocabularySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["topic", "difficulty"]

    def get_queryset(self):
        return Vocabulary.objects.select_related("topic").all()

    def perform_create(self, serializer):
        if self.request.user.role != "admin":
            raise permissions.PermissionDenied("Only admins can create vocabulary.")
        serializer.save()


class VocabularyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vocabulary.objects.select_related("topic").all()
    serializer_class = VocabularySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        if self.request.user.role != "admin":
            raise permissions.PermissionDenied("Only admins can update vocabulary.")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != "admin":
            raise permissions.PermissionDenied("Only admins can delete vocabulary.")
        instance.delete()


class VocabularyByTopicView(generics.ListAPIView):
    serializer_class = VocabularySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Disable pagination for this view

    def get_queryset(self):
        topic_id = self.kwargs["topic_id"]
        return Vocabulary.objects.filter(topic_id=topic_id).select_related("topic")
