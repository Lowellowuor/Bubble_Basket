from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InventoryViewSet, ExpenseViewSet, PromoCodeViewSet,
    LoyaltyRewardViewSet, SubscriptionPlanViewSet, ReferralViewSet,
    PricingCategoryViewSet, PricingItemViewSet, BrandingViewSet,
    PublicPricingListView, PublicBrandingView,
    AnalyticsRevenueView, AnalyticsOrderVolumeView,
    CustomerSegmentationView, BroadcastMessageView,
    GenerateReferralCodeView, MyReferralsView, MyLoyaltyView,
    RedeemLoyaltyView, AvailablePlansView, PurchaseSubscriptionView,
    MySubscriptionsView
)

router = DefaultRouter()
router.register(r'inventory', InventoryViewSet, basename='inventory')
router.register(r'expenses', ExpenseViewSet, basename='expenses')
router.register(r'promo-codes', PromoCodeViewSet, basename='promo-codes')
router.register(r'loyalty-rewards', LoyaltyRewardViewSet, basename='loyalty-rewards')
router.register(r'subscription-plans', SubscriptionPlanViewSet, basename='subscription-plans')
router.register(r'referrals', ReferralViewSet, basename='referrals')
router.register(r'pricing-categories', PricingCategoryViewSet, basename='pricing-categories')
router.register(r'pricing-items', PricingItemViewSet, basename='pricing-items')
router.register(r'branding', BrandingViewSet, basename='branding')

urlpatterns = [
    path('', include(router.urls)),
    path('public/pricing/', PublicPricingListView.as_view(), name='public-pricing'),
    path('public/branding/', PublicBrandingView.as_view(), name='public-branding'),
    path('analytics/revenue/', AnalyticsRevenueView.as_view(), name='analytics-revenue'),
    path('analytics/order-volume/', AnalyticsOrderVolumeView.as_view(), name='analytics-order-volume'),
    path('analytics/customers/', CustomerSegmentationView.as_view(), name='analytics-customers'),
    path('broadcast/', BroadcastMessageView.as_view(), name='broadcast'),
    path('referral/generate/', GenerateReferralCodeView.as_view(), name='generate-referral'),
    path('referral/my-referrals/', MyReferralsView.as_view(), name='my-referrals'),
    path('loyalty/my-stamps/', MyLoyaltyView.as_view(), name='my-loyalty'),
    path('loyalty/redeem/', RedeemLoyaltyView.as_view(), name='redeem-loyalty'),
    path('subscriptions/plans/', AvailablePlansView.as_view(), name='available-plans'),
    path('subscriptions/purchase/', PurchaseSubscriptionView.as_view(), name='purchase-subscription'),
    path('subscriptions/my/', MySubscriptionsView.as_view(), name='my-subscriptions'),
]
