from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import update_session_auth_hash
from django.db.models import Q
from .models import User
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    UserManagementSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserProfileSerializer(user).data,
                "token": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserProfileSerializer(user).data,
                "token": str(refresh.access_token),
                "refresh": str(refresh),
            }
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data["new_password"])
        user.save()

        update_session_auth_hash(request, user)
        return Response({"message": "Password updated successfully."})


# User Management Views (Admin only)
class UserListView(generics.ListAPIView):
    serializer_class = UserManagementSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Disable pagination for user list
    filterset_fields = ["role", "status"]
    search_fields = ["email", "first_name", "last_name", "username"]
    ordering_fields = ["date_joined", "last_login", "email"]
    ordering = ["-date_joined"]

    def get_queryset(self):
        if not self.request.user.role == "admin":
            return User.objects.none()
        return User.objects.all()


class UserDetailView(generics.RetrieveAPIView):
    serializer_class = UserManagementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.role == "admin":
            return User.objects.none()
        return User.objects.all()


class UserStatusUpdateView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk, *args, **kwargs):
        if not request.user.role == "admin":
            return Response(
                {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
            )

        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        action = request.data.get("action")
        if action == "activate":
            user.status = "active"
        elif action == "suspend":
            user.status = "suspended"
        elif action == "ban":
            user.status = "banned"
        else:
            return Response(
                {"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST
            )

        user.save()
        return Response({"success": True, "message": f"User {action}ed successfully"})


class UserDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk, *args, **kwargs):
        if not request.user.role == "admin":
            return Response(
                {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
            )

        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if user.role == "admin":
            return Response(
                {"error": "Cannot delete admin users"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.delete()
        return Response({"success": True, "message": "User deleted successfully"})


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    if not request.user.role == "admin":
        return Response(
            {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
        )

    total_users = User.objects.count()
    active_users = User.objects.filter(status="active").count()
    suspended_users = User.objects.filter(status="suspended").count()
    banned_users = User.objects.filter(status="banned").count()
    admin_users = User.objects.filter(role="admin").count()
    regular_users = User.objects.filter(role="user").count()

    return Response(
        {
            "totalUsers": total_users,
            "activeUsers": active_users,
            "suspendedUsers": suspended_users,
            "bannedUsers": banned_users,
            "adminUsers": admin_users,
            "regularUsers": regular_users,
        }
    )
