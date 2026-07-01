#!/usr/bin/env bash
# Exit on error, treat unset vars as error, and catch pipe failures
set -o errexit -o nounset -o pipefail

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Running database migrations..."
python manage.py migrate

echo "Forging Production Admin..."
# This will silently create the admin using the environment variables we set on Render
if [[ -n "${DJANGO_SUPERUSER_USERNAME}" && -n "${DJANGO_SUPERUSER_EMAIL}" && -n "${DJANGO_SUPERUSER_PASSWORD}" ]]; then
  # Try to create superuser; if already exists, ensure password is set
  python manage.py shell <<PYTHON || true
from django.contrib.auth import get_user_model
User = get_user_model()
username = "${DJANGO_SUPERUSER_USERNAME}"
email = "${DJANGO_SUPERUSER_EMAIL}"
password = "${DJANGO_SUPERUSER_PASSWORD}"
user, created = User.objects.get_or_create(username=username, defaults={'email': email, 'is_superuser': True, 'is_staff': True})
if not created:
    user.email = email
    user.is_superuser = True
    user.is_staff = True
    user.save()
user.set_password(password)
user.save()
print('Superuser created' if created else 'Superuser updated')
PYTHON
  echo "Superuser verified."
fi