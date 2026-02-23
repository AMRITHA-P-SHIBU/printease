import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

function StatCard({ icon, iconClass, value, label }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconClass}`}>{icon}</div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { Pending: 'badge-pending', Printing: 'badge-printing', Completed: 'badge-completed' };
  return <span className={`badge ${map[status] || 'badge-pending'}`}>{status || 'Pending'}</span>;
}

function TypeBadge({ type }) {
  return <span className={`badge ${type === 'Fast Track' ? 'badge-fast' : 'badge-general'}`}>{type}</span>;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/print-requests')
      .then(res => res.json())
      .then(data => {
        if (data.success) setRequests(data.data);
        else setError('Failed to load requests');
        setLoading(false);
      })
      .catch(() => {
        setError('Could not connect to server');
        setLoading(false);
      });
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await fetch(`http://localhost:5000/api/admin/print-requests/${id}/status`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: newStatus }),
      });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, print_status: newStatus } : r));
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const today     = new Date().toDateString();
  const todayReqs = requests.filter(r => new Date(r.created_at).toDateString() === today);
  const stats = {
    totalToday: todayReqs.length,
    pending:    requests.filter(r => (r.print_status || 'Pending') === 'Pending').length,
    fastTrack:  requests.filter(r => r.mode === 'Fast Track').length,
    revenue:    requests.filter(r => r.payment_status === 'paid').reduce((sum, r) => sum + Number(r.amount), 0),
  };

  const latest = requests.slice(0, 5);

  return (
    <AdminLayout adminName="Admin">

      <div className="welcome-banner">
        <div>
          <h1 className="welcome-title">Good {getGreeting()}, Admin 👋</h1>
          <p className="welcome-sub">Here's what's happening with PrintEase today.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon="🖨️" iconClass="teal"   value={stats.totalToday}              label="Requests Today"  />
        <StatCard icon="⏳" iconClass="orange"  value={stats.pending}                  label="Pending"         />
        <StatCard icon="⚡" iconClass="red"     value={stats.fastTrack}                label="Fast-Track"      />
        <StatCard icon="₹" iconClass="blue"    value={`₹${stats.revenue.toFixed(0)}`} label="Today's Revenue" />
      </div>

      <div className="section-card">
        <div className="section-header">
          <div>
            <div className="section-title">Recent Print Requests</div>
            <div className="section-subtitle">Showing latest 5 requests · Update status inline</div>
          </div>
          <button className="btn btn-outline" onClick={() => window.location.href='/admin/requests'}>
            View All →
          </button>
        </div>

        {loading && <p className="empty-msg">Loading requests...</p>}
        {error   && <p className="empty-msg" style={{color:'#e53935'}}>{error}</p>}

        {!loading && !error && (
          <div style={{overflowX:'auto'}}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Document</th>
                  <th>Mode</th>
                  <th>Print Type</th>
                  <th>Pages</th>
                  <th>Copies</th>
                  <th>Spiral</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {latest.length === 0 && (
                  <tr><td colSpan="11" className="empty-msg">No requests yet</td></tr>
                )}
                {latest.map((req) => (
                  <tr key={req.id}>
                    <td><strong>PE-{String(req.id).padStart(3,'0')}</strong></td>

                    {/* ── Document View Button ── */}
                    <td>
                      {req.file_url ? (
                        <a
                          href={req.file_url}
                          target="_blank"
                          rel="noreferrer"
                          style={viewBtnStyle}
                        >
                          📄 View
                        </a>
                      ) : '—'}
                    </td>

                    <td><TypeBadge type={req.mode} /></td>
                    <td style={{fontSize:'13px'}}>{req.print_type}</td>
                    <td>{req.total_pages}</td>
                    <td>{req.copies}</td>
                    <td>
                      <span className={`badge ${req.spiral_binding ? 'badge-fast' : 'badge-general'}`}>
                        {req.spiral_binding ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td><strong>₹{Number(req.amount).toFixed(2)}</strong></td>
                    <td>
                      <span className={`badge ${req.payment_status === 'paid' ? 'badge-completed' : 'badge-pending'}`}>
                        {req.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td><StatusBadge status={req.print_status || 'Pending'} /></td>
                    <td>
                      <select
                        className="status-select"
                        value={req.print_status || 'Pending'}
                        onChange={e => updateStatus(req.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Printing">Printing</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Summary Row */}
      <div className="quick-row">
        <div className="section-card quick-card">
          <div className="section-header">
            <div className="section-title">⚡ Fast-Track Queue</div>
          </div>
          <div className="quick-list">
            {requests.filter(r => r.mode === 'Fast Track').length === 0
              ? <p className="empty-msg">No fast-track requests</p>
              : requests.filter(r => r.mode === 'Fast Track').slice(0,5).map(r => (
                  <div key={r.id} className="quick-item">
                    <span className="quick-token">PE-{String(r.id).padStart(3,'0')}</span>
                    <span className="quick-user">{r.print_type} · {r.total_pages}pg</span>
                    <StatusBadge status={r.print_status || 'Pending'} />
                  </div>
                ))
            }
          </div>
        </div>

        <div className="section-card quick-card">
          <div className="section-header">
            <div className="section-title">📌 Pending Payments</div>
          </div>
          <div className="quick-list">
            {requests.filter(r => r.payment_status !== 'paid').length === 0
              ? <p className="empty-msg">All payments cleared ✓</p>
              : requests.filter(r => r.payment_status !== 'paid').slice(0,5).map(r => (
                  <div key={r.id} className="quick-item">
                    <span className="quick-token">PE-{String(r.id).padStart(3,'0')}</span>
                    <span className="quick-user">{r.print_type}</span>
                    <span className="badge badge-pending">₹{Number(r.amount).toFixed(0)}</span>
                  </div>
                ))
            }
          </div>
        </div>
      </div>

      <style>{dashboardStyles}</style>
    </AdminLayout>
  );
}

const viewBtnStyle = {
  color: '#2bb5a0',
  fontWeight: '600',
  fontSize: '12px',
  textDecoration: 'none',
  padding: '4px 10px',
  border: '1.5px solid #2bb5a0',
  borderRadius: '6px',
  whiteSpace: 'nowrap',
  display: 'inline-block',
};

const dashboardStyles = `
  .welcome-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  .welcome-title {
    font-size: 24px;
    font-weight: 800;
    color: var(--navy);
    letter-spacing: -0.5px;
  }
  .welcome-sub {
    color: var(--grey-400);
    font-size: 14px;
    margin-top: 4px;
  }
  .status-select {
    padding: 5px 8px;
    border: 1.5px solid var(--grey-200);
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--navy);
    background: var(--white);
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
  }
  .status-select:focus { border-color: var(--teal); }
  .quick-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }
  .quick-list { padding: 8px 0; }
  .quick-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 24px;
    border-bottom: 1px solid var(--grey-100);
  }
  .quick-item:last-child { border-bottom: none; }
  .quick-token {
    font-size: 12px;
    font-weight: 700;
    color: var(--teal-dark);
    background: var(--teal-light);
    padding: 2px 8px;
    border-radius: 4px;
  }
  .quick-user { flex: 1; font-size: 13px; color: var(--navy); }
  .empty-msg  { padding: 16px 24px; font-size: 13px; color: var(--grey-400); }
  @media (max-width: 768px) {
    .quick-row { grid-template-columns: 1fr; }
  }
`;