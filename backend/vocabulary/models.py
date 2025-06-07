from django.db import models
from topics.models import Topic


class Vocabulary(models.Model):
    DIFFICULTY_CHOICES = [
        ("easy", "Easy"),
        ("medium", "Medium"),
        ("hard", "Hard"),
    ]

    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    word = models.CharField(max_length=100)
    pronunciation = models.CharField(max_length=200)
    meaning = models.TextField()
    example = models.TextField()
    image = models.ImageField(upload_to="vocabulary/", null=True, blank=True)
    difficulty = models.CharField(
        max_length=10, choices=DIFFICULTY_CHOICES, default="medium"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["word"]
        unique_together = ["topic", "word"]

    def __str__(self):
        return f"{self.word} ({self.topic.name})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update topic vocabulary count
        self.topic.update_vocabulary_count()

    def delete(self, *args, **kwargs):
        topic = self.topic
        super().delete(*args, **kwargs)
        # Update topic vocabulary count
        topic.update_vocabulary_count()
