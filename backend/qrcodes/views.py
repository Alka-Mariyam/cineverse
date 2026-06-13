import qrcode
import uuid
from io import BytesIO
from django.utils import timezone
from django.core.files.base import ContentFile
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404

from .models import QRCode, QRAuditLog
from .serializers import QRCodeSerializer

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')

class QRCodeViewSet(viewsets.ModelViewSet):
    queryset = QRCode.objects.all()
    serializer_class = QRCodeSerializer
    permission_classes = [IsAuthenticated]

    def _log_audit(self, qr_code, action, request, details=""):
        QRAuditLog.objects.create(
            qr_code=qr_code,
            action=action,
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            details=details
        )

    @action(detail=False, methods=['post'])
    def generate(self, request):
        entity_id = request.data.get('entityId')
        entity_type = request.data.get('entityType')

        if not entity_id or not entity_type:
            return Response({"success": False, "error": "Missing entityId or entityType"}, status=status.HTTP_400_BAD_REQUEST)

        # Create QR Object
        qr = QRCode.objects.create(
            entity_id=entity_id,
            entity_type=entity_type,
            generated_by=request.user
        )

        # Generate Physical Image
        qr_data = f'{{"token": "{qr.qr_token}"}}'
        img = qrcode.make(qr_data)
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        
        qr.qr_image.save(f'qr_{qr.id}.png', ContentFile(buffer.getvalue()), save=True)

        self._log_audit(qr, 'GENERATED', request)

        serializer = self.get_serializer(qr)
        return Response({
            "success": True,
            "qrId": qr.id,
            "qrUrl": request.build_absolute_uri(qr.qr_image.url) if qr.qr_image else "",
            "token": qr.qr_token
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def verify(self, request):
        token = request.data.get('token')
        if not token:
            return Response({"valid": False, "message": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            qr = QRCode.objects.get(qr_token=token)
        except QRCode.DoesNotExist:
            return Response({"valid": False, "message": "QR code is invalid or expired"}, status=status.HTTP_404_NOT_FOUND)

        if qr.status == 'REVOKED':
            self._log_audit(qr, 'FAILED', request, "Attempted to verify revoked token")
            return Response({"valid": False, "message": "QR code is revoked"}, status=status.HTTP_403_FORBIDDEN)

        if qr.status == 'EXPIRED' or (qr.expires_at and qr.expires_at < timezone.now()):
            if qr.status != 'EXPIRED':
                qr.status = 'EXPIRED'
                qr.save()
            self._log_audit(qr, 'FAILED', request, "Attempted to verify expired token")
            return Response({"valid": False, "message": "QR code is expired"}, status=status.HTTP_403_FORBIDDEN)

        # Success
        qr.last_verified_at = timezone.now()
        qr.save()
        self._log_audit(qr, 'VERIFIED', request)

        return Response({
            "valid": True,
            "message": "QR verified successfully",
            "data": {
                "entityId": qr.entity_id,
                "entityType": qr.entity_type
            }
        })

    @action(detail=True, methods=['patch'])
    def revoke(self, request, pk=None):
        qr = self.get_object()
        if qr.status == 'REVOKED':
            return Response({"success": False, "message": "Already revoked"}, status=status.HTTP_400_BAD_REQUEST)
            
        qr.status = 'REVOKED'
        qr.revoked_at = timezone.now()
        qr.save()
        
        self._log_audit(qr, 'REVOKED', request)
        return Response({"success": True, "message": "QR code revoked successfully"})

    @action(detail=True, methods=['post'])
    def regenerate(self, request, pk=None):
        old_qr = self.get_object()
        
        # Revoke old one automatically
        old_qr.status = 'REVOKED'
        old_qr.revoked_at = timezone.now()
        old_qr.save()
        self._log_audit(old_qr, 'REVOKED', request, "Regenerated")

        # Create new one
        new_qr = QRCode.objects.create(
            entity_id=old_qr.entity_id,
            entity_type=old_qr.entity_type,
            generated_by=request.user
        )
        
        qr_data = f'{{"token": "{new_qr.qr_token}"}}'
        img = qrcode.make(qr_data)
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        new_qr.qr_image.save(f'qr_{new_qr.id}.png', ContentFile(buffer.getvalue()), save=True)

        self._log_audit(new_qr, 'GENERATED', request, f"Regenerated from {old_qr.id}")

        return Response({
            "success": True,
            "qrId": new_qr.id,
            "qrUrl": request.build_absolute_uri(new_qr.qr_image.url) if new_qr.qr_image else "",
            "token": new_qr.qr_token
        })
