from django.contrib import admin
from .models import Vocabulary


@admin.register(Vocabulary)
class VocabularyAdmin(admin.ModelAdmin):
    list_display = ("word", "topic", "difficulty", "created_at")
    list_filter = ("topic", "difficulty", "created_at")
    search_fields = ("word", "meaning", "topic__name")
    list_select_related = ("topic",)

    fieldsets = (
        (None, {"fields": ("topic", "word", "pronunciation", "difficulty")}),
        ("Content", {"fields": ("meaning", "example", "image")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    readonly_fields = ("created_at", "updated_at")
