from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/users/', include('apps.users.urls')),   # NEW: for user listing endpoints
    path('api/payments/', include('apps.payments.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/admin/', include('apps.admin_tools.urls')),
]
