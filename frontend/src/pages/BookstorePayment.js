import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./Bookstore.css";

export default function BookstorePayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useParams();

  const { cart = [], totalAmount = 0, username = "" } = location.state || {};

  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => setError("Failed to load payment system");
    document.body.appendChild(script);
  }, []);

  const fullName = localStorage.getItem("full_name") || "User";
  const initial = fullName.charAt(0).toUpperCase();

  const handlePayNow = async () => {
    if (!razorpayLoaded) {
      setError("Payment system is loading. Please wait...");
      return;
    }
    if (!cart.length) return;
    setPaying(true);
    setError("");
    try {
      // Create Razorpay order
      const orderRes = await fetch("http://localhost:5000/api/bookstore/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount, receipt: `bookstore_${username}_${Date.now()}` }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) {
        setError("Failed to create payment order");
        setPaying(false);
        return;
      }

      const options = {
        key: "rzp_test_SWmNgZQfffPpwJ", // Your Razorpay key_id
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "PrintEase Bookstore",
        description: "Bookstore Order Payment",
        order_id: orderData.order.id,
        method: {
          card: false,
          netbanking: true,
          upi: true,
          wallet: false,
          emi: false,
          paylater: false,
        },
        notes: { username, orderRequestId: orderData.order.id },
        retry: { enabled: true, max_count: 2 },
        modal: {
          escape: true,
          ondismiss: () => setError("Payment cancelled. Please retry with UPI/Netbanking."),
        },
        handler: async (response) => {
          // Payment successful, place order on backend
          const orderRes = await fetch("http://localhost:5000/api/bookstore/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username,
              items: cart,
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
            }),
          });
          const orderData = await orderRes.json();
          if (orderData.success) {
            sessionStorage.removeItem("bs_cart");
            navigate(`/${role}/bookstore/success`, {
              state: {
                orderId: orderData.order_id,
                totalAmount: orderData.total_amount
              }
            });
          } else {
            setError("Order placement failed after payment");
          }
        },
        prefill: {
          name: fullName,
          email: localStorage.getItem("email") || "",
        },
        theme: {
          color: "#2bb5a0",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        const reason = response.error && response.error.description ? response.error.description : "Payment failed";
        setError(`${reason}. Please retry with UPI/Netbanking if your card is not supported.`);
      });
      rzp.open();
    } catch (err) {
      setError("Could not initiate payment.");
    }
    setPaying(false);
  };

  return (
    <div style={styles.page}>

      {/* ── NAVBAR ── */}
      <div style={styles.navbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            style={styles.navIconBtn}
            onClick={() => navigate(-1)}
            title="Go Back"
            aria-label="Go back to previous page"
          >
            <FaArrowLeft />
          </button>
          <h2 style={styles.brand}>PRINTEASE</h2>
        </div>
        <div style={styles.navRight}>
          <div 
            style={{ ...styles.avatar, cursor: 'pointer' }}
            onClick={() => navigate(`/${role}/profile`)}
          >{initial}</div>
          <span 
            style={{ ...styles.username, cursor: 'pointer' }}
            onClick={() => navigate(`/${role}/profile`)}
          >{fullName}</span>
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

          {error && <div style={styles.errorMsg}>{error}</div>}

          <button
            style={paying || !razorpayLoaded ? styles.payBtnDisabled : styles.payBtn}
            onClick={handlePayNow}
            disabled={paying || !razorpayLoaded}
          >
            {paying ? "Processing..." : !razorpayLoaded ? "Loading Payment..." : "💳 Pay Now"}
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
  brand:         { color: "#2bb5a0", fontWeight: "800", fontSize: "22px", margin: 0 },
  navRight:      { display: "flex", alignItems: "center", gap: "12px" },
  navBtn:        { background: "transparent", border: "1.5px solid #2bb5a0", color: "#2bb5a0", padding: "7px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  navIconBtn:    { background: "none", border: "none", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "10px", fontSize: "18px", color: "#1a2e35", cursor: "pointer", transition: "all 0.22s ease", padding: 0 },
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