from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "email",
            "username",
            "first_name",
            "last_name",
            "password",
            "password_confirm",
        )

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError("Invalid email or password.")
            if user.status != "active":
                raise serializers.ValidationError("Account is not active.")
            attrs["user"] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="get_full_name", read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "name",
            "role",
            "status",
            "avatar",
            "bio",
            "location",
            "website",
            "language",
            "timezone",
            "total_quizzes",
            "words_learned",
            "average_score",
            "date_joined",
        )
        read_only_fields = (
            "id",
            "email",
            "username",
            "role",
            "status",
            "total_quizzes",
            "words_learned",
            "average_score",
            "date_joined",
        )

    def update(self, instance, validated_data):
        # Update profile fields
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)
        instance.bio = validated_data.get("bio", instance.bio)
        instance.location = validated_data.get("location", instance.location)
        instance.website = validated_data.get("website", instance.website)
        instance.language = validated_data.get("language", instance.language)
        instance.timezone = validated_data.get("timezone", instance.timezone)
        instance.save()
        return instance


class UserManagementSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="get_full_name", read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "name",
            "role",
            "status",
            "avatar",
            "total_quizzes",
            "words_learned",
            "average_score",
            "date_joined",
            "last_login",
        )
        read_only_fields = (
            "id",
            "total_quizzes",
            "words_learned",
            "average_score",
            "date_joined",
            "last_login",
        )


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    confirm_password = serializers.CharField()

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError("New passwords don't match.")
        return attrs
