from django.contrib import admin
from .models import UserProgress


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ("user", "vocabulary", "topic", "status", "accuracy", "last_studied")
    list_filter = ("status", "topic", "last_studied")
    search_fields = ("user__email", "vocabulary__word", "topic__name")
    list_select_related = ("user", "vocabulary", "topic")

    def accuracy(self, obj):
        return f"{obj.accuracy:.1f}%"

    accuracy.short_description = "Accuracy"
