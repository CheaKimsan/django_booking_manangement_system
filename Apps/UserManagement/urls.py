from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomTokenObtainPairView, RegisterView, UserProfile, UserViewSet

router = DefaultRouter(trailing_slash=False)
router.register('users', UserViewSet, basename='user')

urlpatterns = [
    path('login', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('register', RegisterView.as_view(), name='register'),
    path('profile', UserProfile.as_view(), name='user_profile'),
] + router.urls