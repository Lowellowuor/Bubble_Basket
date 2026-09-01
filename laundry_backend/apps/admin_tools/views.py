from rest_framework import generics, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from apps.orders.models import Order
from apps.users.models import User
from django.shortcuts import get_object_or_404
from .models import (
    InventoryItem, Expense, PromoCode, LoyaltyReward, LoyaltyStamp,
    SubscriptionPlan, Referral, UserSubscription,
    PricingCategory, PricingItem, Branding
)
from .serializers import (
    InventoryItemSerializer, ExpenseSerializer, PromoCodeSerializer,
    LoyaltyRewardSerializer, SubscriptionPlanSerializer, ReferralSerializer,
    UserSubscriptionSerializer, PricingCategorySerializer, PricingItemSerializer,
    BrandingSerializer
)
from .permissions import IsAdmin

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class PromoCodeViewSet(viewsets.ModelViewSet):
    queryset = PromoCode.objects.all()
    serializer_class = PromoCodeSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class LoyaltyRewardViewSet(viewsets.ModelViewSet):
    queryset = LoyaltyReward.objects.all()
    serializer_class = LoyaltyRewardSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class ReferralViewSet(viewsets.ModelViewSet):
    queryset = Referral.objects.all()
    serializer_class = ReferralSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class PricingCategoryViewSet(viewsets.ModelViewSet):
    queryset = PricingCategory.objects.all()
    serializer_class = PricingCategorySerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class PricingItemViewSet(viewsets.ModelViewSet):
    queryset = PricingItem.objects.all()
    serializer_class = PricingItemSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class BrandingViewSet(viewsets.ModelViewSet):
    queryset = Branding.objects.all()
    serializer_class = BrandingSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    http_method_names = ['get', 'put', 'patch']
    def get_queryset(self):
        return Branding.objects.filter(id=1)

class PublicPricingListView(generics.ListAPIView):
    permission_classes = []
    authentication_classes = []
    queryset = PricingCategory.objects.filter(is_active=True)
    serializer_class = PricingCategorySerializer

class PublicBrandingView(generics.RetrieveAPIView):
    permission_classes = []
    authentication_classes = []
    queryset = Branding.objects.all()
    serializer_class = BrandingSerializer
    def get_object(self):
        return Branding.objects.get_instance()

class AnalyticsRevenueView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def get(self, request):
        period = request.query_params.get('period', 'day')
        now = timezone.now()
        if period == 'week':
            start = now - timedelta(days=7)
        elif period == 'month':
            start = now - timedelta(days=30)
        else:
            start = now - timedelta(days=1)
        orders = Order.objects.filter(created_at__gte=start, payment_status='paid')
        total = orders.aggregate(total=Sum('total_price'))['total'] or 0
        cash = orders.filter(mpesa_receipt__isnull=True).aggregate(total=Sum('total_price'))['total'] or 0
        mpesa = orders.filter(mpesa_receipt__isnull=False).aggregate(total=Sum('total_price'))['total'] or 0
        return Response({
            'period': period, 'start_date': start, 'end_date': now,
            'total_revenue': total, 'cash_revenue': cash, 'mpesa_revenue': mpesa,
            'order_count': orders.count()
        })

class AnalyticsOrderVolumeView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def get(self, request):
        days = int(request.query_params.get('days', 7))
        end = timezone.now()
        start = end - timedelta(days=days)
        orders = Order.objects.filter(created_at__gte=start)
        volume_by_day = orders.extra(select={'day': "DATE(created_at)"}).values('day').annotate(count=Count('id')).order_by('day')
        return Response({'days': days, 'volume': list(volume_by_day)})

class CustomerSegmentationView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def get(self, request):
        clients = User.objects.filter(role='client')
        result = []
        for user in clients:
            order_count = Order.objects.filter(student=user).count()
            last_order = Order.objects.filter(student=user).order_by('-created_at').first()
            result.append({
                'user_id': user.id,
                'phone': user.phone_number,
                'name': user.name,
                'order_count': order_count,
                'last_order_date': last_order.created_at if last_order else None,
            })
        return Response(result)

class BroadcastMessageView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def post(self, request):
        message = request.data.get('message')
        segment = request.data.get('segment', 'all')
        if not message:
            return Response({'error': 'Message required'}, status=400)
        users = User.objects.filter(role='client')
        if segment == 'active':
            cutoff = timezone.now() - timedelta(days=30)
            users = users.filter(orders__created_at__gte=cutoff).distinct()
        elif segment == 'dormant':
            cutoff = timezone.now() - timedelta(days=30)
            users = users.exclude(orders__created_at__gte=cutoff).distinct()
        for user in users:
            print(f"Send to {user.phone_number}: {message}")
        return Response({'message': f'Broadcast sent to {users.count()} users'})

class GenerateReferralCodeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        profile = request.user.client_profile
        return Response({'referral_code': profile.referral_code})

class MyReferralsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        referrals = Referral.objects.filter(referrer=request.user)
        return Response(ReferralSerializer(referrals, many=True).data)

class MyLoyaltyView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        profile = request.user.client_profile
        stamps = LoyaltyStamp.objects.filter(user=request.user).count()
        reward = LoyaltyReward.objects.filter(is_active=True).first()
        return Response({
            'points': profile.points,
            'referral_code': profile.referral_code,
            'stamps': stamps,
            'stamps_required': reward.stamps_required if reward else 5,
            'reward_available': stamps >= (reward.stamps_required if reward else 5)
        })

class RedeemLoyaltyView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        reward = LoyaltyReward.objects.filter(is_active=True).first()
        if not reward:
            return Response({'error': 'No active reward'}, status=400)
        stamps = LoyaltyStamp.objects.filter(user=request.user).count()
        if stamps < reward.stamps_required:
            return Response({'error': 'Not enough stamps'}, status=400)
        LoyaltyStamp.objects.filter(user=request.user).order_by('created_at')[:reward.stamps_required].delete()
        order = Order.objects.create(
            student=request.user,
            status='created',
            payment_status='paid',
            total_price=0,
            pickup_location=request.user.client_profile.hostel,
            delivery_location=request.user.client_profile.hostel,
        )
        return Response({
            'message': 'Reward redeemed',
            'free_order_id': order.id,
            'order_number': order.order_number
        })

class AvailablePlansView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        plans = SubscriptionPlan.objects.all()
        return Response(SubscriptionPlanSerializer(plans, many=True).data)

class PurchaseSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        plan_id = request.data.get('plan_id')
        plan = get_object_or_404(SubscriptionPlan, id=plan_id)
        existing = UserSubscription.objects.filter(user=request.user, is_active=True).first()
        if existing:
            existing.is_active = False
            existing.save()
        end_date = timezone.now() + timedelta(days=plan.validity_days)
        subscription = UserSubscription.objects.create(
            user=request.user,
            plan=plan,
            end_date=end_date,
            remaining_loads=plan.load_quantity_kg,
        )
        order = Order.objects.create(
            student=request.user,
            status='created',
            payment_status='paid',
            total_price=plan.price,
            pickup_location='subscription',
            delivery_location='subscription',
        )
        return Response({
            'subscription_id': subscription.id,
            'end_date': end_date,
            'remaining_loads': float(subscription.remaining_loads),
            'order_id': order.id
        })

class MySubscriptionsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        subscriptions = UserSubscription.objects.filter(user=request.user)
        return Response(UserSubscriptionSerializer(subscriptions, many=True).data)