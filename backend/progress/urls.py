from django.urls import path
from .views import UserProgressListView, update_progress, topic_progress_summary

urlpatterns = [
    path("", UserProgressListView.as_view(), name="user-progress-list"),
    path("update/", update_progress, name="update-progress"),
    path(
        "topic/<int:topic_id>/summary/",
        topic_progress_summary,
        name="topic-progress-summary",
    ),
]
