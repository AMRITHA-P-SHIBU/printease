import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

export default function BookstoreSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useParams();

  const { orderId = 0 } = location.state || {};
  const fullName = localStorage.getItem("full_name") || "User";
  const initial = fullName.charAt(0).toUpperCase();

  const tokenNumber = `BS-${String(orderId).padStart(3, "0")}`;
  localStorage.setItem("last_bs_order_id", orderId);

  return (
    <div style={styles.page}>

      {/* ── NAVBAR ── */}
      <div style={styles.navbar}>
        <h2 style={styles.brand}>PRINTEASE</h2>
        <div style={styles.navRight}>
          <button style={styles.navBtn} onClick={() => navigate(-1)}>← Back</button>
          <button style={styles.navBtn} onClick={() => navigate("/")}>🏠 Home</button>
          <div style={styles.avatar}>{initial}</div>
          <span style={styles.username}>{fullName}</span>
          <span style={styles.logout} onClick={() => { localStorage.clear(); navigate("/"); }}>
            Logout
          </span>
        </div>
      </div>

      {/* ── CARD ── */}
      <div style={styles.cardContainer}>
        <div style={styles.card}>

          {/* Success Icon */}
          <div style={styles.iconCircle}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="18" fill="#2bb5a0"/>
              <path d="M10 18L15.5 24L26 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h2 style={styles.title}>Payment Successful!</h2>
          <p style={styles.subtitle}>Your order has been confirmed</p>

          {/* Token Number */}
          <div style={styles.tokenBox}>
            <span style={styles.tokenLabel}>Your Token Number</span>
            <span style={styles.tokenValue}>{tokenNumber}</span>
            <span style={styles.tokenHint}>Please save this number for reference</span>
          </div>

          {/* What's Next only */}
          <div style={styles.infoBox}>
            <div style={styles.infoRow}>
              <span style={styles.infoIcon}>ℹ️</span>
              <div>
                <p style={styles.infoTitle}>What's Next?</p>
                <p style={styles.infoText}>Your items will be prepared shortly. Please show your token number when collecting your order.</p>
              </div>
            </div>
          </div>

          {/* Go to Home only */}
          <button style={styles.homeBtn} onClick={() => navigate(`/${role}/dashboard`)}>
            🏠 Go to Home
          </button>

        </div>
      </div>
    </div>
  );
}

const styles = {
  page:          { minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Segoe UI', sans-serif", display: "flex", flexDirection: "column" },
  navbar:        { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 40px", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 100, width: "100%", boxSizing: "border-box" },
  brand:         { color: "#1b8a6b", fontWeight: "800", fontSize: "22px", margin: 0 },
  navRight:      { display: "flex", alignItems: "center", gap: "12px" },
  navBtn:        { background: "transparent", border: "1.5px solid #2bb5a0", color: "#2bb5a0", padding: "7px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  avatar:        { width: "34px", height: "34px", borderRadius: "50%", background: "#2bb5a0", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px" },
  username:      { fontWeight: "600", fontSize: "14px", color: "#1e293b" },
  logout:        { fontWeight: "600", fontSize: "14px", color: "#e53935", cursor: "pointer" },
  cardContainer: { flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 20px" },
  card:          { background: "white", borderRadius: "24px", padding: "40px 36px", width: "100%", maxWidth: "460px", boxShadow: "0 8px 40px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", alignItems: "center" },
  iconCircle:    { width: "72px", height: "72px", borderRadius: "50%", background: "#e6f7f5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" },
  title:         { fontSize: "24px", fontWeight: "800", color: "#1a2e35", margin: "0 0 6px" },
  subtitle:      { fontSize: "14px", color: "#8aacaa", margin: "0 0 24px" },
  tokenBox:      { width: "100%", background: "linear-gradient(135deg, #e6f7f5, #d4f0eb)", borderRadius: "14px", padding: "24px", textAlign: "center", marginBottom: "20px" },
  tokenLabel:    { display: "block", fontSize: "12px", fontWeight: "700", color: "#2bb5a0", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" },
  tokenValue:    { display: "block", fontSize: "48px", fontWeight: "900", color: "#1a2e35", letterSpacing: "-1px", marginBottom: "8px" },
  tokenHint:     { display: "block", fontSize: "12px", color: "#2bb5a0", fontWeight: "500" },
  infoBox:       { width: "100%", background: "#f8fafb", borderRadius: "12px", padding: "16px 18px", marginBottom: "24px" },
  infoRow:       { display: "flex", gap: "12px", alignItems: "flex-start" },
  infoIcon:      { fontSize: "18px", marginTop: "2px" },
  infoTitle:     { fontSize: "13px", fontWeight: "700", color: "#1a2e35", margin: "0 0 4px" },
  infoText:      { fontSize: "12px", color: "#8aacaa", margin: 0, lineHeight: "1.5" },
  homeBtn:       { width: "100%", padding: "15px", background: "linear-gradient(135deg, #1b8a6b, #2bb5a0)", border: "none", borderRadius: "12px", color: "white", fontSize: "16px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 16px rgba(43,181,160,0.35)" },
};