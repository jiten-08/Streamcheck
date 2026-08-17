from django.http import HttpResponse
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Invoice, Subscription, SubscriptionPlan
from .serializers import (
    InvoiceSerializer,
    PurchaseResultSerializer,
    PurchaseSerializer,
    SubscriptionPlanSerializer,
    SubscriptionSerializer,
)
from .services import PaymentDeclined, build_invoice_pdf, process_purchase


@extend_schema_view(list=extend_schema(tags=("Subscriptions",)), retrieve=extend_schema(tags=("Subscriptions",)))
class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = (AllowAny,)
    pagination_class = None
    lookup_field = "slug"


@extend_schema_view(list=extend_schema(tags=("Subscriptions",)), retrieve=extend_schema(tags=("Subscriptions",)))
class SubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subscription.objects.none()
    serializer_class = SubscriptionSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Subscription.objects.none()
        return Subscription.objects.filter(user=self.request.user).select_related("plan", "payment")

    @extend_schema(tags=("Subscriptions",), request=None, responses={200: SubscriptionSerializer, 404: None})
    @action(detail=False, methods=("get",))
    def current(self, request):
        subscription = self.get_queryset().filter(status=Subscription.Status.ACTIVE).first()
        if not subscription:
            return Response({"detail": "No active subscription."}, status=status.HTTP_404_NOT_FOUND)
        return Response(self.get_serializer(subscription).data)

    @extend_schema(tags=("Subscriptions",), request=PurchaseSerializer, responses={201: PurchaseResultSerializer})
    @action(detail=False, methods=("post",))
    def purchase(self, request):
        serializer = PurchaseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            subscription, payment, invoice = process_purchase(
                user=request.user,
                plan=data["plan"],
                payment_method=data["payment_method"],
                card_holder=data.get("card_holder", ""),
                card_number=data.get("card_number", ""),
                upi_id=data.get("upi_id", ""),
            )
        except PaymentDeclined as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_402_PAYMENT_REQUIRED)
        result = {"subscription": subscription, "payment": payment, "invoice": invoice}
        return Response(PurchaseResultSerializer(result, context={"request": request}).data, status=status.HTTP_201_CREATED)


@extend_schema_view(list=extend_schema(tags=("Invoices",)), retrieve=extend_schema(tags=("Invoices",)))
class InvoiceViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Invoice.objects.none()
    serializer_class = InvoiceSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Invoice.objects.none()
        return Invoice.objects.filter(user=self.request.user).select_related(
            "user", "payment", "subscription__plan"
        )

    @extend_schema(tags=("Invoices",), responses={(200, "application/pdf"): OpenApiTypes.BINARY})
    @action(detail=True, methods=("get",))
    def download(self, request, pk=None):
        invoice = self.get_object()
        response = HttpResponse(build_invoice_pdf(invoice), content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{invoice.invoice_number}.pdf"'
        return response
