from django.conf import settings
from django.db import models

from apps.catalog.models import Movie


class WatchlistItem(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="watchlist_items"
    )
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name="watchlist_items")
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-added_at", "-id")
        constraints = (
            models.UniqueConstraint(
                fields=("user", "movie"), name="unique_user_watchlist_movie"
            ),
        )
        indexes = (models.Index(fields=("user", "-added_at")),)

    def __str__(self) -> str:
        return f"{self.user} · {self.movie}"

