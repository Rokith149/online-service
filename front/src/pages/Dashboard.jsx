import React, { useState, useEffect } from 'react';
import api from '../api';
import './Dashboard.css';
import { FiPlus, FiFilter, FiActivity, FiTrash2, FiMonitor, FiArrowDownCircle, FiArrowUpCircle, FiEye, FiRefreshCw } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [monitors, setMonitors] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form State
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [monitorType, setMonitorType] = useState('HTTP');
  const [interval, setIntervalTime] = useState(5);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchMonitors = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/monitors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMonitors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMonitors();
    // Poll every 10 seconds for updates
    const poll = window.setInterval(fetchMonitors, 10000);
    return () => clearInterval(poll);
  }, []);

  const handleAddMonitor = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/monitors', 
        { url, name, type: monitorType, interval },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAddForm(false);
      setUrl('');
      setName('');
      fetchMonitors();
    } catch (err) {
      console.error('Error adding monitor', err);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure you want to delete this monitor?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/monitors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMonitors();
    } catch (err) {
      console.error(err);
    }
  };

  const calculateDuration = (startTime) => {
    const diffMs = Date.now() - new Date(startTime).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hrs > 0) return `${hrs} hr, ${mins} min`;
    return `${mins} min`;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Monitors</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Overview of your services</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowAddForm(!showAddForm)}>
          <FiPlus /> New Monitor
        </button>
      </div>

      {showAddForm && (
        <div className="glass-panel add-monitor-form">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2>Add single monitor.</h2>
          </div>
          <form onSubmit={handleAddMonitor}>
            <div className="input-group">
              <label>Monitor type</label>
              <select 
                className="input-field" 
                value={monitorType} 
                onChange={(e) => setMonitorType(e.target.value)}
              >
                <option value="HTTP">HTTP / website monitoring</option>
                <option value="PING">Ping</option>
                <option value="PORT">Port</option>
              </select>
              <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                Use HTTP(S) monitor to monitor your website, API endpoint, or anything running on HTTP.
              </small>
            </div>

            <div className="input-group">
              <label>Friendly Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="My Website"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

             <div className="input-group">
              <label>URL to monitor</label>
              <input 
                type="url" 
                className="input-field" 
                placeholder="https://"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Monitoring Interval (mins)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={interval}
                    onChange={(e) => setIntervalTime(e.target.value)}
                    min="1"
                    default="5"
                  />
                </div>
                 <div className="input-group" style={{ flex: 1 }}>
                  <label>Add tags</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Click to add tag..."
                  />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
               <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
               <button type="submit" className="btn-primary">Create Monitor</button>
            </div>
          </form>
        </div>
      )}

      <div className="controls-bar">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search by name or URL" 
            className="input-field" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          className="btn-secondary"
          onClick={() => {
             if (statusFilter === 'ALL') setStatusFilter('UP');
             else if (statusFilter === 'UP') setStatusFilter('DOWN');
             else setStatusFilter('ALL');
          }}
          style={{ 
            backgroundColor: statusFilter !== 'ALL' ? 'rgba(255,255,255,0.1)' : 'transparent',
            borderColor: statusFilter !== 'ALL' ? 'var(--text-primary)' : 'var(--border-color)'
          }}
        >
          <FiFilter /> {statusFilter === 'ALL' ? 'Filter' : `Status: ${statusFilter}`}
        </button>
      </div>

      <div className="monitors-list">
        {monitors.filter(m => {
           const matchQuery = m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || m.url?.toLowerCase().includes(searchQuery.toLowerCase());
           const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;
           return matchQuery && matchStatus;
        }).map(monitor => {
          const isDown = monitor.status === 'DOWN';
          const downDuration = isDown && monitor.latestIncident 
            ? calculateDuration(monitor.latestIncident.createdAt) 
            : '0 min';

          // Generate 32 mock tracker bars (in a real app, this would be derived from incident history over 24h)
          // For simplicity, we'll make them all green if UP, or mostly green with a red tip if DOWN.
          const bars = Array.from({ length: 32 }).map((_, i) => {
             // If monitor is down, make the last bar red.
             if (isDown && i === 31) return 'var(--error-color)';
             return 'var(--success-color)';
          });
          const uptimePercentage = isDown ? '98.541%' : '100.000%';

          return (
          <div key={monitor._id} className="monitor-card glass-panel" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '1rem 1.5rem', borderLeft: isDown ? 'none' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="monitor-info" style={{ gap: '1rem' }}>
                 {isDown ? (
                     <div style={{ backgroundColor: 'var(--error-color)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <FiArrowDownCircle style={{ color: 'var(--bg-card)' }}/>
                     </div>
                 ) : (
                     <div style={{ backgroundColor: 'var(--success-color)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <FiArrowUpCircle style={{ color: 'var(--bg-card)' }}/>
                     </div>
                 )}
                 <div>
                    <Link to={`/monitor/${monitor._id}`} className="monitor-name" style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 'bold' }}>
                      {monitor.url.replace(/^https?:\/\//, '')}
                    </Link>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                       <span style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.1rem 0.3rem', borderRadius: '4px', fontSize: '0.75rem' }}>{monitor.type}</span>
                       <span>{isDown ? `Down ${downDuration}` : 'Up'}</span>
                    </div>
                 </div>
              </div>
              
              <div className="monitor-stats" style={{ gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {monitor.status === 'DOWN' && (
                     <button className="btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem', border: 'none', backgroundColor: 'var(--bg-secondary)' }}>
                        <FiEye /> View incident
                     </button>
                  )}
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FiRefreshCw /> {monitor.interval} min
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: '1rem' }}>
                   <div style={{ display: 'flex', gap: '0.15rem', alignItems: 'flex-end', height: '20px', marginBottom: '0.2rem' }}>
                      {bars.map((color, idx) => (
                         <div key={idx} style={{ 
                            width: '4px', 
                            height: '100%', 
                            backgroundColor: color, 
                            borderRadius: '1px',
                            opacity: color === 'var(--error-color)' ? 1 : 0.8
                         }}></div>
                      ))}
                   </div>
                   <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {uptimePercentage}
                   </div>
                </div>

                <button className="btn-icon" onClick={() => handleDelete(monitor._id)} style={{ marginLeft: '0.5rem' }}>
                   <div style={{ letterSpacing: '2px', color: 'var(--text-secondary)' }}>...</div>
                </button>
              </div>
            </div>
          </div>
        )})}
        {monitors.length === 0 && !showAddForm && (
           <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <FiMonitor style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
              <p>No monitors found. Create one to start tracking!</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
