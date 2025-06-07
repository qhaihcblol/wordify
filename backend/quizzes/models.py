from django.db import models
from django.conf import settings
from topics.models import Topic
from vocabulary.models import Vocabulary
import json


class QuizSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    questions_data = models.JSONField()  # Store questions and answers
    score = models.IntegerField()
    total_questions = models.IntegerField()
    time_spent = models.IntegerField()  # in seconds
    accuracy = models.FloatField()
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-completed_at"]

    def __str__(self):
        return f"{self.user.name} - {self.topic.name} Quiz ({self.score}%)"

    @property
    def correct_answers(self):
        return sum(1 for q in self.questions_data if q.get("is_correct", False))

    @property
    def incorrect_answers(self):
        return self.total_questions - self.correct_answers

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update user's learning statistics
        self.user.update_learning_stats()
