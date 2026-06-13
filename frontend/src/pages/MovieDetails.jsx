import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import './MovieDetails.css';
import { Clock, Calendar, Star, Languages, Bookmark, BookmarkCheck } from 'lucide-react';

const MovieDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  
  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  const [reviewSummary, setReviewSummary] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      const movieRes = await api.get(`/movies/${id}/`);
      const movieData = movieRes.data;
      setMovie(movieData);
      
      const reviewsRes = await api.get(`/movies/${id}/reviews/`);
      setReviews(reviewsRes.data);

      const summaryRes = await api.get(`/movies/${id}/review_summary/`);
      setReviewSummary(summaryRes.data);

      const similarRes = await api.get(`/movies/?genre=${movieData.genre}`);
      setSimilarMovies(similarRes.data.filter(m => m.id !== parseInt(id)).slice(0, 4));

      if (user) {
        // Check if watchlisted
        const watchlistRes = await api.get('/watchlist/');
        const inWatchlist = watchlistRes.data.some(item => item.movie.id === parseInt(id));
        setIsWatchlisted(inWatchlist);
      }
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const toggleWatchlist = async () => {
    if (!user) {
      alert("Please log in to add to your watchlist.");
      return;
    }
    try {
      const res = await api.post('/watchlist/toggle/', { movie_id: id });
      if (res.data.status === 'added') {
        setIsWatchlisted(true);
      } else {
        setIsWatchlisted(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setReviewError("Please log in to leave a review.");
      return;
    }
    try {
      await api.post(`/movies/${id}/reviews/`, { rating, comment });
      setComment('');
      setRating(5);
      setReviewError('');
      // Refresh reviews
      const reviewsRes = await api.get(`/movies/${id}/reviews/`);
      setReviews(reviewsRes.data);
    } catch (err) {
      setReviewError(err.response?.data?.error || "Failed to submit review.");
    }
  };

  if (loading) return <div className="loader">Loading details...</div>;
  if (!movie) return <div className="error">Movie not found</div>;

  return (
    <div className="movie-details-page">
      <div className="backdrop-container">
        <div className="backdrop-overlay"></div>
        <img className="backdrop-image" src={movie.poster_image} alt={`${movie.title} backdrop`} />
      </div>

      <div className="container details-content">
        <div className="poster-wrapper glass-panel">
          <img src={movie.poster_image} alt={movie.title} className="details-poster" />
        </div>

        <div className="info-wrapper">
          <div className="title-row">
            <h1 className="title">{movie.title}</h1>
            <button className="watchlist-btn" onClick={toggleWatchlist} title="Add to Watchlist">
              {isWatchlisted ? <BookmarkCheck size={32} color="var(--primary-color)" /> : <Bookmark size={32} />}
            </button>
          </div>
          
          <div className="meta-tags">
            <span className="tag" title="Rating"><Star size={16} /> {movie.rating} ({movie.votes.toLocaleString()} votes)</span>
            <span className="tag"><Clock size={16} /> {movie.duration_minutes} min</span>
            <span className="tag"><Calendar size={16} /> {movie.release_date}</span>
            <span className="tag"><Languages size={16} /> {movie.language}</span>
          </div>

          <div className="genres">
            {movie.genre.split(',').map((g, i) => (
              <span key={i} className="genre-pill">{g.trim()}</span>
            ))}
            {movie.moods && movie.moods.split(',').map((m, i) => (
              <span key={`mood-${i}`} className="genre-pill mood-pill">{m.trim()}</span>
            ))}
          </div>

          <div className="synopsis">
            <h3>Synopsis</h3>
            <p>{movie.description}</p>
          </div>

          {movie.available_offers && movie.available_offers.length > 0 && (
            <div className="offers">
              <h3>Available Offers</h3>
              <div className="offers-list">
                {movie.available_offers.map((offer, index) => (
                  <div key={index} className="offer-tag glass-panel">
                    <strong>{offer.title}</strong>: {offer.desc}
                  </div>
                ))}
              </div>
            </div>
          )}

          {movie.cast_and_crew && movie.cast_and_crew.length > 0 && (
            <div className="cast-crew">
              <h3>Cast & Crew</h3>
              <div className="cast-list">
                {movie.cast_and_crew.map((person, index) => (
                  <div key={index} className="cast-member glass-panel">
                    <span className="cast-name">{person.name}</span>
                    <span className="cast-role text-muted">{person.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="actions">
            <Link to={`/buytickets/${movie.id}`} className="btn btn-primary btn-large">
              Book Tickets Now
            </Link>
            {movie.trailer_url && (
              <a href={movie.trailer_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-large">
                Watch Trailer
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Review Insights Section */}
      {reviewSummary && (
        <div className="container review-insights-section">
          <h2 className="section-title">Review Insights</h2>
          <div className="insights-card glass-panel">
            <div className="insight-header">
              <div className="sentiment">
                <h3>Overall Sentiment</h3>
                <span className={`sentiment-badge ${reviewSummary.sentiment.toLowerCase().replace(' ', '-')}`}>
                  {reviewSummary.sentiment} ({reviewSummary.average_rating} <Star size={14} color="gold" fill="gold" />)
                </span>
              </div>
              <div className="total-reviews">
                Based on {reviewSummary.total_reviews} reviews
              </div>
            </div>
            
            <div className="highlights-row">
              <div className="highlight-box positive">
                <h4>Positive Feedback</h4>
                <ul>
                  {reviewSummary.positive_highlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
              <div className="highlight-box negative">
                <h4>Areas for Improvement</h4>
                <ul>
                  {reviewSummary.negative_highlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="container reviews-section">
        <h2 className="section-title">User Reviews</h2>
        
        <div className="reviews-layout">
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="text-muted">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="review-card glass-panel">
                  <div className="review-header">
                    <span className="review-user">{review.user.username}</span>
                    <span className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} color={i < review.rating ? "gold" : "#555"} fill={i < review.rating ? "gold" : "none"} />
                      ))}
                    </span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>

          <div className="review-form-container glass-panel">
            <h3>Write a Review</h3>
            {reviewError && <p className="error-text">{reviewError}</p>}
            <form onSubmit={submitReview}>
              <div className="form-group">
                <label>Rating</label>
                <div className="star-selector">
                  {[1, 2, 3, 4, 5].map(num => (
                    <Star 
                      key={num} 
                      size={24} 
                      color={num <= rating ? "gold" : "#555"} 
                      fill={num <= rating ? "gold" : "none"}
                      onClick={() => setRating(num)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Comment</label>
                <textarea 
                  rows="4" 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about the movie..."
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Submit Review</button>
            </form>
          </div>
        </div>
      </div>
      {/* Similar Movies Section */}
      {similarMovies && similarMovies.length > 0 && (
        <div className="container similar-movies-section">
          <h2 className="section-title">Similar Movies</h2>
          <div className="similar-movies-grid">
            {similarMovies.map(similar => (
              <Link to={`/movie/${similar.id}`} key={similar.id} className="movie-card glass-panel" onClick={() => window.scrollTo(0,0)}>
                <img src={similar.poster_image || similar.poster_url} alt={similar.title} />
                <div className="movie-card-info">
                  <h3>{similar.title}</h3>
                  <p>{similar.genre}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
