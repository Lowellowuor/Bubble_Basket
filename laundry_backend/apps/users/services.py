import random
from twilio.rest import Client
from django.conf import settings

twilio_client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_via_sms(phone_number, otp_code):
    twilio_client.messages.create(
        body=f'Your laundry app verification code is: {otp_code}',
        from_=settings.TWILIO_PHONE_NUMBER,
        to=phone_number
    )