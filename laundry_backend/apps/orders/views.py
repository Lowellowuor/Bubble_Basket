from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView, CreateAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Order
from .serializers import OrderSerializer, ApplyPromoSerializer, ApplyReferralSerializer, AssignRiderSerializer
from .permissions import IsClient, IsShopStaff, IsRider, IsAssignedRider
from apps.admin_tools.models import PromoCode, Referral
from apps.users.models import User

class OrderCreateView(ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsClient]
    def perform_create(self, serializer):
        order = serializer.save(student=self.request.user, payment_status='pending')
        if not order.total_price:
            order.total_price = sum(item.price for item in order.items.all())
            order.save()

class OrderListView(ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        if user.role == 'client':
            return Order.objects.filter(student=user)
        elif user.role == 'shop_staff':
            return Order.objects.exclude(status__in=['delivered', 'cancelled'])
        elif user.role == 'rider':
            return Order.objects.filter(assigned_rider=user, status='ready')
        return Order.objects.all()

class OrderDetailView(RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    queryset = Order.objects.all()
    lookup_field = 'id'

class OrderStatusUpdateView(RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsShopStaff]
    queryset = Order.objects.all()
    lookup_field = 'id'
    def patch(self, request, *args, **kwargs):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save()
            return Response({'status': order.status})
        return Response({'error': 'Invalid status'}, status=400)

class AssignRiderView(UpdateAPIView):
    permission_classes = [IsAuthenticated, IsShopStaff]
    serializer_class = AssignRiderSerializer
    def patch(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        rider_id = request.data.get('rider_id')
        rider = get_object_or_404(User, id=rider_id, role='rider')
        order.assigned_rider = rider
        order.save()
        return Response({'message': f'Rider {rider.phone_number} assigned'})

class RiderDeliverView(UpdateAPIView):
    permission_classes = [IsAuthenticated, IsRider, IsAssignedRider]
    def patch(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        if order.status != 'ready':
            return Response({'error': 'Not ready'}, status=400)
        order.status = 'delivered'
        order.save()
        return Response({'message': 'Delivered'})

class ApplyPromoView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsClient]
    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id, student=request.user)
        code = request.data.get('code')
        promo = get_object_or_404(PromoCode, code=code, is_active=True)
        if promo.used_count >= promo.usage_limit:
            return Response({'error': 'Limit exceeded'}, status=400)
        if promo.start_date > timezone.now() or promo.end_date < timezone.now():
            return Response({'error': 'Expired'}, status=400)
        if promo.discount_type == 'percentage':
            discount = order.total_price * (promo.discount_value / 100)
        else:
            discount = promo.discount_value
        order.total_price = max(0, order.total_price - discount)
        order.save()
        promo.used_count += 1
        promo.save()
        return Response({'discount_applied': float(discount), 'new_total': float(order.total_price)})

class ApplyReferralView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsClient]
    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id, student=request.user)
        code = request.data.get('referral_code')
        referrer = User.objects.filter(client_profile__referral_code=code).first()
        if not referrer or referrer == request.user:
            return Response({'error': 'Invalid code'}, status=400)
        existing = Referral.objects.filter(referrer=referrer, referee=request.user).first()
        if existing:
            return Response({'error': 'Already referred'}, status=400)
        Referral.objects.create(referrer=referrer, referee=request.user, order=order)
        order.total_price = max(0, order.total_price - 100)
        order.save()
        return Response({'discount_applied': 100, 'new_total': float(order.total_price)})

class CancelOrderView(APIView):
    permission_classes = [IsAuthenticated, IsClient]
    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id, student=request.user)
        if order.status in ['delivered', 'cancelled']:
            return Response({'error': 'Cannot cancel'}, status=400)
        order.status = 'cancelled'
        order.save()
        return Response({'message': 'Cancelled'})
