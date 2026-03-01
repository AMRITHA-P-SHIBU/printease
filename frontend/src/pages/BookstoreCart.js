import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Bookstore.css";
import "./Dashboard.css";

export default function BookstoreCart() {
  const navigate = useNavigate();
  const { role } = useParams();
  const fullName = localStorage.getItem("full_name") || "User";
  const username = localStorage.getItem("username") || "student";

  const [cart, setCart] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("bs_cart")) || []; }
    catch { return []; }
  });

  const totalAmount = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const removeItem = (id) => {
    const updated = cart.filter(c => c.id !== id);
    setCart(updated);
    sessionStorage.setItem("bs_cart", JSON.stringify(updated));
  };

  const handlePlaceOrder = () => {
    if (!cart.length) return;
    navigate(`/${role}/bookstore/payment`, {
      state: { cart, totalAmount, username }
    });
  };

  return (
    <div className="dashboard-wrapper">

      {/* ── NAVBAR ── */}
      <div className="navbar">
        <h2 className="brand">PRINTEASE</h2>
        <div className="nav-right">
          <button className="nav-btn" onClick={() => navigate(-1)}>← Back</button>
          <button className="nav-btn" onClick={() => navigate('/')}>🏠 Home</button>
          <div className="avatar">
            {fullName ? fullName.charAt(0).toUpperCase() : "U"}
          </div>
          <span className="username">{fullName}</span>
          <span className="logout" onClick={() => { localStorage.clear(); navigate('/'); }}>
            Logout
          </span>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="bookstore-cart-page">
        <div className="bookstore-cart-wrapper">
          <div className="cart-header">
            <button className="cart-back-btn" onClick={() => navigate(-1)}>← Back</button>
            <h2>🛒 Your Cart</h2>
          </div>

          {cart.length === 0 ? (
            <div className="cart-empty">
              <p>Your cart is empty.</p>
              <button
                className="bookstore-view-btn"
                style={{ marginTop: 16 }}
                onClick={() => navigate(`/${role}/bookstore/items`)}
              >
                Browse Items
              </button>
            </div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} className="cart-item-row">
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p>₹{item.price} × {item.quantity}</p>
                  </div>
                  <div className="cart-item-right">
                    <span className="cart-item-total">₹{(item.price * item.quantity).toFixed(2)}</span>
                    <button className="cart-remove-btn" onClick={() => removeItem(item.id)}>✕</button>
                  </div>
                </div>
              ))}

              <div className="cart-summary">
                <div className="cart-total-row">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                <button className="cart-checkout-btn" onClick={handlePlaceOrder}>
                  ✅ Place Order
                </button>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}