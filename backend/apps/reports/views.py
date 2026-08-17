from decimal import Decimal

from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.activity.models import ActivityEvent, WatchHistory
from apps.subscriptions.models import Payment, Subscription

from .serializers import ReportFilterSerializer, ReportsOverviewSerializer


def apply_date_filter(queryset, field: str, filters: dict):
    if filters.get("start_date"):
        queryset = queryset.filter(**{f"{field}__date__gte": filters["start_date"]})
    if filters.get("end_date"):
        queryset = queryset.filter(**{f"{field}__date__lte": filters["end_date"]})
    return queryset


class ReportsOverviewView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=("Reports",),
        parameters=[ReportFilterSerializer],
        responses={200: ReportsOverviewSerializer},
    )
    def get(self, request):
        query = ReportFilterSerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        filters = query.validated_data

        history = WatchHistory.objects.filter(user=request.user).select_related("movie", "movie__category")
        history = apply_date_filter(history, "last_watched_at", filters)

        activity = ActivityEvent.objects.filter(user=request.user)
        activity = apply_date_filter(activity, "created_at", filters)
        if filters.get("activity_type"):
            activity = activity.filter(event_type=filters["activity_type"])

        subscriptions = Subscription.objects.filter(user=request.user).select_related("plan", "payment")
        subscriptions = apply_date_filter(subscriptions, "created_at", filters)
        if filters.get("subscription_status"):
            subscriptions = subscriptions.filter(status=filters["subscription_status"])

        payments = Payment.objects.filter(
            user=request.user,
            status=Payment.Status.COMPLETED,
            subscription__in=subscriptions,
        )
        total_spent = payments.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        active = subscriptions.filter(status=Subscription.Status.ACTIVE).first()

        viewing_by_day = list(
            activity.filter(event_type=ActivityEvent.Type.WATCHED)
            .annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(views=Count("id"))
            .order_by("date")
        )
        breakdown = [
            {"name": item["event_type"].replace("_", " ").title(), "value": item["value"]}
            for item in activity.values("event_type").annotate(value=Count("id")).order_by("event_type")
        ]
        spending = [
            {
                "date": subscription.created_at.date(),
                "amount": subscription.payment.amount,
                "plan": subscription.plan.name,
            }
            for subscription in reversed(list(subscriptions))
            if subscription.payment.status == Payment.Status.COMPLETED
        ]

        result = {
            "summary": {
                "watch_history_count": history.count(),
                "activity_count": activity.count(),
                "subscription_count": subscriptions.count(),
                "total_spent": total_spent,
                "active_plan": active.plan.name if active else None,
            },
            "watch_history": history[:100],
            "activity": activity[:100],
            "subscriptions": subscriptions[:100],
            "viewing_by_day": viewing_by_day,
            "activity_breakdown": breakdown,
            "spending": spending,
        }
        return Response(ReportsOverviewSerializer(result, context={"request": request}).data)
