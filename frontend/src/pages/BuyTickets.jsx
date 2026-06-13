import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './BuyTickets.css';

const BuyTickets = () => {
  const { movieId } = useParams();
  const [shows, setShows] = useState([]);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch movie details
    api.get(`/movies/${movieId}/`).then(res => setMovie(res.data));

    // Fetch shows for this movie
    api.get(`/shows/?movie=${movieId}`)
      .then(res => {
        setShows(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [movieId]);

  // Group shows by theatre
  const groupedShows = shows.reduce((acc, show) => {
    const theatreName = show.screen.theatre.name;
    if (!acc[theatreName]) acc[theatreName] = [];
    acc[theatreName].push(show);
    return acc;
  }, {});

  if (loading) return <div className="loader">Loading shows...</div>;

  return (
    <div className="container buy-tickets-page">
      <h1 className="page-title">{movie?.title} - Select Showtime</h1>
      
      <div className="theatres-list">
        {Object.keys(groupedShows).length === 0 && (
          <p className="no-shows">No shows available currently.</p>
        )}
        
        {Object.entries(groupedShows).map(([theatreName, theatreShows]) => (
          <div key={theatreName} className="theatre-card glass-panel">
            <div className="theatre-info">
              <h2>{theatreName}</h2>
              <p className="location">{theatreShows[0].screen.theatre.location}</p>
            </div>
            
            <div className="showtimes">
              {theatreShows.map(show => (
                <Link key={show.id} to={`/seat-layout/${show.id}`} className="showtime-btn">
                  <span className="time">{show.start_time.substring(0, 5)}</span>
                  <span className="type">Standard</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyTickets;
