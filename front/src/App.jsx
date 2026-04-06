import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Incidents from './pages/Incidents';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import MonitorDetails from './pages/MonitorDetails';
import './index.css';

// Simple Auth Wrapper
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <div className="layout-container">
              <Sidebar />
              <main className="main-content">
                <Dashboard />
              </main>
            </div>
          </PrivateRoute>
        } />
        
        <Route path="/monitor/:id" element={
          <PrivateRoute>
            <div className="layout-container">
              <Sidebar />
              <main className="main-content">
                <MonitorDetails />
              </main>
            </div>
          </PrivateRoute>
        } />
        
        <Route path="/incidents" element={
          <PrivateRoute>
            <div className="layout-container">
              <Sidebar />
              <main className="main-content">
                <Incidents />
              </main>
            </div>
          </PrivateRoute>
        } />

        <Route path="/alerts" element={
          <PrivateRoute>
            <div className="layout-container">
              <Sidebar />
              <main className="main-content">
                <Alerts />
              </main>
            </div>
          </PrivateRoute>
        } />

        <Route path="/profile" element={
          <PrivateRoute>
            <div className="layout-container">
              <Sidebar />
              <main className="main-content">
                <Profile />
              </main>
            </div>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
