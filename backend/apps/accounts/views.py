from django.contrib.auth.models import User
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile
from .permissions import IsProfileOwner
from .serializers import (
    AuthResponseSerializer,
    AvatarUploadSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    LogoutSerializer,
    MessageSerializer,
    ProfileSerializer,
    RegisterSerializer,
)
from apps.activity.models import ActivityEvent
from apps.activity.services import log_activity


@extend_schema_view(
    register=extend_schema(request=RegisterSerializer, responses={201: AuthResponseSerializer}),
    login=extend_schema(request=LoginSerializer, responses={200: AuthResponseSerializer}),
    refresh=extend_schema(request=TokenRefreshSerializer, responses={200: TokenRefreshSerializer}),
    logout=extend_schema(request=LogoutSerializer, responses={205: MessageSerializer}),
    change_password=extend_schema(request=ChangePasswordSerializer, responses={200: MessageSerializer}),
    forgot_password=extend_schema(request=ForgotPasswordSerializer, responses={200: MessageSerializer}),
)
class AccountsViewSet(viewsets.GenericViewSet):
    """Authentication and current-user account operations."""

    parser_classes = (JSONParser, MultiPartParser, FormParser)
    permission_classes = (IsAuthenticated, IsProfileOwner)
    serializer_class = ProfileSerializer

    serializer_action_classes = {
        "register": RegisterSerializer,
        "login": LoginSerializer,
        "refresh": TokenRefreshSerializer,
        "logout": LogoutSerializer,
        "profile": ProfileSerializer,
        "change_password": ChangePasswordSerializer,
        "forgot_password": ForgotPasswordSerializer,
        "avatar": AvatarUploadSerializer,
    }
    public_actions = {"register", "login", "refresh", "forgot_password"}

    def get_serializer_class(self):
        return self.serializer_action_classes.get(self.action, self.serializer_class)

    def get_permissions(self):
        if self.action in self.public_actions:
            return [AllowAny()]
        return super().get_permissions()

    @staticmethod
    def _profile_for(user: User) -> Profile:
        profile, _ = Profile.objects.get_or_create(user=user)
        return profile

    def _auth_response(self, user: User) -> dict:
        refresh = RefreshToken.for_user(user)
        profile = self._profile_for(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "profile": ProfileSerializer(profile, context=self.get_serializer_context()).data,
        }

    @action(detail=False, methods=("post",), url_path="register")
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(self._auth_response(user), status=status.HTTP_201_CREATED)

    @action(detail=False, methods=("post",), url_path="login")
    def login(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(self._auth_response(serializer.validated_data["user"]))

    @action(detail=False, methods=("post",), url_path="refresh")
    def refresh(self, request):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as exc:
            raise InvalidToken("Invalid or expired refresh token.") from exc
        return Response(serializer.validated_data)

    @action(detail=False, methods=("post",), url_path="logout")
    def logout(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            RefreshToken(serializer.validated_data["refresh"]).blacklist()
        except TokenError as exc:
            raise serializers.ValidationError({"refresh": "Invalid or expired refresh token."}) from exc
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)

    @extend_schema(methods=("GET",), responses={200: ProfileSerializer})
    @extend_schema(methods=("PATCH",), request=ProfileSerializer, responses={200: ProfileSerializer})
    @action(detail=False, methods=("get", "patch"), url_path="profile")
    def profile(self, request):
        profile = self._profile_for(request.user)
        self.check_object_permissions(request, profile)
        if request.method == "PATCH":
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            log_activity(user=request.user, event_type=ActivityEvent.Type.PROFILE, title="Profile updated", description="Your personal information was updated.")
            return Response(serializer.data)
        return Response(self.get_serializer(profile).data)

    @action(detail=False, methods=("post",), url_path="change-password")
    def change_password(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        log_activity(user=request.user, event_type=ActivityEvent.Type.PASSWORD, title="Password changed", description="Your account password was changed securely.")
        return Response({"detail": "Password changed successfully."})

    @action(detail=False, methods=("post",), url_path="forgot-password")
    def forgot_password(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(
            {"detail": "If an account exists for this email, password reset instructions will be sent."}
        )

    @extend_schema(methods=("POST",), request=AvatarUploadSerializer, responses={200: ProfileSerializer})
    @extend_schema(methods=("DELETE",), request=None, responses={200: ProfileSerializer})
    @action(detail=False, methods=("post", "delete"), url_path="avatar")
    def avatar(self, request):
        profile = self._profile_for(request.user)
        self.check_object_permissions(request, profile)
        if request.method == "DELETE":
            if profile.avatar:
                profile.avatar.delete(save=False)
                profile.avatar = None
                profile.save(update_fields=("avatar", "updated_at"))
                log_activity(user=request.user, event_type=ActivityEvent.Type.AVATAR, title="Avatar removed", description="Your profile image was removed.")
            return Response(ProfileSerializer(profile, context=self.get_serializer_context()).data)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        previous_avatar = profile.avatar.name if profile.avatar else None
        storage = profile.avatar.storage
        profile.avatar = serializer.validated_data["avatar"]
        profile.save(update_fields=("avatar", "updated_at"))
        if previous_avatar and previous_avatar != profile.avatar.name:
            storage.delete(previous_avatar)
        log_activity(user=request.user, event_type=ActivityEvent.Type.AVATAR, title="Avatar updated", description="A new profile image was uploaded.")
        return Response(ProfileSerializer(profile, context=self.get_serializer_context()).data)
