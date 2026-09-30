from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('Apps.UserManagement.urls')),
    path('api/', include('Apps.Movie.urls')),
    path('api/', include('Apps.Theater.urls')),

]

# Serve uploaded posters in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)