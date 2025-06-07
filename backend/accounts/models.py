from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("user", "User"),
    ]

    STATUS_CHOICES = [
        ("active", "Active"),
        ("suspended", "Suspended"),
        ("banned", "Banned"),
        ("pending", "Pending"),
    ]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    language = models.CharField(max_length=20, default="english")
    timezone = models.CharField(max_length=20, default="UTC+0")

    # Learning statistics
    total_quizzes = models.IntegerField(default=0)
    words_learned = models.IntegerField(default=0)
    average_score = models.FloatField(default=0.0)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "first_name", "last_name"]

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    @property
    def name(self):
        return self.get_full_name() or self.username

    def update_learning_stats(self):
        """Update user's learning statistics"""
        from quizzes.models import QuizSession
        from progress.models import UserProgress

        # Update total quizzes
        self.total_quizzes = QuizSession.objects.filter(user=self).count()

        # Update words learned (mastered vocabulary)
        self.words_learned = UserProgress.objects.filter(
            user=self, status="mastered"
        ).count()

        # Update average score
        quiz_sessions = QuizSession.objects.filter(user=self)
        if quiz_sessions.exists():
            self.average_score = (
                quiz_sessions.aggregate(avg_score=models.Avg("score"))["avg_score"]
                or 0.0
            )

        self.save(update_fields=["total_quizzes", "words_learned", "average_score"])
