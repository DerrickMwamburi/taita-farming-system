from django.contrib import admin
from .models import Crop, Farmer

@admin.register(Crop)
class CropAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')

@admin.register(Farmer)
class FarmerAdmin(admin.ModelAdmin):
    # Replaced 'user' with 'full_name'
    list_display = ('full_name', 'phone_number', 'subcounty', 'onboarded_at')
    
    list_filter = ('subcounty', 'crops')
    
    # Replaced 'user__username' with 'full_name'
    search_fields = ('full_name', 'phone_number')