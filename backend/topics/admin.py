from django.contrib import admin
from .models import Topic


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ("name", "vocabulary_count", "color", "created_at")
    list_filter = ("created_at",)
    search_fields = ("name", "description")
    readonly_fields = ("vocabulary_count", "created_at", "updated_at")

    fieldsets = (
        (None, {"fields": ("name", "description", "color")}),
        ("Statistics", {"fields": ("vocabulary_count",), "classes": ("collapse",)}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
