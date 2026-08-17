from rest_framework.routers import DefaultRouter

from .views import AccountsViewSet

app_name = "accounts"

router = DefaultRouter()
router.register("accounts", AccountsViewSet, basename="accounts")

urlpatterns = router.urls

