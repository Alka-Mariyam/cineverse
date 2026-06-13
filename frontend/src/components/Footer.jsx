import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, HeadphonesIcon, Globe, MessageCircle, Camera, Video } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer glass-panel">
      <div className="container footer-content">
        <div className="footer-section">
          <h3>Information</h3>
          <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('About CineVerse is coming soon!'); }}>About CineVerse</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Customer Care is coming soon!'); }}>Customer Care</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Helpdesk is coming soon!'); }}>Helpdesk</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('FAQs are coming soon!'); }}>FAQs</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Call Booking is coming soon!'); }}>Book Through Call</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Support email is coming soon!'); }}>Contact Information</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Feedback form is coming soon!'); }}>Feedback</a></li>
            </ul>
          </div>
        
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><Globe size={24} /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><Camera size={24} /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><MessageCircle size={24} /></a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><Video size={24} /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 CineVerse. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
