from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta

from movies.models import Movie
from theatres.models import Screen, Show
from bookings.models import Booking

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        seven_days_ago = now - timedelta(days=7)
        one_day_ago = now - timedelta(days=1)

        total_movies = Movie.objects.count()
        total_screens = Screen.objects.count()
        total_shows = Show.objects.count()
        
        # Booking Stats
        confirmed_bookings = Booking.objects.filter(status='Confirmed')
        total_bookings = confirmed_bookings.count()
        total_revenue = confirmed_bookings.aggregate(Sum('total_amount'))['total_amount__sum'] or 0.00

        # Revenue Breakdown
        daily_revenue = confirmed_bookings.filter(created_at__gte=one_day_ago).aggregate(Sum('total_amount'))['total_amount__sum'] or 0.00
        weekly_revenue = confirmed_bookings.filter(created_at__gte=seven_days_ago).aggregate(Sum('total_amount'))['total_amount__sum'] or 0.00
        monthly_revenue = confirmed_bookings.filter(created_at__gte=thirty_days_ago).aggregate(Sum('total_amount'))['total_amount__sum'] or 0.00

        # Most Booked Movies
        most_booked = (
            Booking.objects.filter(status='Confirmed')
            .values('show__movie__title')
            .annotate(total_bookings=Count('id'))
            .order_by('-total_bookings')[:5]
        )

        return Response({
            "total_movies": total_movies,
            "total_screens": total_screens,
            "total_shows": total_shows,
            "total_bookings": total_bookings,
            "total_revenue": float(total_revenue),
            "daily_revenue": float(daily_revenue),
            "weekly_revenue": float(weekly_revenue),
            "monthly_revenue": float(monthly_revenue),
            "most_booked_movies": list(most_booked)
        })
