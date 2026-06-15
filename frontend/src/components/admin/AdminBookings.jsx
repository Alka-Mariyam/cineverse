import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import qrService from '../../api/qrService';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, XCircle, Search, Camera, StopCircle } from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerInstance, setScannerInstance] = useState(null);
  const [manualToken, setManualToken] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const startScanner = () => {
    setScannerActive(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      setScannerInstance(scanner);
      scanner.render(onScanSuccess, onScanFailure);
    }, 100);
  };

  const stopScanner = () => {
    if (scannerInstance) {
      scannerInstance.clear().catch(e => console.error("Failed to clear scanner", e));
      setScannerInstance(null);
    }
    setScannerActive(false);
  };

  const onScanSuccess = async (decodedText) => {
    let tokenToVerify = decodedText;
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.token) tokenToVerify = parsed.token;
    } catch (e) {
      const parts = decodedText.split('/');
      tokenToVerify = parts[parts.length - 1];
    }

    verifyQRToken(tokenToVerify);
    stopScanner();
  };

  const onScanFailure = (error) => {
    // ignore
  };

  const handleManualVerify = (e) => {
    e.preventDefault();
    if (manualToken) {
      verifyQRToken(manualToken);
    }
  };

  const verifyQRToken = async (token) => {
    try {
      const res = await qrService.verifyQR(token);
      setVerifyResult(res);
    } catch (err) {
      setVerifyResult({
        valid: false,
        message: err.response?.data?.message || 'Invalid or Expired QR Code'
      });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-module">
      <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        
        {/* QR Scanner Section */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '15px' }}>
          <h3>QR Ticket Scanner</h3>
          
          {verifyResult ? (
            <div className="verify-result" style={{ textAlign: 'center', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', marginTop: '20px' }}>
              {verifyResult.valid ? (
                <>
                  <CheckCircle size={60} color="#00C851" style={{ margin: '0 auto 10px' }} />
                  <h3 style={{ color: '#00C851', marginBottom: '10px' }}>Valid Ticket - Access Granted</h3>
                  <div style={{ textAlign: 'left', marginTop: '20px', padding: '15px', background: 'rgba(0, 200, 81, 0.1)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                    <p><strong>Movie:</strong> <span style={{ color: '#fff' }}>{verifyResult.data.movie_title}</span></p>
                    <p><strong>Theatre:</strong> <span style={{ color: '#fff' }}>{verifyResult.data.theatre} ({verifyResult.data.screen})</span></p>
                    <p><strong>Seats:</strong> <span style={{ color: '#00C851', fontSize: '1.1rem', fontWeight: 'bold' }}>{verifyResult.data.seats}</span></p>
                    <p><strong>User:</strong> <span style={{ color: '#fff' }}>{verifyResult.data.user}</span></p>
                  </div>
                </>
              ) : (
                <>
                  {verifyResult.message.toLowerCase().includes('revoked') ? (
                    <>
                      <XCircle size={60} color="#ffbb33" style={{ margin: '0 auto 10px' }} />
                      <h3 style={{ color: '#ffbb33', fontSize: '1.5rem', marginBottom: '10px' }}>Ticket Already Used!</h3>
                      <div style={{ padding: '15px', background: 'rgba(255, 187, 51, 0.1)', borderRadius: '8px', marginTop: '15px' }}>
                        <p style={{ color: '#fff', margin: 0 }}>This QR code has already been scanned and cannot be used again.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle size={60} color="#ff4444" style={{ margin: '0 auto 10px' }} />
                      <h3 style={{ color: '#ff4444', fontSize: '1.5rem', marginBottom: '10px' }}>Invalid Ticket!</h3>
                      <div style={{ padding: '15px', background: 'rgba(255, 68, 68, 0.1)', borderRadius: '8px', marginTop: '15px' }}>
                        <p style={{ color: '#fff', margin: 0 }}>{verifyResult.message}</p>
                      </div>
                    </>
                  )}
                </>
              )}
              <button className="btn btn-primary" style={{ marginTop: '20px', width: '100%', padding: '12px' }} onClick={() => setVerifyResult(null)}>Scan Next Ticket</button>
            </div>
          ) : (
            <>
              {!scannerActive ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <button className="btn btn-primary" onClick={startScanner}>
                    <Camera size={20} style={{ marginRight: '10px' }} /> Start Camera Scanner
                  </button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <div id="qr-reader" style={{ width: '100%', marginTop: '20px', background: '#fff' }}></div>
                  <button className="btn btn-outline" style={{ width: '100%', marginTop: '10px' }} onClick={stopScanner}>
                    <StopCircle size={20} style={{ marginRight: '10px' }} /> Stop Scanner
                  </button>
                </div>
              )}

              <div style={{ margin: '30px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>OR</div>

              <form onSubmit={handleManualVerify} style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Enter Ticket Token manually" 
                  value={manualToken} 
                  onChange={e => setManualToken(e.target.value)} 
                  style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff' }} 
                  required 
                />
                <button type="submit" className="btn btn-primary"><Search size={18} /></button>
              </form>
            </>
          )}
        </div>

        {/* Global Bookings Table */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '15px', overflowX: 'auto' }}>
          <h3>Global Bookings</h3>
          <table className="admin-table" style={{ marginTop: '20px', width: '100%' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Show</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td><strong>#{b.id}</strong></td>
                  <td>{b.user_email || b.user || 'Unknown'}</td>
                  <td>{b.show_details?.movie_title || `Show ${b.show}`}</td>
                  <td>₹{b.total_amount}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                      background: b.status === 'Confirmed' ? 'rgba(0, 200, 81, 0.2)' : 'rgba(255, 68, 68, 0.2)',
                      color: b.status === 'Confirmed' ? '#00C851' : '#ff4444'
                    }}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default AdminBookings;
