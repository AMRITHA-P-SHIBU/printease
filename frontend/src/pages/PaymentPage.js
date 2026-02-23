import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    printType      = "Black & White",
    totalPages     = 1,
    copies         = 1,
    spiralBinding  = false,
    finalAmount    = 0,
    requestId      = null,
    mode           = "General",
    colorPageInput = "",
  } = location.state || {};

  const [paying, setPaying] = useState(false);
  const [paid,   setPaid]   = useState(false);
  const [error,  setError]  = useState("");

  const fullName = localStorage.getItem("full_name") || "User";
  const initial  = fullName.charAt(0).toUpperCase();
  const role     = localStorage.getItem("role") || "student";

  // ── Compute color/bw page counts for breakdown ──
  const parseColorPages = (input, tp) => {
    const pages = new Set();
    if (!input || !input.trim()) return pages;
    input.split(",").forEach(part => {
      part = part.trim();
      if (part.includes("-")) {
        const [s, e] = part.split("-").map(Number);
        for (let i = s; i <= e; i++) if (i >= 1 && i <= tp) pages.add(i);
      } else {
        const n = Number(part);
        if (!isNaN(n) && n >= 1 && n <= tp) pages.add(n);
      }
    });
    return pages;
  };

  const colorCount = printType === "Color" ? parseColorPages(colorPageInput, totalPages).size : 0;
  const bwCount    = totalPages - colorCount;
  const bindingTotal = spiralBinding ? 50 * copies : 0;

  const handlePayNow = async () => {
    setPaying(true);
    setError("");
    try {
      const res  = await fetch("http://localhost:5000/api/payment-confirm", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ request_id: requestId, amount: finalAmount }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPaid(true);
        // remember token for user convenience
        try { localStorage.setItem('last_request_id', requestId); } catch {};
      } else setError(data.message || "Payment confirmation failed.");
    } catch {
      setError("Could not connect to server.");
    }
    setPaying(false);
  };

  if (paid) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: "52px", marginBottom: "12px" }}>✅</div>
          <h2 style={styles.title}>Payment Successful!</h2>
          <p style={styles.subtitle}>Your print request has been confirmed.</p>
          {requestId && (
            <div style={styles.tokenBox}>
              <span style={styles.tokenLabel}>Token</span>
              <span style={styles.tokenValue}>PE-{String(requestId).padStart(3,'0')}</span>
            </div>
          )}
          <div style={styles.amountBox}>
            <span style={styles.amountLabel}>Amount Paid</span>
            <span style={styles.amountValue}>₹{Number(finalAmount).toFixed(2)}</span>
          </div>
          <button style={styles.payBtn} onClick={() => navigate(`/${role}/dashboard`)}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.brand}>PRINTEASE</h2>
        <div style={styles.navRight}>
          <button style={styles.navBtn} onClick={() => navigate(-1)}>← Back</button>
          <button style={styles.navBtn} onClick={() => navigate("/")}>🏠 Home</button>
          <div style={styles.avatar}>{initial}</div>
          <span style={styles.username}>{fullName}</span>
        </div>
      </div>

      <div style={styles.cardContainer}>
        <div style={styles.card}>

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
          {/* Request token */}
          {requestId && (
            <div style={styles.tokenBox}>
              <span style={styles.tokenLabel}>Token</span>
              <span style={styles.tokenValue}>PE-{String(requestId).padStart(3,'0')}</span>
            </div>
          )}

          <div style={styles.amountBox}>
            <span style={styles.amountLabel}>Total Amount</span>
            <span style={styles.amountValue}>₹{Number(finalAmount).toFixed(2)}</span>
          </div>

          {/* Breakdown */}
          <div style={styles.breakdown}>
            {[
              ["Print Type",     printType],
              ["Total Pages",    totalPages],
              ["Copies",         copies],
              ...(printType === "Color"
                ? [
                    ["Color Pages", `${colorCount} page(s) × ₹5`],
                    ["B&W Pages",   `${bwCount} page(s) × ₹1.5`],
                  ]
                : [["Rate", `${totalPages} pages × ₹1.5`]]
              ),
              ["Spiral Binding", spiralBinding
                ? `₹50 × ${copies} cop${copies > 1 ? "ies" : "y"} = +₹${bindingTotal}`
                : "No"
              ],
              ...(mode === "Fast Track" ? [["Fast Track", "+₹10 (flat)"]] : []),
            ].map(([key, val]) => (
              <div key={key} style={styles.breakdownRow}>
                <span style={styles.breakdownKey}>{key}</span>
                <span style={styles.breakdownVal}>{val}</span>
              </div>
            ))}
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
  tokenBox:      { width: "100%", background: "#eaf7f5", borderRadius: "14px", padding: "12px 0", textAlign: "center", marginBottom: "16px" },
  tokenLabel:    { display: "block", fontSize: "12px", fontWeight: "700", color: "#2bb5a0", textTransform: "uppercase", letterSpacing: "1px" },
  tokenValue:    { display: "block", fontSize: "22px", fontWeight: "900", color: "#1a2e35", marginTop: "4px" },
  navbar:        { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 40px", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 100, width: "100%", boxSizing: "border-box" },
  brand:         { color: "#1b8a6b", fontWeight: "800", fontSize: "22px", margin: 0 },
  navRight:      { display: "flex", alignItems: "center", gap: "12px" },
  navBtn:        { background: "transparent", border: "1.5px solid #2bb5a0", color: "#2bb5a0", padding: "7px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  avatar:        { width: "34px", height: "34px", borderRadius: "50%", background: "#2bb5a0", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px" },
  username:      { fontWeight: "600", fontSize: "14px", color: "#1e293b" },
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