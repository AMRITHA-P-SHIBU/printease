import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';

const statusStyle = {
  Completed:  { background: "rgba(52,199,89,0.12)",  color: "#1a7a3a", label: "Completed"  },
  Pending:    { background: "rgba(255,159,10,0.12)",  color: "#b7650a", label: "Pending"    },
  Processing: { background: "rgba(43,181,160,0.12)",  color: "#1b8a6b", label: "Processing" },
};

export default function BookstorePreviousActivity() {
  const navigate = useNavigate();
  const fullName = localStorage.getItem("full_name") || "User";
  const username = localStorage.getItem("username")  || "";

  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [expanded, setExpanded] = useState(null);
  const [filter,   setFilter]   = useState("All");

  useEffect(() => {
    if (!username) {
      setError("Session expired. Please login again.");
      setLoading(false);
      return;
    }
    fetch(`http://localhost:5000/api/bookstore/orders/${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrders(data.data);
        else setError("Failed to load activity.");
        setLoading(false);
      })
      .catch(() => {
        setError("Could not connect to server.");
        setLoading(false);
      });
  }, [username]);

  const completedOrders = orders.filter(o => o.status === "Completed");
  const totalSpent = completedOrders
    .reduce((sum, o) => sum + Number(o.total_amount), 0)
    .toFixed(2);

  const filtered = filter === "All"
    ? orders
    : orders.filter(o => o.status === filter);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #e8f5f2 0%, #f0faf8 100%)" }}>

      {/* Navbar */}
      <div className="navbar">
        <h2 className="brand">PRINTEASE</h2>
        <div className="nav-right">
          <button className="nav-btn" onClick={() => navigate(-1)}>← Back</button>
          <button className="nav-btn" onClick={() => navigate('/')}>Home</button>
          <div className="avatar">{fullName.charAt(0).toUpperCase()}</div>
          <span className="username">{fullName}</span>
          <span className="logout" onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</span>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1a2e35" }}>Bookstore Activity</h1>
          <p style={{ margin: "6px 0 0", color: "#5a7a7e", fontSize: 14 }}>Your complete bookstore order history</p>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Orders",  value: loading ? "…" : orders.length,          color: "#2bb5a0", icon: "🛒" },
            { label: "Completed",     value: loading ? "…" : completedOrders.length, color: "#1a7a3a", icon: "✅" },
            { label: "Total Spent",   value: loading ? "…" : `₹${totalSpent}`,       color: "#1b8a6b", icon: "💰" },
          ].map((card) => (
            <div key={card.label} style={{
              background: "white", borderRadius: 16, padding: "20px 24px",
              boxShadow: "0 4px 16px rgba(43,181,160,0.10)",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <span style={{ fontSize: 28 }}>{card.icon}</span>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: card.color }}>{card.value}</div>
                <div style={{ fontSize: 13, color: "#5a7a7e", fontWeight: 500 }}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {["All", "Completed", "Pending", "Processing"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 22px", borderRadius: 100, border: "none",
                cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit",
                transition: "all 0.2s",
                background: filter === f ? "#2bb5a0" : "white",
                color:      filter === f ? "white"   : "#555",
                boxShadow:  filter === f
                  ? "0 4px 12px rgba(43,181,160,0.30)"
                  : "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Loading / Error */}
        {loading && (
          <div style={{ background: "white", borderRadius: 16, padding: "40px 20px", textAlign: "center", color: "#aaa", fontSize: 15 }}>
            Loading your activity...
          </div>
        )}
        {error && (
          <div style={{ background: "#ffeaea", borderRadius: 16, padding: "20px", textAlign: "center", color: "#c0392b", fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* Order List */}
        {!loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.length === 0 ? (
              <div style={{
                background: "white", borderRadius: 16, padding: "40px 20px",
                textAlign: "center", color: "#aaa", fontWeight: 500, fontSize: 15,
              }}>
                No orders found.
              </div>
            ) : filtered.map((order) => {
              const statusKey = order.status || "Pending";
              const st        = statusStyle[statusKey] || statusStyle["Pending"];
              const isOpen    = expanded === order.id;

              return (
                <div
                  key={order.id}
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  style={{
                    background: "white", borderRadius: 16, padding: "18px 22px",
                    cursor: "pointer",
                    boxShadow: isOpen ? "0 6px 24px rgba(43,181,160,0.15)" : "0 2px 12px rgba(0,0,0,0.05)",
                    border: isOpen ? "1.5px solid #2bb5a0" : "1.5px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  {/* Top Row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: "rgba(43,181,160,0.10)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, fontSize: 20,
                      }}>
                        🛍️
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#1a2e35" }}>
                          Order BS-{String(order.id).padStart(3, "0")}
                        </div>
                        <div style={{ fontSize: 12, color: "#999", marginTop: 3 }}>
                          {order.items.length} item{order.items.length > 1 ? "s" : ""} · ₹{Number(order.total_amount).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        padding: "5px 14px", borderRadius: 100,
                        background: st.background, color: st.color,
                        fontSize: 12, fontWeight: 700,
                      }}>
                        {st.label}
                      </span>
                      <svg
                        width="18" height="18" viewBox="0 0 18 18" fill="none"
                        style={{ transition: "transform 0.2s", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                      >
                        <path d="M7 5l4 4-4 4" stroke="#bbb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isOpen && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", marginBottom: 16 }}>
                        {[
                          { label: "Order Token",  value: `BS-${String(order.id).padStart(3, "0")}` },
                          { label: "Status",       value: statusKey },
                          { label: "Ordered On",   value: formatDate(order.created_at) },
                          { label: "Total Amount",  value: `₹${Number(order.total_amount).toFixed(2)}` },
                        ].map((d) => (
                          <div key={d.label}>
                            <div style={{ fontSize: 11, color: "#bbb", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                              {d.label}
                            </div>
                            <div style={{ fontSize: 13, color: "#1a2e35", fontWeight: 600, marginTop: 2 }}>{d.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Items Table */}
                      <div style={{
                        background: "#f8fafb", borderRadius: 10,
                        padding: "12px 16px",
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
