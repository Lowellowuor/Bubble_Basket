from django.urls import path
from .views import InitiatePaymentView, MpesaCallbackView

urlpatterns = [
    path('initiate/<int:order_id>/', InitiatePaymentView.as_view(), name='initiate-payment'),
    path('mpesa-callback/', MpesaCallbackView.as_view(), name='mpesa-callback'),
]
