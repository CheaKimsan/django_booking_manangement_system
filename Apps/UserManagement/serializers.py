from django.utils import timezone

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import update_last_login
from .models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        identifier = attrs.get(self.username_field)
        # Not an existing username? Try it as a phone number.
        if identifier and not User.objects.filter(username=identifier).exists():
            user = User.objects.filter(phone_number=identifier).first()
            if user:
                attrs[self.username_field] = user.get_username()

        data = super().validate(attrs)
        update_last_login(None, self.user)
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password',
                  'first_name', 'last_name', 'phone_number']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        return User.objects.create_user(role=User.Role.CUSTOMER, **validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'role', 'phone_number', 'address', 'profile_picture',
                  'date_of_birth', 'created_at', 'last_login']
        read_only_fields = ['id', 'username', 'role', 'created_at', 'last_login']

class UserListSerializer(serializers.ModelSerializer):
    last_login = serializers.SerializerMethodField()

    def get_last_login(self, obj):
        if obj.last_login:
            return timezone.localtime(obj.last_login).isoformat()
        return None
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'role', 'profile_picture' ,'phone_number', 'is_active', 'last_login', 'created_at']