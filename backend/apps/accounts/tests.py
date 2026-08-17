import base64
import shutil
from pathlib import Path

from django.contrib.auth.models import User
from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase


class AccountsAPITests(APITestCase):
    password = "Strong!Pass2026"

    def setUp(self):
        self.media_directory = Path(settings.BASE_DIR) / ".test-media-accounts"
        shutil.rmtree(self.media_directory, ignore_errors=True)
        self.media_directory.mkdir(parents=True, exist_ok=True)
        self.media_override = override_settings(MEDIA_ROOT=self.media_directory)
        self.media_override.enable()

    def tearDown(self):
        self.media_override.disable()
        shutil.rmtree(self.media_directory, ignore_errors=True)

    def register(self, username="streamer", email="streamer@example.com"):
        return self.client.post(
            "/api/v1/accounts/register/",
            {
                "username": username,
                "email": email,
                "first_name": "Stream",
                "last_name": "Tester",
                "password": self.password,
                "password_confirm": self.password,
            },
            format="json",
        )

    def authenticate(self):
        response = self.register()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        return response

    def test_registration_login_refresh_profile_and_logout_flow(self):
        registration = self.authenticate()
        self.assertEqual(registration.data["profile"]["email"], "streamer@example.com")
        self.assertTrue(User.objects.filter(username="streamer").exists())

        profile = self.client.get("/api/v1/accounts/profile/")
        self.assertEqual(profile.status_code, status.HTTP_200_OK)
        self.assertEqual(profile.data["first_name"], "Stream")

        updated = self.client.patch(
            "/api/v1/accounts/profile/",
            {"first_name": "Updated", "bio": "Automation profile"},
            format="json",
        )
        self.assertEqual(updated.status_code, status.HTTP_200_OK)
        self.assertEqual(updated.data["bio"], "Automation profile")

        login = self.client.post(
            "/api/v1/accounts/login/",
            {"username": "streamer", "password": self.password},
            format="json",
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)

        refreshed = self.client.post(
            "/api/v1/accounts/refresh/", {"refresh": login.data["refresh"]}, format="json"
        )
        self.assertEqual(refreshed.status_code, status.HTTP_200_OK)
        self.assertIn("access", refreshed.data)
        self.assertIn("refresh", refreshed.data)

        logged_out = self.client.post(
            "/api/v1/accounts/logout/", {"refresh": refreshed.data["refresh"]}, format="json"
        )
        self.assertEqual(logged_out.status_code, status.HTTP_205_RESET_CONTENT)
        rejected_refresh = self.client.post(
            "/api/v1/accounts/refresh/", {"refresh": refreshed.data["refresh"]}, format="json"
        )
        self.assertEqual(rejected_refresh.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_change_password(self):
        self.authenticate()
        changed = self.client.post(
            "/api/v1/accounts/change-password/",
            {
                "current_password": self.password,
                "new_password": "Different!Pass2027",
                "new_password_confirm": "Different!Pass2027",
            },
            format="json",
        )
        self.assertEqual(changed.status_code, status.HTTP_200_OK)
        self.assertTrue(User.objects.get(username="streamer").check_password("Different!Pass2027"))

    def test_forgot_password_is_non_enumerating_mock(self):
        known = self.client.post(
            "/api/v1/accounts/forgot-password/", {"email": "known@example.com"}, format="json"
        )
        unknown = self.client.post(
            "/api/v1/accounts/forgot-password/", {"email": "unknown@example.com"}, format="json"
        )
        self.assertEqual(known.status_code, status.HTTP_200_OK)
        self.assertEqual(known.data, unknown.data)

    def test_avatar_upload_and_delete(self):
        self.authenticate()
        gif = base64.b64decode("R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==")
        avatar = SimpleUploadedFile("avatar.gif", gif, content_type="image/gif")
        uploaded = self.client.post(
            "/api/v1/accounts/avatar/", {"avatar": avatar}, format="multipart"
        )
        self.assertEqual(uploaded.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(uploaded.data["avatar"])
        user_id = User.objects.get(username="streamer").pk
        avatar_path = self.media_directory / "avatars" / f"user_{user_id}" / "avatar.gif"
        self.assertTrue(avatar_path.exists())

        deleted = self.client.delete("/api/v1/accounts/avatar/")
        self.assertEqual(deleted.status_code, status.HTTP_200_OK)
        self.assertIsNone(deleted.data["avatar"])
        self.assertFalse(avatar_path.exists())

    def test_registration_validation(self):
        first = self.register()
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        duplicate = self.register(username="STREAMER", email="STREAMER@example.com")
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", duplicate.data)
        self.assertIn("email", duplicate.data)

    def test_openapi_schema_is_available(self):
        response = self.client.get("/api/schema/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("application/vnd.oai.openapi", response["Content-Type"])
