"""Sending the contact form through Microsoft Graph.

Uses the client credentials flow: the registered app authenticates as itself and
sends on behalf of MS_GRAPH_SENDER. There is no mailbox password anywhere, and
nothing here depends on SMTP being reachable.
"""

import threading
import time

import requests
from django.conf import settings

TOKEN_URL = "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
SEND_URL = "https://graph.microsoft.com/v1.0/users/{sender}/sendMail"

_token = {"value": None, "expires": 0.0}
_lock = threading.Lock()


class MailNotConfigured(RuntimeError):
    pass


def _access_token():
    missing = [
        name for name in
        ("MS_GRAPH_TENANT_ID", "MS_GRAPH_CLIENT_ID", "MS_GRAPH_CLIENT_SECRET", "MS_GRAPH_SENDER")
        if not getattr(settings, name, "")
    ]
    if missing:
        raise MailNotConfigured(f"missing settings: {', '.join(missing)}")

    with _lock:
        if _token["value"] and time.time() < _token["expires"]:
            return _token["value"]

        res = requests.post(
            TOKEN_URL.format(tenant=settings.MS_GRAPH_TENANT_ID),
            data={
                "client_id": settings.MS_GRAPH_CLIENT_ID,
                "client_secret": settings.MS_GRAPH_CLIENT_SECRET,
                "scope": "https://graph.microsoft.com/.default",
                "grant_type": "client_credentials",
            },
            timeout=10,
        )
        res.raise_for_status()
        payload = res.json()

        _token["value"] = payload["access_token"]
        _token["expires"] = time.time() + int(payload.get("expires_in", 3600)) - 60
        return _token["value"]


def send_enquiry(enquiry):
    """Post one ContactMessage to Graph. Raises on any failure — the caller
    records that against the stored message rather than losing it."""

    if not settings.CONTACT_RECIPIENT:
        raise MailNotConfigured("missing settings: CONTACT_RECIPIENT")

    lines = [
        f"Name:    {enquiry.name}",
        f"Company: {enquiry.company}",
        f"Email:   {enquiry.email}",
    ]
    if enquiry.phone:
        lines.append(f"Phone:   {enquiry.phone}")
    lines += ["", enquiry.message, "", "—", "Sent from the contact form on thecreativesphere.com"]

    res = requests.post(
        SEND_URL.format(sender=settings.MS_GRAPH_SENDER),
        headers={"Authorization": f"Bearer {_access_token()}"},
        json={
            "message": {
                "subject": f"New enquiry — {enquiry.company}",
                "body": {"contentType": "Text", "content": "\n".join(lines)},
                "toRecipients": [
                    {"emailAddress": {"address": settings.CONTACT_RECIPIENT}},
                ],
                "replyTo": [{"emailAddress": {"address": enquiry.email}}],
            },
            "saveToSentItems": True,
        },
        timeout=20,
    )
    res.raise_for_status()
