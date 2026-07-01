# backend/core/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Our Farming Management API endpoints
    path('api/', include('management.urls')),
    
    # Standard JWT Authentication endpoints (No Firebase!)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

from django.contrib.auth.models import User
from django.db import OperationalError, ProgrammingError

# --- FORCE CREATE ADMIN ON BOOT (Overrides Render's SQLite wipe) ---
try:
    admin_user = "admin_katute"
    admin_email = "admin@taitataveta.go.ke"
    admin_pass = "AgriNetMasterKey2026!" # Use this exact password to test

    if not User.objects.filter(username=admin_user).exists():
        User.objects.create_superuser(admin_user, admin_email, admin_pass)
        print("SUCCESS: Forged Admin User!")
except (OperationalError, ProgrammingError):
    pass