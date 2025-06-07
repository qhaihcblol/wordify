from rest_framework import serializers
from .models import UserProgress


class UserProgressSerializer(serializers.ModelSerializer):
    vocabulary_word = serializers.CharField(source="vocabulary.word", read_only=True)
    vocabulary_pronunciation = serializers.CharField(
        source="vocabulary.pronunciation", read_only=True
    )
    vocabulary_meaning = serializers.CharField(
        source="vocabulary.meaning", read_only=True
    )
    vocabulary_example = serializers.CharField(
        source="vocabulary.example", read_only=True
    )
    vocabulary_difficulty = serializers.CharField(
        source="vocabulary.difficulty", read_only=True
    )
    topic_name = serializers.CharField(source="topic.name", read_only=True)
    topic_color = serializers.CharField(source="topic.color", read_only=True)
    accuracy = serializers.ReadOnlyField()

    class Meta:
        model = UserProgress
        fields = [
            "id",
            "vocabulary",
            "vocabulary_word",
            "vocabulary_pronunciation",
            "vocabulary_meaning",
            "vocabulary_example",
            "vocabulary_difficulty",
            "topic",
            "topic_name",
            "topic_color",
            "status",
            "correct_count",
            "total_attempts",
            "accuracy",
            "last_studied",
        ]
        read_only_fields = ["id", "last_studied"]
