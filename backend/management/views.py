# backend/management/views.py
import csv
from django.contrib.auth.models import User
from django.http import HttpResponse # Added for CSV export
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.views import APIView            # Added for custom views
from rest_framework.response import Response        # Added for custom responses
from django.db.models import Count, Sum, Avg             # Added for data aggregation
from .models import Farmer, Crop
from .serializers import FarmerSerializer, CropSerializer
from .sms import send_registration_sms
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny

class CropViewSet(viewsets.ModelViewSet):
    queryset = Crop.objects.all()
    serializer_class = CropSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class FarmerViewSet(viewsets.ModelViewSet):
    queryset = Farmer.objects.all().order_by('-onboarded_at') # Newest farmers first    
    serializer_class = FarmerSerializer
    permission_classes = [AllowAny] # We will override this in get_permissions()


    def perform_create(self, serializer):
       # 1. Pop the password out of the data before saving the farmer
        password = serializer.validated_data.pop('password')
        phone_number = serializer.validated_data.get('phone_number')
        
        # 2. Create the secure Django auth account using the phone number as the username
        user_account = User.objects.create_user(username=phone_number, password=password)
        
        # 3. Save the Farmer to the database, explicitly linking the new user account
        farmer = serializer.save(user=user_account)
        
        # 4. Trigger your existing SMS code
        farmer_name = farmer.full_name
        acreage = farmer.acreage
        subcounty = farmer.subcounty

        send_registration_sms(
            farmer_name=farmer_name,
            phone_number=phone_number,
            acreage=acreage,
            subcounty=subcounty
        )
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Returns the profile of the currently logged-in farmer."""
        try:
            # request.user is automatically determined by the JWT token!
            farmer = request.user.farmer 
            serializer = self.get_serializer(farmer)
            return Response(serializer.data)
        except Exception:
            return Response({"error": "No farmer profile linked to this account."}, status=404)
            
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

class ExportFarmersCSVView(APIView):
    permission_classes = [IsAuthenticated] # Keep it locked down!

    def get(self, request):
        # 1. Set up the response to tell the browser "This is a downloadable file"
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="taita_taveta_farmers.csv"'

        # 2. Create the CSV writer
        writer = csv.writer(response)
        
        # 3. Write the Header Row
        writer.writerow(['ID', 'Full Name', 'Phone Number', 'Subcounty', 'Acreage', 'Active Crops', 'Date Registered'])

        # 4. Fetch all farmers and write their data row by row
        farmers = Farmer.objects.all().prefetch_related('crops')
        
        for farmer in farmers:
            # Because crops are a Many-to-Many relationship, we join them into a single string (e.g., "Maize, Green Grams")
            crop_names = ", ".join([crop.name.replace('_', ' ') for crop in farmer.crops.all()])
            
            writer.writerow([
                farmer.id,
                farmer.full_name,
                farmer.phone_number,
                farmer.get_subcounty_display(),
                farmer.acreage,
                crop_names,
                farmer.onboarded_at.strftime('%Y-%m-%d %H:%M') # Format the date cleanly
            ])

        return response