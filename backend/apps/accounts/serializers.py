from django.contrib.auth import authenticate, password_validation
from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers

from .models import Profile

MAX_AVATAR_SIZE = 5 * 1024 * 1024
ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


def validate_unique_email(value: str, *, exclude_user: User | None = None) -> str:
    normalized = value.strip().lower()
    users = User.objects.filter(email__iexact=normalized)
    if exclude_user is not None:
        users = users.exclude(pk=exclude_user.pk)
    if users.exists():
        raise serializers.ValidationError("An account with this email already exists.")
    return normalized


def validate_unique_username(value: str, *, exclude_user: User | None = None) -> str:
    normalized = value.strip()
    users = User.objects.filter(username__iexact=normalized)
    if exclude_user is not None:
        users = users.exclude(pk=exclude_user.pk)
    if users.exists():
        raise serializers.ValidationError("An account with this username already exists.")
    return normalized


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(
        max_length=150, validators=User._meta.get_field("username").validators
    )
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    password_confirm = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_username(self, value: str) -> str:
        return validate_unique_username(value)

    def validate_email(self, value: str) -> str:
        return validate_unique_email(value)

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        candidate = User(username=attrs["username"], email=attrs["email"])
        password_validation.validate_password(attrs["password"], candidate)
        return attrs

    @transaction.atomic
    def create(self, validated_data) -> User:
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        Profile.objects.get_or_create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get("request"),
            username=attrs["username"],
            password=attrs["password"],
        )
        if user is None or not user.is_active:
            raise serializers.ValidationError("Invalid username or password.")
        attrs["user"] = user
        return attrs


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", max_length=150)
    email = serializers.EmailField(source="user.email")
    first_name = serializers.CharField(source="user.first_name", max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(source="user.last_name", max_length=150, required=False, allow_blank=True)
    avatar = serializers.ImageField(read_only=True)

    class Meta:
        model = Profile
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "bio",
            "avatar",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate(self, attrs):
        user_data = attrs.get("user", {})
        if "username" in user_data:
            user_data["username"] = validate_unique_username(
                user_data["username"], exclude_user=self.instance.user
            )
        if "email" in user_data:
            user_data["email"] = validate_unique_email(
                user_data["email"], exclude_user=self.instance.user
            )
        return attrs

    @transaction.atomic
    def update(self, instance: Profile, validated_data) -> Profile:
        user_data = validated_data.pop("user", {})
        for field, value in user_data.items():
            setattr(instance.user, field, value)
        if user_data:
            instance.user.save(update_fields=[*user_data.keys()])
        return super().update(instance, validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password_confirm = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_current_password(self, value: str) -> str:
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("The current password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match."})
        if attrs["current_password"] == attrs["new_password"]:
            raise serializers.ValidationError(
                {"new_password": "The new password must differ from the current password."}
            )
        password_validation.validate_password(
            attrs["new_password"], self.context["request"].user
        )
        return attrs

    def save(self, **kwargs) -> User:
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        return value.strip().lower()


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(write_only=True)


class AvatarUploadSerializer(serializers.Serializer):
    avatar = serializers.ImageField(write_only=True)

    def validate_avatar(self, value):
        if value.size > MAX_AVATAR_SIZE:
            raise serializers.ValidationError("Avatar size must not exceed 5 MB.")
        content_type = getattr(value, "content_type", "")
        if content_type not in ALLOWED_AVATAR_TYPES:
            raise serializers.ValidationError("Use a JPEG, PNG, WebP, or GIF image.")
        return value


class AuthResponseSerializer(serializers.Serializer):
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)
    profile = ProfileSerializer(read_only=True)


class MessageSerializer(serializers.Serializer):
    detail = serializers.CharField(read_only=True)
