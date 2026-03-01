import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "./Bookstore.css";

export default function BookstorePayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useParams();

  const { cart = [], totalAmount = 0, username = "" } = location.state || {};

  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const fullName = localStorage.getItem("full_name") || "User";
  const initial = fullName.charAt(0).toUpperCase();

  const handlePayNow = async () => {
    if (!cart.length) return;
    setPaying(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/bookstore/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, items: cart })
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.removeItem("bs_cart");
        navigate(`/${role}/bookstore/success`, {
          state: {
            orderId: data.order_id,
            totalAmount: data.total_amount
          }
        });
      } else {
        setError(data.message || "Order failed. Please try again.");
      }
    } catch {
      setError("Could not connect to server.");
    }
    setPaying(false);
  };

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

          {/* Icon */}
          <div style={styles.iconCircle}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#2bb5a0"/>
              <rect x="4" y="9" width="20" height="13" rx="2" fill="white" opacity="0.9"/>
              <rect x="4" y="13" width="20" height="3" fill="#2bb5a0" opacity="0.5"/>
              <rect x="7" y="16" width="5" height="2" rx="1" fill="white"/>
            </svg>
          </div>

          <h2 style={styles.title}>Payment</h2>
          <p style={styles.subtitle}>Complete your payment to proceed</p>

          {/* Total Amount */}
          <div style={styles.amountBox}>
            <span style={styles.amountLabel}>Total Amount</span>
            <span style={styles.amountValue}>₹{Number(totalAmount).toFixed(2)}</span>
          </div>

          {/* Order Breakdown */}
          <div style={styles.breakdown}>
            {cart.map(item => (
              <div key={item.id} style={styles.breakdownRow}>
                <span style={styles.breakdownKey}>{item.name} × {item.quantity}</span>
                <span style={styles.breakdownVal}>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ ...styles.breakdownRow, borderBottom: "none", marginTop: 6 }}>
              <span style={{ ...styles.breakdownKey, fontWeight: "700", color: "#1a2e35" }}>Total</span>
              <span style={{ ...styles.breakdownVal, fontSize: "15px" }}>₹{Number(totalAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* QR Code */}
          <div style={styles.qrSection}>
            <p style={styles.qrLabel}>Scan QR Code to Pay</p>
            <div style={styles.qrBox}>
              <svg width="100" height="100" viewBox="0 0 90 90" fill="none">
                <rect width="90" height="90" rx="8" fill="#f3f4f6"/>
                <rect x="10" y="10" width="28" height="28" rx="2" fill="none" stroke="#2bb5a0" strokeWidth="3"/>
                <rect x="16" y="16" width="16" height="16" rx="1" fill="#2bb5a0"/>
                <rect x="52" y="10" width="28" height="28" rx="2" fill="none" stroke="#2bb5a0" strokeWidth="3"/>
                <rect x="58" y="16" width="16" height="16" rx="1" fill="#2bb5a0"/>
                <rect x="10" y="52" width="28" height="28" rx="2" fill="none" stroke="#2bb5a0" strokeWidth="3"/>
                <rect x="16" y="58" width="16" height="16" rx="1" fill="#2bb5a0"/>
                <rect x="52" y="52" width="8" height="8" rx="1" fill="#2bb5a0"/>
                <rect x="64" y="52" width="8" height="8" rx="1" fill="#2bb5a0"/>
                <rect x="52" y="64" width="8" height="8" rx="1" fill="#2bb5a0"/>
                <rect x="64" y="64" width="8" height="8" rx="1" fill="#2bb5a0"/>
              </svg>
              <p style={{ fontSize: "11px", color: "#8aacaa", margin: 0 }}>QR Code</p>
            </div>
            <p style={styles.qrHint}>Use any UPI app to scan and pay</p>
          </div>

          {error && <div style={styles.errorMsg}>{error}</div>}

          <button
            style={paying ? styles.payBtnDisabled : styles.payBtn}
            onClick={handlePayNow}
            disabled={paying}
          >
            {paying ? "Processing..." : "💳 Pay Now"}
          </button>

          <button style={styles.goBackBtn} onClick={() => navigate(-1)}>
            Go Back
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
  iconCircle:    { width: "60px", height: "60px", borderRadius: "50%", background: "#e6f7f5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" },
  title:         { fontSize: "24px", fontWeight: "800", color: "#1a2e35", margin: "0 0 6px" },
  subtitle:      { fontSize: "14px", color: "#8aacaa", margin: "0 0 24px" },
  amountBox:     { width: "100%", background: "linear-gradient(135deg, #e6f7f5, #d4f0eb)", borderRadius: "14px", padding: "20px", textAlign: "center", marginBottom: "20px" },
  amountLabel:   { display: "block", fontSize: "12px", fontWeight: "700", color: "#2bb5a0", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" },
  amountValue:   { display: "block", fontSize: "42px", fontWeight: "900", color: "#1a2e35", letterSpacing: "-1px" },
  breakdown:     { width: "100%", background: "#f8fafb", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px" },
  breakdownRow:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #e8f0ee" },
  breakdownKey:  { fontSize: "13px", color: "#8aacaa", fontWeight: "500" },
  breakdownVal:  { fontSize: "13px", color: "#1a2e35", fontWeight: "700" },
  qrSection:     { width: "100%", textAlign: "center", marginBottom: "24px" },
  qrLabel:       { fontSize: "13px", fontWeight: "600", color: "#5a7a7e", marginBottom: "12px" },
  qrBox:         { display: "inline-flex", flexDirection: "column", alignItems: "center", background: "#f8fafb", border: "1px solid #e8f0ee", borderRadius: "16px", padding: "20px", gap: "8px" },
  qrHint:        { fontSize: "12px", color: "#8aacaa", marginTop: "10px" },
  errorMsg:      { background: "#ffeaea", border: "1px solid #e53935", color: "#c62828", padding: "10px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px", fontWeight: "600", width: "100%", textAlign: "center" },
  payBtn:        { width: "100%", padding: "15px", background: "linear-gradient(135deg, #1b8a6b, #2bb5a0)", border: "none", borderRadius: "12px", color: "white", fontSize: "16px", fontWeight: "700", cursor: "pointer", marginBottom: "10px", boxShadow: "0 4px 16px rgba(43,181,160,0.35)" },
  payBtnDisabled:{ width: "100%", padding: "15px", background: "#a0c4b8", border: "none", borderRadius: "12px", color: "white", fontSize: "16px", fontWeight: "700", cursor: "not-allowed", marginBottom: "10px" },
  goBackBtn:     { width: "100%", padding: "13px", background: "#f3f4f6", border: "none", borderRadius: "12px", color: "#5a7a7e", fontSize: "15px", fontWeight: "600", cursor: "pointer" },
};