import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cineverse_backend.settings')

app = Celery('cineverse_backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
