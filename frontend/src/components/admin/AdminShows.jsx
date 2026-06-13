import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Trash2 } from 'lucide-react';

const AdminShows = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [screens, setScreens] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    movie: '', screen: '', date: '', start_time: '', end_time: '', base_price: 150.00
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const shRes = await api.get('/shows/');
      setShows(shRes.data);
      const mRes = await api.get('/movies/');
      setMovies(mRes.data);
      const sRes = await api.get('/screens/');
      setScreens(sRes.data);
      const tRes = await api.get('/theatres/');
      setTheatres(tRes.data);
      
      if (mRes.data.length && sRes.data.length) {
        setFormData(prev => ({...prev, movie: mRes.data[0].id, screen: sRes.data[0].id}));
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/shows/', formData);
      fetchData();
    } catch (err) { alert("Failed to create show"); }
  };

  const deleteShow = async (id) => {
    if (window.confirm("Delete show? Bookings might be orphaned!")) {
      try { await api.delete(`/shows/${id}/`); fetchData(); } catch (e) { alert("Failed"); }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-module">
      <div className="module-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Show Scheduling</h2>
      </div>

      <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        
        {/* Create Show Form */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '15px' }}>
          <h3>Schedule New Show</h3>
          <form onSubmit={handleSubmit} className="admin-form" style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label>Movie</label>
              <select value={formData.movie} onChange={e => setFormData({...formData, movie: e.target.value})} required>
                {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Screen & Theatre</label>
              <select value={formData.screen} onChange={e => setFormData({...formData, screen: e.target.value})} required>
                {screens.map(s => {
                  const t = theatres.find(th => th.id === s.theatre);
                  return <option key={s.id} value={s.id}>{t?.name} - {s.name}</option>;
                })}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label>Base Price (₹)</label>
              <input type="number" step="0.01" value={formData.base_price} onChange={e => setFormData({...formData, base_price: e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}><Plus size={18} /> Create Show</button>
          </form>
        </div>

        {/* Existing Shows List */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '15px' }}>
          <h3>Upcoming Shows</h3>
          <table className="admin-table" style={{ marginTop: '20px' }}>
            <thead>
              <tr>
                <th>Movie</th>
                <th>Theatre/Screen</th>
                <th>Date & Time</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shows.map(show => {
                const m = movies.find(mv => mv.id === show.movie);
                const s = screens.find(sc => sc.id === show.screen);
                const t = s ? theatres.find(th => th.id === s.theatre) : null;
                return (
                  <tr key={show.id}>
                    <td><strong>{m?.title}</strong></td>
                    <td>{t?.name} <br/><small style={{color:'var(--text-secondary)'}}>{s?.name}</small></td>
                    <td>{show.date} <br/><small style={{color:'var(--text-secondary)'}}>{show.start_time}</small></td>
                    <td>₹{show.base_price}</td>
                    <td>
                      <button className="icon-btn delete" onClick={() => deleteShow(show.id)}><Trash2 size={18} /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default AdminShows;
