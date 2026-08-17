from django.contrib import admin

from .models import WatchlistItem


@admin.register(WatchlistItem)
class WatchlistItemAdmin(admin.ModelAdmin):
    list_display = ("user", "movie", "added_at")
    list_filter = ("added_at", "movie__category")
    search_fields = ("user__username", "user__email", "movie__title")
    autocomplete_fields = ("user", "movie")
    list_select_related = ("user", "movie")

