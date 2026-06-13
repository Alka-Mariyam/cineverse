from rest_framework import serializers
from .models import Movie, Watchlist, Review
from users.serializers import UserSerializer

class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['user', 'movie']

class WatchlistSerializer(serializers.ModelSerializer):
    movie = MovieSerializer(read_only=True)
    
    class Meta:
        model = Watchlist
        fields = '__all__'
        read_only_fields = ['user']
