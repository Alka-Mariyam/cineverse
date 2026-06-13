import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [watchlist, setWatchlist] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Parse current tab
  const queryParams = new URLSearchParams(location.search);
  const currentTab = queryParams.get('tab') || 'watchlist';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [watchlistRes, bookingsRes] = await Promise.all([
          api.get('/watchlist/'),
          api.get('/bookings/')
        ]);
        setWatchlist(watchlistRes.data);
        setBookings(bookingsRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  if (!user) return <div className="loader">Redirecting...</div>;
  if (loading) return <div className="loader">Loading profile...</div>;

  const renderTabContent = () => {
    switch (currentTab) {
      case 'orders':
        return (
          <section className="profile-section">
            <h2>Your Orders</h2>
            {bookings.length === 0 ? (
              <p className="text-muted">You haven't made any bookings yet.</p>
            ) : (
              <div className="bookings-list">
                {bookings.map(booking => (
                  <div key={booking.id} className="booking-card glass-panel">
                    <h3>{booking.show.movie.title}</h3>
                    <p>Theatre: {booking.show.screen.theatre.name}</p>
                    <p>Date: {booking.show.date} | Time: {booking.show.start_time.substring(0,5)}</p>
                    <p>Total Amount: ₹{booking.total_amount}</p>
                    <Link to={`/ticket/${booking.id}`} className="btn btn-primary btn-small">View Ticket</Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      case 'stream':
        return <section className="profile-section"><h2>Stream Library</h2><p className="text-muted">No rented or purchased movies yet.</p></section>;
      case 'payment':
        return <section className="profile-section"><h2>Saved Payment Methods</h2><p className="text-muted">No cards saved. Add a card to checkout faster.</p></section>;
      case 'venues':
        return <section className="profile-section"><h2>Favourite Venues</h2><p className="text-muted">You haven't added any favourite theatres yet.</p></section>;
      case 'devices':
        return <section className="profile-section"><h2>Saved Devices</h2><p className="text-muted">Current Device: Mac OS (Active)</p></section>;
      case 'rewards':
        return <section className="profile-section"><h2>Rewards & Gift Cards</h2><p className="text-muted">Your Reward Balance: 0 Points.</p></section>;
      case 'settings':
        return <section className="profile-section"><h2>Account Settings</h2><p className="text-muted">Settings coming soon in a future update.</p></section>;
      case 'notifications':
        return <section className="profile-section"><h2>Notifications</h2><p className="text-muted">You're all caught up!</p></section>;
      default:
        return (
          <section className="profile-section">
            <h2>My Watchlist</h2>
            {watchlist.length === 0 ? (
              <p className="text-muted">You haven't saved any movies yet.</p>
            ) : (
              <div className="watchlist-grid">
                {watchlist.map(item => (
                  <Link to={`/movie/${item.movie.id}`} key={item.id} className="watchlist-card glass-panel">
                    <img src={item.movie.poster_image} alt={item.movie.title} />
                    <div className="watchlist-info">
                      <h3>{item.movie.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        );
    }
  };

  return (
    <div className="container profile-page">
      <div className="profile-header glass-panel">
        <div className="profile-info">
          <div className="avatar">{user.username.charAt(0).toUpperCase()}</div>
          <div>
            <h1>{user.username}</h1>
            <p>Member since 2026</p>
          </div>
        </div>
        <button onClick={logout} className="btn btn-secondary">Logout</button>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <Link to="/profile?tab=watchlist" className={`tab-link ${currentTab === 'watchlist' ? 'active' : ''}`}>Watchlist</Link>
          <Link to="/profile?tab=orders" className={`tab-link ${currentTab === 'orders' ? 'active' : ''}`}>Orders</Link>
          <Link to="/profile?tab=rewards" className={`tab-link ${currentTab === 'rewards' ? 'active' : ''}`}>Rewards</Link>
          <Link to="/profile?tab=settings" className={`tab-link ${currentTab === 'settings' ? 'active' : ''}`}>Settings</Link>
        </div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Profile;
