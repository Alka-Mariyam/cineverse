import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { LayoutDashboard, Film, MonitorPlay, CalendarDays, Ticket, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import AdminMovies from '../components/admin/AdminMovies';
import AdminTheatres from '../components/admin/AdminTheatres';
import AdminShows from '../components/admin/AdminShows';
import AdminBookings from '../components/admin/AdminBookings';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user?.is_staff) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats/');
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch admin stats", err);
    }
  };

  if (!user || !user.is_staff) {
    return <Navigate to="/" replace />;
  }

  const renderOverview = () => {
    if (!stats) return <div className="loading-spinner">Loading stats...</div>;

    return (
      <div className="admin-overview">
        <h2 style={{ marginBottom: '20px' }}>Dashboard Overview</h2>
        
        <div className="stats-grid">
          <div className="stat-card glass-panel">
            <div className="stat-icon" style={{ background: 'rgba(0, 200, 81, 0.2)', color: '#00C851' }}><TrendingUp /></div>
            <div className="stat-info">
              <h3>Total Revenue</h3>
              <p className="stat-value">₹{stats.total_revenue.toFixed(2)}</p>
            </div>
          </div>
          <div className="stat-card glass-panel">
            <div className="stat-icon" style={{ background: 'rgba(51, 181, 229, 0.2)', color: '#33b5e5' }}><Ticket /></div>
            <div className="stat-info">
              <h3>Total Bookings</h3>
              <p className="stat-value">{stats.total_bookings}</p>
            </div>
          </div>
          <div className="stat-card glass-panel">
            <div className="stat-icon" style={{ background: 'rgba(255, 187, 51, 0.2)', color: '#ffbb33' }}><Film /></div>
            <div className="stat-info">
              <h3>Total Movies</h3>
              <p className="stat-value">{stats.total_movies}</p>
            </div>
          </div>
          <div className="stat-card glass-panel">
            <div className="stat-icon" style={{ background: 'rgba(255, 68, 68, 0.2)', color: '#ff4444' }}><CalendarDays /></div>
            <div className="stat-info">
              <h3>Total Shows</h3>
              <p className="stat-value">{stats.total_shows}</p>
            </div>
          </div>
        </div>

        <div className="revenue-breakdown" style={{ marginTop: '40px' }}>
          <h3>Revenue Breakdown</h3>
          <div className="breakdown-grid" style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
            <div className="breakdown-card glass-panel" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
              <p className="text-muted">Today</p>
              <h4 style={{ color: '#00C851', fontSize: '1.5rem' }}>₹{stats.daily_revenue.toFixed(2)}</h4>
            </div>
            <div className="breakdown-card glass-panel" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
              <p className="text-muted">Last 7 Days</p>
              <h4 style={{ color: '#33b5e5', fontSize: '1.5rem' }}>₹{stats.weekly_revenue.toFixed(2)}</h4>
            </div>
            <div className="breakdown-card glass-panel" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
              <p className="text-muted">Last 30 Days</p>
              <h4 style={{ color: '#ffbb33', fontSize: '1.5rem' }}>₹{stats.monthly_revenue.toFixed(2)}</h4>
            </div>
          </div>
        </div>

        <div className="most-booked-movies" style={{ marginTop: '40px' }}>
          <h3>Most Booked Movies</h3>
          <div className="glass-panel" style={{ padding: '20px', marginTop: '15px', borderRadius: '15px' }}>
            {stats.most_booked_movies.map((movie, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: index < stats.most_booked_movies.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <span style={{ fontWeight: 'bold' }}>{movie.show__movie__title}</span>
                <span style={{ color: 'var(--accent-color)' }}>{movie.total_bookings} Bookings</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard container" style={{ paddingTop: '100px', display: 'flex', minHeight: '90vh' }}>
      {/* Sidebar Navigation */}
      <div className="admin-sidebar glass-panel" style={{ width: '250px', padding: '20px', borderRadius: '15px', marginRight: '30px', height: 'fit-content' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', color: 'var(--primary-color)' }}>
          <ShieldCheck size={28} />
          <h3 style={{ margin: 0 }}>Admin Portal</h3>
        </div>
        
        <ul className="admin-nav" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={20} /> Overview
          </li>
          <li className={activeTab === 'movies' ? 'active' : ''} onClick={() => setActiveTab('movies')}>
            <Film size={20} /> Movie Management
          </li>
          <li className={activeTab === 'screens' ? 'active' : ''} onClick={() => setActiveTab('screens')}>
            <MonitorPlay size={20} /> Screens & Seats
          </li>
          <li className={activeTab === 'shows' ? 'active' : ''} onClick={() => setActiveTab('shows')}>
            <CalendarDays size={20} /> Show Management
          </li>
          <li className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
            <Ticket size={20} /> Bookings & Scanner
          </li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="admin-content" style={{ flex: 1 }}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'movies' && <AdminMovies />}
        {activeTab === 'screens' && <AdminTheatres />}
        {activeTab === 'shows' && <AdminShows />}
        {activeTab === 'bookings' && <AdminBookings />}
      </div>
    </div>
  );
};

export default AdminDashboard;
