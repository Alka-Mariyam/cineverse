from rest_framework import serializers
from .models import Booking, BookedSeat, GroupBooking, GroupBookingSeat
from theatres.serializers import ShowSerializer, SeatSerializer

class BookedSeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookedSeat
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    booked_seats = BookedSeatSerializer(many=True, read_only=True)
    show = ShowSerializer(read_only=True)
    
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['user', 'total_amount', 'status', 'stripe_session_id', 'qr_code']

class CreateBookingSerializer(serializers.Serializer):
    show_id = serializers.IntegerField()
    seat_ids = serializers.ListField(child=serializers.IntegerField())
    is_reserve = serializers.BooleanField(default=False)

class GroupBookingSeatSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    seat_label = serializers.SerializerMethodField()

    class Meta:
        model = GroupBookingSeat
        fields = ['id', 'user', 'username', 'seat', 'seat_label']

    def get_seat_label(self, obj):
        return f"{obj.seat.row}{obj.seat.number}"

class GroupBookingSerializer(serializers.ModelSerializer):
    group_seats = GroupBookingSeatSerializer(many=True, read_only=True)
    organizer_username = serializers.CharField(source='organizer.username', read_only=True)
    show = ShowSerializer(read_only=True)

    class Meta:
        model = GroupBooking
        fields = ['id', 'token', 'show', 'organizer', 'organizer_username', 'status', 'created_at', 'group_seats']
        read_only_fields = ['token', 'organizer', 'status', 'show']
