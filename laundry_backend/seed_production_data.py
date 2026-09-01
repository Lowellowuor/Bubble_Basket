import random
import secrets
from datetime import datetime, timedelta
from decimal import Decimal
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.users.models import ClientProfile, StaffProfile, RiderProfile
from apps.orders.models import Order, OrderItem, OrderStatusHistory
from apps.admin_tools.models import (
    InventoryItem, Expense, PromoCode, LoyaltyStamp, LoyaltyReward,
    Referral, SubscriptionPlan, UserSubscription,
    PricingCategory, PricingItem, Branding
)

User = get_user_model()

# ------------------------------------------------------------
# 1. USERS
# ------------------------------------------------------------
def create_users():
    print("Creating users...")

    # Admin
    admin, _ = User.objects.get_or_create(
        phone_number='254700000001',
        defaults={'role': 'admin', 'name': 'Super Admin', 'is_staff': True, 'is_superuser': True}
    )

    # Shop Staff
    staff, _ = User.objects.get_or_create(
        phone_number='254700000002',
        defaults={'role': 'shop_staff', 'name': 'Jane Staff'}
    )
    StaffProfile.objects.get_or_create(user=staff)

    # Riders
    rider1, _ = User.objects.get_or_create(
        phone_number='254700000003',
        defaults={'role': 'rider', 'name': 'John Rider'}
    )
    RiderProfile.objects.get_or_create(user=rider1, defaults={'is_available': True, 'vehicle_plate': 'KCB 123A'})

    rider2, _ = User.objects.get_or_create(
        phone_number='254700000004',
        defaults={'role': 'rider', 'name': 'Mary Rider'}
    )
    RiderProfile.objects.get_or_create(user=rider2, defaults={'is_available': True, 'vehicle_plate': 'KCB 456B'})

    # Clients (students)
    clients_data = [
        {'phone': '254712345678', 'name': 'Alice Mwangi', 'hostel': 'Bethel Hostel', 'room': '101'},
        {'phone': '254712345679', 'name': 'Brian Otieno', 'hostel': 'Grace Hostel', 'room': '204'},
        {'phone': '254712345680', 'name': 'Cynthia Akinyi', 'hostel': 'Lukenya Courts', 'room': '12'},
        {'phone': '254712345681', 'name': 'David Kariuki', 'hostel': 'Bethel Hostel', 'room': '305'},
        {'phone': '254712345682', 'name': 'Eunice Wanjiru', 'hostel': 'Grace Hostel', 'room': '108'},
    ]

    for c in clients_data:
        user, _ = User.objects.get_or_create(
            phone_number=c['phone'],
            defaults={'role': 'client', 'name': c['name']}
        )
        profile, _ = ClientProfile.objects.get_or_create(
            user=user,
            defaults={
                'hostel': c['hostel'],
                'room_number': c['room'],
                'prefers_fabric_softener': random.choice([True, False]),
                'prefers_scent_free': random.choice([True, False]),
                'prefers_color_separation': random.choice([True, False]),
            }
        )
        # Set referral code if not set
        if not profile.referral_code:
            # Generate from name + random digits
            name_part = c['name'].replace(' ', '')[:6]
            name_part = ''.join(ch for ch in name_part if ch.isalnum())
            if not name_part:
                name_part = 'USER'
            suffix = str(random.randint(1000, 9999))
            code = f"{name_part}{suffix}"
            while ClientProfile.objects.filter(referral_code=code).exists():
                suffix = str(random.randint(1000, 9999))
                code = f"{name_part}{suffix}"
            profile.referral_code = code
            profile.save()

    print(f"✅ Created {len(clients_data)} clients, staff, riders and admin.")

# ------------------------------------------------------------
# 2. ORDERS
# ------------------------------------------------------------
def create_orders():
    print("Creating orders...")

    clients = list(User.objects.filter(role='client'))
    riders = list(User.objects.filter(role='rider'))
    staff = User.objects.get(phone_number='254700000002')

    if not clients:
        print("❌ No clients found. Run create_users first.")
        return

    statuses = ['created', 'picked_up', 'washing', 'drying', 'ready', 'delivered', 'cancelled']
    now = timezone.now()
    order_count = 0

    # For each client, create 1-3 orders spread over time
    for client in clients:
        num_orders = random.randint(1, 3)
        for j in range(num_orders):
            # Random date: between 7 days ago and now
            days_ago = random.randint(0, 7)
            hours_ago = random.randint(0, 23)
            minutes_ago = random.randint(0, 59)
            created_at = now - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)

            # Random status, but ensure the status progression makes sense with created_at
            # We'll assign based on date: older orders more likely delivered
            if days_ago >= 2 and random.random() < 0.7:
                status = 'delivered'
            elif days_ago >= 1 and random.random() < 0.5:
                status = 'ready'
            elif days_ago >= 1:
                status = random.choice(['drying', 'washing'])
            else:
                status = random.choice(['created', 'picked_up', 'washing'])

            # Sometimes cancelled
            if random.random() < 0.05:
                status = 'cancelled'

            payment_status = 'paid' if status in ['delivered', 'cancelled'] else random.choice(['pending', 'paid'])
            # If cancelled, usually pending
            if status == 'cancelled':
                payment_status = 'pending'

            total_price = Decimal(random.randint(200, 1200))
            if random.random() < 0.4:
                total_price += Decimal(random.randint(0, 500))  # Add bulky item extra

            pickup_location = random.choice(['Bethel Hostel', 'Grace Hostel', 'Lukenya Courts', 'Other'])
            delivery_location = random.choice(['Bethel Hostel', 'Grace Hostel', 'Lukenya Courts', 'Other'])

            order = Order.objects.create(
                student=client,
                status=status,
                payment_status=payment_status,
                total_price=total_price,
                pickup_location=pickup_location,
                delivery_location=delivery_location,
                special_instructions=random.choice(['', 'Use fabric softener', 'Separate colors', 'Fragrance-free']),
                created_at=created_at,
                updated_at=created_at,
                points_used=0,
                discount_from_points=Decimal(0),
                points_awarded=False,
            )
            # order_number auto-generated

            # Add order items
            # 1-2 items per order
            num_items = random.randint(1, 2)
            for _ in range(num_items):
                if random.random() < 0.7:
                    # Regular item
                    weight = round(random.uniform(0.5, 4.0), 1)
                    price = weight * 80
                    OrderItem.objects.create(
                        order=order,
                        item_type='regular',
                        description='Clothes',
                        weight_kg=weight,
                        price=price
                    )
                else:
                    # Bulky item
                    bulky_desc = random.choice(['Duvet Small', 'Duvet Medium', 'Blazer', 'Jacket'])
                    price = random.choice([250, 350, 400, 200])
                    OrderItem.objects.create(
                        order=order,
                        item_type='bulky',
                        description=bulky_desc,
                        flat_rate=price,
                        price=price
                    )

            # Assign rider for ready or delivered
            if status in ['ready', 'delivered'] and riders:
                order.assigned_rider = random.choice(riders)
                order.save()

            # For delivered orders, create loyalty stamp
            if status == 'delivered':
                LoyaltyStamp.objects.get_or_create(user=client, order=order)

            # For some delivered orders, apply points discount (simulate)
            if status == 'delivered' and random.random() < 0.2:
                # Redeem 100 points for 10% discount (simulate)
                profile = client.client_profile
                if profile.points >= 100:
                    profile.points -= 100
                    profile.save()
                    discount = order.total_price * Decimal(0.1)
                    order.total_price -= discount
                    order.points_used = 100
                    order.discount_from_points = discount
                    order.save()

            # Create status history (optional)
            # We'll just create one or two history entries for simplicity
            if status != 'created':
                # At least one status change
                prev_status = 'created'
                if status in ['picked_up', 'washing', 'drying', 'ready', 'delivered']:
                    OrderStatusHistory.objects.create(
                        order=order,
                        status='created',
                        updated_by=staff,
                        created_at=created_at - timedelta(minutes=random.randint(5, 30))
                    )
                if status in ['washing', 'drying', 'ready', 'delivered'] and status != 'picked_up':
                    OrderStatusHistory.objects.create(
                        order=order,
                        status='picked_up',
                        updated_by=staff,
                        created_at=created_at - timedelta(minutes=random.randint(1, 20))
                    )
                # Add the final status
                OrderStatusHistory.objects.create(
                    order=order,
                    status=status,
                    updated_by=staff if status != 'delivered' else None,
                    created_at=created_at
                )

            order_count += 1

            # For some orders, add M-PESA receipt (simulate)
            if payment_status == 'paid' and random.random() < 0.6:
                # Generate a fake receipt
                receipt = f'MP{random.randint(100000, 999999)}'
                order.mpesa_receipt = receipt
                order.save()

    print(f"✅ Created {order_count} orders across all clients.")

# ------------------------------------------------------------
# 3. REFERRALS & POINTS
# ------------------------------------------------------------
def create_referrals():
    print("Creating referrals...")

    clients = list(User.objects.filter(role='client'))
    if len(clients) < 2:
        return

    # Create some referrals
    for i in range(3):
        referrer = random.choice(clients)
        # pick a referee who is not the referrer
        possible = [c for c in clients if c != referrer]
        if not possible:
            continue
        referee = random.choice(possible)

        # Check if referral already exists
        if Referral.objects.filter(referrer=referrer, referee=referee).exists():
            continue

        # Find an order from the referee that is delivered
        order = Order.objects.filter(student=referee, status='delivered').first()
        if not order:
            continue

        referral = Referral.objects.create(
            referrer=referrer,
            referee=referee,
            order=order,
            reward_issued=True
        )
        # Award points to referrer if not already awarded
        if referral.reward_issued:
            profile = referrer.client_profile
            profile.points += 100
            profile.save()

    print("✅ Referrals created and points awarded.")

# ------------------------------------------------------------
# 4. INVENTORY & EXPENSES
# ------------------------------------------------------------
def create_inventory():
    print("Creating inventory...")

    items = [
        {'name': 'Detergent (5L)', 'category': 'Cleaning', 'quantity': 20, 'reorder_threshold': 5, 'unit_cost': 350},
        {'name': 'Fabric Softener (5L)', 'category': 'Cleaning', 'quantity': 15, 'reorder_threshold': 4, 'unit_cost': 400},
        {'name': 'Bleach (1L)', 'category': 'Cleaning', 'quantity': 10, 'reorder_threshold': 3, 'unit_cost': 120},
        {'name': 'Stain Remover', 'category': 'Cleaning', 'quantity': 8, 'reorder_threshold': 2, 'unit_cost': 200},
        {'name': 'Laundry Bags (50pcs)', 'category': 'Packaging', 'quantity': 100, 'reorder_threshold': 20, 'unit_cost': 500},
    ]
    for item in items:
        InventoryItem.objects.get_or_create(
            name=item['name'],
            defaults={
                'category': item['category'],
                'quantity': item['quantity'],
                'reorder_threshold': item['reorder_threshold'],
                'unit_cost': item['unit_cost'],
            }
        )
    print("✅ Inventory items created.")

def create_expenses():
    print("Creating expenses...")

    categories = ['utilities', 'rent', 'supplies', 'maintenance', 'other']
    now = timezone.now()
    for i in range(10):
        days_ago = random.randint(0, 30)
        date = now - timedelta(days=days_ago)
        amount = Decimal(random.randint(500, 5000))
        Expense.objects.create(
            category=random.choice(categories),
            amount=amount,
            description=f"Expense for {date.strftime('%B')}",
            date=date
        )
    print("✅ Expenses created.")

# ------------------------------------------------------------
# 5. PROMO CODES
# ------------------------------------------------------------
def create_promos():
    print("Creating promo codes...")

    promos = [
        {'code': 'WELCOME10', 'discount_type': 'percentage', 'discount_value': 10, 'usage_limit': 50},
        {'code': 'STUDENT20', 'discount_type': 'percentage', 'discount_value': 20, 'usage_limit': 30},
        {'code': 'FLASH15', 'discount_type': 'percentage', 'discount_value': 15, 'usage_limit': 20},
    ]
    now = timezone.now()
    for p in promos:
        PromoCode.objects.get_or_create(
            code=p['code'],
            defaults={
                'discount_type': p['discount_type'],
                'discount_value': p['discount_value'],
                'start_date': now - timedelta(days=5),
                'end_date': now + timedelta(days=30),
                'usage_limit': p['usage_limit'],
                'used_count': random.randint(0, p['usage_limit']//2),
                'is_active': True,
            }
        )
    print("✅ Promo codes created.")

# ------------------------------------------------------------
# 6. SUBSCRIPTION PLANS
# ------------------------------------------------------------
def create_subscriptions():
    print("Creating subscription plans...")

    plans = [
        {'name': 'Bronze Monthly', 'price': 600, 'validity_days': 30, 'load_quantity_kg': 7, 'discount_rate': 5},
        {'name': 'Silver Monthly', 'price': 1000, 'validity_days': 30, 'load_quantity_kg': 12, 'discount_rate': 10},
        {'name': 'Gold Weekly', 'price': 500, 'validity_days': 7, 'load_quantity_kg': 5, 'discount_rate': 15},
    ]
    for plan in plans:
        SubscriptionPlan.objects.get_or_create(
            name=plan['name'],
            defaults={
                'description': f"{plan['name']} plan",
                'price': plan['price'],
                'validity_days': plan['validity_days'],
                'load_quantity_kg': plan['load_quantity_kg'],
                'discount_rate': plan['discount_rate'],
            }
        )
    print("✅ Subscription plans created.")

# ------------------------------------------------------------
# 7. PRICING & BRANDING
# ------------------------------------------------------------
def seed_pricing():
    print("Seeding pricing...")

    categories = [
        {"name": "Clothes (per kg)", "icon": "👕"},
        {"name": "Duvets / Blankets", "icon": "🛏️"},
        {"name": "Special Items", "icon": "👔"},
    ]
    items = {
        "Clothes (per kg)": [
            {"service": "Wash & Dry", "price": "80 KSH"},
            {"service": "Wash & Iron", "price": "150 KSH"},
            {"service": "Curtains", "price": "120 KSH"},
            {"service": "Towels", "price": "100 KSH"},
        ],
        "Duvets / Blankets": [
            {"service": "Small (4×6)", "price": "350 KSH"},
            {"service": "Medium (5×6)", "price": "400 KSH"},
            {"service": "Large (6×6)", "price": "450 KSH"},
            {"service": "Throw / Fleece", "price": "250 KSH"},
        ],
        "Special Items": [
            {"service": "Suit (Blazer + Trouser)", "price": "350 KSH"},
            {"service": "Suit (Wash, Dry & Iron)", "price": "450 KSH"},
            {"service": "Blazer / Heavy Jacket", "price": "200 KSH"},
            {"service": "Graduation Gown", "price": "300 KSH"},
            {"service": "Door Mat", "price": "150 KSH"},
        ],
    }
    for cat_data in categories:
        cat, _ = PricingCategory.objects.get_or_create(
            name=cat_data["name"],
            defaults={"icon": cat_data["icon"], "is_active": True}
        )
        for item_data in items[cat_data["name"]]:
            PricingItem.objects.get_or_create(
                category=cat,
                service=item_data["service"],
                defaults={"price": item_data["price"], "is_active": True}
            )
    print("✅ Pricing seeded.")

def seed_branding():
    print("Seeding branding...")
    branding, _ = Branding.objects.get_or_create(
        id=1,
        defaults={
            'company_name': 'Bubble Basket Laundry',
            'tagline': 'Fast & Fresh! Need It Today?',
            'sub_tagline': 'Book before 10 AM, get it back by 5 PM',
            'phone': '0793 272 588',
            'location': 'Daystar, Athi River',
            'footer_message': 'We clean more than clothes, we care for you',
            'pillars': [
                {'icon': 'Truck', 'title': 'FREE PICK UP & DELIVERY', 'description': 'We come to you'},
                {'icon': 'Sparkles', 'title': 'QUALITY WASH', 'description': 'Expert care'},
                {'icon': 'ShieldCheck', 'title': 'EXPERT CARE', 'description': 'We care for you'},
                {'icon': 'Package', 'title': 'NEATLY FOLDED', 'description': 'Ready to wear'},
            ],
            'payment_paybill': '303030',
            'payment_account': '2051303388',
            'payment_airtel': '*222#',
            'payment_tkash': '*160#',
        }
    )
    print("✅ Branding seeded.")

# ------------------------------------------------------------
# 8. LOYALTY REWARD
# ------------------------------------------------------------
def create_loyalty_reward():
    print("Creating loyalty reward...")
    LoyaltyReward.objects.get_or_create(
        id=1,
        defaults={
            'stamps_required': 5,
            'reward_description': 'Free order',
            'reward_value': 0,
            'is_active': True,
        }
    )
    print("✅ Loyalty reward configured.")

# ------------------------------------------------------------
# MAIN EXECUTION
# ------------------------------------------------------------
def run():
    print("🌱 Starting data seeding...")
    create_users()
    create_orders()
    create_referrals()
    create_inventory()
    create_expenses()
    create_promos()
    create_subscriptions()
    seed_pricing()
    seed_branding()
    create_loyalty_reward()
    print("✅ Data seeding complete!")

if __name__ == "__main__":
    run()