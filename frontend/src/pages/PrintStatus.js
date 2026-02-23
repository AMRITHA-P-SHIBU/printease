import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';

// placeholder for server-loaded job

const statusConfig = {
  completed: {
    label: "Completed",
    bg: "rgba(52, 199, 89, 0.15)",
    color: "#34C759",
    dot: "#34C759",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="7" fill="#34C759" />
        <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  printing: {
    label: "Printing",
    bg: "rgba(0, 194, 168, 0.15)",
    color: "#00C2A8",
    dot: "#00C2A8",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="#00C2A8" strokeWidth="1.5" strokeDasharray="2 2" />
        <circle cx="7" cy="7" r="2.5" fill="#00C2A8" />
      </svg>
    ),
  },
  pending: {
    label: "Pending",
    bg: "rgba(255, 159, 10, 0.15)",
    color: "#FF9F0A",
    dot: "#FF9F0A",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="#FF9F0A" strokeWidth="1.5" />
        <path d="M7 4v3.5l2 1" stroke="#FF9F0A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  cancelled: {
    label: "Cancelled",
    bg: "rgba(255, 69, 58, 0.12)",
    color: "#FF453A",
    dot: "#FF453A",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="#FF453A" strokeWidth="1.5" />
        <path d="M5 5l4 4M9 5l-4 4" stroke="#FF453A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
};

// (we no longer need filter tabs - lookup is by token)

export default function PrintStatus() {
  const [token, setToken] = useState(() => {
    // try prefilling from storage
    const last = localStorage.getItem('last_request_id');
    return last ? `PE-${String(last).padStart(3,'0')}` : "";
  });
  const [job, setJob]     = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const fullName = localStorage.getItem("full_name");

  const handleCheck = useCallback(async (overrideToken) => {
    const raw = overrideToken !== undefined ? overrideToken : token;
    const t    = (typeof raw === 'string' ? raw : String(raw)).trim();
    if (!t) return;
    setError("");
    setJob(null);
    const id = t.replace(/^PE-?/i, "");
    try {
      const res = await fetch(`http://localhost:5000/api/print-requests/${id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setJob(data.data);
      } else {
        setError(data.message || "Unable to find request");
      }
    } catch (err) {
      setError("Could not connect to server");
    }
  }, [token]);

  // auto-check when token is set from storage
  useEffect(() => {
    if (token) handleCheck(token);
  }, [token, handleCheck]);

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f3" }}>

      {/* Navbar — same as Dashboard */}
      <div className="navbar">
        <h2 className="brand">PRINTEASE</h2>
        <div className="nav-right">
          <button className="nav-btn" onClick={() => navigate(-1)}>← Back</button>
          <button className="nav-btn" onClick={() => navigate('/')}>Home</button>
          <div className="avatar">
            {fullName ? fullName.charAt(0).toUpperCase() : "U"}
          </div>
          <span className="username">{fullName}</span>
          <span className="logout" onClick={() => { localStorage.clear(); navigate('/'); }}>
            Logout
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 20px" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#1a1a1a" }}>Print Status</h1>
          <p style={{ margin: "6px 0 0", color: "#888", fontSize: 14 }}>Enter your token to view current status</p>
        </div>

        {/* Token input */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <input
            type="text"
            placeholder="PE-123"
            value={token}
            onChange={e => setToken(e.target.value)}
            style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
          />
          <button
            onClick={() => handleCheck()}
            style={{ padding: "8px 20px", borderRadius: 6, background: "#00C2A8", color: "white", border: "none", cursor: "pointer" }}
          >
            Check
          </button>
        </div>

        {error && <p style={{ color: '#e53935' }}>{error}</p>}

        {job && (
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Token: <strong>PE-{String(job.id).padStart(3,'0')}</strong></div>
                <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>{new Date(job.created_at).toLocaleString()}</div>
              </div>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 100,
                background: statusConfig[(job.print_status||'Pending').toLowerCase()]?.bg || '#eee',
                color: statusConfig[(job.print_status||'Pending').toLowerCase()]?.color || '#333',
                fontSize: 12, fontWeight: 700,
              }}>
                {statusConfig[(job.print_status||'Pending').toLowerCase()]?.icon}
                {job.print_status || 'Pending'}
              </span>
            </div>

            {/* additional details if desired */}
            <div style={{ marginTop: 16, fontSize: 14, color: '#444' }}>
              <div>Type: {job.print_type}</div>
              <div>Mode: {job.mode}</div>
              <div>Pages: {job.total_pages}</div>
              <div>Copies: {job.copies}</div>
              <div>Payment: {job.payment_status === 'paid' ? 'Paid' : 'Unpaid'}</div>
            </div>
          </div>
        )}
      </div>


      <style>{`
        @keyframes progress-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}