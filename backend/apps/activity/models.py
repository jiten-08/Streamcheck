from django.conf import settings
from django.db import models

from apps.catalog.models import Movie


class WatchHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="watch_history")
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name="watch_history")
    progress_seconds = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    first_watched_at = models.DateTimeField(auto_now_add=True)
    last_watched_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-last_watched_at", "-id")
        constraints = (
            models.UniqueConstraint(fields=("user", "movie"), name="unique_user_movie_history"),
        )
        indexes = (models.Index(fields=("user", "-last_watched_at")),)

    def __str__(self):
        return f"{self.user} watched {self.movie}"


class ActivityEvent(models.Model):
    class Type(models.TextChoices):
        WATCHED = "watched", "Watched"
        PROFILE = "profile", "Profile updated"
        AVATAR = "avatar", "Avatar updated"
        PASSWORD = "password", "Password changed"
        SUBSCRIPTION = "subscription", "Subscription purchased"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="activity_events")
    event_type = models.CharField(max_length=20, choices=Type.choices)
    title = models.CharField(max_length=160)
    description = models.CharField(max_length=300, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at", "-id")
        indexes = (models.Index(fields=("user", "-created_at")),)

    def __str__(self):
        return f"{self.user}: {self.title}"
