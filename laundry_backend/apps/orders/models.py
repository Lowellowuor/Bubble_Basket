from django.db import models
from django.utils import timezone
from apps.users.models import User

class Order(models.Model):
    STATUS_CHOICES = (
        ('created', 'Created'),
        ('picked_up', 'Picked Up'),
        ('washing', 'Washing'),
        ('drying', 'Drying'),
        ('ready', 'Ready for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    )

    order_number = models.CharField(max_length=20, unique=True, blank=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    assigned_rider = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_orders', limit_choices_to={'role': 'rider'}
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='created')
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_transaction_id = models.CharField(max_length=50, blank=True, null=True)
    mpesa_receipt = models.CharField(max_length=50, blank=True, null=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    pickup_location = models.CharField(max_length=100)
    delivery_location = models.CharField(max_length=100)
    special_instructions = models.TextField(blank=True)
    scheduled_pickup_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    points_used = models.PositiveIntegerField(default=0)
    discount_from_points = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    points_awarded = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.order_number:
            today = timezone.now().strftime('%y%m%d')
            last_order = Order.objects.filter(order_number__startswith=f'DAY-{today}').order_by('-order_number').first()
            if last_order:
                last_seq = int(last_order.order_number[-3:])
                seq = str(last_seq + 1).zfill(3)
            else:
                seq = '001'
            self.order_number = f'DAY-{today}-{seq}'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.order_number

class OrderItem(models.Model):
    ITEM_TYPE_CHOICES = (
        ('regular', 'Regular (per KG)'),
        ('bulky', 'Bulky (flat rate)'),
    )
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    item_type = models.CharField(max_length=10, choices=ITEM_TYPE_CHOICES)
    description = models.CharField(max_length=100)
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    flat_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)

class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20, choices=Order.STATUS_CHOICES)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)