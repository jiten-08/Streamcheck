from django.db import migrations


PLANS = (
    {
        "name": "Essential",
        "slug": "essential",
        "description": "A simple way to enjoy StreamCheck on one screen.",
        "price": "8.99",
        "billing_period": "monthly",
        "features": ["Full HD streaming", "1 screen at a time", "Ad-free movies", "Cancel anytime"],
        "sort_order": 10,
    },
    {
        "name": "Premium",
        "slug": "premium",
        "description": "Our best experience for households and movie lovers.",
        "price": "14.99",
        "billing_period": "monthly",
        "features": ["4K Ultra HD", "4 screens at a time", "Offline downloads", "Spatial audio", "Cancel anytime"],
        "sort_order": 20,
    },
    {
        "name": "Annual",
        "slug": "annual",
        "description": "Everything in Premium with two months on us.",
        "price": "149.90",
        "billing_period": "yearly",
        "features": ["4K Ultra HD", "4 screens at a time", "Offline downloads", "Priority support", "Best annual value"],
        "sort_order": 30,
    },
)


def seed_plans(apps, schema_editor):
    Plan = apps.get_model("subscriptions", "SubscriptionPlan")
    for plan in PLANS:
        Plan.objects.update_or_create(slug=plan["slug"], defaults=plan)


def remove_plans(apps, schema_editor):
    Plan = apps.get_model("subscriptions", "SubscriptionPlan")
    Plan.objects.filter(slug__in=[plan["slug"] for plan in PLANS]).delete()


class Migration(migrations.Migration):
    dependencies = [("subscriptions", "0001_initial")]
    operations = [migrations.RunPython(seed_plans, remove_plans)]
