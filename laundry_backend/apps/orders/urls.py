from django.urls import path
from .views import (
    ApplyPointsView, OrderCreateView, OrderListView, OrderDetailView, OrderStatusUpdateView,
    ApplyPromoView, ApplyReferralView, CancelOrderView,
    AssignRiderView, RiderDeliverView
)

urlpatterns = [
    path('', OrderListView.as_view(), name='order-list'),
    path('create/', OrderCreateView.as_view(), name='order-create'),
    path('<int:id>/', OrderDetailView.as_view(), name='order-detail'),
    path('<int:order_id>/apply-points/', ApplyPointsView.as_view(), name='apply-points'),
    path('<int:id>/status/', OrderStatusUpdateView.as_view(), name='order-status-update'),
    path('<int:order_id>/apply-promo/', ApplyPromoView.as_view(), name='apply-promo'),
    path('<int:order_id>/apply-referral/', ApplyReferralView.as_view(), name='apply-referral'),
    path('<int:order_id>/cancel/', CancelOrderView.as_view(), name='cancel-order'),
    path('<int:order_id>/assign-rider/', AssignRiderView.as_view(), name='assign-rider'),
    path('<int:order_id>/deliver/', RiderDeliverView.as_view(), name='rider-deliver'),
]
