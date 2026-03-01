import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';

const statusStyle = {
  Completed: { background: "rgba(52,199,89,0.12)",  color: "#1a7a3a", label: "Completed" },
  Pending:   { background: "rgba(255,159,10,0.12)",  color: "#b7650a", label: "Pending"   },
  Printing:  { background: "rgba(43,181,160,0.12)",  color: "#1b8a6b", label: "Printing"  },
};

export default function PreviousActivity() {
  const navigate = useNavigate();
  const fullName = localStorage.getItem("full_name") || "User";
  const username = localStorage.getItem("username")  || "";

  const [jobs,     setJobs]     = useState([]);
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
    fetch(`http://localhost:5000/api/my-requests?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setJobs(data.data);
        else setError("Failed to load activity.");
        setLoading(false);
      })
      .catch(() => {
        setError("Could not connect to server.");
        setLoading(false);
      });
  }, [username]);

  const completedJobs = jobs.filter(j => j.print_status === "Completed");
  const totalSpent    = completedJobs
    .reduce((sum, j) => sum + Number(j.amount), 0)
    .toFixed(2);

  const filtered = filter === "All"
    ? jobs
    : jobs.filter(j => j.print_status === filter);

  // when files are stored on the server we prefix them with a random
  // token to avoid collisions. the original filename is saved in the
  // `original_name` property in the response, so prefer that when
  // displaying anything to the user.
  const getFileName = (filePath) => {
    if (!filePath) return "Unknown file";
    let name = filePath.replace(/\\/g, "/").split("/").pop();
    // stored filenames prefix with a timestamp/random number pair
    // followed by a hyphen. if we don't have the original_name field
    // (older records) try to strip that prefix.
    const parts = name.split("-");
    if (parts.length > 2 && /^[0-9]+$/.test(parts[0]) && /^[0-9]+$/.test(parts[1])) {
      name = parts.slice(2).join("-");
    }
    return name;
  };

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
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1a2e35" }}>Previous Activity</h1>
          <p style={{ margin: "6px 0 0", color: "#5a7a7e", fontSize: 14 }}>Your complete print job history</p>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Jobs",  value: loading ? "…" : jobs.length,           color: "#2bb5a0", icon: "🗂️" },
            { label: "Completed",   value: loading ? "…" : completedJobs.length,  color: "#1a7a3a", icon: "✅" },
            { label: "Total Spent", value: loading ? "…" : `₹${totalSpent}`,      color: "#1b8a6b", icon: "💰" },
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
          {["All", "Completed", "Pending", "Printing"].map((f) => (
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

        {/* Job List */}
        {!loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.length === 0 ? (
              <div style={{
                background: "white", borderRadius: 16, padding: "40px 20px",
                textAlign: "center", color: "#aaa", fontWeight: 500, fontSize: 15,
              }}>
                No activity found.
              </div>
            ) : filtered.map((job) => {
              const statusKey = job.print_status || "Pending";
              const st        = statusStyle[statusKey] || statusStyle["Pending"];
              const isOpen    = expanded === job.id;
              const fileName  = getFileName(job.file_path);

              return (
                <div
                  key={job.id}
                  onClick={() => setExpanded(isOpen ? null : job.id)}
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
                        display: "flex", alignItems: "center", justifysContent: "center",
                        flexShrink: 0, fontSize: 20,
                      }}>
                        📄
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#1a2e35" }}>
                          {job.original_name || fileName}
                        </div>
                        <div style={{ fontSize: 12, color: "#999", marginTop: 3 }}>
                          {job.total_pages} pages · {job.copies} {job.copies > 1 ? "copies" : "copy"} · {job.print_type}
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
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
                        {[
                          { label: "Request ID",     value: `PE-${String(job.id).padStart(3,"0")}` },
                          { label: "Mode",           value: job.mode },
                          { label: "Submitted",      value: formatDate(job.created_at) },
                          { label: "Payment",        value: job.payment_status === "paid" ? "✅ Paid" : "⏳ Unpaid" },
                          { label: "Pages × Copies", value: `${job.total_pages} × ${job.copies} = ${job.total_pages * job.copies} total` },
                          { label: "Amount",         value: `₹${Number(job.amount).toFixed(2)}` },
                          { label: "Spiral Binding", value: job.spiral_binding ? "Yes" : "No" },
                          { label: "Print Type",     value: job.print_type },
                        ].map((d) => (
                          <div key={d.label}>
                            <div style={{ fontSize: 11, color: "#bbb", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                              {d.label}
                            </div>
                            <div style={{ fontSize: 13, color: "#1a2e35", fontWeight: 600, marginTop: 2 }}>{d.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* View Document Button */}
                      {job.file_path && (
                        <div style={{ marginTop: 14 }}>
                          <a
                            href={`http://localhost:5000/${job.file_path.replace(/\\/g, "/")}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "8px 18px",
                              background: "#2bb5a0",
                              color: "white",
                              borderRadius: 10,
                              fontWeight: 600,
                              fontSize: 13,
                              textDecoration: "none",
                            }}
                          >
                            📄 View Document
                          </a>
                        </div>
                      )}
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