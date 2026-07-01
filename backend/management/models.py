from django.db import models
from django.contrib.auth.models import User

class Crop(models.Model):
    # Notice we removed CROP_CHOICES entirely!
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)

    # --- SMART FEATURES ---
    expected_yield_per_acre = models.DecimalField(max_digits=6, decimal_places=2, default=15.00) 
    price_per_unit = models.DecimalField(max_digits=8, decimal_places=2, default=3000.00)
    unit_measure = models.CharField(max_length=50, default='90kg bags')

    def __str__(self):
        # Changed this from get_name_display() because choices are gone
        return self.name

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
    otp_code = models.CharField(max_length=6, blank=True, null=True)

    def __str__(self):
        return f"{self.full_name} - {self.get_subcounty_display()}"


class FarmActivity(models.Model):
    # Change FarmerProfile to 'Farmer' (or whatever your exact class name is at the top of the file)
    farmer = models.ForeignKey('Farmer', on_delete=models.CASCADE, related_name='activities')
    task = models.CharField(max_length=255)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    completed = models.BooleanField(default=False)
    date_added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # Update this to match the fields in your actual Farmer model
        return f"{self.task} - {self.farmer.phone_number}"

class SystemAlert(models.Model):
    CATEGORY_CHOICES = [
        ('WEATHER', 'Weather Alert'),
        ('KALRO', 'KALRO Advisory'),
        ('MARKET', 'Market Update'),
        ('SYSTEM', 'System Notice'),
    ]
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='SYSTEM')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at'] # Ensures the newest alerts always show up first

    def __str__(self):
        return f"{self.get_category_display()}: {self.title}"

# ==========================================
# --- NEW: SUPPORT DESK & DATA VAULT ---
# ==========================================

class SupportTicket(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
    ]
    
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='support_tickets')
    issue_description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Ticket #{self.id} - {self.farmer.full_name} ({self.status})"

class BackupLog(models.Model):
    TYPE_CHOICES = [
        ('Automated', 'Automated'),
        ('Manual', 'Manual'),
    ]
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Verified', 'Verified'),
        ('Failed', 'Failed'),
    ]

    file_name = models.CharField(max_length=255, help_text="Name of the generated .sql or .dump file")
    file_size = models.CharField(max_length=50, default="0 MB") 
    backup_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='Manual')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Verified')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Backup: {self.file_name} [{self.status}]"