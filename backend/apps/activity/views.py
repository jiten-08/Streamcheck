from django.utils import timezone
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import ActivityEvent, WatchHistory
from .pagination import DashboardPagination
from .serializers import ActivityEventSerializer, RecordWatchSerializer, WatchHistorySerializer
from .services import log_activity


@extend_schema_view(list=extend_schema(tags=("Profile",)), create=extend_schema(tags=("Profile",), request=RecordWatchSerializer, responses={200: WatchHistorySerializer, 201: WatchHistorySerializer}))
class WatchHistoryViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = WatchHistory.objects.none()
    permission_classes = (IsAuthenticated,)
    pagination_class = DashboardPagination

    def get_serializer_class(self):
        return RecordWatchSerializer if self.action == "create" else WatchHistorySerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return WatchHistory.objects.none()
        return WatchHistory.objects.filter(user=self.request.user).select_related("movie", "movie__category")

    def create(self, request, *args, **kwargs):
        serializer = RecordWatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        values = serializer.validated_data
        movie = values["movie"]
        item, created = WatchHistory.objects.get_or_create(
            user=request.user,
            movie=movie,
            defaults={"progress_seconds": values["progress_seconds"], "completed": values["completed"]},
        )
        if not created:
            item.progress_seconds = values["progress_seconds"]
            item.completed = values["completed"]
            item.last_watched_at = timezone.now()
            item.save(update_fields=("progress_seconds", "completed", "last_watched_at"))
        log_activity(
            user=request.user,
            event_type=ActivityEvent.Type.WATCHED,
            title=f"Watched {movie.title}",
            description=f"Played {movie.title} from your library.",
            metadata={"movie_id": movie.pk, "movie_slug": movie.slug},
        )
        output = WatchHistorySerializer(item, context=self.get_serializer_context())
        return Response(output.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@extend_schema_view(list=extend_schema(tags=("Profile",)))
class ActivityEventViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = ActivityEvent.objects.none()
    serializer_class = ActivityEventSerializer
    permission_classes = (IsAuthenticated,)
    pagination_class = DashboardPagination

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return ActivityEvent.objects.none()
        return ActivityEvent.objects.filter(user=self.request.user)
