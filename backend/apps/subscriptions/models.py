import uuid

from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import Q

User = get_user_model()


class SubscriptionPlan(models.Model):
    class BillingPeriod(models.TextChoices):
        MONTHLY = "monthly", "Monthly"
        YEARLY = "yearly", "Yearly"

    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=80, unique=True)
    description = models.CharField(max_length=240)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    billing_period = models.CharField(max_length=10, choices=BillingPeriod.choices)
    features = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("sort_order", "price")

    def __str__(self):
        return self.name


class Payment(models.Model):
    class Method(models.TextChoices):
        CARD = "card", "Card"
        UPI = "upi", "UPI"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name="payments")
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name="payments")
    transaction_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    payment_method = models.CharField(max_length=10, choices=Method.choices, default=Method.CARD)
    billing_name = models.CharField(max_length=120)
    card_last4 = models.CharField(max_length=4, blank=True)
    upi_id_masked = models.CharField(max_length=120, blank=True)
    failure_reason = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.transaction_id} ({self.status})"


class Subscription(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        CANCELLED = "cancelled", "Cancelled"
        EXPIRED = "expired", "Expired"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="subscriptions")
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name="subscriptions")
    payment = models.OneToOneField(Payment, on_delete=models.PROTECT, related_name="subscription")
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.ACTIVE)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    auto_renew = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(
                fields=("user",),
                condition=Q(status="active"),
                name="unique_active_subscription_per_user",
            )
        ]

    def __str__(self):
        return f"{self.user} - {self.plan}"


class Invoice(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name="invoices")
    subscription = models.OneToOneField(Subscription, on_delete=models.PROTECT, related_name="invoice")
    payment = models.OneToOneField(Payment, on_delete=models.PROTECT, related_name="invoice")
    invoice_number = models.CharField(max_length=32, unique=True)
    total = models.DecimalField(max_digits=8, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-issued_at",)

    def __str__(self):
        return self.invoice_number
