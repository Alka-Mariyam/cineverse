from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import User
from .serializers import UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

# We can just use TokenObtainPairView for login directly in urls.py
