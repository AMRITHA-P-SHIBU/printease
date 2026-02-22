import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaUserGraduate, FaUserShield } from "react-icons/fa";
import './Welcome.css';

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="container">

      {/* ── NAVBAR ── */}
      <div className="login-navbar">
        <h2 className="login-nav-brand">PRINTEASE</h2>
        <div className="login-nav-right">
          <button className="login-nav-btn" onClick={() => navigate(-1)}>← Back</button>
          <button className="login-nav-btn" onClick={() => navigate('/')}>🏠 Home</button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="welcome-body">
        <h1 className="welcome">WELCOME!</h1>
        <p className="subtitle">Select your role to continue to the login page</p>

        <div className="card-container">
          <div className="card" onClick={() => navigate("/login/student")}>
            <div className="icon student"><FaUser /></div>
            <h3>Student</h3>
            <p className="continue">Continue →</p>
          </div>

          <div className="card" onClick={() => navigate("/login/faculty")}>
            <div className="icon faculty"><FaUserGraduate /></div>
            <h3>Faculty / Staff</h3>
            <p className="continue">Continue →</p>
          </div>

          <div className="card" onClick={() => navigate("/login/admin")}>
            <div className="icon admin"><FaUserShield /></div>
            <h3>Admin</h3>
            <p className="continue">Continue →</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Welcome;

/* Add these to your Welcome.css */
/*
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0 !important;
}

.welcome-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}
*/