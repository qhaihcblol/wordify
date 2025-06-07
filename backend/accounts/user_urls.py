from django.urls import path
from .views import (
    UserListView,
    UserDetailView,
    UserStatusUpdateView,
    UserDeleteView,
    user_stats,
)

urlpatterns = [
    path("", UserListView.as_view(), name="user-list"),
    path("stats/", user_stats, name="user-stats"),
    path("<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    path("<int:pk>/status/", UserStatusUpdateView.as_view(), name="user-status-update"),
    path("<int:pk>/delete/", UserDeleteView.as_view(), name="user-delete"),
]
