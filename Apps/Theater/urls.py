from rest_framework.routers import DefaultRouter
from .views import TheaterViewSet, ScreenViewSet, SeatViewSet

router = DefaultRouter(trailing_slash=False)
router.register('theaters', TheaterViewSet, basename='theater')

router.register('screens', ScreenViewSet, basename='screen')

router.register('seats', SeatViewSet, basename='seat')

urlpatterns = router.urls