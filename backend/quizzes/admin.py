from django.contrib import admin
from .models import QuizSession


@admin.register(QuizSession)
class QuizSessionAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "topic",
        "score",
        "total_questions",
        "accuracy",
        "completed_at",
    )
    list_filter = ("topic", "completed_at", "score")
    search_fields = ("user__email", "topic__name")
    list_select_related = ("user", "topic")
    readonly_fields = ("completed_at",)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("user", "topic")
