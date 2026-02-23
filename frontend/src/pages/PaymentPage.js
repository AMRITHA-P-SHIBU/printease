import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ── PAGE NUMBER PARSER ──────────────────────────────────────────
// Parses strings like "1,3-5,7" into a Set of unique page numbers
function parsePageNumbers(input, totalPages) {
  const pages = new Set();
  if (!input || !input.trim()) return pages;

  const parts = input.split(",");
  for (let part of parts) {
    part = part.trim();
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= totalPages) pages.add(i);
        }
      }
    } else {
      const num = Number(part);
      if (!isNaN(num) && num >= 1 && num <= totalPages) pages.add(num);
    }
  }
  return pages;
}

// ── COST CALCULATOR ────────────────────────────────────────────
function calculateTotal({ printType, totalPages, colorPageInput, copies }) {
  const COLOR_RATE = 5;
  const BW_RATE    = 1.5;

  if (printType === "Black & White") {
    return totalPages * BW_RATE * copies;
  }

  // Color mode — parse color pages
  const colorPages   = parsePageNumbers(colorPageInput, totalPages);
  const colorCount   = colorPages.size;
  const bwCount      = totalPages - colorCount;

  const colorCost = colorCount * COLOR_RATE;
  const bwCost    = bwCount    * BW_RATE;

  return (colorCost + bwCost) * copies;
}

// ── PAYMENT PAGE COMPONENT ─────────────────────────────────────
export default function PaymentPage() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Data passed from SubmitPrintRequest via navigate state
  const {
    printType      = "Black & White",
    totalPages     = 1,
    colorPageInput = "",
    copies         = 1,
    requestId      = null,
  } = location.state || {};

  const [total, setTotal]     = useState(0);
  const [paying, setPaying]   = useState(false);
  const [paid, setPaid]       = useState(false);
  const [error, setError]     = useState("");

  const fullName = localStorage.getItem("full_name") || "User";
  const initial  = fullName.charAt(0).toUpperCase();

  useEffect(() => {
    const amount = calculateTotal({ printType, totalPages, colorPageInput, copies });
    setTotal(amount);
  }, [printType, totalPages, colorPageInput, copies]);

  const handlePayNow = async () => {
    setPaying(true);
    setError("");
    try {
      // Simulate payment confirmation (replace with real UPI/payment API if needed)
      await new Promise((res) => setTimeout(res, 1500));

      // Notify backend that payment is done
      const res  = await fetch("http://localhost:5000/api/payment-confirm", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ request_id: requestId, amount: total }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPaid(true);
      } else {
        setError(data.message || "Payment confirmation failed.");
      }
    } catch (err) {
      setError("Could not connect to server.");
    }
    setPaying(false);
  };

  // ── SUCCESS SCREEN ──
  if (paid) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✅</div>
          <h2 style={styles.successTitle}>Payment Successful!</h2>
          <p style={styles.successSub}>Your print request has been confirmed.</p>
          <div style={styles.amountBox}>
            <span style={styles.amountLabel}>Amount Paid</span>
            <span style={styles.amountValue}>₹{total.toFixed(2)}</span>
          </div>
          <button style={styles.payBtn} onClick={() => navigate("/student/dashboard")}>
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

      {/* Payment Card */}
      <div style={styles.cardContainer}>
        <div style={styles.card}>

          {/* Icon */}
          <div style={styles.iconCircle}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#2bb5a0"/>
              <rect x="4" y="9" width="20" height="13" rx="2" fill="white" opacity="0.9"/>
              <rect x="4" y="13" width="20" height="3" fill="#2bb5a0" opacity="0.5"/>
              <rect x="7"  y="16" width="5" height="2" rx="1" fill="white"/>
            </svg>
          </div>

          <h2 style={styles.title}>Payment</h2>
          <p style={styles.subtitle}>Complete your payment to proceed</p>

          {/* Amount Box */}
          <div style={styles.amountBox}>
            <span style={styles.amountLabel}>Total Amount</span>
            <span style={styles.amountValue}>₹{total.toFixed(2)}</span>
          </div>

          {/* Breakdown */}
          <div style={styles.breakdown}>
            <div style={styles.breakdownRow}>
              <span style={styles.breakdownKey}>Print Type</span>
              <span style={styles.breakdownVal}>{printType}</span>
            </div>
            <div style={styles.breakdownRow}>
              <span style={styles.breakdownKey}>Total Pages</span>
              <span style={styles.breakdownVal}>{totalPages}</span>
            </div>
            <div style={styles.breakdownRow}>
              <span style={styles.breakdownKey}>Copies</span>
              <span style={styles.breakdownVal}>{copies}</span>
            </div>
            {printType === "Color" && colorPageInput && (
              <div style={styles.breakdownRow}>
                <span style={styles.breakdownKey}>Color Pages</span>
                <span style={styles.breakdownVal}>
                  {parsePageNumbers(colorPageInput, totalPages).size} pages @ ₹5
                </span>
              </div>
            )}
            <div style={styles.breakdownRow}>
              <span style={styles.breakdownKey}>B&W Rate</span>
              <span style={styles.breakdownVal}>₹1.5/page</span>
            </div>
          </div>

          {/* QR Code */}
          <div style={styles.qrSection}>
            <p style={styles.qrLabel}>Scan QR Code to Pay</p>
            <div style={styles.qrBox}>
              {/* QR placeholder — replace src with real QR image if available */}
              <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
                <rect width="90" height="90" rx="8" fill="#f3f4f6"/>
                {/* QR pattern simulation */}
                <rect x="10" y="10" width="28" height="28" rx="2" fill="none" stroke="#2bb5a0" strokeWidth="3"/>
                <rect x="16" y="16" width="16" height="16" rx="1" fill="#2bb5a0"/>
                <rect x="52" y="10" width="28" height="28" rx="2" fill="none" stroke="#2bb5a0" strokeWidth="3"/>
                <rect x="58" y="16" width="16" height="16" rx="1" fill="#2bb5a0"/>
                <rect x="10" y="52" width="28" height="28" rx="2" fill="none" stroke="#2bb5a0" strokeWidth="3"/>
                <rect x="16" y="58" width="16" height="16" rx="1" fill="#2bb5a0"/>
                <rect x="52" y="52" width="8"  height="8"  rx="1" fill="#2bb5a0"/>
                <rect x="64" y="52" width="8"  height="8"  rx="1" fill="#2bb5a0"/>
                <rect x="52" y="64" width="8"  height="8"  rx="1" fill="#2bb5a0"/>
                <rect x="64" y="64" width="8"  height="8"  rx="1" fill="#2bb5a0"/>
                <rect x="38" y="10" width="6"  height="6"  rx="1" fill="#2bb5a0"/>
                <rect x="38" y="20" width="6"  height="6"  rx="1" fill="#2bb5a0"/>
                <rect x="38" y="52" width="6"  height="6"  rx="1" fill="#2bb5a0"/>
                <rect x="10" y="38" width="6"  height="6"  rx="1" fill="#2bb5a0"/>
                <rect x="20" y="38" width="6"  height="6"  rx="1" fill="#2bb5a0"/>
              </svg>
              <p style={styles.qrSub}>QR Code</p>
            </div>
            <p style={styles.qrHint}>Use any UPI app to scan and pay</p>
          </div>

          {/* Error */}
          {error && <div style={styles.errorMsg}>{error}</div>}

          {/* Pay Now Button */}
          <button
            style={paying ? styles.payBtnDisabled : styles.payBtn}
            onClick={handlePayNow}
            disabled={paying}
          >
            {paying ? "Processing..." : "💳 Pay Now"}
          </button>

          {/* Go Back */}
          <button style={styles.goBackBtn} onClick={() => navigate(-1)}>
            Go Back
          </button>

        </div>
      </div>
    </div>
  );
}

// ── STYLES ─────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f0f4f8",
    fontFamily: "'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 40px",
    background: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    width: "100%",
    boxSizing: "border-box",
  },
  brand:    { color: "#1b8a6b", fontWeight: "800", fontSize: "22px", margin: 0 },
  navRight: { display: "flex", alignItems: "center", gap: "12px" },
  navBtn: {
    background: "transparent",
    border: "1.5px solid #2bb5a0",
    color: "#2bb5a0",
    padding: "7px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  avatar: {
    width: "34px", height: "34px", borderRadius: "50%",
    background: "#2bb5a0", color: "white",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "700", fontSize: "14px",
  },
  username: { fontWeight: "600", fontSize: "14px", color: "#1e293b" },

  cardContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
  },
  card: {
    background: "white",
    borderRadius: "24px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  iconCircle: {
    width: "60px", height: "60px", borderRadius: "50%",
    background: "#e6f7f5",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: "16px",
  },
  title:    { fontSize: "24px", fontWeight: "800", color: "#1a2e35", margin: "0 0 6px" },
  subtitle: { fontSize: "14px", color: "#8aacaa", margin: "0 0 24px" },

  amountBox: {
    width: "100%",
    background: "linear-gradient(135deg, #e6f7f5, #d4f0eb)",
    borderRadius: "14px",
    padding: "20px",
    textAlign: "center",
    marginBottom: "20px",
  },
  amountLabel: { display: "block", fontSize: "12px", fontWeight: "700", color: "#2bb5a0", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" },
  amountValue: { display: "block", fontSize: "40px", fontWeight: "900", color: "#1a2e35", letterSpacing: "-1px" },

  breakdown: {
    width: "100%",
    background: "#f8fafb",
    borderRadius: "12px",
    padding: "14px 18px",
    marginBottom: "20px",
  },
  breakdownRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #e8f0ee" },
  breakdownKey: { fontSize: "13px", color: "#8aacaa", fontWeight: "500" },
  breakdownVal: { fontSize: "13px", color: "#1a2e35", fontWeight: "700" },

  qrSection: { width: "100%", textAlign: "center", marginBottom: "24px" },
  qrLabel:   { fontSize: "13px", fontWeight: "600", color: "#5a7a7e", marginBottom: "12px" },
  qrBox: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#f8fafb",
    border: "1px solid #e8f0ee",
    borderRadius: "16px",
    padding: "20px",
    gap: "8px",
  },
  qrSub:  { fontSize: "11px", color: "#8aacaa", margin: 0 },
  qrHint: { fontSize: "12px", color: "#8aacaa", marginTop: "10px" },

  errorMsg: {
    background: "#ffeaea", border: "1px solid #e53935",
    color: "#c62828", padding: "10px 16px",
    borderRadius: "10px", marginBottom: "16px",
    fontSize: "13px", fontWeight: "600", width: "100%", textAlign: "center",
  },

  payBtn: {
    width: "100%", padding: "15px",
    background: "linear-gradient(135deg, #1b8a6b, #2bb5a0)",
    border: "none", borderRadius: "12px",
    color: "white", fontSize: "16px", fontWeight: "700",
    cursor: "pointer", marginBottom: "10px",
    boxShadow: "0 4px 16px rgba(43,181,160,0.35)",
  },
  payBtnDisabled: {
    width: "100%", padding: "15px",
    background: "#a0c4b8", border: "none", borderRadius: "12px",
    color: "white", fontSize: "16px", fontWeight: "700",
    cursor: "not-allowed", marginBottom: "10px",
  },
  goBackBtn: {
    width: "100%", padding: "13px",
    background: "#f3f4f6", border: "none", borderRadius: "12px",
    color: "#5a7a7e", fontSize: "15px", fontWeight: "600",
    cursor: "pointer",
  },

  successIcon:  { fontSize: "52px", marginBottom: "12px" },
  successTitle: { fontSize: "24px", fontWeight: "800", color: "#1a2e35", margin: "0 0 8px" },
  successSub:   { fontSize: "14px", color: "#8aacaa", margin: "0 0 24px" },
};