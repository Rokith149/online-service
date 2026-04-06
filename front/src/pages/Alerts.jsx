import React from 'react';
import { FiBell } from 'react-icons/fi';

const Alerts = () => {
    // Basic placeholder for an alerts page since Alert routes are not fully mapped in backend yet.
    // Real implementation would fetch from /api/alerts
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Alerts</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Email notifications and system alerts</p>
        </div>
      </div>

      <div className="monitors-list">
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <FiBell style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
            <p>Alerts are being sent directly to your registered Email address.</p>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
