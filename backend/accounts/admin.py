from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        "email",
        "name",
        "role",
        "status",
        "total_quizzes",
        "words_learned",
        "date_joined",
    )
    list_filter = ("role", "status", "date_joined", "is_active")
    search_fields = ("email", "first_name", "last_name", "username")
    ordering = ("-date_joined",)

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Profile Information",
            {"fields": ("role", "status", "avatar", "bio", "location", "website")},
        ),
        ("Preferences", {"fields": ("language", "timezone")}),
        (
            "Learning Statistics",
            {
                "fields": ("total_quizzes", "words_learned", "average_score"),
                "classes": ("collapse",),
            },
        ),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Additional Info", {"fields": ("email", "first_name", "last_name", "role")}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related()

    def name(self, obj):
        return obj.name

    name.short_description = "Full Name"

    actions = ["activate_users", "suspend_users", "ban_users"]

    def activate_users(self, request, queryset):
        queryset.update(status="active")
        self.message_user(request, f"Successfully activated {queryset.count()} users.")

    activate_users.short_description = "Activate selected users"

    def suspend_users(self, request, queryset):
        queryset.update(status="suspended")
        self.message_user(request, f"Successfully suspended {queryset.count()} users.")

    suspend_users.short_description = "Suspend selected users"

    def ban_users(self, request, queryset):
        queryset.update(status="banned")
        self.message_user(request, f"Successfully banned {queryset.count()} users.")

    ban_users.short_description = "Ban selected users"
