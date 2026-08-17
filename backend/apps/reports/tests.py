from datetime import timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.activity.models import ActivityEvent, WatchHistory
from apps.catalog.models import Movie
from apps.subscriptions.services import process_purchase
from apps.subscriptions.models import SubscriptionPlan


class ReportsAPITests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(username="reporter", password="Strong!Pass2026")
        cls.other = User.objects.create_user(username="other-reporter", password="Strong!Pass2026")
        cls.movie = Movie.objects.filter(is_published=True).first()
        WatchHistory.objects.create(user=cls.user, movie=cls.movie, progress_seconds=120)
        WatchHistory.objects.create(user=cls.other, movie=cls.movie)
        ActivityEvent.objects.create(user=cls.user, event_type="watched", title="Watched a movie")
        ActivityEvent.objects.create(user=cls.user, event_type="profile", title="Updated profile")
        ActivityEvent.objects.create(user=cls.other, event_type="watched", title="Private activity")
        plan = SubscriptionPlan.objects.get(slug="premium")
        process_purchase(user=cls.user, plan=plan, card_holder="Report User", card_number="4242424242424242")

    def setUp(self):
        self.client = APIClient()

    def test_reports_require_authentication(self):
        response = self.client.get("/api/v1/reports/overview/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_overview_is_owner_scoped_and_contains_aggregates(self):
        self.client.force_authenticate(self.user)
        response = self.client.get("/api/v1/reports/overview/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["summary"]["watch_history_count"], 1)
        self.assertEqual(response.data["summary"]["subscription_count"], 1)
        self.assertEqual(response.data["summary"]["active_plan"], "Premium")
        self.assertEqual(len(response.data["watch_history"]), 1)
        self.assertGreaterEqual(response.data["summary"]["activity_count"], 3)

    def test_activity_and_subscription_filters(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(
            "/api/v1/reports/overview/",
            {"activity_type": "profile", "subscription_status": "active"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["summary"]["activity_count"], 1)
        self.assertEqual(response.data["summary"]["subscription_count"], 1)

    def test_date_range_validation_and_filtering(self):
        self.client.force_authenticate(self.user)
        invalid = self.client.get(
            "/api/v1/reports/overview/",
            {"start_date": "2026-08-10", "end_date": "2026-08-01"},
        )
        self.assertEqual(invalid.status_code, status.HTTP_400_BAD_REQUEST)
        future = (timezone.now() + timedelta(days=2)).date().isoformat()
        filtered = self.client.get("/api/v1/reports/overview/", {"start_date": future})
        self.assertEqual(filtered.data["summary"]["activity_count"], 0)
        self.assertEqual(filtered.data["summary"]["watch_history_count"], 0)
