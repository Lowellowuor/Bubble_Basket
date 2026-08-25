from django.db import models
from apps.users.models import User
from apps.orders.models import Order

class InventoryItem(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    quantity = models.PositiveIntegerField(default=0)
    reorder_threshold = models.PositiveIntegerField(default=5)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    last_updated = models.DateTimeField(auto_now=True)
    def __str__(self): return self.name

class Expense(models.Model):
    CATEGORY_CHOICES = (('utilities','Utilities'),('rent','Rent'),('supplies','Supplies'),('maintenance','Maintenance'),('other','Other'))
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    date = models.DateField(auto_now_add=True)
    def __str__(self): return f"{self.category} - {self.amount}"

class PromoCode(models.Model):
    DISCOUNT_TYPE_CHOICES = (('percentage','Percentage'),('fixed','Fixed Amount'))
    code = models.CharField(max_length=20, unique=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    usage_limit = models.PositiveIntegerField(default=1)
    used_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    def __str__(self): return self.code

class LoyaltyStamp(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='loyalty_stamps')
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='loyalty_stamp')
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('user', 'order')

class LoyaltyReward(models.Model):
    stamps_required = models.PositiveIntegerField(default=5)
    reward_description = models.CharField(max_length=100)
    reward_value = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)

class Referral(models.Model):
    referrer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_made')
    referee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_received')
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True)
    reward_issued = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('referrer', 'referee')

class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    validity_days = models.PositiveIntegerField()
    load_quantity_kg = models.DecimalField(max_digits=5, decimal_places=2)
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    def __str__(self): return self.name

class UserSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    remaining_loads = models.DecimalField(max_digits=5, decimal_places=2)
    is_active = models.BooleanField(default=True)
    def __str__(self): return f"{self.user.phone_number} - {self.plan.name}"

# NEW: Pricing and Branding models
class PricingCategory(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    class Meta:
        ordering = ['display_order']
    def __str__(self): return self.name

class PricingItem(models.Model):
    category = models.ForeignKey(PricingCategory, on_delete=models.CASCADE, related_name='items')
    service = models.CharField(max_length=200)
    price = models.CharField(max_length=50)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    class Meta:
        ordering = ['display_order']
    def __str__(self): return f"{self.service} - {self.price}"

class BrandingManager(models.Manager):
    def get_instance(self):
        instance, created = self.get_or_create(
            id=1,
            defaults={
                'pillars': [
                    {'icon': '🚀', 'title': 'FREE PICK UP & DELIVERY', 'description': 'We come to you'},
                    {'icon': '✨', 'title': 'QUALITY WASH', 'description': 'Expert care'},
                    {'icon': '👔', 'title': 'EXPERT CARE', 'description': 'We care for you'},
                    {'icon': '📦', 'title': 'NEATLY FOLDED', 'description': 'Ready to wear'},
                ]
            }
        )
        return instance

class Branding(models.Model):
    company_name = models.CharField(max_length=100, default="Bubble Basket Laundry")
    tagline = models.CharField(max_length=200, default="Fast & Fresh! Need It Today?")
    sub_tagline = models.CharField(max_length=200, default="Book before 10 AM, get it back by 5 PM")
    phone = models.CharField(max_length=20, default="0793 272 588")
    location = models.CharField(max_length=100, default="Daystar, Athi River")
    footer_message = models.CharField(max_length=200, default="We clean more than clothes, we care for you ❤️")
    pillars = models.JSONField(default=list, blank=True)
    payment_paybill = models.CharField(max_length=20, default="303030", blank=True)
    payment_account = models.CharField(max_length=20, default="2051303388", blank=True)
    payment_airtel = models.CharField(max_length=20, default="*222#", blank=True)
    payment_tkash = models.CharField(max_length=20, default="*160#", blank=True)

    objects = BrandingManager()

    def save(self, *args, **kwargs):
        if not self.pk and Branding.objects.exists():
            raise ValueError("Only one Branding record allowed.")
        super().save(*args, **kwargs)
    def __str__(self): return self.company_name
