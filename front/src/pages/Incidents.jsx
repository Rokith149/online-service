import React, { useState, useEffect } from 'react';
import api from '../api';
import { FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [monitors, setMonitors] = useState([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch monitors first to map IDs to Names
        const monitorsRes = await api.get('/monitors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMonitors(monitorsRes.data);

        // Fetch incidents for each monitor (simple but N+1 queries for prototyping)
        let allIncidents = [];
        for (const monitor of monitorsRes.data) {
           const incRes = await api.get(`/monitors/${monitor._id}/incidents`, {
             headers: { Authorization: `Bearer ${token}` }
           });
           const enhancedIncidents = incRes.data.map(inc => ({...inc, monitorName: monitor.name }));
           allIncidents = [...allIncidents, ...enhancedIncidents];
        }

        // Sort by youngest
        allIncidents.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setIncidents(allIncidents);

      } catch (err) {
        console.error(err);
      }
    };
    fetchIncidents();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Incidents</h1>
          <p style={{ color: 'var(--text-secondary)' }}>History of downtime events</p>
        </div>
      </div>

      <div className="monitors-list">
        {incidents.map(incident => (
          <div key={incident._id} className="monitor-card glass-panel" style={{ borderLeft: incident.type === 'DOWN' ? '4px solid var(--error-color)' : '4px solid var(--success-color)' }}>
            <div className="monitor-info">
               {incident.type === 'DOWN' ? 
                 <FiXCircle style={{ color: 'var(--error-color)', fontSize: '1.5rem' }} /> : 
                 <FiCheckCircle style={{ color: 'var(--success-color)', fontSize: '1.5rem' }} />
               }
               <div>
                  <h3 className="monitor-name">{incident.monitorName}</h3>
                  <div className="monitor-url">{incident.cause || (incident.type === 'UP' ? 'Service Restored' : 'Service Down')}</div>
               </div>
            </div>
            
            <div className="monitor-stats">
              <div className="stat-item" style={{ color: 'var(--text-secondary)' }}>
                <FiClock /> {new Date(incident.createdAt).toLocaleString()}
              </div>
              {incident.resolvedAt && (
                <div className="stat-item" style={{ color: 'var(--success-color)', fontSize: '0.875rem' }}>
                  Resolved at {new Date(incident.resolvedAt).toLocaleString()}
                </div>
              )}
              {!incident.resolvedAt && incident.type === 'DOWN' && (
                 <div className="stat-item" style={{ color: 'var(--error-color)', fontSize: '0.875rem' }}>
                  Ongoing
                </div>
              )}
            </div>
          </div>
        ))}

        {incidents.length === 0 && (
           <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <FiCheckCircle style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--success-color)', opacity: 0.8 }} />
              <p>No incidents found. All systems are operational!</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default Incidents;
