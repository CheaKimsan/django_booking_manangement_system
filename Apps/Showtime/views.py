from rest_framework import viewsets, filters
from Apps.UserManagement.permissions import ShowtimePermission
from .models import Showtime
from .serializers import ShowtimeSerializer


class ShowtimeViewSet(viewsets.ModelViewSet):
    serializer_class = ShowtimeSerializer
    permission_classes = [ShowtimePermission]
    filter_backends = [filters.SearchFilter]
    search_fields = ['movie__title', 'screen__name']

    def get_queryset(self):
        qs = Showtime.objects.select_related('movie', 'screen__theater')
        movie_id = self.request.query_params.get('movie')
        theater_id = self.request.query_params.get('theater')
        if movie_id:
            qs = qs.filter(movie_id=movie_id)
        if theater_id:
            qs = qs.filter(screen__theater_id=theater_id)
        return qs