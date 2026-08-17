from rest_framework import serializers

from .models import Category, Movie, MovieCast


class CategorySerializer(serializers.ModelSerializer):
    movie_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "movie_count")


class MovieCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug")


class MovieSerializer(serializers.ModelSerializer):
    category = MovieCategorySerializer(read_only=True)
    year = serializers.IntegerField(source="release_date.year", read_only=True)
    duration = serializers.SerializerMethodField()
    poster_url = serializers.SerializerMethodField()
    is_watchlisted = serializers.BooleanField(read_only=True, default=False)
    watchlist_item_id = serializers.IntegerField(read_only=True, allow_null=True, default=None)

    class Meta:
        model = Movie
        fields = (
            "id",
            "title",
            "slug",
            "tagline",
            "description",
            "category",
            "release_date",
            "year",
            "duration_minutes",
            "duration",
            "rating",
            "maturity_rating",
            "poster_url",
            "video_url",
            "accent_color",
            "is_featured",
            "is_watchlisted",
            "watchlist_item_id",
        )

    def get_duration(self, obj: Movie) -> str:
        hours, minutes = divmod(obj.duration_minutes, 60)
        return f"{hours}h {minutes}m" if hours else f"{minutes}m"

    def get_poster_url(self, obj: Movie) -> str | None:
        if not obj.poster:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.poster.url) if request else obj.poster.url


class MovieCastSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="cast_member.id", read_only=True)
    name = serializers.CharField(source="cast_member.name", read_only=True)
    slug = serializers.CharField(source="cast_member.slug", read_only=True)
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = MovieCast
        fields = ("id", "name", "slug", "character", "order", "photo_url")

    def get_photo_url(self, obj: MovieCast) -> str | None:
        if not obj.cast_member.photo:
            return None
        request = self.context.get("request")
        url = obj.cast_member.photo.url
        return request.build_absolute_uri(url) if request else url


class MovieDetailSerializer(MovieSerializer):
    cast = MovieCastSerializer(source="cast_credits", many=True, read_only=True)

    class Meta(MovieSerializer.Meta):
        fields = (*MovieSerializer.Meta.fields, "cast")
