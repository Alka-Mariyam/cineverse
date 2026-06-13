import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import './SeatLayout.css';

const SeatLayout = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Fetch show details
    api.get(`/shows/${showId}/`).then(res => {
      setShow(res.data);
      // Fetch seats for the screen
      return api.get(`/seats/?screen=${res.data.screen.id}`);
    }).then(res => {
      setSeats(res.data);
      return api.get(`/shows/${showId}/seat_statuses/`);
    }).then(res => {
      setBookedSeats(res.data.booked || []);
      setReservedSeats(res.data.reserved || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [showId]);

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId) || reservedSeats.includes(seatId)) return;
    
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleBooking = async (isReserve = false) => {
    if (!user) {
      alert('Please sign in to book tickets.');
      navigate('/login');
      return;
    }

    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }
    
    try {
      const response = await api.post('/bookings/create_booking/', {
        show_id: showId,
        seat_ids: selectedSeats,
        is_reserve: isReserve
      });

      if (isReserve) {
        alert(`Booking Reserved! ID: ${response.data.id}`);
        navigate('/profile');
      } else {
        // Redirect to Stripe
        api.post(`/bookings/${response.data.id}/create_checkout_session/`).then(res => {
          window.location.href = res.data.url;
        }).catch(err => {
          alert('Failed to initialize payment');
        });
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Booking failed');
    }
  };

  const handleGroupBooking = async () => {
    if (!user) {
      alert('Please sign in to create a group booking.');
      navigate('/login');
      return;
    }

    try {
      const response = await api.post('/group-bookings/create_group/', {
        show_id: showId
      });
      alert(`Group Booking Created! Share the link with your friends.`);
      navigate(`/group-booking/${response.data.token}`);
    } catch (error) {
      console.error(error);
      alert('Failed to create group booking.');
    }
  };

  if (loading || !show) {
    return <div className="loading-spinner">Loading seats...</div>;
  }

  // Group seats by tier and row
  const tiers = {
    'Recliner': {},
    'Premium': {},
    'Standard': {}
  };
  seats.forEach(seat => {
    if (!tiers[seat.seat_type]) tiers[seat.seat_type] = {};
    if (!tiers[seat.seat_type][seat.row]) tiers[seat.seat_type][seat.row] = [];
    tiers[seat.seat_type][seat.row].push(seat);
  });

  const getPrice = (type) => {
    let p = parseFloat(show.base_price);
    if (type === 'Premium') p += 100;
    else if (type === 'Recliner') p += 250;
    return p;
  };

  const totalPrice = selectedSeats.reduce((acc, seatId) => {
    const seat = seats.find(s => s.id === seatId);
    return acc + (seat ? getPrice(seat.seat_type) : 0);
  }, 0);

  return (
    <div className="seat-layout-page">
      <div className="layout-header">
        <h1>{show.movie.title}</h1>
        <p>{show.screen.theatre.name} | {show.screen.name} | {new Date(show.date).toDateString()} | {show.start_time}</p>
      </div>

      <div className="screen-container">
        <div className="screen-curve"></div>
        <div className="screen-text">ALL EYES THIS WAY</div>
      </div>

      <div className="seating-area">
        {['Recliner', 'Premium', 'Standard'].map(tierName => {
          const tierRows = tiers[tierName];
          if (Object.keys(tierRows).length === 0) return null;
          return (
            <div key={tierName} className="seat-tier">
              <div className="tier-header">
                {tierName} - ₹{getPrice(tierName)}
              </div>
              {Object.keys(tierRows).sort().reverse().map(rowKey => (
                <div key={rowKey} className="seat-row">
                  <div className="row-label">{rowKey}</div>
                  <div className="seats">
                    {tierRows[rowKey].sort((a,b) => a.number - b.number).map(seat => {
                      let statusClass = 'available';
                      if (bookedSeats.includes(seat.id)) statusClass = 'booked';
                      else if (reservedSeats.includes(seat.id)) statusClass = 'reserved';
                      else if (selectedSeats.includes(seat.id)) statusClass = 'selected';
                      
                      // Inject Aisle
                      const style = {};
                      if (seat.number === 6 || seat.number === 16) {
                         style.marginRight = '30px';
                      }

                      return (
                        <div 
                          key={seat.id} 
                          className={`seat ${statusClass}`}
                          style={style}
                          onClick={() => toggleSeat(seat.id)}
                          title={`Row ${seat.row} Seat ${seat.number} (${seat.seat_type})`}
                        >
                          {seat.number}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="legend">
        <div className="legend-item"><div className="seat available"></div> Available</div>
        <div className="legend-item"><div className="seat selected"></div> Selected</div>
        <div className="legend-item"><div className="seat reserved"></div> Reserved</div>
        <div className="legend-item"><div className="seat booked"></div> Booked</div>
      </div>

      <div className="booking-footer card-glass">
        <div className="booking-summary">
          <p>Selected Seats: <span>{selectedSeats.length}</span></p>
          <p>Total Price: <span>₹{totalPrice}</span></p>
        </div>
        <div className="booking-actions" style={{display: 'flex', gap: '10px'}}>
          <button className="btn btn-outline" onClick={handleGroupBooking}>
            Create Group Booking
          </button>
          <button 
            className="btn btn-outline" 
            onClick={() => handleBooking(true)}
            disabled={selectedSeats.length === 0}
          >
            Reserve for Later
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => handleBooking(false)}
            disabled={selectedSeats.length === 0}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
