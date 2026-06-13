from django.db import models
from movies.models import Movie

class Theatre(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    city = models.CharField(max_length=100, default='Metropolis')

    def __str__(self):
        return self.name

class Screen(models.Model):
    theatre = models.ForeignKey(Theatre, on_delete=models.CASCADE, related_name='screens')
    name = models.CharField(max_length=100)
    total_seats = models.IntegerField()

    def __str__(self):
        return f"{self.theatre.name} - {self.name}"

class Show(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='shows')
    screen = models.ForeignKey(Screen, on_delete=models.CASCADE, related_name='shows')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    base_price = models.DecimalField(max_digits=8, decimal_places=2, default=150.00)

    def __str__(self):
        return f"{self.movie.title} at {self.screen.theatre.name} - {self.start_time}"

class Seat(models.Model):
    screen = models.ForeignKey(Screen, on_delete=models.CASCADE, related_name='seats')
    row = models.CharField(max_length=5)
    number = models.IntegerField()
    seat_type = models.CharField(max_length=50, default='Standard')
    
    class Meta:
        unique_together = ('screen', 'row', 'number')

    def __str__(self):
        return f"{self.row}{self.number} ({self.seat_type})"
