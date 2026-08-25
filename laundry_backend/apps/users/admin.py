from django.contrib import admin
from .models import User, ClientProfile, StaffProfile, RiderProfile

admin.site.register(User)
admin.site.register(ClientProfile)
admin.site.register(StaffProfile)
admin.site.register(RiderProfile)
