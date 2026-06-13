from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Theatre, Screen, Show, Seat
from .serializers import TheatreSerializer, ScreenSerializer, ShowSerializer, SeatSerializer

class TheatreViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Theatre.objects.all()
    serializer_class = TheatreSerializer

class ShowViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Show.objects.all()
    serializer_class = ShowSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['movie', 'date', 'screen__theatre']

    @action(detail=True, methods=['get'])
    def seat_statuses(self, request, pk=None):
        show = self.get_object()
        from bookings.models import BookedSeat, GroupBookingSeat
        
        # Booked seats (Confirmed)
        booked_seats = BookedSeat.objects.filter(booking__show=show, booking__status='Confirmed').values_list('seat_id', flat=True)
        
        # Reserved seats (Reserved or Pending Group Booking)
        reserved_seats = list(BookedSeat.objects.filter(booking__show=show, booking__status='Reserved').values_list('seat_id', flat=True))
        group_reserved = list(GroupBookingSeat.objects.filter(group_booking__show=show, group_booking__status='Pending').values_list('seat_id', flat=True))
        
        reserved_seats.extend(group_reserved)
        
        return Response({
            'booked': list(booked_seats),
            'reserved': list(set(reserved_seats))
        })

class SeatViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Seat.objects.all()
    serializer_class = SeatSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['screen']
