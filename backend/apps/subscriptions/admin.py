from django.contrib import admin

from .models import Invoice, Payment, Subscription, SubscriptionPlan


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "billing_period", "is_active", "sort_order")
    list_filter = ("billing_period", "is_active")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "plan", "status", "starts_at", "ends_at", "auto_renew")
    list_filter = ("status", "plan")
    search_fields = ("user__username", "user__email")
    readonly_fields = ("payment", "created_at")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("transaction_id", "user", "amount", "currency", "payment_method", "status", "payment_reference", "created_at")
    list_filter = ("payment_method", "status", "currency")
    search_fields = ("transaction_id", "user__username", "user__email")
    readonly_fields = ("transaction_id", "card_last4", "upi_id_masked", "created_at", "completed_at")

    @admin.display(description="Reference")
    def payment_reference(self, obj):
        return obj.upi_id_masked or (f"•••• {obj.card_last4}" if obj.card_last4 else "—")


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "user", "total", "currency", "issued_at")
    search_fields = ("invoice_number", "user__username", "user__email")
    readonly_fields = ("invoice_number", "subscription", "payment", "issued_at")
