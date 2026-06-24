from django.db import models
from django.contrib.auth.models import User

class Crop(models.Model):
    CROP_CHOICES = [
        ('MAIZE', 'Maize'),
        ('GROUNDNUTS', 'Groundnuts'),
        ('GREEN_GRAMS', 'Green Grams'),
        ('MACADAMIA', 'Macadamia'),
        ('OTHER', 'Other'),
    ]
    name = models.CharField(max_length=50, choices=CROP_CHOICES, unique=True)
    description = models.TextField(blank=True, null=True)

    # --- NEW SMART FEATURES ---
    # How many units (e.g., bags/kg) a standard acre produces
    expected_yield_per_acre = models.DecimalField(max_digits=6, decimal_places=2, default=15.00) 
    # Current market price per unit in KES
    price_per_unit = models.DecimalField(max_digits=8, decimal_places=2, default=3000.00)
    # What are we measuring? (bags, kg, tons)
    unit_measure = models.CharField(max_length=50, default='90kg bags')

    def __str__(self):
        return self.get_name_display()

class Farmer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    SUBCOUNTY_CHOICES = [
        ('MWATATE', 'Mwatate'),
        ('VOI', 'Voi'),
        ('WUNDANYI', 'Wundanyi'),
        ('TAVETA', 'Taveta'),
    ]
    
    # We will add a 'name' field so they can introduce themselves on the form
    full_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15, unique=True)
    subcounty = models.CharField(max_length=50, choices=SUBCOUNTY_CHOICES)
    acreage = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    crops = models.ManyToManyField(Crop, related_name='farmers')
    onboarded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} - {self.get_subcounty_display()}"