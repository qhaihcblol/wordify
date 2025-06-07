from rest_framework import serializers
from .models import Vocabulary


class VocabularySerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source="topic.name", read_only=True)
    topic_color = serializers.CharField(source="topic.color", read_only=True)

    class Meta:
        model = Vocabulary
        fields = [
            "id",
            "topic",
            "topic_name",
            "topic_color",
            "word",
            "pronunciation",
            "meaning",
            "example",
            "image",
            "difficulty",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        # Check for uniqueness of word within topic
        topic = attrs.get("topic")
        word = attrs.get("word")
        instance = getattr(self, "instance", None)

        if topic and word:
            queryset = Vocabulary.objects.filter(topic=topic, word=word)
            if instance:
                queryset = queryset.exclude(pk=instance.pk)
            if queryset.exists():
                raise serializers.ValidationError(
                    "This word already exists in this topic."
                )

        return attrs
