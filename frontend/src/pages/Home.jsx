import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './Home.css';
import { Smile, Zap, Heart, Ghost, ChevronRight, ChevronLeft } from 'lucide-react';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [trending, setTrending] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [premieres, setPremieres] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [mostBooked, setMostBooked] = useState([]);
  const [activeMood, setActiveMood] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMovies = (mood = '') => {
    setLoading(true);
    let url = '/movies/';
    if (mood) {
      url += `?mood=${mood}`;
    }
    
    api.get(url)
      .then(res => {
        setMovies(res.data);
        if (!mood) {
          setTrending(res.data.filter(m => m.is_trending));
          setUpcoming(res.data.filter(m => m.is_upcoming));
          setPremieres(res.data.filter(m => m.is_premiere));
          setNewReleases(res.data.filter(m => m.is_new_release));
          setMostBooked(res.data.filter(m => m.is_most_booked));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMovies(activeMood);
  }, [activeMood]);

  const handleMoodClick = (mood) => {
    setActiveMood(prevMood => prevMood === mood ? '' : mood);
  };

  const scrollRow = (id, direction) => {
    const element = document.getElementById(id);
    if (element) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const MovieRow = ({ title, moviesList, rowId }) => (
    <div className="movie-row-container">
      <div className="row-header">
        <h2 className="section-title">{title}</h2>
        <div className="row-controls">
          <button className="control-btn" onClick={() => scrollRow(rowId, 'left')}><ChevronLeft size={24} /></button>
          <button className="control-btn" onClick={() => scrollRow(rowId, 'right')}><ChevronRight size={24} /></button>
        </div>
      </div>
      <div className="movies-row" id={rowId}>
        {moviesList.length === 0 && <p className="text-muted">No movies found.</p>}
        {moviesList.map(movie => (
          <div key={movie.id} className="movie-card hover-scale glass-panel">
            <div className="movie-poster">
              <img src={movie.poster_image} alt={movie.title} />
              <div className="movie-overlay">
                <Link to={`/movie/${movie.id}`} className="btn btn-primary">View Details</Link>
              </div>
            </div>
            <div className="movie-info">
              <h3>{movie.title}</h3>
              <p className="movie-genre">{movie.genre}</p>
              <div className="movie-meta">
                <span className="rating">{movie.rating}</span>
                <span className="language">{movie.language}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="home-page">
      {/* Hero Banner Carousel (Simplified for single featured item, or could map through trending) */}
      <section className="hero">
        <div className="hero-content">
          <span className="featured-badge">Featured</span>
          <h1 className="hero-title">{trending[0]?.title || 'Experience the Magic'}</h1>
          <p className="hero-subtitle">{trending[0]?.description || 'Book tickets for the latest blockbusters in premium theatres.'}</p>
          <div className="hero-actions">
             {trending[0] && (
               <Link to={`/buytickets/${trending[0].id}`} className="btn btn-primary">Book Now</Link>
             )}
             {trending[0] && (
               <Link to={`/movie/${trending[0].id}`} className="btn btn-secondary">More Info</Link>
             )}
          </div>
        </div>
      </section>

      <div className="container">
        {/* Mood Filter Section */}
        <section className="mood-section">
          <h3>What are you in the mood for?</h3>
          <div className="mood-filters">
            <button className={`mood-btn ${activeMood === 'Happy' ? 'active' : ''}`} onClick={() => handleMoodClick('Happy')}>
              <Smile size={20} /> Happy
            </button>
            <button className={`mood-btn ${activeMood === 'Excited' ? 'active' : ''}`} onClick={() => handleMoodClick('Excited')}>
              <Zap size={20} /> Excited
            </button>
            <button className={`mood-btn ${activeMood === 'Romantic' ? 'active' : ''}`} onClick={() => handleMoodClick('Romantic')}>
              <Heart size={20} /> Romantic
            </button>
            <button className={`mood-btn ${activeMood === 'Scared' ? 'active' : ''}`} onClick={() => handleMoodClick('Scared')}>
              <Ghost size={20} /> Scared
            </button>
          </div>
        </section>

        {loading ? (
          <div className="loader">Loading movies...</div>
        ) : (
          <div className="content-sections">
            {activeMood ? (
              <MovieRow title={`Movies making you feel ${activeMood}`} moviesList={movies} rowId="mood-row" />
            ) : (
              <>
                <MovieRow title="Premieres" moviesList={premieres} rowId="premieres-row" />
                <MovieRow title="New Releases" moviesList={newReleases} rowId="newreleases-row" />
                <MovieRow title="Most Booked" moviesList={mostBooked} rowId="mostbooked-row" />
                <MovieRow title="Trending Movies" moviesList={trending} rowId="trending-row" />
                <MovieRow title="Upcoming Releases" moviesList={upcoming} rowId="upcoming-row" />
                <MovieRow title="Recommended For You" moviesList={movies.slice(0, 4)} rowId="recommended-row" />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
