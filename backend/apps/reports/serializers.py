from rest_framework import serializers

from apps.activity.models import ActivityEvent
from apps.activity.serializers import ActivityEventSerializer, WatchHistorySerializer
from apps.subscriptions.models import Subscription
from apps.subscriptions.serializers import SubscriptionPlanSerializer


class ReportFilterSerializer(serializers.Serializer):
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    activity_type = serializers.ChoiceField(
        choices=ActivityEvent.Type.choices, required=False
    )
    subscription_status = serializers.ChoiceField(
        choices=Subscription.Status.choices, required=False
    )

    def validate(self, attrs):
        if attrs.get("start_date") and attrs.get("end_date") and attrs["start_date"] > attrs["end_date"]:
            raise serializers.ValidationError({"end_date": "End date must be on or after start date."})
        return attrs


class ReportSubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    amount = serializers.DecimalField(source="payment.amount", max_digits=8, decimal_places=2, read_only=True)
    currency = serializers.CharField(source="payment.currency", read_only=True)

    class Meta:
        model = Subscription
        fields = ("id", "plan", "status", "amount", "currency", "starts_at", "ends_at", "auto_renew", "created_at")


class DailyViewingSerializer(serializers.Serializer):
    date = serializers.DateField()
    views = serializers.IntegerField()


class BreakdownSerializer(serializers.Serializer):
    name = serializers.CharField()
    value = serializers.IntegerField()


class SpendingSerializer(serializers.Serializer):
    date = serializers.DateField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    plan = serializers.CharField()


class ReportSummarySerializer(serializers.Serializer):
    watch_history_count = serializers.IntegerField()
    activity_count = serializers.IntegerField()
    subscription_count = serializers.IntegerField()
    total_spent = serializers.DecimalField(max_digits=10, decimal_places=2)
    active_plan = serializers.CharField(allow_null=True)


class ReportsOverviewSerializer(serializers.Serializer):
    summary = ReportSummarySerializer()
    watch_history = WatchHistorySerializer(many=True)
    activity = ActivityEventSerializer(many=True)
    subscriptions = ReportSubscriptionSerializer(many=True)
    viewing_by_day = DailyViewingSerializer(many=True)
    activity_breakdown = BreakdownSerializer(many=True)
    spending = SpendingSerializer(many=True)
