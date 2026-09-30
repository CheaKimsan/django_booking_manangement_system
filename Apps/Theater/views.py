from rest_framework import viewsets, filters
from Apps.UserManagement.permissions import TheaterPermission
from .models import Theater, Screen, Seat
from .serializers import TheaterSerializer, ScreenSerializer, SeatSerializer


class TheaterViewSet(viewsets.ModelViewSet):
    serializer_class = TheaterSerializer
    permission_classes = [TheaterPermission]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'city']

    def get_queryset(self):
        qs = Theater.objects.select_related('manager').prefetch_related('screens__seats')
        user = self.request.user
        if not (user.is_authenticated and user.is_admin):
            qs = qs.filter(is_active=True)
        return qs


class ScreenViewSet(viewsets.ModelViewSet):
    serializer_class = ScreenSerializer
    permission_classes = [TheaterPermission]

    def get_queryset(self):
        return Screen.objects.select_related('theater').prefetch_related('seats')

class SeatViewSet(viewsets.ModelViewSet):
    serializer_class = SeatSerializer
    permission_classes = [TheaterPermission]

    def get_queryset(self):
        qs = Seat.objects.select_related('screen__theater')
        screen_id = self.request.query_params.get('screen')
        if screen_id:
            qs = qs.filter(screen_id=screen_id)
        return qs