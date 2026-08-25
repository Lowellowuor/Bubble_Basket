from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'item_type', 'description', 'weight_kg', 'flat_rate', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    rider_phone = serializers.CharField(source='assigned_rider.phone_number', read_only=True)
    rider_name = serializers.CharField(source='assigned_rider.name', read_only=True)
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_status',
            'total_price', 'pickup_location', 'delivery_location',
            'special_instructions', 'scheduled_pickup_time',
            'created_at', 'updated_at', 'items',
            'assigned_rider', 'rider_phone', 'rider_name'
        ]
        read_only_fields = ['order_number', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        order.total_price = sum(item.price for item in order.items.all())
        order.save()
        return order

class ApplyPromoSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=20)

class ApplyReferralSerializer(serializers.Serializer):
    referral_code = serializers.CharField(max_length=10)

class AssignRiderSerializer(serializers.Serializer):
    rider_id = serializers.IntegerField()
