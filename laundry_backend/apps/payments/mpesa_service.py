import base64, datetime, requests
from django.conf import settings

class MpesaService:
    def __init__(self):
        self.consumer_key = settings.MPESA_CONSUMER_KEY
        self.consumer_secret = settings.MPESA_CONSUMER_SECRET
        self.shortcode = settings.MPESA_SHORTCODE
        self.passkey = settings.MPESA_PASSKEY
        self.callback_url = settings.MPESA_CALLBACK_URL
        self.token_url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
        self.stk_push_url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'

    def _get_access_token(self):
        response = requests.get(self.token_url, auth=(self.consumer_key, self.consumer_secret))
        return response.json().get('access_token')

    def _generate_password(self):
        timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
        password_str = f"{self.shortcode}{self.passkey}{timestamp}"
        encoded = base64.b64encode(password_str.encode()).decode('utf-8')
        return encoded, timestamp

    def initiate_stk_push(self, phone_number, amount, order_id):
        access_token = self._get_access_token()
        password, timestamp = self._generate_password()
        payload = {
            'BusinessShortCode': self.shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': 'CustomerPayBillOnline',
            'Amount': amount,
            'PartyA': phone_number,
            'PartyB': self.shortcode,
            'PhoneNumber': phone_number,
            'CallBackURL': self.callback_url,
            'AccountReference': f'ORDER-{order_id}',
            'TransactionDesc': f'Laundry payment for order {order_id}'
        }
        headers = {'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'}
        response = requests.post(self.stk_push_url, json=payload, headers=headers)
        return response.json()
