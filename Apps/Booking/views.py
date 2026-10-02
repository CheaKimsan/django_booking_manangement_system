from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from Apps.UserManagement.permissions import IsOwnerOrAdmin
from .models import Booking
from .serializers import BookingSerializer


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsOwnerOrAdmin]

    def get_queryset(self):
        qs = Booking.objects.select_related(
            'user', 'showtime__movie', 'showtime__screen__theater'
        ).prefetch_related('booking_seats__seat')

        user = self.request.user
        if not user.is_admin:
            qs = qs.filter(user=user)

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        return qs

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status not in (Booking.Status.PENDING, Booking.Status.CONFIRMED):
            return Response(
                {"detail": "This booking can't be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = Booking.Status.CANCELLED
        booking.save(update_fields=['status'])
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        booking = self.get_object()

        if booking.status == Booking.Status.CONFIRMED:
            # idempotent — return existing booking with its code
            return Response(BookingSerializer(booking).data)

        if booking.status != Booking.Status.PENDING:
            return Response(
                {"detail": "Only pending bookings can be confirmed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            booking.confirm()
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(BookingSerializer(booking).data)

    @action(detail=False, methods=['get'], url_path=r'by-code/(?P<code>[^/.]+)')
    def by_code(self, request, code=None):
        """Lookup a booking by its code — useful for door scanning / customer service."""
        try:
            booking = self.get_queryset().get(booking_code=code)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(BookingSerializer(booking).data)