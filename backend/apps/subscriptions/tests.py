from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Invoice, Payment, Subscription, SubscriptionPlan


class SubscriptionAPITests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(username="subscriber", email="sub@example.com", password="Strong!Pass2026")
        cls.other = User.objects.create_user(username="other-sub", password="Strong!Pass2026")
        cls.plan = SubscriptionPlan.objects.get(slug="premium")

    def setUp(self):
        self.client = APIClient()

    def payload(self, card_number="4242424242424242"):
        return {
            "plan_id": self.plan.pk,
            "card_holder": "Alex Stream",
            "card_number": card_number,
            "expiry_month": 12,
            "expiry_year": 2030,
            "cvv": "123",
        }

    def upi_payload(self, upi_id="streamcheck@upi"):
        return {
            "plan_id": self.plan.pk,
            "payment_method": "upi",
            "upi_id": upi_id,
        }

    def test_plans_are_public_and_purchase_requires_authentication(self):
        plans = self.client.get("/api/v1/subscription-plans/")
        self.assertEqual(plans.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(plans.data), 3)
        purchase = self.client.post("/api/v1/subscriptions/purchase/", self.payload(), format="json")
        self.assertEqual(purchase.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_successful_purchase_creates_subscription_payment_and_invoice(self):
        self.client.force_authenticate(self.user)
        response = self.client.post("/api/v1/subscriptions/purchase/", self.payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["subscription"]["status"], "active")
        self.assertEqual(response.data["payment"]["card_last4"], "4242")
        self.assertEqual(Subscription.objects.filter(user=self.user, status="active").count(), 1)
        self.assertEqual(Invoice.objects.filter(user=self.user).count(), 1)
        field_names = {field.name for field in Payment._meta.fields}
        self.assertNotIn("card_number", field_names)
        self.assertNotIn("cvv", field_names)

    def test_new_purchase_replaces_existing_active_subscription(self):
        self.client.force_authenticate(self.user)
        self.client.post("/api/v1/subscriptions/purchase/", self.payload(), format="json")
        self.client.post("/api/v1/subscriptions/purchase/", self.payload(), format="json")
        self.assertEqual(Subscription.objects.filter(user=self.user, status="active").count(), 1)
        self.assertEqual(Subscription.objects.filter(user=self.user, status="cancelled").count(), 1)

    def test_mock_decline_records_only_safe_payment_data(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            "/api/v1/subscriptions/purchase/", self.payload("4000000000000002"), format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_402_PAYMENT_REQUIRED)
        payment = Payment.objects.get(user=self.user)
        self.assertEqual(payment.status, Payment.Status.FAILED)
        self.assertEqual(payment.card_last4, "0002")
        self.assertFalse(Subscription.objects.filter(user=self.user).exists())

    def test_successful_upi_purchase_stores_only_masked_identifier(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            "/api/v1/subscriptions/purchase/", self.upi_payload(), format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["payment"]["payment_method"], "upi")
        self.assertEqual(response.data["payment"]["card_last4"], "")
        self.assertEqual(response.data["payment"]["upi_id_masked"], "st*********@upi")
        payment = Payment.objects.get(user=self.user)
        self.assertNotEqual(payment.upi_id_masked, "streamcheck@upi")
        field_names = {field.name for field in Payment._meta.fields}
        self.assertNotIn("upi_id", field_names)

    def test_upi_validation_and_mock_decline(self):
        self.client.force_authenticate(self.user)
        invalid = self.client.post(
            "/api/v1/subscriptions/purchase/", self.upi_payload("not-a-upi-id"), format="json"
        )
        self.assertEqual(invalid.status_code, status.HTTP_400_BAD_REQUEST)
        declined = self.client.post(
            "/api/v1/subscriptions/purchase/", self.upi_payload("decline@upi"), format="json"
        )
        self.assertEqual(declined.status_code, status.HTTP_402_PAYMENT_REQUIRED)
        payment = Payment.objects.get(user=self.user)
        self.assertEqual(payment.status, Payment.Status.FAILED)
        self.assertEqual(payment.payment_method, Payment.Method.UPI)
        self.assertFalse(Subscription.objects.filter(user=self.user).exists())

    def test_current_subscription_and_invoice_pdf_are_owner_only(self):
        self.client.force_authenticate(self.user)
        purchase = self.client.post("/api/v1/subscriptions/purchase/", self.payload(), format="json")
        current = self.client.get("/api/v1/subscriptions/current/")
        self.assertEqual(current.status_code, status.HTTP_200_OK)
        invoice_id = purchase.data["invoice"]["id"]
        download = self.client.get(f"/api/v1/invoices/{invoice_id}/download/")
        self.assertEqual(download.status_code, status.HTTP_200_OK)
        self.assertEqual(download["Content-Type"], "application/pdf")
        self.assertTrue(download.content.startswith(b"%PDF"))
        self.client.force_authenticate(self.other)
        denied = self.client.get(f"/api/v1/invoices/{invoice_id}/download/")
        self.assertEqual(denied.status_code, status.HTTP_404_NOT_FOUND)
