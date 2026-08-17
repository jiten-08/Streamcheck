from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.catalog.models import Movie

from .models import WatchlistItem


class WatchlistAPITests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(username="watcher", password="Strong!Pass2026")
        cls.other_user = User.objects.create_user(username="other", password="Strong!Pass2026")
        cls.movies = list(Movie.objects.filter(is_published=True)[:13])

    def setUp(self):
        self.client = APIClient()

    def test_watchlist_requires_authentication(self):
        response = self.client.get("/api/v1/watchlist/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_add_list_duplicate_and_remove_flow(self):
        self.client.force_authenticate(self.user)
        added = self.client.post(
            "/api/v1/watchlist/", {"movie_id": self.movies[0].pk}, format="json"
        )
        self.assertEqual(added.status_code, status.HTTP_201_CREATED)
        self.assertEqual(added.data["movie"]["id"], self.movies[0].pk)

        duplicate = self.client.post(
            "/api/v1/watchlist/", {"movie_id": self.movies[0].pk}, format="json"
        )
        self.assertEqual(duplicate.status_code, status.HTTP_200_OK)
        self.assertEqual(WatchlistItem.objects.filter(user=self.user).count(), 1)

        listed = self.client.get("/api/v1/watchlist/")
        self.assertEqual(listed.status_code, status.HTTP_200_OK)
        self.assertEqual(listed.data["count"], 1)

        removed = self.client.delete(f"/api/v1/watchlist/{added.data['id']}/")
        self.assertEqual(removed.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(WatchlistItem.objects.filter(user=self.user).exists())

    def test_users_only_see_and_remove_their_own_items(self):
        other_item = WatchlistItem.objects.create(user=self.other_user, movie=self.movies[0])
        self.client.force_authenticate(self.user)
        listed = self.client.get("/api/v1/watchlist/")
        self.assertEqual(listed.data["count"], 0)
        removed = self.client.delete(f"/api/v1/watchlist/{other_item.pk}/")
        self.assertEqual(removed.status_code, status.HTTP_404_NOT_FOUND)

    def test_watchlist_is_paginated(self):
        WatchlistItem.objects.bulk_create(
            [WatchlistItem(user=self.user, movie=movie) for movie in self.movies]
        )
        self.client.force_authenticate(self.user)
        response = self.client.get("/api/v1/watchlist/")
        self.assertEqual(response.data["count"], 13)
        self.assertEqual(len(response.data["results"]), 12)
        self.assertEqual(response.data["total_pages"], 2)

