from django.db import models
from django.core.validators import RegexValidator


class Topic(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    color = models.CharField(
        max_length=7,
        validators=[
            RegexValidator(
                regex=r"^#[0-9A-Fa-f]{6}$", message="Enter a valid hex color code"
            )
        ],
        default="#3B82F6",
    )
    vocabulary_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    def update_vocabulary_count(self):
        """Update the vocabulary count for this topic"""
        self.vocabulary_count = self.vocabulary_set.count()
        self.save(update_fields=["vocabulary_count"])
