from rest_framework import serializers
from .models import Theater, Screen, Seat


class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ['id', 'row', 'number', 'seat_type']


class ScreenSerializer(serializers.ModelSerializer):
    seats = SeatSerializer(many=True, read_only=True)

    class Meta:
        model = Screen
        fields = ['id', 'theater', 'name', 'total_rows', 'seats_per_row', 'seats']


class TheaterSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)
    screens = ScreenSerializer(many=True, read_only=True)

    class Meta:
        model = Theater
        fields = '__all__'

    def validate_manager(self, value):
        if value and not value.is_theater_manager:
            raise serializers.ValidationError("User must have the THEATER_MANAGER role.")
        return value


