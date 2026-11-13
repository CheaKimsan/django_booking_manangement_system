from django.urls import path
from . import views

urlpatterns = [
    path('bookings/<int:booking_id>/pay', views.start_payment),
    path('bookings/<int:booking_id>/payment-status', views.payment_status),
    path('payments/webhook', views.payment_webhook),
]