from django.db.models import Count, Exists, IntegerField, OuterRef, Q, Subquery, Value
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .filters import MovieFilter
from .models import Category, Movie
from .pagination import MoviePagination
from .serializers import CategorySerializer, MovieDetailSerializer, MovieSerializer


@extend_schema_view(
    list=extend_schema(tags=("Media Library",)),
    retrieve=extend_schema(tags=("Movie Details",), responses=MovieDetailSerializer),
    related=extend_schema(tags=("Movie Details",), responses=MovieSerializer(many=True)),
)
class MovieViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MovieSerializer
    permission_classes = (AllowAny,)
    pagination_class = MoviePagination
    filterset_class = MovieFilter
    filter_backends = (
        filters.SearchFilter,
        filters.OrderingFilter,
        DjangoFilterBackend,
    )
    search_fields = ("title", "tagline", "description", "category__name")
    ordering_fields = ("title", "release_date", "rating", "duration_minutes", "created_at")
    ordering = ("-release_date", "title")
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "retrieve":
            return MovieDetailSerializer
        return MovieSerializer

    def get_queryset(self):
        queryset = Movie.objects.filter(is_published=True).select_related("category")
        if self.request.user.is_authenticated:
            from apps.watchlist.models import WatchlistItem

            membership = WatchlistItem.objects.filter(
                user=self.request.user, movie_id=OuterRef("pk")
            )
            queryset = queryset.annotate(
                is_watchlisted=Exists(membership),
                watchlist_item_id=Subquery(membership.values("pk")[:1]),
            )
        else:
            queryset = queryset.annotate(
                is_watchlisted=Value(False),
                watchlist_item_id=Value(None, output_field=IntegerField()),
            )
        if self.action == "retrieve":
            queryset = queryset.prefetch_related("cast_credits__cast_member")
        return queryset

    @action(detail=True, methods=("get",), url_path="related")
    def related(self, request, slug=None):
        movie = self.get_object()
        related_movies = (
            Movie.objects.filter(is_published=True, category=movie.category)
            .exclude(pk=movie.pk)
            .select_related("category")
            .order_by("-is_featured", "-rating", "-release_date")[:6]
        )
        return Response(MovieSerializer(related_movies, many=True, context=self.get_serializer_context()).data)


@extend_schema_view(
    list=extend_schema(tags=("Media Library",)),
    retrieve=extend_schema(tags=("Media Library",)),
)
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = (AllowAny,)
    pagination_class = None
    lookup_field = "slug"

    def get_queryset(self):
        return Category.objects.annotate(
            movie_count=Count("movies", filter=Q(movies__is_published=True))
        )
