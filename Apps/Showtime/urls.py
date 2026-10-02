from rest_framework.routers import DefaultRouter
from .views import ShowtimeViewSet

router = DefaultRouter(trailing_slash=False)
router.register('showtimes', ShowtimeViewSet, basename='showtime')

urlpatterns = router.urls