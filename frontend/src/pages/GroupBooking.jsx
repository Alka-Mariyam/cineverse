import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import './SeatLayout.css';

const GroupBooking = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [groupBooking, setGroupBooking] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchGroupData();
  }, [token]);

  const fetchGroupData = () => {
    api.get(`/group-bookings/${token}/details_by_token/`).then(res => {
      setGroupBooking(res.data);
      return api.get(`/seats/?screen=${res.data.show.screen.id}`);
    }).then(res => {
      setSeats(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      alert('Invalid or expired Group Booking link.');
      navigate('/');
    });
  };

  const isOrganizer = user && groupBooking?.organizer === user.user_id;

  const toggleSeat = (seatId) => {
    // Check if taken
    if (groupBooking.group_seats.find(s => s.seat === seatId)) return;
    
    if (selectedSeat === seatId) {
      setSelectedSeat(null);
    } else {
      setSelectedSeat(seatId);
    }
  };

  const handleJoin = async () => {
    if (!user) {
      alert('Please sign in to join the group booking.');
      navigate('/login');
      return;
    }
    if (!selectedSeat) {
      alert('Select a seat first!');
      return;
    }

    try {
      await api.post(`/group-bookings/${token}/add_seat/`, { seat_id: selectedSeat });
      alert('Seat locked in for the group!');
      setSelectedSeat(null);
      fetchGroupData(); // refresh
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add seat');
    }
  };

  const handleConfirmPay = async () => {
    try {
      const res = await api.post(`/group-bookings/${token}/confirm/`);
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to confirm group booking');
    }
  };

  if (loading || !groupBooking) {
    return <div className="loading-spinner">Loading Group Booking...</div>;
  }

  // Group seats by row
  const rows = {};
  seats.forEach(seat => {
    if (!rows[seat.row]) rows[seat.row] = [];
    rows[seat.row].push(seat);
  });

  return (
    <div className="seat-layout-page">
      <div className="layout-header">
        <h1>Group Booking: {groupBooking.show.movie_title}</h1>
        <p>Organized by: {groupBooking.organizer_username}</p>
        {groupBooking.status !== 'Pending' && <p style={{color: 'red'}}>This booking is {groupBooking.status}</p>}
      </div>

      <div className="screen-container">
        <div className="screen-curve"></div>
        <div className="screen-text">ALL EYES THIS WAY</div>
      </div>

      <div className="seating-area" style={{ pointerEvents: groupBooking.status === 'Pending' ? 'auto' : 'none', opacity: groupBooking.status === 'Pending' ? 1 : 0.6 }}>
        {Object.keys(rows).sort().map(rowKey => (
          <div key={rowKey} className="seat-row">
            <div className="row-label">{rowKey}</div>
            <div className="seats">
              {rows[rowKey].sort((a,b) => a.number - b.number).map(seat => {
                let statusClass = 'available';
                const friendSeat = groupBooking.group_seats.find(s => s.seat === seat.id);

                if (friendSeat) {
                  statusClass = 'reserved'; // Friends picked this
                } else if (selectedSeat === seat.id) {
                  statusClass = 'selected';
                }

                return (
                  <div 
                    key={seat.id} 
                    className={`seat ${statusClass}`}
                    onClick={() => toggleSeat(seat.id)}
                    title={friendSeat ? `Picked by ${friendSeat.username}` : `Row ${seat.row} Seat ${seat.number}`}
                  >
                    {seat.number}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="legend">
        <div className="legend-item"><div className="seat available"></div> Available</div>
        <div className="legend-item"><div className="seat selected"></div> Your Pick</div>
        <div className="legend-item"><div className="seat reserved"></div> Friends Picked</div>
      </div>

      <div className="group-members-list" style={{ marginTop: '20px', width: '100%', maxWidth: '600px' }}>
        <h3>Friends in this group ({groupBooking.group_seats.length}):</h3>
        <ul>
          {groupBooking.group_seats.map(gs => (
            <li key={gs.id}>{gs.username} picked Seat {gs.seat_label}</li>
          ))}
        </ul>
      </div>

      {groupBooking.status === 'Pending' && (
        <div className="booking-footer card-glass">
          <div className="booking-summary">
            <p>Link: <span>{window.location.href}</span></p>
          </div>
          <div className="booking-actions" style={{display: 'flex', gap: '10px'}}>
            {!isOrganizer && (
              <button className="btn btn-primary" onClick={handleJoin} disabled={!selectedSeat}>
                Lock My Seat
              </button>
            )}
            {isOrganizer && (
              <button 
                className="btn btn-primary" 
                onClick={handleConfirmPay}
                disabled={groupBooking.group_seats.length === 0}
              >
                Confirm & Pay For All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupBooking;
