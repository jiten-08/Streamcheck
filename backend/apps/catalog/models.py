from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("name",)
        verbose_name_plural = "categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        return super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class Movie(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    tagline = models.CharField(max_length=250, blank=True)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="movies")
    release_date = models.DateField()
    duration_minutes = models.PositiveSmallIntegerField(
        validators=(MinValueValidator(1), MaxValueValidator(1440))
    )
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        validators=(MinValueValidator(0), MaxValueValidator(10)),
    )
    maturity_rating = models.CharField(max_length=20, default="U/A 13+")
    poster = models.ImageField(upload_to="movies/posters/", blank=True, null=True)
    video_url = models.URLField(max_length=500, blank=True)
    accent_color = models.CharField(max_length=7, default="#6366F1")
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-release_date", "title")
        indexes = (
            models.Index(fields=("is_published", "-release_date")),
            models.Index(fields=("category", "is_published")),
            models.Index(fields=("rating",)),
        )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        return super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.title


class CastMember(models.Model):
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=170, unique=True)
    photo = models.ImageField(upload_to="cast/photos/", blank=True, null=True)

    class Meta:
        ordering = ("name",)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        return super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class MovieCast(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name="cast_credits")
    cast_member = models.ForeignKey(
        CastMember, on_delete=models.CASCADE, related_name="movie_credits"
    )
    character = models.CharField(max_length=150)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("order", "id")
        constraints = (
            models.UniqueConstraint(
                fields=("movie", "cast_member"), name="unique_movie_cast_member"
            ),
        )

    def __str__(self) -> str:
        return f"{self.cast_member} as {self.character} in {self.movie}"
