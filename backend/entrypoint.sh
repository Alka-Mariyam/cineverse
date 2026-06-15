#!/bin/bash

# Exit on error
set -e

echo "Running Django migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting server..."
# Pass the command to the main Docker execution
exec "$@"
