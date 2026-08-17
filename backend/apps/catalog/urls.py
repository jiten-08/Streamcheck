from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, MovieViewSet

app_name = "catalog"

router = DefaultRouter()
router.register("movies", MovieViewSet, basename="movie")
router.register("categories", CategoryViewSet, basename="category")

urlpatterns = router.urls

