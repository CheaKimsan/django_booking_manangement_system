import json
import secrets
from decimal import Decimal

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from Apps.Booking.models import Booking
from . import gateway
from .models import Payment


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_payment(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id, user=request.user)

    if booking.status != Booking.Status.PENDING or booking.expires_at < timezone.now():
        return Response({'detail': 'Booking is not payable.'}, status=400)

    # Reuse an existing unpaid attempt instead of creating duplicates
    payment = booking.payments.filter(status=Payment.Status.PENDING).first()
    if not payment:
        payment = Payment.objects.create(
            booking=booking,
            reference=f"BK{booking.id}-{secrets.token_hex(4)}",
            amount=booking.total_price,
        )

    if not payment.checkout_url and not payment.qr_data:
        try:
            result = gateway.create_payment(payment)
        except gateway.GatewayError as e:
            return Response({'detail': 'Payment gateway error.', 'error': str(e)}, status=502)
        payment.gateway_id = result['gateway_id']
        payment.checkout_url = result['checkout_url']
        payment.qr_data = result['qr_data']
        payment.save()

    return Response({
        'payment_id': payment.id,
        'amount': payment.amount,
        'checkout_url': payment.checkout_url,
        'qr_data': payment.qr_data,
        'expires_at': booking.expires_at,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, booking_id):
    """Frontend polls this after showing the QR."""
    booking = get_object_or_404(Booking, id=booking_id, user=request.user)
    return Response({'status': booking.status, 'booking_code': booking.booking_code})


@api_view(['POST'])
@permission_classes([AllowAny])        # called by the gateway, not a logged-in user
def payment_webhook(request):
    raw = request.body                 # read BEFORE touching request.data
    if not gateway.verify_signature(raw, request.headers.get('X-Gateway-Signature', '')):
        return Response({'detail': 'Invalid signature'}, status=401)

    try:
        event = gateway.parse_event(json.loads(raw))
    except (ValueError, AttributeError):
        return Response({'detail': 'Bad payload'}, status=400)

    with transaction.atomic():
        try:
            payment = Payment.objects.select_for_update().select_related('booking').get(
                reference=event['reference']
            )
        except Payment.DoesNotExist:
            return Response({'detail': 'Unknown reference'}, status=404)

        if payment.status == Payment.Status.PAID:          # webhooks can repeat
            return Response({'ok': True})

        if event['failed']:
            payment.status = Payment.Status.FAILED
            payment.save()
            return Response({'ok': True})

        if not event['paid']:
            return Response({'ok': True})

        # Amount must match what we asked for
        if event['amount'] is not None and Decimal(str(event['amount'])) != payment.amount:
            payment.status = Payment.Status.FAILED
            payment.save()
            return Response({'detail': 'Amount mismatch'}, status=400)

        payment.status = Payment.Status.PAID
        payment.paid_at = timezone.now()
        payment.save()

        booking = payment.booking
        if booking.status != Booking.Status.CONFIRMED:
            booking.status = Booking.Status.CONFIRMED
            booking.confirmed_at = timezone.now()
            booking.booking_code = f"BK{booking.id:06d}"
            booking.save()

    return Response({'ok': True})