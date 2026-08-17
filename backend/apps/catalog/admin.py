from django.contrib import admin

from .models import CastMember, Category, Movie, MovieCast


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "created_at")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


class MovieCastInline(admin.TabularInline):
    model = MovieCast
    extra = 1
    autocomplete_fields = ("cast_member",)
    ordering = ("order",)


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "release_date", "rating", "has_video", "is_featured", "is_published")
    list_filter = ("category", "is_featured", "is_published", "release_date")
    search_fields = ("title", "tagline", "description")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("category",)
    date_hierarchy = "release_date"
    list_select_related = ("category",)
    inlines = (MovieCastInline,)

    @admin.display(boolean=True, description="Video")
    def has_video(self, obj):
        return bool(obj.video_url)


@admin.register(CastMember)
class CastMemberAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}
