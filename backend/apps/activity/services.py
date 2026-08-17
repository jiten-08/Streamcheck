from .models import ActivityEvent


def log_activity(*, user, event_type: str, title: str, description: str = "", metadata=None):
    return ActivityEvent.objects.create(
        user=user,
        event_type=event_type,
        title=title,
        description=description,
        metadata=metadata or {},
    )
