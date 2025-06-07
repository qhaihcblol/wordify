from django.db import models
from django.conf import settings
from topics.models import Topic
from vocabulary.models import Vocabulary


class UserProgress(models.Model):
    STATUS_CHOICES = [
        ("not_started", "Not Started"),
        ("learning", "Learning"),
        ("mastered", "Mastered"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    vocabulary = models.ForeignKey(Vocabulary, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=15, choices=STATUS_CHOICES, default="not_started"
    )
    correct_count = models.IntegerField(default=0)
    total_attempts = models.IntegerField(default=0)
    last_studied = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "vocabulary"]
        ordering = ["-last_studied"]

    def __str__(self):
        return f"{self.user.name} - {self.vocabulary.word} ({self.status})"

    @property
    def accuracy(self):
        if self.total_attempts == 0:
            return 0
        return (self.correct_count / self.total_attempts) * 100

    def update_progress(self, is_correct):
        """Update progress based on answer correctness"""
        self.total_attempts += 1
        if is_correct:
            self.correct_count += 1

        # Update status based on accuracy
        if self.accuracy >= 80 and self.total_attempts >= 3:
            self.status = "mastered"
        elif self.total_attempts > 0:
            self.status = "learning"

        self.save()

        # Update user's learning statistics
        self.user.update_learning_stats()
