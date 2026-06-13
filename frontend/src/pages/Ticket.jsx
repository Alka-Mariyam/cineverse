import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Download, CheckCircle, MapPin, Calendar, Clock } from 'lucide-react';
import './Ticket.css';

const Ticket = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/bookings/${bookingId}/`)
      .then(res => {
        setBooking(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [bookingId]);

  if (loading) return <div className="loading-spinner">Generating ticket...</div>;
  if (!booking) return <div className="error">Ticket not found</div>;

  return (
    <div className="container ticket-page" style={{ paddingTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="ticket-success" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <CheckCircle size={64} color="var(--accent-color)" style={{ marginBottom: '10px' }} />
        <h2 style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>Booking Confirmed!</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Your tickets have been successfully booked.</p>
      </div>

      <div className="ticket-card glass-panel" id="ticket-content" style={{ width: '100%', maxWidth: '500px', padding: '30px', borderRadius: '15px', position: 'relative' }}>
        <div className="ticket-header" style={{ borderBottom: '1px dashed var(--border-color)', paddingBottom: '20px', marginBottom: '20px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.8rem', margin: 0 }}>CineVerse</h3>
          <span className="booking-id" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>ID: #{booking.id}</span>
        </div>
        
        <div className="ticket-body">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>{booking.show.movie_title}</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={18} color="var(--accent-color)" />
              <span>{booking.show.screen.theatre.name} - {booking.show.screen.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={18} color="var(--accent-color)" />
              <span>{new Date(booking.show.date).toDateString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={18} color="var(--accent-color)" />
              <span>{booking.show.start_time}</span>
            </div>
          </div>
          
          <div className="ticket-row" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginBottom: '15px' }}>
            <div className="ticket-info">
              <p className="label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Amount Paid</p>
              <p className="value" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹{booking.total_amount}</p>
            </div>
            <div className="ticket-info">
              <p className="label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status</p>
              <p className="value" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{booking.status}</p>
            </div>
          </div>
          
          {/* QR Code Section */}
          {booking.qr_code && (
            <div className="qr-code-section" style={{ textAlign: 'center', marginTop: '30px' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Scan for entry</p>
              <img 
                src={booking.qr_code} 
                alt="Ticket QR Code" 
                style={{ width: '150px', height: '150px', borderRadius: '10px', background: '#fff', padding: '10px', boxShadow: '0 0 20px rgba(229, 9, 20, 0.4)' }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="ticket-actions" style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
        <button className="btn btn-outline" onClick={() => window.print()}>
          <Download size={18} style={{ marginRight: '8px' }} />
          Download Ticket
        </button>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    </div>
  );
};

export default Ticket;
