import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function Dashboard() {
  const [zipCode, setZipCode] = useState('');
  const [officials, setOfficials] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const lookupOfficials = async () => {
    try {
      const res = await API.get(`/officials/zip/${zipCode}`);
      setOfficials(res.data);
    } catch (err) {
      alert('Error looking up officials');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a2e', color: 'white', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>PolitiCard Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#e94560', color: 'white', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ background: '#16213e', padding: '30px', borderRadius: '12px', marginBottom: '20px' }}>
        <h2>Find Your Representatives</h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <input type="text" placeholder="Enter ZIP Code" value={zipCode} onChange={(e) => setZipCode(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#0f3460', color: 'white', flex: 1 }} />
          <button onClick={lookupOfficials} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#e94560', color: 'white', cursor: 'pointer' }}>
            Search
          </button>
        </div>
      </div>

      {officials && (
        <div style={{ background: '#16213e', padding: '30px', borderRadius: '12px' }}>
          <h3>Results for {officials.zip_code} ({officials.total_count} officials found)</h3>
          {['federal', 'state', 'local'].map((level) => (
            officials[level]?.length > 0 && (
              <div key={level} style={{ marginTop: '20px' }}>
                <h4 style={{ textTransform: 'capitalize', color: '#e94560' }}>{level}</h4>
                {officials[level].map((o) => (
                  <div key={o.id} style={{ background: '#0f3460', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
                    <strong>{o.name}</strong> — {o.title} ({o.party})
                  </div>
                ))}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;