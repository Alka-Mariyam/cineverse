from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Booking, BookedSeat
from theatres.models import Show

@shared_task
def expire_unconfirmed_reservations():
    """
    Finds all 'Reserved' bookings. If the current time is past
    (show_datetime - 24 hours), the reservation expires and is cancelled.
    """
    now = timezone.now()
    # Let's filter out pending or reserved bookings
    reservations = Booking.objects.filter(status='Reserved')
    
    expired_count = 0
    for booking in reservations:
        # Construct timezone aware datetime of the show
        show_datetime = timezone.make_aware(
            timezone.datetime.combine(booking.show.date, booking.show.start_time)
        )
        
        expiration_deadline = show_datetime - timedelta(days=1)
        
        if now >= expiration_deadline:
            # Expire the reservation
            booking.status = 'Cancelled'
            booking.save()
            # Release the seats
            booking.booked_seats.all().delete()
            expired_count += 1
            
    return f"Expired {expired_count} reservations."
