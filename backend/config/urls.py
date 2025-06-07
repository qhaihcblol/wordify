from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/topics/", include("topics.urls")),
    path("api/vocabulary/", include("vocabulary.urls")),
    path("api/quizzes/", include("quizzes.urls")),
    path("api/progress/", include("progress.urls")),
    path("api/users/", include("accounts.user_urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Customize admin site
admin.site.site_header = "Wordify Admin"
admin.site.site_title = "Wordify Admin Portal"
admin.site.index_title = "Welcome to Wordify Administration"
