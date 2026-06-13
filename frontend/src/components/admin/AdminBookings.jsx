import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import qrService from '../../api/qrService';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, XCircle, Search, Camera } from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [scannerActive, setScannerActive] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [verifyResult, setVerifyResult] = useState(null); // { valid: bool, message: str, data: obj }

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

  useEffect(() => {
    if (scannerActive) {
      const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(onScanSuccess, onScanFailure);

      return () => {
        scanner.clear().catch(error => console.error("Failed to clear scanner", error));
      };
    }
  }, [scannerActive]);

  const onScanSuccess = async (decodedText) => {
    // Expected format from our Enterprise QR: `https://cineverse-smoky.vercel.app/validate/bookingId/TOKEN`
    // Extract token from URL, or if it's raw JSON (from older tests) extract the token field.
    let tokenToVerify = decodedText;
    
    try {
      // If it's a JSON string
      const parsed = JSON.parse(decodedText);
      if (parsed.token) tokenToVerify = parsed.token;
    } catch (e) {
      // If it's a URL
      const parts = decodedText.split('/');
      tokenToVerify = parts[parts.length - 1];
    }

    verifyQRToken(tokenToVerify);
    setScannerActive(false); // Stop scanner on success
  };

  const onScanFailure = (error) => {
    // Ignore frequent scan failures (happens every frame it doesn't see a QR)
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
                  <h3 style={{ color: '#00C851' }}>Access Granted</h3>
                  <div style={{ textAlign: 'left', marginTop: '20px', color: 'var(--text-secondary)' }}>
                    <p><strong>Movie:</strong> {verifyResult.data.movie_title}</p>
                    <p><strong>Theatre:</strong> {verifyResult.data.theatre} ({verifyResult.data.screen})</p>
                    <p><strong>Seats:</strong> {verifyResult.data.seats}</p>
                    <p><strong>User:</strong> {verifyResult.data.user}</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle size={60} color="#ff4444" style={{ margin: '0 auto 10px' }} />
                  <h3 style={{ color: '#ff4444' }}>Access Denied</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{verifyResult.message}</p>
                </>
              )}
              <button className="btn btn-outline" style={{ marginTop: '20px', width: '100%' }} onClick={() => setVerifyResult(null)}>Scan Another</button>
            </div>
          ) : (
            <>
              {!scannerActive ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <button className="btn btn-primary" onClick={() => setScannerActive(true)}>
                    <Camera size={20} style={{ marginRight: '10px' }} /> Start Camera Scanner
                  </button>
                </div>
              ) : (
                <div id="qr-reader" style={{ width: '100%', marginTop: '20px', background: '#fff' }}></div>
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
                  <td><small>{b.id.substring(0,8)}...</small></td>
                  <td>{b.user_email || b.user}</td>
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
