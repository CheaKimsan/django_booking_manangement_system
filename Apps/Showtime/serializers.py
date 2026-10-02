from datetime import timedelta

from rest_framework import serializers

from .models import Showtime
from Apps.Movie.models import Movie
from Apps.Theater.models import Screen


class ShowtimeMovieSerializer(serializers.ModelSerializer):
    """Only the movie fields a showtime card needs."""

    class Meta:
        model = Movie
        fields = ['id', 'title', 'genre', 'language', 'duration_min', 'poster']


class ShowtimeScreenSerializer(serializers.ModelSerializer):
    """Screen info without the full seat list."""
    theater_name = serializers.CharField(source='theater.name', read_only=True)

    class Meta:
        model = Screen
        fields = ['id', 'name', 'theater', 'theater_name']


class ShowtimeSerializer(serializers.ModelSerializer):
    movie_detail = ShowtimeMovieSerializer(source='movie', read_only=True)
    screen_detail = ShowtimeScreenSerializer(source='screen', read_only=True)
    end_time = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Showtime
        fields = ['id', 'movie', 'screen', 'start_time', 'end_time', 'price',
                  'is_active', 'movie_detail', 'screen_detail']

    def validate(self, attrs):
        screen = attrs.get('screen') or getattr(self.instance, 'screen', None)
        start_time = attrs.get('start_time') or getattr(self.instance, 'start_time', None)
        movie = attrs.get('movie') or getattr(self.instance, 'movie', None)

        if screen and start_time and movie:
            end_time = start_time + timedelta(minutes=movie.duration_min)

            overlapping = Showtime.objects.filter(
                screen=screen,
                start_time__lt=end_time,
            )
            if self.instance:
                overlapping = overlapping.exclude(pk=self.instance.pk)

            # Overlap = existing starts before our end AND ends after our start.
            for existing in overlapping.select_related('movie'):
                if existing.end_time > start_time:
                    raise serializers.ValidationError(
                        "This screen already has a showtime that overlaps this time slot."
                    )

        return attrs