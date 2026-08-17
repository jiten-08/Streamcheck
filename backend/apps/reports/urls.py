from django.urls import path

from .views import ReportsOverviewView

urlpatterns = [path("reports/overview/", ReportsOverviewView.as_view(), name="reports-overview")]
