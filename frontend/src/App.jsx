import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import BuyTickets from './pages/BuyTickets';
import SeatLayout from './pages/SeatLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Ticket from './pages/Ticket';
import Profile from './pages/Profile';
import GroupBooking from './pages/GroupBooking';
import ValidateTicket from './pages/ValidateTicket';
import PaymentSuccess from './pages/PaymentSuccess';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <main className="main-content" style={{ paddingTop: '70px', minHeight: '100vh' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/buytickets/:movieId" element={<BuyTickets />} />
              <Route path="/seat-layout/:showId" element={<SeatLayout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/ticket/:bookingId" element={<Ticket />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/group-booking/:token" element={<GroupBooking />} />
              <Route path="/validate/:bookingId/:token" element={<ValidateTicket />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
