from rest_framework import serializers
from .models import (
    InventoryItem, Expense, PromoCode, LoyaltyStamp, LoyaltyReward,
    Referral, SubscriptionPlan, UserSubscription,
    PricingCategory, PricingItem, Branding
)

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta: model = InventoryItem; fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta: model = Expense; fields = '__all__'

class PromoCodeSerializer(serializers.ModelSerializer):
    class Meta: model = PromoCode; fields = '__all__'

class LoyaltyStampSerializer(serializers.ModelSerializer):
    class Meta: model = LoyaltyStamp; fields = '__all__'

class LoyaltyRewardSerializer(serializers.ModelSerializer):
    class Meta: model = LoyaltyReward; fields = '__all__'

class ReferralSerializer(serializers.ModelSerializer):
    class Meta: model = Referral; fields = '__all__'

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta: model = SubscriptionPlan; fields = '__all__'

class UserSubscriptionSerializer(serializers.ModelSerializer):
    class Meta: model = UserSubscription; fields = '__all__'

# New
class PricingItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingItem
        fields = ['id', 'service', 'price', 'display_order', 'is_active']

class PricingCategorySerializer(serializers.ModelSerializer):
    items = PricingItemSerializer(many=True, read_only=True)
    class Meta:
        model = PricingCategory
        fields = ['id', 'name', 'icon', 'display_order', 'is_active', 'items']

class BrandingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branding
        fields = '__all__'
