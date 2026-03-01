import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

function StatusBadge({ status }) {
  const map = { Pending: 'badge-pending', Printing: 'badge-printing', Completed: 'badge-completed' };
  return <span className={`badge ${map[status] || 'badge-pending'}`}>{status || 'Pending'}</span>;
}

function TypeBadge({ type }) {
  return <span className={`badge ${type === 'Fast Track' ? 'badge-fast' : 'badge-general'}`}>{type}</span>;
}

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, print_status: newStatus } : r));
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = requests.slice(startIdx, startIdx + itemsPerPage);

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

  return (
    <AdminLayout adminName="Admin">
      <div className="section-card">
        <div className="section-header">
          <div>
            <div className="section-title">All Print Requests</div>
            <div className="section-subtitle">Showing {startIdx + 1}–{Math.min(startIdx + itemsPerPage, requests.length)} of {requests.length} requests</div>
          </div>
        </div>

        {loading && <p className="empty-msg">Loading requests...</p>}
        {error && <p className="empty-msg" style={{ color: '#e53935' }}>{error}</p>}

        {!loading && !error && (
          <>
            <div style={{ overflowX: 'auto' }}>
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
                  {paginatedRequests.length === 0 ? (
                    <tr><td colSpan="11" className="empty-msg">No requests found</td></tr>
                  ) : (
                    paginatedRequests.map((req) => (
                      <tr key={req.id}>
                        <td><strong>PE-{String(req.id).padStart(3, '0')}</strong></td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 500, color: '#1a2e35' }}>
                              {req.original_name || ''}
                            </span>
                            {req.file_url ? (
                              <a
                                href={req.file_url}
                                target="_blank"
                                rel="noreferrer"
                                style={viewBtnStyle}
                              >
                                📄 View
                              </a>
                            ) : null}
                          </div>
                        </td>

                        <td><TypeBadge type={req.mode} /></td>
                        <td style={{ fontSize: '13px' }}>{req.print_type}</td>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={paginationStyle}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={paginationBtn}
                >
                  ← Prev
                </button>
                <span style={paginationInfo}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={paginationBtn}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{styles}</style>
    </AdminLayout>
  );
}

const paginationStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '12px',
  marginTop: '20px',
  padding: '16px',
};

const paginationBtn = {
  padding: '8px 16px',
  border: '1.5px solid #2bb5a0',
  background: 'white',
  color: '#2bb5a0',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '13px',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const paginationInfo = {
  fontWeight: '600',
  fontSize: '13px',
  color: '#2bb5a0',
};

const styles = `
  .section-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  }
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .section-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--navy);
  }
  .section-subtitle {
    font-size: 13px;
    color: var(--grey-400);
    margin-top: 4px;
  }
  .admin-table {
    width: 100%;
    border-collapse: collapse;
  }
  .admin-table thead tr {
    background: var(--grey-50);
    border-bottom: 2px solid var(--grey-100);
  }
  .admin-table th {
    padding: 12px;
    text-align: left;
    font-weight: 600;
    font-size: 12px;
    color: var(--grey-600);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .admin-table td {
    padding: 12px;
    border-bottom: 1px solid var(--grey-100);
    font-size: 13px;
    color: var(--navy);
  }
  .admin-table tbody tr:hover {
    background: #f9fafb;
  }
  .badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    text-transform: capitalize;
  }
  .badge-pending {
    background: #fff3cd;
    color: #856404;
  }
  .badge-printing {
    background: #d1ecf1;
    color: #0c5460;
  }
  .badge-completed {
    background: #d4edda;
    color: #155724;
  }
  .badge-fast {
    background: #f8d7da;
    color: #721c24;
  }
  .badge-general {
    background: #e2e3e5;
    color: #383d41;
  }
  .status-select {
    padding: 5px 8px;
    border: 1.5px solid var(--grey-200);
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--navy);
    background: white;
    cursor: pointer;
    outline: none;
  }
  .status-select:focus {
    border-color: #2bb5a0;
  }
  .empty-msg {
    padding: 16px;
    text-align: center;
    color: var(--grey-400);
    font-size: 13px;
  }
`;
