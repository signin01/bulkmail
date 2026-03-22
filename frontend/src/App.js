import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = "http://localhost:5000/api"; // ✅ ADD THIS

function App() {
  const [formData, setFormData] = useState({ subject: '', body: '', recipients: '' });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error("Sync Error:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const list = formData.recipients.split(',').map(item => item.trim());

    try {
      await axios.post(`${API_BASE}/send-mail`, { ...formData, recipients: list });
      setFormData({ subject: '', body: '', recipients: '' });
      fetchHistory();
    } catch (err) {
      alert("Broadcast Failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    await axios.delete(`${API_BASE}/history/${id}`);
    fetchHistory();
  };

  return (
    <div className="app-viewport">
      <div className="main-card">
        <header>
          <h1>NEBULA</h1>
          <p>Global Intelligence Dispatch</p>
        </header>

        <form onSubmit={handleSubmit} className="dispatch-form">
          <div className="input-group">
            <label>Subject</label>
            <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required />
          </div>

          <div className="input-group">
            <label>Targets (CSV)</label>
            <input type="text" value={formData.recipients} onChange={e => setFormData({...formData, recipients: e.target.value})} required />
          </div>

          <div className="input-group full-width">
            <label>Payload</label>
            <textarea value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} required />
          </div>

          <button type="submit">
            {loading ? "TRANSMITTING..." : "LAUNCH BROADCAST"}
          </button>
        </form>

        <section className="logs">
          <h2>MISSION_LOGS</h2>
          <div className="log-list">
            {history.map(item => (
              <div key={item._id} className="log-item">
                <div className="status-glow"></div>
                <div className="log-text">
                  <h4>{item.subject}</h4>
                  <p>{item.recipients.length} Nodes Synchronized</p>
                </div>
                <button onClick={() => deleteItem(item._id)} className="delete-btn">×</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;