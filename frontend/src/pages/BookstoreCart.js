import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaTrash, FaCheckCircle, FaMoneyBillWave } from "react-icons/fa";
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
    <div className="dashboard-wrapper" style={{ overflow: 'hidden' }}>
      <style>{`
        /* Antigravity Modern UI / Glassmorphism for Cart */
        
        .page-bg-accent {
          position: fixed;
          top: -20%;
          left: -10%;
          width: 50vw;
          height: 50vw;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          z-index: 0;
          pointer-events: none;
        }
        .page-bg-accent-2 {
          position: fixed;
          bottom: -20%;
          right: -10%;
          width: 60vw;
          height: 60vw;
          background: radial-gradient(circle, rgba(43, 181, 160, 0.08) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          z-index: 0;
          pointer-events: none;
        }

        .bookstore-cart-page {
          position: relative;
          z-index: 1;
          background: transparent;
          min-height: calc(100vh - 64px);
          padding: 40px 16px;
        }

        .bookstore-cart-wrapper {
          max-width: 800px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(31, 38, 135, 0.05), 0 1px 3px rgba(0,0,0,0.02);
        }

        .cart-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .cart-header h2 {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0;
        }

        .cart-back-btn {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.1rem;
          color: #4b5563;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .cart-back-btn:hover {
          background: #f9fafb;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          color: #111827;
        }

        /* Cart Items */
        .cart-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,1);
          border-radius: 16px;
          padding: 20px 24px;
          margin-bottom: 16px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }

        .cart-item-row:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 10px 25px rgba(0,0,0,0.06);
          border-color: rgba(43, 181, 160, 0.3);
        }

        .cart-item-info h4 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 6px 0;
        }

        .cart-item-info p {
          font-size: 0.95rem;
          color: #6b7280;
          font-weight: 500;
          margin: 0;
        }

        .cart-item-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .cart-item-total {
          font-size: 1.25rem;
          font-weight: 800;
          color: #1a9e8e;
          background: rgba(26, 158, 142, 0.1);
          padding: 6px 14px;
          border-radius: 10px;
        }

        .cart-remove-btn {
          background: rgba(239, 68, 68, 0.1);
          border: none;
          color: #ef4444;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cart-remove-btn:hover {
          background: #ef4444;
          color: white;
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
        }

        /* Cart Summary */
        .cart-summary {
          margin-top: 32px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 20px;
          padding: 24px;
          border: 1px solid rgba(255,255,255,1);
          box-shadow: 0 8px 25px rgba(0,0,0,0.04);
        }

        .cart-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1.3rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px dashed #e5e7eb;
        }
        
        .cart-total-row .total-amount {
          color: #1a9e8e;
          font-size: 1.8rem;
        }

        .ag-btn {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #2bb5a0, #1a9e8e);
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 6px 15px rgba(26, 158, 142, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .ag-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(26, 158, 142, 0.4);
          background: linear-gradient(135deg, #32cdb6, #1fbaaa);
        }
        
        .ag-btn:active {
          transform: translateY(0);
          box-shadow: 0 3px 10px rgba(26, 158, 142, 0.3);
        }

        .cart-empty {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 20px;
          border: 1px dashed #d1d5db;
        }

        .cart-empty p {
          color: #6b7280;
          font-size: 1.2rem;
          font-weight: 500;
          margin-bottom: 24px;
        }

        @media (max-width: 640px) {
          .bookstore-cart-wrapper {
            padding: 24px 16px;
          }
          .cart-item-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .cart-item-right {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>

      <div className="page-bg-accent"></div>
      <div className="page-bg-accent-2"></div>

      {/* ── NAVBAR ── */}
      <div className="navbar" style={{ position: 'relative', zIndex: 10 }}>
        <div className="nav-left">
          <h2 className="brand" style={{ color: '#2bb5a0' }}>PRINTEASE</h2>
        </div>
        <div className="nav-right">
          <div 
            className="avatar"
            onClick={() => navigate(`/${role}/profile`)}
            style={{ cursor: "pointer" }}
          >
            {fullName ? fullName.charAt(0).toUpperCase() : "U"}
          </div>
          <span 
            className="username"
            onClick={() => navigate(`/${role}/profile`)}
            style={{ cursor: "pointer" }}
          >{fullName}</span>
          <span className="logout" onClick={() => { localStorage.clear(); navigate('/'); }}>
            Logout
          </span>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="bookstore-cart-page">
        <div className="bookstore-cart-wrapper">
          <div className="cart-header">
            <button className="cart-back-btn" onClick={() => navigate(-1)} title="Go Back">
              <FaArrowLeft />
            </button>
            <h2>🛒 Your Cart</h2>
          </div>

          {cart.length === 0 ? (
            <div className="cart-empty">
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📦</div>
              <p>Your cart is looking a bit empty.</p>
              <button
                className="ag-btn"
                style={{ maxWidth: '240px', margin: '0 auto' }}
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
                    <button className="cart-remove-btn" onClick={() => removeItem(item.id)} title="Remove item">
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="cart-summary">
                <div className="cart-total-row">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaMoneyBillWave color="#1a9e8e" /> Total Amount
                  </span>
                  <span className="total-amount">₹{totalAmount.toFixed(2)}</span>
                </div>
                <button className="ag-btn" onClick={handlePlaceOrder}>
                  <FaCheckCircle size={18} /> Place Order Securely
                </button>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}