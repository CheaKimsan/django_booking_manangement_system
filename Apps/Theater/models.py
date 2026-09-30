from django.conf import settings
from django.db import models


class Theater(models.Model):
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    address = models.TextField()
    phone_number = models.CharField(max_length=20, blank=True)
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_theaters',
        limit_choices_to={'role': 'THEATER_MANAGER'},
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        unique_together = ('name', 'city')

    def __str__(self):
        return f"{self.name} ({self.city})"


class Screen(models.Model):
    theater = models.ForeignKey(Theater, on_delete=models.CASCADE, related_name='screens')
    name = models.CharField(max_length=100)
    total_rows = models.PositiveIntegerField(default=10)
    seats_per_row = models.PositiveIntegerField(default=10)

    class Meta:
        unique_together = ('theater', 'name')

    def __str__(self):
        return f"{self.theater.name} - {self.name}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            self._generate_seats()

    def _generate_seats(self):
        rows = [chr(65 + i) for i in range(self.total_rows)]
        seats = [
            Seat(screen=self, row=r, number=n)
            for r in rows
            for n in range(1, self.seats_per_row + 1)
        ]
        Seat.objects.bulk_create(seats)


class Seat(models.Model):
    class SeatType(models.TextChoices):
        REGULAR = 'REGULAR', 'Regular'
        PREMIUM = 'PREMIUM', 'Premium'
        VIP = 'VIP', 'VIP'

    screen = models.ForeignKey(Screen, on_delete=models.CASCADE, related_name='seats')
    row = models.CharField(max_length=2)
    number = models.PositiveIntegerField()
    seat_type = models.CharField(max_length=20, choices=SeatType.choices, default=SeatType.REGULAR)

    class Meta:
        unique_together = ('screen', 'row', 'number')
        ordering = ['row', 'number']

    def __str__(self):
        return f"{self.row}{self.number}"