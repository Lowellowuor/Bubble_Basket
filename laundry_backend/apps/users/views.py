import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.cache import cache
from django.conf import settings
from .models import User
from .serializers import UserProfileSerializer

def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_via_sms(phone_number, otp_code):
    print(f"📱 OTP for {phone_number}: {otp_code}")

class RequestOTPView(APIView):
    permission_classes = []
    def post(self, request):
        phone = (request.data.get('phone_number') or request.data.get('phone', '')).strip()
        if not phone:
            return Response(
                {'error': 'Phone number required', 'received': request.data},
                status=status.HTTP_400_BAD_REQUEST
            )
        otp = generate_otp()
        cache.set(f'otp_{phone}', otp, timeout=300)
        send_otp_via_sms(phone, otp)
        return Response({'message': 'OTP sent'})

class VerifyOTPView(APIView):
    permission_classes = []
    def post(self, request):
        phone = (request.data.get('phone_number') or request.data.get('phone', '')).strip()
        otp_provided = request.data.get('otp', '').strip()

        print(f"🔍 Received phone: {phone}, OTP: {otp_provided}")

        if not phone or not otp_provided:
            return Response(
                {'error': 'Phone and OTP required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cached = cache.get(f'otp_{phone}')
        print(f"🔍 Cached OTP for {phone}: {cached}")

        if not cached or cached != otp_provided:
            return Response(
                {
                    'error': 'Invalid OTP',
                    'cached': cached,
                    'received': otp_provided
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user, created = User.objects.get_or_create(phone_number=phone)
        cache.delete(f'otp_{phone}')
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'role': user.role,
            'user_id': user.id
        })

class GetProfileView(APIView):
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

class UpdateProfileView(APIView):
    def patch(self, request):
        user = request.user
        user.name = request.data.get('name', user.name)
        user.save()
        profile = user.client_profile
        if profile:
            profile.hostel = request.data.get('hostel', profile.hostel)
            profile.room_number = request.data.get('room_number', profile.room_number)
            profile.prefers_fabric_softener = request.data.get('prefers_fabric_softener', profile.prefers_fabric_softener)
            profile.prefers_scent_free = request.data.get('prefers_scent_free', profile.prefers_scent_free)
            profile.prefers_color_separation = request.data.get('prefers_color_separation', profile.prefers_color_separation)
            profile.save()
        return Response({'message': 'Profile updated'})