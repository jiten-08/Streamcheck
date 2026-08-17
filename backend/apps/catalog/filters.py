import django_filters

from .models import Movie


class MovieFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug")
    min_rating = django_filters.NumberFilter(field_name="rating", lookup_expr="gte")
    max_rating = django_filters.NumberFilter(field_name="rating", lookup_expr="lte")
    release_year = django_filters.NumberFilter(field_name="release_date", lookup_expr="year")
    min_duration = django_filters.NumberFilter(field_name="duration_minutes", lookup_expr="gte")
    max_duration = django_filters.NumberFilter(field_name="duration_minutes", lookup_expr="lte")
    featured = django_filters.BooleanFilter(field_name="is_featured")

    class Meta:
        model = Movie
        fields = (
            "category",
            "min_rating",
            "max_rating",
            "release_year",
            "min_duration",
            "max_duration",
            "featured",
        )

