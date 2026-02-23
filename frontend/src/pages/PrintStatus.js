import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';

const mockJobs = [
  {
    id: "PRN-2024-001",
    fileName: "Assignment_Unit3.pdf",
    pages: 12,
    copies: 2,
    submittedAt: "2026-02-23 09:15 AM",
    status: "completed",
    completedAt: "2026-02-23 09:40 AM",
    color: false,
  },
  {
    id: "PRN-2024-002",
    fileName: "Lab_Report_Final.docx",
    pages: 8,
    copies: 1,
    submittedAt: "2026-02-23 10:30 AM",
    status: "printing",
    completedAt: null,
    color: true,
  },
  {
    id: "PRN-2024-003",
    fileName: "Seminar_Slides.pdf",
    pages: 24,
    copies: 1,
    submittedAt: "2026-02-23 11:00 AM",
    status: "pending",
    completedAt: null,
    color: false,
  },
  {
    id: "PRN-2024-004",
    fileName: "Project_Proposal.pdf",
    pages: 5,
    copies: 3,
    submittedAt: "2026-02-22 03:20 PM",
    status: "completed",
    completedAt: "2026-02-22 03:45 PM",
    color: false,
  },
  {
    id: "PRN-2024-005",
    fileName: "Resume_Draft.docx",
    pages: 2,
    copies: 5,
    submittedAt: "2026-02-22 01:10 PM",
    status: "cancelled",
    completedAt: null,
    color: true,
  },
];

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

const filters = ["All", "Pending", "Printing", "Completed", "Cancelled"];

export default function PrintStatus() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const fullName = localStorage.getItem("full_name");

  const filtered =
    activeFilter === "All"
      ? mockJobs
      : mockJobs.filter((j) => j.status === activeFilter.toLowerCase());

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
          <p style={{ margin: "6px 0 0", color: "#888", fontSize: 14 }}>Track your current and past print jobs</p>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Total Jobs", value: mockJobs.length, color: "#00C2A8" },
            { label: "Pending", value: mockJobs.filter(j => j.status === "pending").length, color: "#FF9F0A" },
            { label: "Printing", value: mockJobs.filter(j => j.status === "printing").length, color: "#00C2A8" },
            { label: "Completed", value: mockJobs.filter(j => j.status === "completed").length, color: "#34C759" },
          ].map((card) => (
            <div key={card.label} style={{
              background: "white",
              borderRadius: 16,
              padding: "18px 20px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: 13, color: "#888", fontWeight: 500, marginTop: 2 }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: "8px 20px",
                borderRadius: 100,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 600,
                fontSize: 13,
                transition: "all 0.2s",
                background: activeFilter === f ? "#00C2A8" : "white",
                color: activeFilter === f ? "white" : "#555",
                boxShadow: activeFilter === f ? "0 4px 12px rgba(0,194,168,0.35)" : "0 2px 8px rgba(0,0,0,0.06)",
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
              textAlign: "center", color: "#aaa", fontWeight: 500
            }}>No print jobs found.</div>
          ) : filtered.map((job) => {
            const cfg = statusConfig[job.status];
            const isSelected = selected === job.id;
            return (
              <div
                key={job.id}
                onClick={() => setSelected(isSelected ? null : job.id)}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: "18px 22px",
                  cursor: "pointer",
                  boxShadow: isSelected ? "0 6px 24px rgba(0,194,168,0.18)" : "0 2px 12px rgba(0,0,0,0.05)",
                  border: isSelected ? "1.5px solid #00C2A8" : "1.5px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* File icon */}
                    <div style={{
                      width: 42, height: 42, borderRadius: 12,
                      background: "rgba(0,194,168,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <rect x="4" y="2" width="12" height="16" rx="2" stroke="#00C2A8" strokeWidth="1.5" />
                        <path d="M7 7h6M7 10h6M7 13h4" stroke="#00C2A8" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>{job.fileName}</div>
                      <div style={{ fontSize: 12, color: "#999", marginTop: 3 }}>
                        {job.pages} pages · {job.copies} {job.copies > 1 ? "copies" : "copy"} · {job.color ? "Color" : "B&W"}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "5px 12px", borderRadius: 100,
                      background: cfg.bg, color: cfg.color,
                      fontSize: 12, fontWeight: 700,
                    }}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <svg
                      width="18" height="18" viewBox="0 0 18 18" fill="none"
                      style={{ transition: "transform 0.2s", transform: isSelected ? "rotate(90deg)" : "rotate(0deg)" }}
                    >
                      <path d="M7 5l4 4-4 4" stroke="#bbb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Expanded details */}
                {isSelected && (
                  <div style={{
                    marginTop: 16, paddingTop: 16,
                    borderTop: "1px solid #f0f0f0",
                    display: "grid", gridTemplateColumns: "1fr 1fr",
                    gap: "10px 24px",
                  }}>
                    {[
                      { label: "Job ID", value: job.id },
                      { label: "Submitted", value: job.submittedAt },
                      { label: "Pages × Copies", value: `${job.pages} × ${job.copies} = ${job.pages * job.copies} total` },
                      { label: "Completed", value: job.completedAt || "—" },
                    ].map((detail) => (
                      <div key={detail.label}>
                        <div style={{ fontSize: 11, color: "#bbb", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          {detail.label}
                        </div>
                        <div style={{ fontSize: 13, color: "#333", fontWeight: 600, marginTop: 2 }}>{detail.value}</div>
                      </div>
                    ))}

                    {/* Progress bar for printing status */}
                    {job.status === "printing" && (
                      <div style={{ gridColumn: "span 2", marginTop: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: "#00C2A8", fontWeight: 600 }}>Printing in progress...</span>
                          <span style={{ fontSize: 12, color: "#00C2A8", fontWeight: 600 }}>65%</span>
                        </div>
                        <div style={{ height: 6, background: "#eee", borderRadius: 100, overflow: "hidden" }}>
                          <div style={{
                            width: "65%", height: "100%",
                            background: "linear-gradient(90deg, #00C2A8, #3DD9C5)",
                            borderRadius: 100,
                            animation: "progress-pulse 2s ease-in-out infinite",
                          }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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