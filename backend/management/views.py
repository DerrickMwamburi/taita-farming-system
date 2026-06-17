# backend/management/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.views import APIView            # Added for custom views
from rest_framework.response import Response        # Added for custom responses
from django.db.models import Count, Sum, Avg             # Added for data aggregation
from .models import Farmer, Crop
from .serializers import FarmerSerializer, CropSerializer

class CropViewSet(viewsets.ModelViewSet):
    queryset = Crop.objects.all()
    serializer_class = CropSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class FarmerViewSet(viewsets.ModelViewSet):
    queryset = Farmer.objects.all()
    serializer_class = FarmerSerializer

    # Custom permission logic: 
    # Anyone can submit a form (create), but you must be logged in to read or edit.
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticatedOrReadOnly]
        return [permission() for permission in permission_classes]

        # --- NEW ANALYTICS VIEW ---
class RegionalAnalyticsView(APIView):
    # This is highly sensitive data; it MUST be locked behind JWT authentication
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        total_farmers = Farmer.objects.count()
        
       # Calculate total acreage across the entire network
        total_acreage_dict = Farmer.objects.aggregate(total=Sum('acreage'))
        total_acreage = total_acreage_dict['total'] or 0.00
        
        # Count farmers AND sum/average acreage per subcounty
        subcounty_data = Farmer.objects.values('subcounty').annotate(
            count=Count('id'),
            total_acres=Sum('acreage'),
            avg_acres=Avg('acreage')
        ).order_by('-count')
        
        # Count how many farmers are growing each crop
        crop_data = Crop.objects.annotate(
            farmer_count=Count('farmers')
        ).values('name', 'farmer_count').order_by('-farmer_count')
        
        return Response({
            'total_farmers': total_farmers,
            'total_acreage': round(total_acreage, 2),
            'subcounty_distribution': list(subcounty_data),
            'crop_popularity': list(crop_data)
        })