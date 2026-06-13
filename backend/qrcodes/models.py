import uuid
from django.db import models
from django.conf import settings

class QRCode(models.Model):
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('EXPIRED', 'Expired'),
        ('REVOKED', 'Revoked'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    qr_token = models.CharField(max_length=255, unique=True, default=uuid.uuid4)
    entity_id = models.CharField(max_length=255)
    entity_type = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='generated_qrs')
    
    qr_image = models.ImageField(upload_to='qrcodes/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    last_verified_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"QR {self.id} for {self.entity_type} {self.entity_id}"

class QRAuditLog(models.Model):
    ACTION_CHOICES = (
        ('GENERATED', 'Generated'),
        ('VERIFIED', 'Verified'),
        ('FAILED', 'Failed Verification'),
        ('REVOKED', 'Revoked'),
        ('REGENERATED', 'Regenerated'),
    )

    qr_code = models.ForeignKey(QRCode, on_delete=models.CASCADE, related_name='audit_logs')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, null=True, blank=True)
    details = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} on {self.qr_code.id} at {self.timestamp}"
