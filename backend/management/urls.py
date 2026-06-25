# backend/management/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FarmerViewSet, CropViewSet, RegionalAnalyticsView, ExportFarmersCSVView
from . import views
router = DefaultRouter()
router.register(r'farmers', FarmerViewSet)
router.register(r'crops', CropViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Add the custom analytics endpoint here:
    path('analytics/regional/', RegionalAnalyticsView.as_view(), name='regional-analytics'),
    path('export/farmers/', ExportFarmersCSVView.as_view(), name='export-farmers'),
    path('market-prices/', views.mock_market_prices, name='mock_market_prices'),
    path('activities/', views.farm_activities, name='farm_activities'),
    path('activities/<int:pk>/', views.farm_activity_detail, name='farm_activity_detail'),
]