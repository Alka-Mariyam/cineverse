import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying your payment...');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const bookingId = searchParams.get('booking_id');

    if (!sessionId || !bookingId) {
      setStatus('Invalid payment return URL.');
      return;
    }

    api.post('/bookings/verify_payment/', {
      session_id: sessionId,
      booking_id: bookingId
    }).then(res => {
      setStatus('Payment successful! Generating your ticket...');
      setTimeout(() => {
        navigate(`/ticket/${bookingId}`);
      }, 2000);
    }).catch(err => {
      console.error(err);
      setStatus('Payment verification failed. Please contact support.');
    });

  }, [searchParams, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>{status}</h2>
      <div className="loading-spinner" style={{marginTop: '20px'}}></div>
    </div>
  );
};

export default PaymentSuccess;
