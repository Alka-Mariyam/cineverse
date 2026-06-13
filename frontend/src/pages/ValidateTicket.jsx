import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle, XCircle, Home, Film, MapPin, Calendar, Users } from 'lucide-react';
import './Ticket.css';

import qrService from '../api/qrService';

const ValidateTicket = () => {
  const { bookingId, token } = useParams();
  const [manualToken, setManualToken] = useState(token || '');
  const [status, setStatus] = useState(token ? 'loading' : 'idle'); // idle, loading, success, used, error
  const [details, setDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const verifyToken = (tokenToVerify) => {
    setStatus('loading');
    qrService.verifyQR(tokenToVerify)
      .then(res => {
        if (res.valid) {
          setDetails(res.data);
          setStatus('success');
        } else {
          setErrorMessage(res.message);
          setStatus('error');
        }
      })
      .catch(err => {
        console.error(err);
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'Failed to validate ticket');
      });
  };

  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualToken) {
      verifyToken(manualToken);
    }
  };

  if (status === 'loading') {
    return (
      <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>
        <div className="loading-spinner">Scanning Ticket...</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>
        <XCircle size={80} color="#ff4444" style={{ marginBottom: '20px' }} />
        <h2>Invalid Ticket</h2>
        <p className="text-muted">{errorMessage}</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="container ticket-page" style={{ paddingTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {status === 'success' ? (
        <div className="ticket-success" style={{ textAlign: 'center', marginBottom: '30px' }}>
          <CheckCircle size={80} color="#00C851" style={{ marginBottom: '10px' }} />
          <h2 style={{ fontSize: '2.5rem', color: '#00C851' }}>ACCESS GRANTED</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Ticket is valid. Have a great time!</p>
        </div>
      ) : (
        <div className="ticket-success" style={{ textAlign: 'center', marginBottom: '30px' }}>
          <XCircle size={80} color="#ff4444" style={{ marginBottom: '10px' }} />
          <h2 style={{ fontSize: '2.5rem', color: '#ff4444' }}>TICKET ALREADY SCANNED</h2>
          <p style={{ color: 'var(--text-secondary)' }}>This ticket has already been used for entry.</p>
        </div>
      )}

      <div className="ticket-card glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '30px', borderRadius: '15px' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--primary-color)' }}>Ticket Details</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Film size={20} color="var(--accent-color)" />
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{details.movie_title}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={20} color="var(--accent-color)" />
            <span>{details.theatre} - {details.screen}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={20} color="var(--accent-color)" />
            <span>{details.date} at {details.time}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="var(--accent-color)" />
            <span>Seats: {details.seats}</span>
          </div>

          <div style={{ borderTop: '1px dashed var(--border-color)', marginTop: '10px', paddingTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Booked By</p>
              <p style={{ fontWeight: 'bold' }}>{details.user}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Booking ID</p>
              <p style={{ fontWeight: 'bold' }}>#{bookingId}</p>
            </div>
          </div>
        </div>
      </div>

      <Link to="/" className="btn btn-outline" style={{ marginTop: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Home size={18} />
        Back to Dashboard
      </Link>
    </div>
  );
};

export default ValidateTicket;
