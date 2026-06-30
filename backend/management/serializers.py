# backend/management/serializers.py
from rest_framework import serializers
from .models import Farmer, Crop, SystemAlert, SupportTicket, BackupLog
from django.contrib.auth.models import User

class CropSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crop
        fields = '__all__'

class FarmerSerializer(serializers.ModelSerializer):
    crop_details = CropSerializer(source='crops', many=True, read_only=True)
    
    crops = serializers.PrimaryKeyRelatedField(
        queryset=Crop.objects.all(),
        many=True,
        write_only=True
    )

    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    # --- NEW CALCULATED FIELD ---
    projected_revenue_kes = serializers.SerializerMethodField()

    class Meta:
        model = Farmer
        fields = [
            'id', 'full_name', 'phone_number', 
            'subcounty', 'acreage', 'crops', 'crop_details', 
            'password', 'onboarded_at', 'projected_revenue_kes' # Add it to fields!
        ]

    # --- THE MATH ENGINE ---
    def get_projected_revenue_kes(self, obj):
        total_revenue = 0
        acreage = float(obj.acreage)
        
        # If they haven't selected crops, return 0
        if not obj.crops.exists():
            return 0
            
        # We assume the farmer divides their land equally among chosen crops
        acres_per_crop = acreage / obj.crops.count()
        
        for crop in obj.crops.all():
            yield_amount = float(crop.expected_yield_per_acre) * acres_per_crop
            revenue = yield_amount * float(crop.price_per_unit)
            total_revenue += revenue
            
        return round(total_revenue, 2)

    class Meta:
        model = Farmer
        # We now use the standard full_name field
        fields = [
            'id', 'full_name', 'phone_number', 
            'subcounty',  'acreage', 'crops', 'crop_details',
            'password', 'onboarded_at', 'projected_revenue_kes'
        ]

class SystemAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemAlert
        fields = '__all__'

class SupportTicketSerializer(serializers.ModelSerializer):
    # This will allow the frontend to display the farmer's name easily
    farmer_name = serializers.CharField(source='farmer.full_name', read_only=True)
    location = serializers.CharField(source='farmer.subcounty', read_only=True)

    class Meta:
        model = SupportTicket
        fields = ['id', 'farmer', 'farmer_name', 'location', 'issue_description', 'status', 'created_at', 'updated_at']
        read_only_fields = ['farmer'] # Prevent manual manipulation of the farmer ID

class BackupLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackupLog
        fields = '__all__'

class AdminUserSerializer(serializers.ModelSerializer):
    # Make password write-only so it never gets sent back to the frontend
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'is_superuser', 'is_staff', 'date_joined', 'is_active']

    def create(self, validated_data):
        # Securely create the user and hash the password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            is_staff=True, # Force staff status so they can access the dashboard
            is_superuser=validated_data.get('is_superuser', False)
        )
        return user