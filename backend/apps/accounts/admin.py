from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from .models import Profile


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    extra = 0
    fields = ("bio", "avatar", "created_at", "updated_at")
    readonly_fields = ("created_at", "updated_at")


class StreamCheckUserAdmin(UserAdmin):
    inlines = (ProfileInline,)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at", "updated_at")
    search_fields = ("user__username", "user__email", "user__first_name", "user__last_name")
    readonly_fields = ("created_at", "updated_at")
    list_select_related = ("user",)


admin.site.unregister(User)
admin.site.register(User, StreamCheckUserAdmin)

