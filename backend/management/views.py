# backend/management/views.py
import os
import csv
import random
import shutil
import subprocess
import requests
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import User
from django.http import HttpResponse 
from rest_framework import viewsets, permissions, status
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.views import APIView       
from rest_framework.response import Response    
from django.db.models import Count, Sum, Avg     
from .models import Farmer, Crop, FarmActivity, SystemAlert, SupportTicket, BackupLog
from .serializers import FarmerSerializer, CropSerializer, SystemAlertSerializer, SupportTicketSerializer, BackupLogSerializer,AdminUserSerializer
from .sms import send_registration_sms, broadcast_campaign_sms, send_otp_sms
from rest_framework.decorators import action, api_view, permission_classes

class CropViewSet(viewsets.ModelViewSet):
    queryset = Crop.objects.all()
    serializer_class = CropSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class FarmerViewSet(viewsets.ModelViewSet):
    queryset = Farmer.objects.all().order_by('-onboarded_at') 
    serializer_class = FarmerSerializer
    permission_classes = [AllowAny] 

    def perform_create(self, serializer):
        # 1. Pop the password out of the data before saving the farmer
        password = serializer.validated_data.pop('password')
        phone_number = serializer.validated_data.get('phone_number')
        
        # 2. Create the secure Django auth account using the phone number as the username
        user_account = User.objects.create_user(username=phone_number, password=password, is_active=False)
        
        # Generate a random 6-digit code
        otp = str(random.randint(100000, 999999))
        
        # 3. Save the Farmer to the database, explicitly linking the new user account
        farmer = serializer.save(user=user_account, otp_code=otp)

        # 4. ONLY trigger the OTP SMS here. (Welcome SMS moved to verify_otp)
        send_otp_sms(phone_number=phone_number, otp_code=otp) 

    @action(detail=False, methods=['get', 'patch', 'put'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Returns or updates the profile of the currently logged-in farmer."""
        try:
            farmer = request.user.farmer 
            
            if request.method == 'GET':
                serializer = self.get_serializer(farmer)
                return Response(serializer.data)
                
            elif request.method in ['PATCH', 'PUT']:
                serializer = self.get_serializer(farmer, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)
                return Response(serializer.errors, status=400)
                
        except Exception:
            return Response({"error": "No farmer profile linked to this account."}, status=404)

class RegionalAnalyticsView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        total_farmers = Farmer.objects.count()
        
        total_acreage_dict = Farmer.objects.aggregate(total=Sum('acreage'))
        total_acreage = total_acreage_dict['total'] or 0.00
        
        subcounty_data = Farmer.objects.values('subcounty').annotate(
            count=Count('id'),
            total_acres=Sum('acreage'),
            avg_acres=Avg('acreage')
        ).order_by('-count')
        
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
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="taita_taveta_farmers.csv"'

        writer = csv.writer(response)
        writer.writerow(['ID', 'Full Name', 'Phone Number', 'Subcounty', 'Acreage', 'Active Crops', 'Date Registered'])

        farmers = Farmer.objects.all().prefetch_related('crops')
        
        for farmer in farmers:
            crop_names = ", ".join([crop.name.replace('_', ' ') for crop in farmer.crops.all()])
            
            writer.writerow([
                farmer.id,
                farmer.full_name,
                farmer.phone_number,
                farmer.get_subcounty_display(),
                farmer.acreage,
                crop_names,
                farmer.onboarded_at.strftime('%Y-%m-%d %H:%M') 
            ])

        return response

@api_view(['GET'])
@permission_classes([AllowAny])
def mock_market_prices(request):
    """
    Simulates the Shamba Records / Africa API market price endpoint for Taita-Taveta.
    """
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

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def farm_activities(request):
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

class SystemAlertViewSet(viewsets.ModelViewSet):
    queryset = SystemAlert.objects.all()
    serializer_class = SystemAlertSerializer

class SupportTicketViewSet(viewsets.ModelViewSet):
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return SupportTicket.objects.all()
        return SupportTicket.objects.filter(farmer__user=user)

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user.farmer)

class BackupLogViewSet(viewsets.ModelViewSet):
    queryset = BackupLog.objects.all()
    serializer_class = BackupLogSerializer
    permission_classes = [permissions.IsAdminUser]

    def create(self, request, *args, **kwargs):
        backup_dir = os.path.join(settings.BASE_DIR, 'database_vault')
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)

        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        db_config = settings.DATABASES['default']
        db_engine = db_config['ENGINE']

        if 'postgresql' in db_engine:
            file_name = f"agrinet_prod_{timestamp}.dump"
        else:
            file_name = f"agrinet_dev_{timestamp}.sqlite3"

        file_path = os.path.join(backup_dir, file_name)
        
        try:
            if 'postgresql' in db_engine:
                env = os.environ.copy()
                env['PGPASSWORD'] = db_config['PASSWORD']
                
                cmd = [
                    'pg_dump',
                    '-h', db_config['HOST'] or 'localhost',
                    '-p', str(db_config['PORT'] or 5432),
                    '-U', db_config['USER'],
                    '-F', 'c', 
                    '-b',      
                    '-v',      
                    '-f', file_path,
                    db_config['NAME']
                ]
                subprocess.run(cmd, env=env, check=True, capture_output=True)
            
            elif 'sqlite3' in db_engine:
                source_db = db_config['NAME']
                if os.path.exists(source_db):
                    shutil.copy2(source_db, file_path)
                else:
                    raise FileNotFoundError("Active SQLite database file could not be located.")
            else:
                return Response(
                    {"error": f"Database engine {db_engine} is not supported by Data Vault."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            bytes_size = os.path.getsize(file_path)
            mb_size = f"{max(0.1, round(bytes_size / (1024 * 1024), 2))} MB"

            backup_entry = BackupLog.objects.create(
                file_name=file_name,
                file_size=mb_size,
                backup_type='Manual',
                status='Verified'
            )

            serializer = self.get_serializer(backup_entry)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except (subprocess.CalledProcessError, Exception) as e:
            failed_entry = BackupLog.objects.create(
                file_name=file_name if 'file_name' in locals() else f"failed_snapshot_{timestamp}.err",
                file_size="0 MB",
                backup_type='Manual',
                status='Failed'
            )
            return Response(
                {
                    "error": "The database engine rejected the snapshot generation.",
                    "details": str(e),
                    "logged_entry": BackupLogSerializer(failed_entry).data
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class BroadcastSMSView(APIView):
    permission_classes = [permissions.IsAdminUser] # Strictly Admin-only

    def post(self, request):
        target_subcounty = request.data.get('targetSubcounty', 'All')
        target_crop = request.data.get('targetCrop', 'All')
        message = request.data.get('message', '')

        if not message:
            return Response({"error": "Message body cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Start with all farmers
        farmers_query = Farmer.objects.all()
        
        # 2. Filter by Subcounty if specified
        if target_subcounty != 'All':
            farmers_query = farmers_query.filter(subcounty=target_subcounty.upper())
            
        # 3. Filter by Crop if specified
        if target_crop != 'All':
            farmers_query = farmers_query.filter(crops__name=target_crop)

        # 4. Extract a flat, distinct list of phone numbers
        phone_numbers = list(farmers_query.values_list('phone_number', flat=True).distinct())

        if not phone_numbers:
            return Response({"error": "No farmers match these criteria."}, status=status.HTTP_404_NOT_FOUND)

        # 5. Blast the message through Africa's Talking
        response = broadcast_campaign_sms(phone_numbers, message)

        return Response({
            "success": True,
            "recipients_count": len(phone_numbers),
            "gateway_response": response
        }, status=status.HTTP_200_OK)

class LocalWeatherView(APIView):
    permission_classes = [IsAuthenticated] # Farmers must be logged in

    def get(self, request):
        try:
            # 1. Identify the logged-in farmer's subcounty
            subcounty = request.user.farmer.subcounty
            
            # 2. Map Taita Taveta subcounties to exact GPS coordinates
            coords = {
                'VOI': {'lat': -3.3953, 'lon': 38.5560},
                'MWATATE': {'lat': -3.5047, 'lon': 38.3778},
                'WUNDANYI': {'lat': -3.3983, 'lon': 38.3644},
                'TAVETA': {'lat': -3.3985, 'lon': 37.6745},
            }
            
            # Default to Voi if something unexpected happens
            location = coords.get(subcounty, coords['VOI']) 
            
            # 3. Fetch from OpenWeatherMap (Make sure to add OPENWEATHER_API_KEY to your settings.py)
            api_key = getattr(settings, 'OPENWEATHER_API_KEY', 'your_api_key_here')
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={location['lat']}&lon={location['lon']}&units=metric&appid={api_key}"
            
            api_response = requests.get(url)
            
            if api_response.status_code == 200:
                data = api_response.json()
                weather_data = {
                    "location": subcounty.title(),
                    "temperature": round(data['main']['temp']),
                    "description": data['weather'][0]['description'].capitalize(),
                    "humidity": data['main']['humidity'],
                    "wind_speed": data['wind']['speed'],
                    "icon": data['weather'][0]['icon']
                }
                return Response(weather_data, status=status.HTTP_200_OK)
            else:
                # Fallback mock data if the API key is not yet configured
                return Response({
                    "location": subcounty.title(),
                    "temperature": 26,
                    "description": "Partly Cloudy (Mock Data)",
                    "humidity": 65,
                    "wind_speed": 4.2,
                    "icon": "04d",
                    "notice": "Please configure your OpenWeatherMap API Key in settings."
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response({"error": f"Weather Service Offline: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Provides a list and creation endpoint for staff and superusers.
    """
    permission_classes = [permissions.IsAdminUser] 
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        return User.objects.filter(is_staff=True).order_by('-date_joined')

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Returns the profile of the currently logged-in admin"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

# THIS MUST BE FLUSH AGAINST THE LEFT MARGIN (0 SPACES)
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """Checks the OTP and unlocks the farmer's account."""
    phone_number = request.data.get('phone_number')
    provided_otp = request.data.get('otp_code')

    try:
        farmer = Farmer.objects.get(phone_number=phone_number)
        
        if farmer.otp_code == provided_otp:
            farmer.user.is_active = True
            farmer.user.save()
            
            # NOW we send the official welcome SMS since they verified!
            send_registration_sms(
                farmer_name=farmer.full_name,
                phone_number=farmer.phone_number,
                acreage=farmer.acreage,
                subcounty=farmer.subcounty
            )
            
            farmer.otp_code = None
            farmer.save()
            
            return Response({"success": "Account verified and activated!"}, status=200)
        else:
            return Response({"error": "Invalid verification code."}, status=400)
            
    except Farmer.DoesNotExist:
        return Response({"error": "Account not found."}, status=404)