from rest_framework import viewsets, filters
from Apps.UserManagement.permissions import IsAdminOrReadOnly
from .models import Movie
from .serializers import MovieSerializer


class MovieViewSet(viewsets.ModelViewSet):
    serializer_class = MovieSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'genre']

    def get_queryset(self):
        qs = Movie.objects.all()
        user = self.request.user
        if not (user.is_authenticated and user.is_admin):
            qs = qs.filter(is_active=True)
        return qs