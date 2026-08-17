from rest_framework.routers import DefaultRouter

from .views import InvoiceViewSet, SubscriptionPlanViewSet, SubscriptionViewSet

router = DefaultRouter()
router.register("subscription-plans", SubscriptionPlanViewSet, basename="subscription-plan")
router.register("subscriptions", SubscriptionViewSet, basename="subscription")
router.register("invoices", InvoiceViewSet, basename="invoice")

urlpatterns = router.urls
