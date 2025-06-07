from rest_framework import serializers
from .models import Topic


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = [
            "id",
            "name",
            "description",
            "color",
            "vocabulary_count",
            "created_at",
        ]
        read_only_fields = ["id", "vocabulary_count", "created_at"]

    def validate_name(self, value):
        # Check for uniqueness excluding current instance
        instance = getattr(self, "instance", None)
        if (
            Topic.objects.filter(name=value)
            .exclude(pk=instance.pk if instance else None)
            .exists()
        ):
            raise serializers.ValidationError("A topic with this name already exists.")
        return value
