import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Edit2, Trash2, X, MonitorPlay } from 'lucide-react';

const AdminTheatres = () => {
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showTheatreModal, setShowTheatreModal] = useState(false);
  const [theatreFormData, setTheatreFormData] = useState({ name: '', location: '', city: 'Metropolis' });
  const [currentTheatre, setCurrentTheatre] = useState(null);

  const [showScreenModal, setShowScreenModal] = useState(false);
  const [screenFormData, setScreenFormData] = useState({ name: '', total_seats: 100, theatre: '' });
  const [currentScreen, setCurrentScreen] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const tRes = await api.get('/theatres/');
      setTheatres(tRes.data);
      const sRes = await api.get('/screens/');
      setScreens(sRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
    setLoading(false);
  };

  const handleTheatreSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentTheatre) {
        await api.put(`/theatres/${currentTheatre.id}/`, theatreFormData);
      } else {
        await api.post('/theatres/', theatreFormData);
      }
      setShowTheatreModal(false);
      fetchData();
    } catch (err) { alert("Failed to save theatre"); }
  };

  const handleScreenSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentScreen) {
        await api.put(`/screens/${currentScreen.id}/`, screenFormData);
      } else {
        await api.post('/screens/', screenFormData);
      }
      setShowScreenModal(false);
      fetchData();
    } catch (err) { alert("Failed to save screen"); }
  };

  const deleteTheatre = async (id) => {
    if (window.confirm("Delete theatre? All screens and shows will be lost!")) {
      try { await api.delete(`/theatres/${id}/`); fetchData(); } catch (e) { alert("Failed"); }
    }
  };

  const deleteScreen = async (id) => {
    if (window.confirm("Delete screen? All shows and seats will be lost!")) {
      try { await api.delete(`/screens/${id}/`); fetchData(); } catch (e) { alert("Failed"); }
    }
  };

  const openTheatreModal = (theatre = null) => {
    setCurrentTheatre(theatre);
    setTheatreFormData(theatre ? { name: theatre.name, location: theatre.location, city: theatre.city } : { name: '', location: '', city: 'Metropolis' });
    setShowTheatreModal(true);
  };

  const openScreenModal = (screen = null) => {
    setCurrentScreen(screen);
    setScreenFormData(screen ? { name: screen.name, total_seats: screen.total_seats, theatre: screen.theatre } : { name: '', total_seats: 100, theatre: theatres.length > 0 ? theatres[0].id : '' });
    setShowScreenModal(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-module">
      <div className="module-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Theatres & Screens</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={() => openTheatreModal()}><Plus size={18} /> Add Theatre</button>
          <button className="btn btn-primary" onClick={() => openScreenModal()}><MonitorPlay size={18} /> Add Screen</button>
        </div>
      </div>

      <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* Theatres Column */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '15px' }}>
          <h3>Theatres</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {theatres.map(t => (
              <li key={t.id} style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{t.name}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.location}, {t.city}</div>
                </div>
                <div>
                  <button className="icon-btn edit" onClick={() => openTheatreModal(t)}><Edit2 size={16} /></button>
                  <button className="icon-btn delete" onClick={() => deleteTheatre(t.id)}><Trash2 size={16} /></button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Screens Column */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '15px' }}>
          <h3>Screens</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {screens.map(s => {
              const t = theatres.find(th => th.id === s.theatre);
              return (
                <li key={s.id} style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{s.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t?.name} • {s.total_seats} seats</div>
                  </div>
                  <div>
                    <button className="icon-btn edit" onClick={() => openScreenModal(s)}><Edit2 size={16} /></button>
                    <button className="icon-btn delete" onClick={() => deleteScreen(s.id)}><Trash2 size={16} /></button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {showTheatreModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-panel">
            <div className="modal-header"><h3>{currentTheatre ? 'Edit Theatre' : 'Add Theatre'}</h3><button className="close-btn icon-btn" onClick={() => setShowTheatreModal(false)}><X size={20} /></button></div>
            <form onSubmit={handleTheatreSubmit} className="admin-form">
              <div className="form-group"><label>Name</label><input type="text" value={theatreFormData.name} onChange={e => setTheatreFormData({...theatreFormData, name: e.target.value})} required /></div>
              <div className="form-group"><label>Location</label><input type="text" value={theatreFormData.location} onChange={e => setTheatreFormData({...theatreFormData, location: e.target.value})} required /></div>
              <div className="form-group"><label>City</label><input type="text" value={theatreFormData.city} onChange={e => setTheatreFormData({...theatreFormData, city: e.target.value})} required /></div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>Save Theatre</button>
            </form>
          </div>
        </div>
      )}

      {showScreenModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-panel">
            <div className="modal-header"><h3>{currentScreen ? 'Edit Screen' : 'Add Screen'}</h3><button className="close-btn icon-btn" onClick={() => setShowScreenModal(false)}><X size={20} /></button></div>
            <form onSubmit={handleScreenSubmit} className="admin-form">
              <div className="form-group">
                <label>Theatre</label>
                <select value={screenFormData.theatre} onChange={e => setScreenFormData({...screenFormData, theatre: parseInt(e.target.value)})} required>
                  <option value="">Select Theatre</option>
                  {theatres.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Screen Name</label><input type="text" value={screenFormData.name} onChange={e => setScreenFormData({...screenFormData, name: e.target.value})} required /></div>
              <div className="form-group"><label>Total Seats</label><input type="number" value={screenFormData.total_seats} onChange={e => setScreenFormData({...screenFormData, total_seats: parseInt(e.target.value)})} required /></div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>Save Screen</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminTheatres;
