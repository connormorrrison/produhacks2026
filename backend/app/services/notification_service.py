class NotificationService:
    def should_notify_emergency_contact(self, urgency_level: str) -> bool:
        return urgency_level.lower() in {"high", "critical", "emergency", "urgent"}

    def send_emergency_notification(self, recipient_name: str, phone_number: str, reason: str) -> str:
        # Hook this into Twilio, Firebase, or APNs later.
        if not phone_number:
            return "failed_missing_phone"
        return f"queued_for_{recipient_name.lower().replace(' ', '_')}"

    def send_call_invite(self, recipient_name: str, phone_number: str, join_url: str) -> str:
        # Hook this into push notifications or SMS deep links later.
        if not phone_number:
            return "failed_missing_phone"
        if not join_url:
            return "failed_missing_link"
        return f"invite_queued_for_{recipient_name.lower().replace(' ', '_')}"
