from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order
from apps.admin_tools.models import LoyaltyStamp, Referral, LoyaltyReward

@receiver(post_save, sender=Order)
def handle_order_completion(sender, instance, created, **kwargs):
    if not created and instance.status == 'delivered' and instance.payment_status == 'paid':
        if not hasattr(instance, 'loyalty_stamp'):
            LoyaltyStamp.objects.create(user=instance.student, order=instance)

        reward = LoyaltyReward.objects.filter(is_active=True).first()
        if reward:
            stamps_count = LoyaltyStamp.objects.filter(user=instance.student).count()
            if stamps_count >= reward.stamps_required:
                LoyaltyStamp.objects.filter(user=instance.student).order_by('created_at')[:reward.stamps_required].delete()

        referrals = Referral.objects.filter(referee=instance.student, reward_issued=False)
        for referral in referrals:
            if not referral.order:
                referral.order = instance
                referral.reward_issued = True
                referral.save()