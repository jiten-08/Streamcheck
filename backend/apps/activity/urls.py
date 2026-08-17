from rest_framework.routers import DefaultRouter

from .views import ActivityEventViewSet, WatchHistoryViewSet

router = DefaultRouter()
router.register("watch-history", WatchHistoryViewSet, basename="watch-history")
router.register("activity", ActivityEventViewSet, basename="activity")

urlpatterns = router.urls
