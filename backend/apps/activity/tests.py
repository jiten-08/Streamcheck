from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.catalog.models import Movie

from .models import ActivityEvent, WatchHistory


class ProfileActivityAPITests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(username="viewer", password="Strong!Pass2026")
        cls.other = User.objects.create_user(username="other-viewer", password="Strong!Pass2026")
        cls.movie = Movie.objects.filter(is_published=True).first()

    def setUp(self):
        self.client = APIClient()

    def test_history_and_activity_require_authentication(self):
        self.assertEqual(self.client.get("/api/v1/watch-history/").status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.get("/api/v1/activity/").status_code, status.HTTP_401_UNAUTHORIZED)

    def test_record_watch_upserts_history_and_logs_activity(self):
        self.client.force_authenticate(self.user)
        first = self.client.post("/api/v1/watch-history/", {"movie_id": self.movie.pk}, format="json")
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        second = self.client.post(
            "/api/v1/watch-history/",
            {"movie_id": self.movie.pk, "progress_seconds": 90},
            format="json",
        )
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.assertEqual(WatchHistory.objects.filter(user=self.user).count(), 1)
        self.assertEqual(second.data["progress_seconds"], 90)
        self.assertEqual(ActivityEvent.objects.filter(user=self.user, event_type="watched").count(), 2)

    def test_users_only_see_their_own_dashboard_data(self):
        WatchHistory.objects.create(user=self.other, movie=self.movie)
        ActivityEvent.objects.create(user=self.other, event_type="profile", title="Private event")
        self.client.force_authenticate(self.user)
        history = self.client.get("/api/v1/watch-history/")
        activity = self.client.get("/api/v1/activity/")
        self.assertEqual(history.data["count"], 0)
        self.assertEqual(activity.data["count"], 0)

    def test_profile_update_and_password_change_create_activity(self):
        self.client.force_authenticate(self.user)
        updated = self.client.patch("/api/v1/accounts/profile/", {"bio": "Movie fan"}, format="json")
        self.assertEqual(updated.status_code, status.HTTP_200_OK)
        changed = self.client.post(
            "/api/v1/accounts/change-password/",
            {
                "current_password": "Strong!Pass2026",
                "new_password": "EvenStronger!Pass2027",
                "new_password_confirm": "EvenStronger!Pass2027",
            },
            format="json",
        )
        self.assertEqual(changed.status_code, status.HTTP_200_OK)
        self.assertTrue(ActivityEvent.objects.filter(user=self.user, event_type="profile").exists())
        self.assertTrue(ActivityEvent.objects.filter(user=self.user, event_type="password").exists())
