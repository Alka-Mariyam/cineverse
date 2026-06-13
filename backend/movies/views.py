from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Movie, Watchlist, Review
from .serializers import MovieSerializer, WatchlistSerializer, ReviewSerializer

class MovieViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_trending', 'is_upcoming', 'language', 'genre', 'rating']

    def get_queryset(self):
        queryset = super().get_queryset()
        mood = self.request.query_params.get('mood', None)
        if mood is not None:
            queryset = queryset.filter(moods__icontains=mood)
        return queryset

    @action(detail=True, methods=['get', 'post'], permission_classes=[IsAuthenticatedOrReadOnly])
    def reviews(self, request, pk=None):
        movie = self.get_object()
        
        if request.method == 'GET':
            reviews = Review.objects.filter(movie=movie).order_by('-created_at')
            serializer = ReviewSerializer(reviews, many=True)
            return Response(serializer.data)
            
        elif request.method == 'POST':
            # Check if user already reviewed
            if Review.objects.filter(movie=movie, user=request.user).exists():
                return Response({"error": "You have already reviewed this movie."}, status=status.HTTP_400_BAD_REQUEST)
                
            serializer = ReviewSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user, movie=movie)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def review_summary(self, request, pk=None):
        movie = self.get_object()
        reviews = Review.objects.filter(movie=movie)
        
        if not reviews.exists():
            return Response({
                "sentiment": "Neutral",
                "average_rating": 0,
                "total_reviews": 0,
                "positive_highlights": ["No reviews yet"],
                "negative_highlights": ["No reviews yet"]
            })
            
        avg_rating = sum(r.rating for r in reviews) / reviews.count()
        sentiment = "Overwhelmingly Positive" if avg_rating >= 4.5 else "Positive" if avg_rating >= 3.5 else "Mixed" if avg_rating >= 2.5 else "Negative"
        
        # Mock NLP extraction of highlights based on rating
        positive_highlights = ["Great acting", "Stunning visuals", "Engaging plot"] if avg_rating >= 3.5 else ["Had potential"]
        negative_highlights = ["A bit long", "Pacing issues"] if avg_rating >= 3.5 else ["Poor script", "Boring", "Bad acting"]
        
        return Response({
            "sentiment": sentiment,
            "average_rating": round(avg_rating, 1),
            "total_reviews": reviews.count(),
            "positive_highlights": positive_highlights,
            "negative_highlights": negative_highlights
        })

class WatchlistViewSet(viewsets.ModelViewSet):
    serializer_class = WatchlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Watchlist.objects.filter(user=self.request.user).order_by('-added_at')

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        movie_id = request.data.get('movie_id')
        if not movie_id:
            return Response({"error": "movie_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            movie = Movie.objects.get(id=movie_id)
        except Movie.DoesNotExist:
            return Response({"error": "Movie not found"}, status=status.HTTP_404_NOT_FOUND)
            
        watchlist_item, created = Watchlist.objects.get_or_create(user=request.user, movie=movie)
        
        if not created:
            # If it already exists, toggling means removing it
            watchlist_item.delete()
            return Response({"status": "removed"}, status=status.HTTP_200_OK)
            
        return Response({"status": "added"}, status=status.HTTP_201_CREATED)
