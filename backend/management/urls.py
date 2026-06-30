# backend/management/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FarmerViewSet, 
    CropViewSet, 
    RegionalAnalyticsView, 
    ExportFarmersCSVView, 
    SystemAlertViewSet, 
    SupportTicketViewSet, 
    BackupLogViewSet,
    BroadcastSMSView,
    LocalWeatherView,
    AdminUserViewSet
)
from . import views

router = DefaultRouter()
router.register(r'farmers', FarmerViewSet)
router.register(r'crops', CropViewSet)
router.register(r'alerts', SystemAlertViewSet)
router.register(r'tickets', SupportTicketViewSet, basename='support-ticket')
router.register(r'backups', BackupLogViewSet, basename='backup-log')
router.register(r'admins', AdminUserViewSet, basename='admin-user')

urlpatterns = [
    path('', include(router.urls)),
    # Custom API Endpoints
    path('analytics/regional/', RegionalAnalyticsView.as_view(), name='regional-analytics'),
    path('export/farmers/', ExportFarmersCSVView.as_view(), name='export-farmers'),
    path('market-prices/', views.mock_market_prices, name='mock_market_prices'),
    path('activities/', views.farm_activities, name='farm_activities'),
    path('activities/<int:pk>/', views.farm_activity_detail, name='farm_activity_detail'),
    path('broadcast-sms/', BroadcastSMSView.as_view(), name='broadcast_sms'),
    path('weather/local/', LocalWeatherView.as_view(), name='local_weather'),
]