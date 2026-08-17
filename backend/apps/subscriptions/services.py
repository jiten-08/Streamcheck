from datetime import timedelta
from io import BytesIO
from uuid import uuid4

from django.db import transaction
from django.utils import timezone
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from .models import Invoice, Payment, Subscription
from apps.activity.models import ActivityEvent
from apps.activity.services import log_activity


class PaymentDeclined(Exception):
    pass


DECLINED_CARD = "4000000000000002"
DECLINED_UPI_ID = "decline@upi"


def mask_upi_id(upi_id: str) -> str:
    username, handle = upi_id.split("@", 1)
    visible = username[:2] if len(username) > 2 else username[:1]
    return f"{visible}{'*' * max(3, len(username) - len(visible))}@{handle}"


def process_purchase(*, user, plan, payment_method=Payment.Method.CARD, card_holder="", card_number="", upi_id=""):
    now = timezone.now()
    is_upi = payment_method == Payment.Method.UPI
    last4 = "" if is_upi else card_number[-4:]
    masked_upi = mask_upi_id(upi_id) if is_upi else ""
    billing_name = (user.get_full_name() or user.username) if is_upi else card_holder
    declined = (is_upi and upi_id == DECLINED_UPI_ID) or (not is_upi and card_number == DECLINED_CARD)
    if declined:
        Payment.objects.create(
            user=user,
            plan=plan,
            amount=plan.price,
            status=Payment.Status.FAILED,
            payment_method=payment_method,
            billing_name=billing_name,
            card_last4=last4,
            upi_id_masked=masked_upi,
            failure_reason="The mock payment provider declined this payment.",
        )
        hint = "streamcheck@upi" if is_upi else "4242 4242 4242 4242"
        raise PaymentDeclined(f"Payment declined. Use {hint} for a successful test payment.")

    with transaction.atomic():
        Subscription.objects.select_for_update().filter(
            user=user, status=Subscription.Status.ACTIVE
        ).update(status=Subscription.Status.CANCELLED, auto_renew=False)
        payment = Payment.objects.create(
            user=user,
            plan=plan,
            amount=plan.price,
            status=Payment.Status.COMPLETED,
            payment_method=payment_method,
            billing_name=billing_name,
            card_last4=last4,
            upi_id_masked=masked_upi,
            completed_at=now,
        )
        days = 365 if plan.billing_period == plan.BillingPeriod.YEARLY else 30
        subscription = Subscription.objects.create(
            user=user,
            plan=plan,
            payment=payment,
            starts_at=now,
            ends_at=now + timedelta(days=days),
        )
        invoice = Invoice.objects.create(
            user=user,
            subscription=subscription,
            payment=payment,
            invoice_number=f"SC-{now:%Y%m}-{uuid4().hex[:8].upper()}",
            total=plan.price,
        )
        log_activity(
            user=user,
            event_type=ActivityEvent.Type.SUBSCRIPTION,
            title=f"{plan.name} subscription activated",
            description=f"Your {plan.get_billing_period_display().lower()} membership is now active.",
            metadata={"plan_id": plan.pk, "subscription_id": subscription.pk},
        )
    return subscription, payment, invoice


def build_invoice_pdf(invoice: Invoice) -> bytes:
    output = BytesIO()
    pdf = canvas.Canvas(output, pagesize=letter)
    width, height = letter
    pdf.setFillColor(HexColor("#09090B"))
    pdf.rect(0, 0, width, height, fill=1, stroke=0)
    pdf.setFillColor(HexColor("#6366F1"))
    pdf.setFont("Helvetica-Bold", 26)
    pdf.drawString(48, height - 64, "StreamCheck")
    pdf.setFillColor(HexColor("#FFFFFF"))
    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawRightString(width - 48, height - 64, "INVOICE")
    pdf.setStrokeColor(HexColor("#27272A"))
    pdf.line(48, height - 90, width - 48, height - 90)

    rows = (
        ("Invoice number", invoice.invoice_number),
        ("Issued", invoice.issued_at.strftime("%B %d, %Y")),
        ("Billed to", invoice.payment.billing_name),
        ("Account", invoice.user.email or invoice.user.username),
        ("Transaction", str(invoice.payment.transaction_id)),
        ("Payment method", f"UPI {invoice.payment.upi_id_masked}" if invoice.payment.payment_method == Payment.Method.UPI else f"Card ending in {invoice.payment.card_last4}"),
    )
    y = height - 130
    for label, value in rows:
        pdf.setFillColor(HexColor("#9CA3AF"))
        pdf.setFont("Helvetica", 10)
        pdf.drawString(48, y, label.upper())
        pdf.setFillColor(HexColor("#FFFFFF"))
        pdf.setFont("Helvetica", 11)
        pdf.drawString(180, y, value)
        y -= 27

    y -= 18
    pdf.setFillColor(HexColor("#18181B"))
    pdf.roundRect(48, y - 86, width - 96, 100, 10, fill=1, stroke=0)
    pdf.setFillColor(HexColor("#FFFFFF"))
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(66, y - 18, f"{invoice.subscription.plan.name} plan")
    pdf.setFillColor(HexColor("#9CA3AF"))
    pdf.setFont("Helvetica", 10)
    pdf.drawString(66, y - 39, f"Billed {invoice.subscription.plan.get_billing_period_display().lower()}")
    pdf.setFillColor(HexColor("#FFFFFF"))
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawRightString(width - 66, y - 28, f"{invoice.currency} {invoice.total:.2f}")
    pdf.setFillColor(HexColor("#22C55E"))
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(66, y - 67, "PAID")

    pdf.setFillColor(HexColor("#9CA3AF"))
    pdf.setFont("Helvetica", 9)
    pdf.drawCentredString(width / 2, 42, "Thank you for choosing StreamCheck.")
    pdf.showPage()
    pdf.save()
    return output.getvalue()
