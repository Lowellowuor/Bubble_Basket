import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from apps.orders.models import Order
from .mpesa_service import MpesaService

mpesa = MpesaService()

class InitiatePaymentView(APIView):
    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id, student=request.user)
        if order.payment_status == 'paid':
            return Response({'error': 'Already paid'}, status=400)
        phone = request.user.phone_number
        if not phone.startswith('254'):
            phone = '254' + phone.lstrip('0')
        response = mpesa.initiate_stk_push(phone, int(order.total_price), order.id)
        if response.get('ResponseCode') == '0':
            order.payment_status = 'pending'
            order.save()
            return Response({'checkout_request_id': response.get('CheckoutRequestID')})
        return Response({'error': response.get('errorMessage')}, status=400)

class MpesaCallbackView(APIView):
    permission_classes = []
    def post(self, request):
        data = request.data
        body = data.get('Body', {})
        stk_callback = body.get('stkCallback', {})
        result_code = stk_callback.get('ResultCode')
        checkout_request_id = stk_callback.get('CheckoutRequestID')
        if result_code == 0:
            callback_metadata = stk_callback.get('CallbackMetadata', {})
            items = callback_metadata.get('Item', [])
            amount = next((item['Value'] for item in items if item['Name'] == 'Amount'), None)
            mpesa_receipt = next((item['Value'] for item in items if item['Name'] == 'MpesaReceiptNumber'), None)
            order = Order.objects.filter(payment_transaction_id=checkout_request_id).first()
            if order:
                order.payment_status = 'paid'
                order.mpesa_receipt = mpesa_receipt
                order.save()
                return Response({'ResultCode': 0, 'ResultDesc': 'Success'})
        return Response({'ResultCode': 1, 'ResultDesc': 'Failure'})
