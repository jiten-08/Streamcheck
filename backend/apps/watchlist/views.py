from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import WatchlistItem
from .pagination import WatchlistPagination
from .serializers import WatchlistItemSerializer


@extend_schema_view(
    list=extend_schema(tags=("Watchlist",)),
    create=extend_schema(tags=("Watchlist",)),
    destroy=extend_schema(tags=("Watchlist",)),
)
class WatchlistViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = WatchlistItemSerializer
    permission_classes = (IsAuthenticated,)
    pagination_class = WatchlistPagination

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return WatchlistItem.objects.none()
        return WatchlistItem.objects.filter(user=self.request.user).select_related(
            "movie", "movie__category"
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item, created = WatchlistItem.objects.get_or_create(
            user=request.user, movie=serializer.validated_data["movie"]
        )
        output = self.get_serializer(item)
        return Response(
            output.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

