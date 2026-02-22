import React, { useState } from 'react';
import AdminLayout from './AdminLayout';

// ── Mock data (replace with real API calls) ──────────────────────────
const mockStats = {
  totalToday: 24,
  pending: 7,
  fastTrack: 3,
  revenue: 1840,
};

const mockRequests = [
  { id: 1, token: 'PE-001', user: 'Arun Kumar',   type: 'Fast-Track', pages: 12, copies: 2, amount: 96,  status: 'Printing',  paid: true  },
  { id: 2, token: 'PE-002', user: 'Meena Raj',    type: 'General',    pages: 8,  copies: 1, amount: 24,  status: 'Pending',   paid: true  },
  { id: 3, token: 'PE-003', user: 'Suresh P.',    type: 'General',    pages: 20, copies: 3, amount: 180, status: 'Completed', paid: true  },
  { id: 4, token: 'PE-004', user: 'Divya S.',     type: 'Fast-Track', pages: 5,  copies: 1, amount: 55,  status: 'Pending',   paid: false },
  { id: 5, token: 'PE-005', user: 'Karthik M.',   type: 'General',    pages: 30, copies: 1, amount: 90,  status: 'Completed', paid: true  },
];

// ── Sub-components ────────────────────────────────────────────────────
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
  return <span className={`badge ${map[status] || ''}`}>{status}</span>;
}

function TypeBadge({ type }) {
  return <span className={`badge ${type === 'Fast-Track' ? 'badge-fast' : 'badge-general'}`}>{type}</span>;
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [requests, setRequests] = useState(mockRequests);

  const updateStatus = (id, newStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <AdminLayout adminName="Admin">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h1 className="welcome-title">Good {getGreeting()}, Admin 👋</h1>
          <p className="welcome-sub">Here's what's happening with PrintEase today.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard icon="🖨️" iconClass="teal"   value={mockStats.totalToday} label="Requests Today" />
        <StatCard icon="⏳" iconClass="orange"  value={mockStats.pending}    label="Pending"        />
        <StatCard icon="⚡" iconClass="red"     value={mockStats.fastTrack}  label="Fast-Track"     />
        <StatCard icon="₹" iconClass="blue"    value={`₹${mockStats.revenue}`} label="Today's Revenue" />
      </div>

      {/* Recent Print Requests Table */}
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
        <table className="admin-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>User</th>
              <th>Type</th>
              <th>Pages</th>
              <th>Copies</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td><strong>{req.token}</strong></td>
                <td>{req.user}</td>
                <td><TypeBadge type={req.type} /></td>
                <td>{req.pages}</td>
                <td>{req.copies}</td>
                <td>₹{req.amount}</td>
                <td>
                  <span className={`badge ${req.paid ? 'badge-completed' : 'badge-pending'}`}>
                    {req.paid ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
                <td><StatusBadge status={req.status} /></td>
                <td>
                  <select
                    className="status-select"
                    value={req.status}
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

      {/* Quick Summary Row */}
      <div className="quick-row">
        <div className="section-card quick-card">
          <div className="section-header">
            <div className="section-title">⚡ Fast-Track Queue</div>
          </div>
          <div className="quick-list">
            {requests.filter(r => r.type === 'Fast-Track').map(r => (
              <div key={r.id} className="quick-item">
                <span className="quick-token">{r.token}</span>
                <span className="quick-user">{r.user}</span>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="section-card quick-card">
          <div className="section-header">
            <div className="section-title">📌 Pending Payments</div>
          </div>
          <div className="quick-list">
            {requests.filter(r => !r.paid).length === 0
              ? <p className="empty-msg">All payments cleared ✓</p>
              : requests.filter(r => !r.paid).map(r => (
                  <div key={r.id} className="quick-item">
                    <span className="quick-token">{r.token}</span>
                    <span className="quick-user">{r.user}</span>
                    <span className="badge badge-pending">₹{r.amount}</span>
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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

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
  .status-select:focus {
    border-color: var(--teal);
  }
  .quick-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }
  .quick-list {
    padding: 8px 0;
  }
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
  .quick-user {
    flex: 1;
    font-size: 13px;
    color: var(--navy);
  }
  .empty-msg {
    padding: 16px 24px;
    font-size: 13px;
    color: var(--grey-400);
  }
  @media (max-width: 768px) {
    .quick-row { grid-template-columns: 1fr; }
  }
`;
