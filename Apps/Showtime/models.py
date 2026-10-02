from datetime import timedelta
from django.db import models
from Apps.Movie.models import Movie
from Apps.Theater.models import Screen


class Showtime(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='showtimes')
    screen = models.ForeignKey(Screen, on_delete=models.CASCADE, related_name='showtimes')
    start_time = models.DateTimeField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['start_time']
        unique_together = ('screen', 'start_time')

    def __str__(self):
        return f"{self.movie.title} @ {self.screen} — {self.start_time:%Y-%m-%d %H:%M}"

    @property
    def end_time(self):
        return self.start_time + timedelta(minutes=self.movie.duration_min)