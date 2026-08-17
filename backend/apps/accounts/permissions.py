from rest_framework.permissions import BasePermission

from .models import Profile


class IsProfileOwner(BasePermission):
    message = "You may only access your own profile."

    def has_object_permission(self, request, view, obj: Profile) -> bool:
        return request.user.is_authenticated and obj.user_id == request.user.id

