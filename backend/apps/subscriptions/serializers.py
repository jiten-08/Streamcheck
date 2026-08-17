import re
from datetime import date

from rest_framework import serializers
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field

from .models import Invoice, Payment, Subscription, SubscriptionPlan


def passes_luhn(number: str) -> bool:
    digits = [int(char) for char in number]
    checksum = 0
    parity = len(digits) % 2
    for index, digit in enumerate(digits):
        if index % 2 == parity:
            digit *= 2
            if digit > 9:
                digit -= 9
        checksum += digit
    return checksum % 10 == 0


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ("id", "name", "slug", "description", "price", "billing_period", "features")


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ("transaction_id", "amount", "currency", "status", "payment_method", "billing_name", "card_last4", "upi_id_masked", "completed_at")


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)

    class Meta:
        model = Subscription
        fields = ("id", "plan", "status", "starts_at", "ends_at", "auto_renew", "created_at")


class InvoiceSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source="subscription.plan.name", read_only=True)
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = ("id", "invoice_number", "plan_name", "total", "currency", "issued_at", "download_url")

    @extend_schema_field(OpenApiTypes.URI)
    def get_download_url(self, obj) -> str:
        request = self.context.get("request")
        path = f"/api/v1/invoices/{obj.pk}/download/"
        return request.build_absolute_uri(path) if request else path


class PurchaseSerializer(serializers.Serializer):
    plan_id = serializers.PrimaryKeyRelatedField(
        source="plan", queryset=SubscriptionPlan.objects.filter(is_active=True)
    )
    payment_method = serializers.ChoiceField(choices=Payment.Method.choices, default=Payment.Method.CARD)
    card_holder = serializers.CharField(max_length=120, required=False, allow_blank=True)
    card_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    expiry_month = serializers.IntegerField(min_value=1, max_value=12, write_only=True, required=False)
    expiry_year = serializers.IntegerField(write_only=True, required=False)
    cvv = serializers.CharField(write_only=True, required=False, allow_blank=True)
    upi_id = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=120)

    def validate_card_number(self, value):
        if not value:
            return value
        number = re.sub(r"[\s-]", "", value)
        if not number.isdigit() or not 13 <= len(number) <= 19 or not passes_luhn(number):
            raise serializers.ValidationError("Enter a valid card number.")
        return number

    def validate(self, attrs):
        if attrs["payment_method"] == Payment.Method.UPI:
            upi_id = attrs.get("upi_id", "").strip().lower()
            if not re.fullmatch(r"[a-z0-9._-]{2,100}@[a-z][a-z0-9.-]{1,30}", upi_id):
                raise serializers.ValidationError({"upi_id": "Enter a valid UPI ID, for example name@bank."})
            attrs["upi_id"] = upi_id
            return attrs

        required = {
            "card_holder": "Enter the name shown on the card.",
            "card_number": "Enter a valid card number.",
            "expiry_month": "Expiry month is required.",
            "expiry_year": "Expiry year is required.",
            "cvv": "Security code is required.",
        }
        errors = {field: message for field, message in required.items() if attrs.get(field) in (None, "")}
        if errors:
            raise serializers.ValidationError(errors)
        if not re.fullmatch(r"\d{3,4}", attrs["cvv"]):
            raise serializers.ValidationError({"cvv": "Enter a 3 or 4 digit security code."})
        today = date.today()
        year = attrs["expiry_year"]
        if year < 100:
            year += 2000
        if year > today.year + 20:
            raise serializers.ValidationError({"expiry_year": "Expiry year is too far in the future."})
        if (year, attrs["expiry_month"]) < (today.year, today.month):
            raise serializers.ValidationError({"expiry_month": "This card has expired."})
        attrs["expiry_year"] = year
        attrs["card_holder"] = attrs["card_holder"].strip()
        if len(attrs["card_holder"]) < 2:
            raise serializers.ValidationError({"card_holder": "Enter the name shown on the card."})
        return attrs


class PurchaseResultSerializer(serializers.Serializer):
    subscription = SubscriptionSerializer()
    payment = PaymentSerializer()
    invoice = InvoiceSerializer()
