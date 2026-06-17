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

    def __str__(self):
        return self.get_name_display()

class Farmer(models.Model):
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
    crops = models.ManyToManyField(Crop, related_name='farmers')
    onboarded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} - {self.get_subcounty_display()}"