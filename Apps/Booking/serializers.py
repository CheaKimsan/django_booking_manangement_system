from django.utils import timezone
from rest_framework import serializers

from .models import Booking, BookingSeat
from Apps.Theater.models import Seat, Screen
from Apps.Theater.serializers import SeatSerializer
from Apps.Showtime.models import Showtime
from Apps.Movie.models import Movie  # adjust this path to where your Movie model lives

    
# ---------- Slim, booking-specific nested serializers ----------

class BookingMovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ['id', 'title', 'genre', 'language', 'duration_min', 'poster']


class BookingScreenSerializer(serializers.ModelSerializer):
    theater_name = serializers.CharField(source='theater.name', read_only=True)

    class Meta:
        model = Screen
        fields = ['id', 'name', 'theater', 'theater_name']  # no seats list


class BookingShowtimeSerializer(serializers.ModelSerializer):
    movie_detail = BookingMovieSerializer(source='movie', read_only=True)
    screen_detail = BookingScreenSerializer(source='screen', read_only=True)

    class Meta:
        model = Showtime
        fields = ['id', 'start_time', 'price', 'movie_detail', 'screen_detail']


# ---------- Booking ----------

class BookingSeatSerializer(serializers.ModelSerializer):
    seat_detail = SeatSerializer(source='seat', read_only=True)

    class Meta:
        model = BookingSeat
        fields = ['id', 'seat', 'seat_detail']


class BookingSerializer(serializers.ModelSerializer):
    seat_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True
    )
    seats = BookingSeatSerializer(source='booking_seats', many=True, read_only=True)
    showtime_detail = BookingShowtimeSerializer(source='showtime', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_code', 'user', 'username',
            'showtime', 'showtime_detail',
            'status', 'total_price',
            'expires_at', 'confirmed_at', 'created_at',
            'seat_ids', 'seats',
        ]
        read_only_fields = [
            'user', 'total_price', 'expires_at',
            'status', 'booking_code', 'confirmed_at',
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # expires_at only matters while the booking is still pending
        if instance.status != Booking.Status.PENDING:
            data['expires_at'] = None
        # hide booking_code while it's not confirmed (nothing to show yet)
        if instance.status != Booking.Status.CONFIRMED:
            data['booking_code'] = None
        return data

    def validate(self, attrs):
        showtime = attrs['showtime']
        seat_ids = attrs['seat_ids']

        if not seat_ids:
            raise serializers.ValidationError({"seat_ids": "Select at least one seat."})

        valid_seat_ids = set(
            Seat.objects.filter(screen=showtime.screen, id__in=seat_ids)
            .values_list('id', flat=True)
        )
        if valid_seat_ids != set(seat_ids):
            raise serializers.ValidationError(
                {"seat_ids": "One or more seats don't belong to this screen."}
            )

        taken = BookingSeat.objects.filter(
            booking__showtime=showtime,
            booking__status__in=[Booking.Status.PENDING, Booking.Status.CONFIRMED],
            seat_id__in=seat_ids,
        ).exclude(
            booking__status=Booking.Status.PENDING,
            booking__expires_at__lt=timezone.now(),
        )
        if taken.exists():
            raise serializers.ValidationError(
                {"seat_ids": "One or more selected seats are already taken."}
            )

        return attrs

    def create(self, validated_data):
        seat_ids = validated_data.pop('seat_ids')
        showtime = validated_data['showtime']
        user = self.context['request'].user

        total_price = showtime.price * len(seat_ids)
        booking = Booking.objects.create(user=user, total_price=total_price, **validated_data)
        BookingSeat.objects.bulk_create([
            BookingSeat(booking=booking, seat_id=sid) for sid in seat_ids
        ])
        return booking