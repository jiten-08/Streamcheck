from pathlib import Path

from django.contrib.auth.models import User
from django.db import models


def avatar_upload_path(instance: "Profile", filename: str) -> str:
    safe_name = Path(filename).name
    return f"avatars/user_{instance.user_id}/{safe_name}"


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    bio = models.CharField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to=avatar_upload_path, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("user__username",)

    def __str__(self) -> str:
        return f"Profile for {self.user.username}"

