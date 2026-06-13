from django.db import models
from django.conf import settings

class Movie(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    release_date = models.DateField()
    duration_minutes = models.IntegerField()
    language = models.CharField(max_length=100)
    rating = models.CharField(max_length=10, help_text="e.g., PG-13, R")
    genre = models.CharField(max_length=100)
    trailer_url = models.URLField(blank=True, null=True)
    poster_image = models.URLField(blank=True, null=True)
    cast = models.TextField(blank=True, null=True, help_text="Comma separated cast members")
    
    # New fields
    moods = models.CharField(max_length=255, blank=True, null=True) # e.g., "Happy,Excited"
    is_trending = models.BooleanField(default=False)
    is_upcoming = models.BooleanField(default=False)
    is_premiere = models.BooleanField(default=False)
    is_new_release = models.BooleanField(default=False)
    is_most_booked = models.BooleanField(default=False)
    votes = models.IntegerField(default=0)
    available_offers = models.JSONField(default=list, blank=True) # List of strings/objects
    cast_and_crew = models.JSONField(default=list, blank=True) # List of dicts {name, role, image}

    def __str__(self):
        return self.title

class Watchlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='watchlist')
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='watchlisted_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'movie')

    def __str__(self):
        return f"{self.user.username} - {self.movie.title}"

class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'movie')

    def __str__(self):
        return f"{self.movie.title} review by {self.user.username}"
