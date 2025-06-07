from rest_framework import serializers
from .models import QuizSession
from vocabulary.serializers import VocabularySerializer


class QuizVocabularySerializer(serializers.Serializer):
    """Simplified vocabulary serializer for quiz submissions"""

    id = serializers.IntegerField()
    word = serializers.CharField()
    pronunciation = serializers.CharField()
    meaning = serializers.CharField()
    example = serializers.CharField()
    difficulty = serializers.CharField()


class QuizQuestionSerializer(serializers.Serializer):
    id = serializers.CharField()
    vocabulary = QuizVocabularySerializer(required=False)
    options = serializers.ListField(child=serializers.CharField())
    correct_answer = serializers.CharField(required=False)
    correctAnswer = serializers.CharField(required=False)
    user_answer = serializers.CharField(required=False, allow_blank=True)
    userAnswer = serializers.CharField(required=False, allow_blank=True)
    is_correct = serializers.BooleanField(required=False)
    isCorrect = serializers.BooleanField(required=False)


class QuizSessionSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source="topic.name", read_only=True)
    topic_color = serializers.CharField(source="topic.color", read_only=True)
    questions = QuizQuestionSerializer(
        source="questions_data", many=True, read_only=True
    )
    correct_answers = serializers.ReadOnlyField()
    incorrect_answers = serializers.ReadOnlyField()

    class Meta:
        model = QuizSession
        fields = [
            "id",
            "topic",
            "topic_name",
            "topic_color",
            "questions",
            "score",
            "total_questions",
            "correct_answers",
            "incorrect_answers",
            "time_spent",
            "accuracy",
            "completed_at",
        ]
        read_only_fields = ["id", "completed_at"]


class QuizSubmissionSerializer(serializers.Serializer):
    topic_id = serializers.IntegerField()
    questions = QuizQuestionSerializer(many=True)
    time_spent = serializers.IntegerField()

    def validate_questions(self, value):
        if not value:
            raise serializers.ValidationError("Questions cannot be empty.")
        return value
