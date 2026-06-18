# backend/management/serializers.py
from rest_framework import serializers
from .models import Farmer, Crop

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

    class Meta:
        model = Farmer
        # We now use the standard full_name field
        fields = [
            'id', 'full_name', 'phone_number', 
            'subcounty',  'acreage', 'crops', 'crop_details',
            'password', 'onboarded_at'
        ]