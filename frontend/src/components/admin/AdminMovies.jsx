import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentMovie, setCurrentMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', release_date: '', duration_minutes: '', 
    language: '', rating: '', genre: '', trailer_url: '', poster_image: ''
  });

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/movies/');
      setMovies(res.data);
    } catch (err) {
      console.error("Failed to fetch movies", err);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentMovie) {
        await api.put(`/movies/${currentMovie.id}/`, formData);
      } else {
        await api.post('/movies/', formData);
      }
      setShowModal(false);
      setCurrentMovie(null);
      fetchMovies();
    } catch (err) {
      console.error("Failed to save movie", err);
      alert("Failed to save movie. Check fields.");
    }
  };

  const openModal = (movie = null) => {
    if (movie) {
      setCurrentMovie(movie);
      setFormData({
        title: movie.title, description: movie.description, release_date: movie.release_date, 
        duration_minutes: movie.duration_minutes, language: movie.language, rating: movie.rating, 
        genre: movie.genre, trailer_url: movie.trailer_url, poster_image: movie.poster_image
      });
    } else {
      setCurrentMovie(null);
      setFormData({
        title: '', description: '', release_date: '', duration_minutes: '', 
        language: '', rating: '', genre: '', trailer_url: '', poster_image: ''
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this movie?")) {
      try {
        await api.delete(`/movies/${id}/`);
        fetchMovies();
      } catch (err) {
        console.error("Failed to delete movie", err);
        alert("Failed to delete movie.");
      }
    }
  };

  if (loading) return <div>Loading movies...</div>;

  return (
    <div className="admin-module">
      <div className="module-header">
        <h2 style={{ margin: 0 }}>Movie Management</h2>
        <button className="btn btn-primary" onClick={() => openModal()}><Plus size={18} /> Add Movie</button>
      </div>

      <div className="glass-panel" style={{ marginTop: '20px', borderRadius: '15px', overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Release Date</th>
              <th>Language</th>
              <th>Genre</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.map(movie => (
              <tr key={movie.id}>
                <td>{movie.title}</td>
                <td>{movie.release_date}</td>
                <td>{movie.language}</td>
                <td>{movie.genre}</td>
                <td>
                  <button className="icon-btn edit" onClick={() => openModal(movie)}><Edit2 size={18} /></button>
                  <button className="icon-btn delete" onClick={() => handleDelete(movie.id)}><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-panel">
            <div className="modal-header">
              <h3>{currentMovie ? 'Edit Movie' : 'Add New Movie'}</h3>
              <button className="close-btn icon-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group"><label>Title</label><input type="text" name="title" value={formData.title} onChange={handleInputChange} required /></div>
              <div className="form-group"><label>Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} required></textarea></div>
              <div className="form-row">
                <div className="form-group"><label>Release Date</label><input type="date" name="release_date" value={formData.release_date} onChange={handleInputChange} required /></div>
                <div className="form-group"><label>Duration (mins)</label><input type="number" name="duration_minutes" value={formData.duration_minutes} onChange={handleInputChange} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Language</label><input type="text" name="language" value={formData.language} onChange={handleInputChange} required /></div>
                <div className="form-group"><label>Rating</label><input type="text" name="rating" value={formData.rating} onChange={handleInputChange} required /></div>
              </div>
              <div className="form-group"><label>Genre</label><input type="text" name="genre" value={formData.genre} onChange={handleInputChange} required /></div>
              <div className="form-group"><label>Poster URL</label><input type="url" name="poster_image" value={formData.poster_image} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Trailer URL</label><input type="url" name="trailer_url" value={formData.trailer_url} onChange={handleInputChange} /></div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>
                {currentMovie ? 'Update Movie' : 'Create Movie'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMovies;
