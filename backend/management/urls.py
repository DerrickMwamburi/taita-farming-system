# backend/management/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FarmerViewSet, CropViewSet, RegionalAnalyticsView

router = DefaultRouter()
router.register(r'farmers', FarmerViewSet)
router.register(r'crops', CropViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Add the custom analytics endpoint here:
    path('analytics/regional/', RegionalAnalyticsView.as_view(), name='regional-analytics'),
]