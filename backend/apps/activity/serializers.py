from rest_framework import serializers

from apps.catalog.models import Movie
from apps.catalog.serializers import MovieSerializer

from .models import ActivityEvent, WatchHistory


class WatchHistorySerializer(serializers.ModelSerializer):
    movie = MovieSerializer(read_only=True)

    class Meta:
        model = WatchHistory
        fields = ("id", "movie", "progress_seconds", "completed", "first_watched_at", "last_watched_at")


class RecordWatchSerializer(serializers.Serializer):
    movie_id = serializers.PrimaryKeyRelatedField(
        source="movie", queryset=Movie.objects.filter(is_published=True)
    )
    progress_seconds = serializers.IntegerField(min_value=0, required=False, default=0)
    completed = serializers.BooleanField(required=False, default=False)


class ActivityEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityEvent
        fields = ("id", "event_type", "title", "description", "metadata", "created_at")
