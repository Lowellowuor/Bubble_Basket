from rest_framework import serializers
from .models import User, ClientProfile

class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        fields = ['hostel', 'room_number', 'prefers_fabric_softener', 'prefers_scent_free', 'prefers_color_separation', 'referral_code']

class UserProfileSerializer(serializers.ModelSerializer):
    client_profile = ClientProfileSerializer(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'phone_number', 'name', 'role', 'date_joined', 'client_profile']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'phone_number', 'name', 'role', 'date_joined']
