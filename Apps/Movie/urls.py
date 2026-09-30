from rest_framework.routers import DefaultRouter
from .views import MovieViewSet

router = DefaultRouter(trailing_slash=False)   # matches your slash-less style
router.register('movies', MovieViewSet, basename='movie')

urlpatterns = router.urls