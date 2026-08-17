from rest_framework.routers import DefaultRouter

from .views import WatchlistViewSet

app_name = "watchlist"

router = DefaultRouter()
router.register("watchlist", WatchlistViewSet, basename="watchlist")

urlpatterns = router.urls

