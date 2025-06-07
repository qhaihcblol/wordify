from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Topic
from .serializers import TopicSerializer


class TopicListCreateView(generics.ListCreateAPIView):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Disable pagination for topics

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        if self.request.user.role != "admin":
            raise permissions.PermissionDenied("Only admins can create topics.")
        serializer.save()


class TopicDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def perform_update(self, serializer):
        if self.request.user.role != "admin":
            raise permissions.PermissionDenied("Only admins can update topics.")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != "admin":
            raise permissions.PermissionDenied("Only admins can delete topics.")
        instance.delete()
