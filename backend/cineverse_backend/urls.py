from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from movies.views import MovieViewSet, WatchlistViewSet
from movies.views import MovieViewSet, WatchlistViewSet
from theatres.views import TheatreViewSet, ShowViewSet, SeatViewSet
from bookings.views import BookingViewSet, GroupBookingViewSet
from users.views import RegisterView

router = DefaultRouter()
router.register(r'movies', MovieViewSet)
router.register(r'watchlist', WatchlistViewSet, basename='watchlist')
router.register(r'theatres', TheatreViewSet)
router.register(r'shows', ShowViewSet)
router.register(r'seats', SeatViewSet)
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'group-bookings', GroupBookingViewSet, basename='group-booking')

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
