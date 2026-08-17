from datetime import date

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import CastMember, Category, Movie, MovieCast


class MediaLibraryAPITests(TestCase):
    @classmethod
    def setUpTestData(cls):
        Movie.objects.all().delete()
        CastMember.objects.all().delete()
        Category.objects.all().delete()
        sci_fi = Category.objects.create(name="Sci-Fi", slug="sci-fi")
        drama = Category.objects.create(name="Drama", slug="drama")
        for index in range(15):
            Movie.objects.create(
                title=f"Signal {index:02d}",
                slug=f"signal-{index:02d}",
                tagline="A distant transmission",
                description="A science fiction signal crosses the stars.",
                category=sci_fi if index % 2 == 0 else drama,
                release_date=date(2026 if index < 10 else 2025, 1, index + 1),
                duration_minutes=90 + index,
                rating=5 + (index % 5),
            )
        Movie.objects.create(
            title="Hidden Draft",
            slug="hidden-draft",
            description="Not available",
            category=drama,
            release_date=date(2026, 2, 1),
            duration_minutes=100,
            rating=9,
            is_published=False,
        )
        performer = CastMember.objects.create(name="Alex Stone", slug="alex-stone")
        MovieCast.objects.create(
            movie=Movie.objects.get(slug="signal-00"),
            cast_member=performer,
            character="Dr. Nova Reed",
            order=0,
        )
        movie = Movie.objects.get(slug="signal-00")
        movie.video_url = "https://example.com/videos/signal-00.mp4"
        movie.save(update_fields=("video_url",))

    def setUp(self):
        self.client = APIClient()

    def test_movie_list_is_public_and_paginated(self):
        response = self.client.get("/api/v1/movies/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 15)
        self.assertEqual(response.data["page_size"], 12)
        self.assertEqual(len(response.data["results"]), 12)
        self.assertEqual(response.data["total_pages"], 2)

    def test_search_filter_and_ordering(self):
        searched = self.client.get("/api/v1/movies/", {"search": "Signal 03"})
        self.assertEqual(searched.data["count"], 1)

        filtered = self.client.get(
            "/api/v1/movies/",
            {"category": "sci-fi", "release_year": 2026, "min_rating": 7},
        )
        self.assertTrue(filtered.data["results"])
        self.assertTrue(all(item["category"]["slug"] == "sci-fi" for item in filtered.data["results"]))
        self.assertTrue(all(item["year"] == 2026 for item in filtered.data["results"]))
        self.assertTrue(all(float(item["rating"]) >= 7 for item in filtered.data["results"]))

        ordered = self.client.get("/api/v1/movies/", {"ordering": "rating", "page_size": 15})
        ratings = [float(item["rating"]) for item in ordered.data["results"]]
        self.assertEqual(ratings, sorted(ratings))

    def test_category_list_has_published_movie_counts(self):
        response = self.client.get("/api/v1/categories/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        counts = {item["slug"]: item["movie_count"] for item in response.data}
        self.assertEqual(sum(counts.values()), 15)

    def test_movie_detail_uses_slug(self):
        response = self.client.get("/api/v1/movies/signal-00/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Signal 00")
        self.assertEqual(response.data["cast"][0]["name"], "Alex Stone")
        self.assertEqual(response.data["cast"][0]["character"], "Dr. Nova Reed")
        self.assertEqual(response.data["video_url"], "https://example.com/videos/signal-00.mp4")

    def test_related_movies_use_same_category_and_exclude_current_movie(self):
        response = self.client.get("/api/v1/movies/signal-00/related/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data)
        self.assertTrue(all(movie["category"]["slug"] == "sci-fi" for movie in response.data))
        self.assertNotIn("signal-00", [movie["slug"] for movie in response.data])
