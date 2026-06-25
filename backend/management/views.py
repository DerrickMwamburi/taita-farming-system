# backend/management/views.py
import csv
import random
from django.contrib.auth.models import User
from django.http import HttpResponse # Added for CSV export
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.views import APIView            # Added for custom views
from rest_framework.response import Response        # Added for custom responses
from django.db.models import Count, Sum, Avg             # Added for data aggregation
from .models import Farmer, Crop, FarmActivity
from .serializers import FarmerSerializer, CropSerializer
from .sms import send_registration_sms
from rest_framework.decorators import action, api_view, permission_classes

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

    # 1. Add 'patch' and 'put' to the allowed methods
    @action(detail=False, methods=['get', 'patch', 'put'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Returns or updates the profile of the currently logged-in farmer."""
        try:
            farmer = request.user.farmer 
            
            # 2. If it's a GET request, just return the data like before
            if request.method == 'GET':
                serializer = self.get_serializer(farmer)
                return Response(serializer.data)
                
            # 3. If it's a PATCH request, update the data securely
            elif request.method in ['PATCH', 'PUT']:
                # partial=True allows them to update just one field (like acreage) without sending everything
                serializer = self.get_serializer(farmer, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)
                return Response(serializer.errors, status=400)
                
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

@api_view(['GET'])
@permission_classes([AllowAny])
def mock_market_prices(request):
    """
    Simulates the Shamba Records / Africa API market price endpoint for Taita-Taveta.
    Returns slightly randomized data so it feels 'live' every time you refresh.
    """
    
    # We add slight random fluctuations to make the prototype feel like a live market feed
    fluctuation = random.choice([-100, 0, 50, 150, -50])
    
    mock_data = {
        "status": "success",
        "source": "Mock Agritech API Sandbox",
        "region": "taita-taveta",
        "prices": [
            {
                "crop_name": "Maize (90kg)",
                "current_price": 3200 + fluctuation,
                "price_trend": "up" if fluctuation > 0 else ("down" if fluctuation < 0 else "stable")
            },
            {
                "crop_name": "Groundnuts (90kg)",
                "current_price": 8500 + random.choice([-200, 0, 300]),
                "price_trend": "down"
            },
            {
                "crop_name": "Green Gram (Crate)",
                "current_price": 2800 + random.choice([-50, 50, 100]),
                "price_trend": "up"
            },
            {
                "crop_name": "Macadamia (Net)",
                "current_price": 1200 + random.choice([0, -20, 20]),
                "price_trend": "stable"
            }
        ]
    }
    
    return Response(mock_data)

# In backend/management/views.py

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def farm_activities(request):
    # Change request.user.farmerprofile to request.user.farmer
    farmer = request.user.farmer
    
    if request.method == 'GET':
        activities = FarmActivity.objects.filter(farmer=farmer).order_by('-date_added')
        data = [{"id": a.id, "task": a.task, "cost": float(a.cost), "completed": a.completed} for a in activities]
        return Response(data)
        
    elif request.method == 'POST':
        task = request.data.get('task')
        cost = request.data.get('cost', 0)
        activity = FarmActivity.objects.create(farmer=farmer, task=task, cost=cost)
        return Response({"id": activity.id, "task": activity.task, "cost": float(activity.cost), "completed": activity.completed})

@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def farm_activity_detail(request, pk):
    try:
        # Change request.user.farmerprofile to request.user.farmer
        activity = FarmActivity.objects.get(pk=pk, farmer=request.user.farmer)
    except FarmActivity.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
        
    if request.method == 'PATCH':
        if 'task' in request.data: activity.task = request.data['task']
        if 'cost' in request.data: activity.cost = request.data['cost']
        if 'completed' in request.data: activity.completed = request.data['completed']
        activity.save()
        return Response({"id": activity.id, "task": activity.task, "cost": float(activity.cost), "completed": activity.completed})
        
    elif request.method == 'DELETE':
        activity.delete()
        return Response(status=204)      