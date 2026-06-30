import os
import sys
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings') # Ensure this matches your project folder name

application = get_wsgi_application()

# --- NEW: RUNTIME MIGRATION BLOWOUT ---
# This forces Django to run migrations on the live Postgres database at startup
if 'render' in os.environ.get('RENDER_EXTERNAL_URL', ''):
    from django.core.management import call_command
    try:
        print("Executing runtime database migrations against PostgreSQL...")
        call_command('migrate', interactive=False)
        
        # Automatically create your admin user if it's not there
        os.environ.setdefault('DJANGO_SUPERUSER_PASSWORD', 'Taita2026!') # Fallback password if env var is missing
        call_command('createsuperuser', '--noinput', '--username', 'admin_katute', '--email', 'admin@example.com', verbosity=0)
        print("Runtime database setup complete!")
    except Exception as e:
        print(f"Runtime migration notice: {e}", file=sys.stderr)