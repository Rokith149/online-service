import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { FiArrowLeft, FiClock, FiActivity, FiAlertCircle } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MonitorDetails = () => {
  const { id } = useParams();
  const [monitor, setMonitor] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [secondsAgo, setSecondsAgo] = useState(24);

  // Poll data every 10 seconds to get the latest ping history and status
  useEffect(() => {
    fetchData();
    const pollId = setInterval(fetchData, 10000);
    return () => clearInterval(pollId);
  }, [id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [monRes, incRes] = await Promise.all([
        api.get(`/monitors`, { headers: { Authorization: `Bearer ${token}` } }),
        api.get(`/monitors/${id}/incidents`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const currentMonitor = monRes.data.find(m => m._id === id);
      setMonitor(currentMonitor);
      setIncidents(incRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Live seconds ago ticker

  useEffect(() => {
    if (!monitor) return;
    const timer = setInterval(() => {
      setSecondsAgo(prev => {
        const intervalSeconds = monitor.interval * 60;
        if (prev >= intervalSeconds - 1) return 0;
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [monitor]);

  if (!monitor) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  const isDown = monitor.status === 'DOWN';

  const calculateDurationFull = (startTime) => {
    if (!startTime) return '0s';
    const diffMs = Date.now() - new Date(startTime).getTime();
    let seconds = Math.floor(diffMs / 1000);
    const h = Math.floor(seconds / 3600);
    seconds %= 3600;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const latestIncident = incidents.length > 0 ? incidents[0] : null;
  const statusDuration = calculateDurationFull(latestIncident ? latestIncident.createdAt : monitor.createdAt);
  const incidentCount = incidents.filter(i => i.type === 'DOWN').length;

  // Mock data for visual simulation as per screenshot
  const bars = Array.from({ length: 32 }).map((_, i) => {
    if (isDown && i > 25) return 'var(--error-color)';
    return 'var(--success-color)';
  });
  
  const uptimePercentage = isDown ? '98.541%' : '100.000%';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{label}</p>
          <p style={{ margin: '0.2rem 0 0 0', fontWeight: 'bold' }}>{payload[0].value} ms</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          <FiArrowLeft /> Back to Dashboard
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           {isDown ? (
               <div style={{ backgroundColor: 'var(--error-color)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <FiAlertCircle size={20} style={{ color: 'var(--bg-card)' }}/>
               </div>
           ) : (
               <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '0.4rem', borderRadius: '50%' }}>
                  <div style={{ backgroundColor: 'var(--success-color)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '8px solid var(--bg-card)' }}></div>
                  </div>
               </div>
           )}
           <div>
             <h1 style={{ fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               {monitor.url.replace(/^https?:\/\//, '')}
             </h1>
             <p style={{ margin: '0.25rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <span style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.1rem 0.3rem', borderRadius: '4px', fontSize: '0.8rem' }}>{monitor.type}/S</span> monitor for <a href={monitor.url} target="_blank" rel="noreferrer" style={{ color: 'var(--success-color)' }}>{monitor.url}</a>
             </p>
           </div>
        </div>
      </div>

      {/* Top 3 Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'white' }}>
             <span>Current status</span>
             {isDown && <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}><FiAlertCircle /> View Incident</button>}
          </div>
          <h2 style={{ color: isDown ? 'var(--error-color)' : 'var(--success-color)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
             {isDown ? 'Down' : 'Up'}
          </h2>
          <p style={{ color: 'white', fontSize: '0.95rem' }}>
             {isDown ? `Currently down for ${statusDuration}` : `Currently up for ${statusDuration}`}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'white', marginBottom: '1rem' }}>Last check</div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'white' }}>
            {secondsAgo < 60 ? `${secondsAgo}s ago` : `${Math.floor(secondsAgo / 60)}m ${secondsAgo % 60}s ago`}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: 'white' }}>Checked every {monitor.interval}m</p>
            <span style={{ color: 'var(--success-color)', fontSize: '0.875rem', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>Get 60 sec. checks</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'white', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Last 24 hours</span>
          </div>
          <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'flex-end', height: '24px', marginBottom: '0.5rem' }}>
             {bars.map((color, idx) => (
                <div key={idx} style={{ 
                   flex: 1, 
                   height: '100%', 
                   backgroundColor: color, 
                   borderRadius: '4px',
                   opacity: color === 'var(--error-color)' ? 1 : 0.8
                }}></div>
             ))}
          </div>
          <p style={{ color: 'white', fontSize: '0.875rem' }}>
             {incidentCount > 0 ? `${incidentCount} incidents, ${statusDuration} down` : '0 incidents, 0m down'}
          </p>
        </div>
      </div>

      {/* History Stats Row */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', marginBottom: '1.5rem', gap: '2rem', flexWrap: 'wrap' }}>
         <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ color: 'white' }}>Last 7 days</div>
            <div style={{ color: isDown ? 'var(--error-color)' : 'var(--success-color)', fontSize: '1.5rem', fontWeight: 'bold', margin: '0.75rem 0' }}>{uptimePercentage}</div>
            <div style={{ color: 'white', fontSize: '0.9rem' }}>{incidentCount > 0 ? `${incidentCount} incidents, ${statusDuration} down` : '0 incidents, 0m down'}</div>
         </div>
         <div style={{ flex: 1, minWidth: '150px', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
            <div style={{ color: 'white' }}>Last 30 days</div>
            <div style={{ color: isDown ? 'var(--error-color)' : 'var(--success-color)', fontSize: '1.5rem', fontWeight: 'bold', margin: '0.75rem 0' }}>{uptimePercentage}</div>
            <div style={{ color: 'white', fontSize: '0.9rem' }}>{incidentCount > 0 ? `${incidentCount} incidents, ${statusDuration} down` : '0 incidents, 0m down'}</div>
         </div>
         <div style={{ flex: 1, minWidth: '150px', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
            <div style={{ color: 'white' }}>Last 365 days</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.75rem 0' }}>--.--%</div>
            <div style={{ color: 'var(--success-color)', fontSize: '0.9rem', textDecoration: 'underline' }}>Unlock with paid plans</div>
         </div>
         <div style={{ flex: 1, minWidth: '150px', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
            <div style={{ color: 'white', display: 'flex', justifyContent: 'space-between' }}>
              <span>MTBF</span>
              <select style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', borderRadius: '4px', padding: '2px 5px' }}>
              </select>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '1.5rem', fontWeight: 'bold', margin: '0.75rem 0' }}>N/A</div>
         </div>
      </div>

      {/* Live Response Time Chart */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Live Response time <span style={{ color: 'var(--success-color)' }}>.</span></h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Setup alerts <span style={{ color: 'white' }}>For slow response times</span></span>
               <select className="btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                 <option>Live view</option>
               </select>
            </div>
         </div>
         
         <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={(monitor?.pingHistory || []).map(p => ({ 
                  time: new Date(p.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
                  ms: p.ms 
                }))} 
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickMargin={10} minTickGap={30} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={(val) => `${val}ms`} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="ms" 
                  stroke="var(--success-color)" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: 'var(--bg-card)', stroke: 'var(--success-color)', strokeWidth: 2 }} 
                  activeDot={{ r: 6, fill: 'var(--success-color)', stroke: 'white', strokeWidth: 2 }} 
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
         </div>
      </div>

    </div>
  );
};

export default MonitorDetails;
