from rest_framework import serializers
from .models import QRCode, QRAuditLog

class QRCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QRCode
        fields = ['id', 'qr_token', 'entity_id', 'entity_type', 'status', 'generated_by', 'qr_image', 'created_at', 'expires_at', 'revoked_at', 'last_verified_at']
        read_only_fields = ['id', 'qr_token', 'generated_by', 'qr_image', 'created_at', 'revoked_at', 'last_verified_at']

class QRAuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = QRAuditLog
        fields = '__all__'
