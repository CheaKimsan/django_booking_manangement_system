import hashlib
import hmac

import requests
from django.conf import settings


class GatewayError(Exception):
    pass


def create_payment(payment):
    """Ask the gateway to create a payment. Returns a dict with gateway_id, checkout_url, qr_data."""
    resp = requests.post(
        f"{settings.GATEWAY_BASE_URL}/api/v1/payments",
        headers={'Authorization': f"Bearer {settings.GATEWAY_API_KEY}"},
        json={
            'amount': float(payment.amount),                 # CHECK: number or string?
            'currency': 'USD',                               # CHECK: USD / KHR
            'reference': payment.reference,                  # CHECK: may be called order_id / tran_id
            'description': f"Booking #{payment.booking_id}",
            'webhook_url': settings.GATEWAY_WEBHOOK_URL,     # CHECK: may be set in dashboard instead
        },
        timeout=15,
    )
    if resp.status_code >= 400:
        raise GatewayError(resp.text)
    data = resp.json()
    data = data.get('data', data)                            # CHECK: response may or may not be wrapped
    return {
        'gateway_id': str(data.get('id', '')),               # CHECK
        'checkout_url': data.get('checkout_url', ''),        # CHECK
        'qr_data': data.get('qr', data.get('qr_string', '')),  # CHECK
    }


def verify_signature(raw_body: bytes, header_value: str) -> bool:
    """HMAC-SHA256 of the raw body with the webhook secret, hex encoded."""   # CHECK: algorithm and encoding
    expected = hmac.new(
        settings.GATEWAY_WEBHOOK_SECRET.encode(), raw_body, hashlib.sha256
    ).hexdigest()
    received = (header_value or '').removeprefix('sha256=')
    return hmac.compare_digest(expected, received)


def parse_event(payload: dict) -> dict:
    """Normalize their webhook payload into what our view needs."""
    data = payload.get('data', payload)                      # CHECK
    status = str(data.get('status', '')).upper()             # CHECK: values like PAID / SUCCESS / COMPLETED
    return {
        'reference': data.get('reference'),                  # CHECK
        'paid': status in ('PAID', 'SUCCESS', 'COMPLETED'),  # CHECK
        'failed': status in ('FAILED', 'EXPIRED', 'CANCELLED'),
        'amount': data.get('amount'),                        # CHECK
    }