import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';

const statusConfig = {
  completed: {
    label: "Completed",
    bg: "rgba(52, 199, 89, 0.15)",
    color: "#34C759",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="7" fill="#34C759" />
        <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  processing: {
    label: "Processing",
    bg: "rgba(0, 194, 168, 0.15)",
    color: "#00C2A8",
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
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="#FF9F0A" strokeWidth="1.5" />
        <path d="M7 4v3.5l2 1" stroke="#FF9F0A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
};

export default function BookstoreStatus() {
  const navigate = useNavigate();

  const fullName = localStorage.getItem("full_name") || "User";

  const [token, setToken] = useState(() => {
    const last = localStorage.getItem("last_bs_order_id");
    return last ? `BS-${String(last).padStart(3, "0")}` : "";
  });
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const handleCheck = useCallback(async (overrideToken) => {
    const raw = overrideToken !== undefined ? overrideToken : token;
    const t = (typeof raw === "string" ? raw : String(raw)).trim();
    if (!t) return;
    setError("");
    setOrder(null);
    const id = t.replace(/^BS-?/i, "");
    try {
      const res = await fetch(`http://localhost:5000/api/bookstore/order/${id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setOrder(data.data);
      } else {
        setError(data.message || "Order not found");
      }
    } catch {
      setError("Could not connect to server");
    }
  }, [token]);

  useEffect(() => {
    if (token) handleCheck(token);
  }, [token, handleCheck]);

  const getStatusConfig = (status) => {
    return statusConfig[(status || "Pending").toLowerCase()] || statusConfig.pending;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f3" }}>

      {/* ── NAVBAR ── */}
      <div className="navbar">
        <h2 className="brand">PRINTEASE</h2>
        <div className="nav-right">
          <button className="nav-btn" onClick={() => navigate(-1)}>← Back</button>
          <button className="nav-btn" onClick={() => navigate("/")}>🏠 Home</button>
          <div className="avatar">
            {fullName ? fullName.charAt(0).toUpperCase() : "U"}
          </div>
          <span className="username">{fullName}</span>
          <span className="logout" onClick={() => { localStorage.clear(); navigate("/"); }}>
            Logout
          </span>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#1a1a1a" }}>
            Order Status
          </h1>
          <p style={{ margin: "6px 0 0", color: "#888", fontSize: 14 }}>
            Enter your token to view current status
          </p>
        </div>

        {/* Token Input */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <input
            type="text"
            placeholder="BS-001"
            value={token}
            onChange={e => setToken(e.target.value)}
            style={{
              flex: 1, padding: "8px 12px", borderRadius: 6,
              border: "1px solid #ccc", fontSize: 14
            }}
          />
          <button
            onClick={() => handleCheck()}
            style={{
              padding: "8px 20px", borderRadius: 6,
              background: "#00C2A8", color: "white",
              border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: 14
            }}
          >
            Check
          </button>
        </div>

        {error && <p style={{ color: "#e53935", fontSize: 14 }}>{error}</p>}

        {/* Order Card */}
        {order && (() => {
          const sc = getStatusConfig(order.status);
          return (
            <div style={{
              background: "white", borderRadius: 16,
              padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.05)"
            }}>
              {/* Top row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>
                    Token: <strong>BS-{String(order.id).padStart(3, "0")}</strong>
                  </div>
                  <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>
                <span style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "5px 12px", borderRadius: 100,
                  background: sc.bg, color: sc.color,
                  fontSize: 12, fontWeight: 700
                }}>
                  {sc.icon}
                  {order.status || "Pending"}
                </span>
              </div>

              {/* Items */}
              <div style={{
                background: "#f8fafb", borderRadius: 10,
                padding: "12px 16px", marginBottom: 14
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 8 }}>
                  Items Ordered:
                </div>
                {order.items.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: 14, color: "#444", padding: "4px 0",
                    borderBottom: i < order.items.length - 1 ? "1px solid #eee" : "none"
                  }}>
                    <span>{item.item_name} × {item.quantity}</span>
                    <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div style={{ fontSize: 14, color: "#444" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontWeight: 700, fontSize: 15, color: "#1a2e35"
                }}>
                  <span>Total Amount</span>
                  <span>₹{Number(order.total_amount).toFixed(2)}</span>
                </div>
              </div>

            </div>
          );
        })()}
      </div>
    </div>
  );
}