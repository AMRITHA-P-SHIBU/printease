import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Bookstore.css";
import "./Dashboard.css";

export default function Bookstore() {
  const navigate = useNavigate();
  const { role } = useParams();
  const fullName = localStorage.getItem("full_name");

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
      <div className="bookstore-bg">
        <div className="bookstore-welcome-card">

          {/* ── Card 1: Welcome to Our Store ── */}
          <div className="bs-service-card" onClick={() => navigate(`/${role}/bookstore/items`)}>
            <div className="bs-service-icon">🛍️</div>
            <div className="bs-service-info">
              <h3>Welcome to Our Store</h3>
              <p>Browse our available items</p>
            </div>
            <span className="bs-service-arrow">→</span>
          </div>

          {/* ── Card 2: Order Status ── */}
          <div className="bs-service-card" onClick={() => navigate(`/${role}/bookstore/status`)}>
            <div className="bs-service-icon">📦</div>
            <div className="bs-service-info">
              <h3>Order Status</h3>
              <p>Track your current orders</p>
            </div>
            <span className="bs-service-arrow">→</span>
          </div>

          {/* ── Card 3: Previous Activity ── */}
          <div className="bs-service-card" onClick={() => navigate(`/${role}/bookstore/history`)}>
            <div className="bs-service-icon">🕐</div>
            <div className="bs-service-info">
              <h3>Previous Activity</h3>
              <p>View your past orders</p>
            </div>
            <span className="bs-service-arrow">→</span>
          </div>

        </div>
      </div>

    </div>
  );
}