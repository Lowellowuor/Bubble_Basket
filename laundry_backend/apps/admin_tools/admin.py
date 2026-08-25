from django.contrib import admin
from .models import (
    InventoryItem, Expense, PromoCode, LoyaltyStamp, LoyaltyReward,
    Referral, SubscriptionPlan, UserSubscription,
    PricingCategory, PricingItem, Branding
)

admin.site.register(InventoryItem)
admin.site.register(Expense)
admin.site.register(PromoCode)
admin.site.register(LoyaltyStamp)
admin.site.register(LoyaltyReward)
admin.site.register(Referral)
admin.site.register(SubscriptionPlan)
admin.site.register(UserSubscription)
admin.site.register(PricingCategory)
admin.site.register(PricingItem)
admin.site.register(Branding)
