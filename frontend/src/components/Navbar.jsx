import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, User, LogOut, Bell, Package, PlaySquare, Settings, CreditCard, Heart, Smartphone, Gift, ChevronDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <nav className="navbar glass-panel">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <Film className="logo-icon" size={28} />
          <span>CineVerse</span>
        </Link>
        
        <div className="nav-center">
        </div>

        <div className="nav-links">
          <Link to="/" className="nav-link">Movies</Link>
          
          {user ? (
            <div className="profile-dropdown-wrapper">
              <button className="nav-link profile-toggle" onClick={toggleDropdown}>
                <User size={20} />
                <span>{user.username}</span>
                <ChevronDown size={16} />
              </button>
              
              {dropdownOpen && (
                <div className="profile-dropdown glass-panel">
                  <div className="dropdown-header">
                    Hi, {user.username}!
                  </div>
                  <Link to="/profile?tab=notifications" className="dropdown-item" onClick={() => setDropdownOpen(false)}><Bell size={16} /> Notifications</Link>
                  <Link to="/profile?tab=orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}><Package size={16} /> Your Orders</Link>
                  <Link to="/profile?tab=stream" className="dropdown-item" onClick={() => setDropdownOpen(false)}><PlaySquare size={16} /> Stream Library</Link>
                  <Link to="/profile?tab=payment" className="dropdown-item" onClick={() => setDropdownOpen(false)}><CreditCard size={16} /> Saved Payment Methods</Link>
                  <Link to="/profile?tab=venues" className="dropdown-item" onClick={() => setDropdownOpen(false)}><Heart size={16} /> Favourite Venues</Link>
                  <Link to="/profile?tab=devices" className="dropdown-item" onClick={() => setDropdownOpen(false)}><Smartphone size={16} /> Saved Devices</Link>
                  <Link to="/profile?tab=rewards" className="dropdown-item" onClick={() => setDropdownOpen(false)}><Gift size={16} /> Rewards & Gift Cards</Link>
                  <Link to="/profile?tab=settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}><Settings size={16} /> Account & Settings</Link>
                  
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item text-danger">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-small">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
