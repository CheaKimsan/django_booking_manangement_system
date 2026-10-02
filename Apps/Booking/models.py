# Apps/Booking/models.py
from datetime import timedelta
from django.conf import settings
from django.db import models
from django.utils import timezone
from Apps.Showtime.models import Showtime
from Apps.Theater.models import Seat
import random
import string


def generate_booking_code():
    while True:
        code = "BK-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
        if not Booking.objects.filter(booking_code=code).exists():
            return code


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        EXPIRED = 'EXPIRED', 'Expired'
        COMPLETED = 'COMPLETED', 'Completed'      # ← must be here

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    showtime = models.ForeignKey(Showtime, on_delete=models.CASCADE, related_name='bookings')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    total_price = models.DecimalField(max_digits=8, decimal_places=2)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    booking_code = models.CharField(                     # ← must be here
        max_length=20, unique=True, null=True, blank=True, db_index=True,
    )
    confirmed_at = models.DateTimeField(null=True, blank=True)  # ← must be here

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=10)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking #{self.id} — {self.user.username} — {self.status}"

    @property
    def is_expired(self):
        return self.status == self.Status.PENDING and timezone.now() > self.expires_at

    @property
    def is_showtime_passed(self):
        end = getattr(self.showtime, 'end_time', None)
        if end:
            return timezone.now() > end
        if self.showtime.start_time and self.showtime.movie.duration_min:
            end = self.showtime.start_time + timedelta(minutes=self.showtime.movie.duration_min)
            return timezone.now() > end
        return False

    @property
    def can_be_cancelled(self):
        return (
            self.status in (self.Status.PENDING, self.Status.CONFIRMED)
            and timezone.now() < self.showtime.start_time
        )

    def confirm(self):
        if self.status == self.Status.CONFIRMED:
            return self
        if self.is_expired:
            self.status = self.Status.EXPIRED
            self.save(update_fields=['status'])
            raise ValueError("This booking has expired.")
        self.status = self.Status.CONFIRMED
        self.confirmed_at = timezone.now()
        if not self.booking_code:
            self.booking_code = generate_booking_code()
        self.save(update_fields=['status', 'confirmed_at', 'booking_code'])
        return self

    def complete(self):
        if self.status != self.Status.CONFIRMED:
            return self
        if not self.is_showtime_passed:
            return self
        self.status = self.Status.COMPLETED
        self.save(update_fields=['status'])
        return self


class BookingSeat(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='booking_seats')
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('booking', 'seat')