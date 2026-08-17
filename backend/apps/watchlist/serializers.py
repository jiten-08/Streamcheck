from rest_framework import serializers

from apps.catalog.models import Movie
from apps.catalog.serializers import MovieSerializer

from .models import WatchlistItem


class WatchlistItemSerializer(serializers.ModelSerializer):
    movie = MovieSerializer(read_only=True)
    movie_id = serializers.PrimaryKeyRelatedField(
        source="movie",
        queryset=Movie.objects.filter(is_published=True),
        write_only=True,
    )

    class Meta:
        model = WatchlistItem
        fields = ("id", "movie", "movie_id", "added_at")
        read_only_fields = ("id", "added_at")

