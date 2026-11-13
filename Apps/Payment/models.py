from django.db import models
from Apps.Booking.models import Booking


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PAID = 'PAID', 'Paid'
        FAILED = 'FAILED', 'Failed'

    booking = models.ForeignKey(Booking, on_delete=models.PROTECT, related_name='payments')
    reference = models.CharField(max_length=40, unique=True)       # our id, sent to the gateway
    gateway_id = models.CharField(max_length=100, blank=True)      # their payment id
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # amount at payment time
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    checkout_url = models.TextField(blank=True)
    qr_data = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.reference} ({self.status})"