from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QRCodeViewSet

router = DefaultRouter()
router.register(r'', QRCodeViewSet, basename='qr')

urlpatterns = [
    path('', include(router.urls)),
]
