from rest_framework import serializers
from .models import Theatre, Screen, Show, Seat

class TheatreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Theatre
        fields = '__all__'

class ScreenSerializer(serializers.ModelSerializer):
    theatre = TheatreSerializer(read_only=True)
    class Meta:
        model = Screen
        fields = '__all__'

class ShowSerializer(serializers.ModelSerializer):
    screen = ScreenSerializer(read_only=True)
    movie_title = serializers.CharField(source='movie.title', read_only=True)
    
    class Meta:
        model = Show
        fields = '__all__'

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = '__all__'
