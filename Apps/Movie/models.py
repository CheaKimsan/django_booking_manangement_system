from django.db import models


class Movie(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    genre = models.CharField(max_length=100)
    language = models.CharField(max_length=50)
    duration_min = models.PositiveIntegerField()
    release_date = models.DateField(null=True, blank=True)
    poster = models.ImageField(upload_to='movie_posters/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title