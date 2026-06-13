from django.db import models
from django.conf import settings
from theatres.models import Show, Seat
import uuid

class Booking(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Reserved', 'Reserved'),
        ('Confirmed', 'Confirmed'),
        ('Cancelled', 'Cancelled'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    show = models.ForeignKey(Show, on_delete=models.CASCADE, related_name='bookings')
    total_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    stripe_session_id = models.CharField(max_length=255, blank=True, null=True)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking #{self.id} - {self.user.username} - {self.status}"

class BookedSeat(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='booked_seats')
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        unique_together = ('booking', 'seat')

    def __str__(self):
        return f"{self.seat} for {self.booking}"

class GroupBooking(models.Model):
    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='group_bookings')
    show = models.ForeignKey(Show, on_delete=models.CASCADE, related_name='group_bookings')
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    status = models.CharField(max_length=20, choices=Booking.STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"GroupBooking {self.token} by {self.organizer.username}"

class GroupBookingSeat(models.Model):
    group_booking = models.ForeignKey(GroupBooking, on_delete=models.CASCADE, related_name='group_seats')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('group_booking', 'seat')

    def __str__(self):
        return f"{self.user.username} picked {self.seat} for Group {self.group_booking.token}"
