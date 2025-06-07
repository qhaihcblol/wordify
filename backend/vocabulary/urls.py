from django.urls import path
from .views import VocabularyListCreateView, VocabularyDetailView, VocabularyByTopicView

urlpatterns = [
    path("", VocabularyListCreateView.as_view(), name="vocabulary-list-create"),
    path("<int:pk>/", VocabularyDetailView.as_view(), name="vocabulary-detail"),
    path(
        "topic/<int:topic_id>/",
        VocabularyByTopicView.as_view(),
        name="vocabulary-by-topic",
    ),
]
