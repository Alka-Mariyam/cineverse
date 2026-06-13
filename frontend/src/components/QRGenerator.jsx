import React, { useState } from 'react';
import qrService from '../api/qrService';
import { Download, RefreshCw } from 'lucide-react';
import './QRGenerator.css'; // Assume basic styling exists

const QRGenerator = ({ entityId, entityType, initialQrUrl, initialQrId }) => {
  const [qrUrl, setQrUrl] = useState(initialQrUrl || '');
  const [qrId, setQrId] = useState(initialQrId || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await qrService.generateQR(entityId, entityType);
      if (data.success) {
        setQrUrl(data.qrUrl);
        setQrId(data.qrId);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate QR');
    }
    setLoading(false);
  };

  const regenerate = async () => {
    if (!qrId) return;
    setLoading(true);
    setError('');
    try {
      const data = await qrService.regenerateQR(qrId);
      if (data.success) {
        setQrUrl(data.qrUrl);
        setQrId(data.qrId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to regenerate QR');
    }
    setLoading(false);
  };

  const downloadQR = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR_${entityType}_${entityId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="qr-generator-container">
      {error && <div className="qr-error text-danger">{error}</div>}
      
      {!qrUrl ? (
        <button className="btn btn-primary" onClick={generate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate QR Code'}
        </button>
      ) : (
        <div className="qr-display">
          <img src={qrUrl} alt="Generated QR" className="qr-image" />
          <div className="qr-actions">
            <button className="btn btn-outline" onClick={downloadQR} title="Download">
              <Download size={18} /> Download
            </button>
            <button className="btn btn-outline" onClick={regenerate} disabled={loading} title="Regenerate">
              <RefreshCw size={18} /> Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRGenerator;
