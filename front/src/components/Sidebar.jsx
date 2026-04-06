import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiMonitor, FiAlertCircle, FiSettings, FiLogOut, FiBell } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-dot"></span> UptimeTracker
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <FiMonitor className="nav-icon" /> Dashboard
        </NavLink>
        <NavLink to="/incidents" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <FiAlertCircle className="nav-icon" /> Incidents
        </NavLink>
        <NavLink to="/alerts" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <FiBell className="nav-icon" /> Alerts
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <FiSettings className="nav-icon" /> Profile
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <FiLogOut className="nav-icon" /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
