#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input

# 1. This will fix the 500 error by creating the PostgreSQL tables
python manage.py migrate

# 2. This creates your cloud Admin account. 
# The "|| true" part tells the script not to crash if the user already exists on future deploys.
python manage.py createsuperuser --noinput --username katute --email katute80@gmail.com || true