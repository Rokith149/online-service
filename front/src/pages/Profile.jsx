import React from 'react';
import { FiUser } from 'react-icons/fi';

const Profile = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Profile</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your account settings</p>
        </div>
      </div>

      <div className="auth-card glass-panel" style={{ maxWidth: '600px', margin: '0' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiUser style={{ fontSize: '2.5rem', color: 'var(--text-secondary)' }} />
            </div>
            <div>
               <h2>{user?.name}</h2>
               <p style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            </div>
         </div>

         <div className="input-group">
            <label>Name</label>
            <input type="text" className="input-field" disabled value={user?.name || ''} />
         </div>
         
         <div className="input-group">
            <label>Email Address</label>
            <input type="email" className="input-field" disabled value={user?.email || ''} />
            <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>Email alerts will be sent to this address.</small>
         </div>
      </div>
    </div>
  );
};

export default Profile;
