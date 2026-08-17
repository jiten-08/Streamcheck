from django.contrib import admin

from .models import ActivityEvent, WatchHistory


@admin.register(WatchHistory)
class WatchHistoryAdmin(admin.ModelAdmin):
    list_display = ("user", "movie", "progress_seconds", "completed", "last_watched_at")
    list_filter = ("completed",)
    search_fields = ("user__username", "movie__title")


@admin.register(ActivityEvent)
class ActivityEventAdmin(admin.ModelAdmin):
    list_display = ("user", "event_type", "title", "created_at")
    list_filter = ("event_type",)
    search_fields = ("user__username", "title")
