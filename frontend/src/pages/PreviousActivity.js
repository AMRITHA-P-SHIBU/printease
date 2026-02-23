import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';

const mockHistory = [
  {
    id: "PRN-2024-001",
    fileName: "Assignment_Unit3.pdf",
    pages: 12,
    copies: 2,
    printType: "Black & White",
    mode: "General",
    submittedAt: "2026-02-20 09:15 AM",
    completedAt: "2026-02-20 09:40 AM",
    status: "completed",
    amount: "₹24.00",
  },
  {
    id: "PRN-2024-002",
    fileName: "Lab_Report_Final.pdf",
    pages: 8,
    copies: 1,
    printType: "Color",
    mode: "Fast Track",
    submittedAt: "2026-02-18 10:30 AM",
    completedAt: "2026-02-18 10:45 AM",
    status: "completed",
    amount: "₹40.00",
  },
  {
    id: "PRN-2024-003",
    fileName: "Seminar_Slides.pdf",
    pages: 24,
    copies: 1,
    printType: "Black & White",
    mode: "General",
    submittedAt: "2026-02-15 11:00 AM",
    completedAt: null,
    status: "cancelled",
    amount: "₹24.00",
  },
  {
    id: "PRN-2024-004",
    fileName: "Project_Proposal.pdf",
    pages: 5,
    copies: 3,
    printType: "Color",
    mode: "General",
    submittedAt: "2026-02-10 03:20 PM",
    completedAt: "2026-02-10 03:50 PM",
    status: "completed",
    amount: "₹75.00",
  },
  {
    id: "PRN-2024-005",
    fileName: "Resume_Draft.docx",
    pages: 2,
    copies: 5,
    printType: "Color",
    mode: "Fast Track",
    submittedAt: "2026-02-05 01:10 PM",
    completedAt: null,
    status: "cancelled",
    amount: "₹50.00",
  },
];

const statusStyle = {
  completed: { background: "rgba(52,199,89,0.12)", color: "#1a7a3a", label: "Completed" },
  cancelled:  { background: "rgba(255,69,58,0.10)", color: "#c0392b", label: "Cancelled" },
};

export default function PreviousActivity() {
  const navigate = useNavigate();
  const fullName = localStorage.getItem("full_name") || "User";
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All"
    ? mockHistory
    : mockHistory.filter(j => j.status === filter.toLowerCase());

  const completedCount = mockHistory.filter(j => j.status === "completed").length;
  const totalSpent = mockHistory
    .filter(j => j.status === "completed")
    .reduce((sum, j) => sum + parseFloat(j.amount.replace("₹", "")), 0)
    .toFixed(2);

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
            { label: "Total Jobs",  value: mockHistory.length, color: "#2bb5a0", icon: "🗂️" },
            { label: "Completed",   value: completedCount,     color: "#1a7a3a", icon: "✅" },
            { label: "Total Spent", value: `₹${totalSpent}`,   color: "#1b8a6b", icon: "💰" },
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
          {["All", "Completed", "Cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 22px", borderRadius: 100, border: "none",
                cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit",
                transition: "all 0.2s",
                background: filter === f ? "#2bb5a0" : "white",
                color:      filter === f ? "white"    : "#555",
                boxShadow:  filter === f
                  ? "0 4px 12px rgba(43,181,160,0.30)"
                  : "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Job List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0 ? (
            <div style={{
              background: "white", borderRadius: 16, padding: "40px 20px",
              textAlign: "center", color: "#aaa", fontWeight: 500, fontSize: 15,
            }}>
              No activity found.
            </div>
          ) : filtered.map((job) => {
            const st = statusStyle[job.status];
            const isOpen = expanded === job.id;
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
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, fontSize: 20,
                    }}>
                      📄
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#1a2e35" }}>{job.fileName}</div>
                      <div style={{ fontSize: 12, color: "#999", marginTop: 3 }}>
                        {job.pages} pages · {job.copies} {job.copies > 1 ? "copies" : "copy"} · {job.printType}
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
                        { label: "Job ID",        value: job.id },
                        { label: "Mode",           value: job.mode },
                        { label: "Submitted",      value: job.submittedAt },
                        { label: "Completed",      value: job.completedAt || "—" },
                        { label: "Pages × Copies", value: `${job.pages} × ${job.copies} = ${job.pages * job.copies} total` },
                        { label: "Amount",         value: job.amount },
                      ].map((d) => (
                        <div key={d.label}>
                          <div style={{ fontSize: 11, color: "#bbb", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                            {d.label}
                          </div>
                          <div style={{ fontSize: 13, color: "#1a2e35", fontWeight: 600, marginTop: 2 }}>{d.value}</div>
                        </div>
                      ))}
                    </div>

                    {job.status === "cancelled" && (
                      <div style={{
                        marginTop: 14, padding: "10px 14px",
                        background: "rgba(255,69,58,0.07)", borderRadius: 10,
                        fontSize: 13, color: "#c0392b", fontWeight: 500,
                      }}>
                        ⚠️ This print request was cancelled and will not be processed.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}