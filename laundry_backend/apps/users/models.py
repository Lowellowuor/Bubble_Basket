from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import random

class UserManager(BaseUserManager):
    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError('Phone number is required')
        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(phone_number, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('shop_staff', 'Shop Staff'),
        ('rider', 'Rider'),
        ('admin', 'Admin'),
    )
    phone_number = models.CharField(max_length=15, unique=True)
    name = models.CharField(max_length=100, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.phone_number} ({self.role})"

    @property
    def is_client(self):
        return self.role == 'client'

    @property
    def is_shop_staff(self):
        return self.role == 'shop_staff'

    @property
    def is_rider(self):
        return self.role == 'rider'

    @property
    def is_admin_role(self):
        return self.role == 'admin'

class ClientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    hostel = models.CharField(max_length=100, blank=True)
    room_number = models.CharField(max_length=20, blank=True)
    prefers_fabric_softener = models.BooleanField(default=True)
    prefers_scent_free = models.BooleanField(default=False)
    prefers_color_separation = models.BooleanField(default=False)
    referral_code = models.CharField(max_length=20, unique=True, blank=True)
    points = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.referral_code:
            name_part = self.user.name.strip() if self.user.name else self.user.phone_number[-4:]
            name_part = ''.join(c for c in name_part if c.isalnum())
            if not name_part:
                name_part = 'USER'
            suffix = str(random.randint(1000, 9999))
            base_code = f"{name_part}{suffix}"
            while ClientProfile.objects.filter(referral_code=base_code).exists():
                suffix = str(random.randint(1000, 9999))
                base_code = f"{name_part}{suffix}"
            self.referral_code = base_code
        super().save(*args, **kwargs)

class StaffProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    shift_start = models.TimeField(null=True, blank=True)
    shift_end = models.TimeField(null=True, blank=True)

class RiderProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='rider_profile')
    vehicle_plate = models.CharField(max_length=20, blank=True)
    is_available = models.BooleanField(default=True)