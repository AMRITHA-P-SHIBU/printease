import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPrint, FaStore } from "react-icons/fa";
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const fullName = localStorage.getItem("full_name");
  const role = localStorage.getItem("role");

  return (
    <div className="dashboard-wrapper">
      {/* Navbar */}
      <div className="navbar">
        <h2 className="brand">PRINTEASE</h2>

        <div className="nav-right">
  <button className="nav-btn" onClick={() => navigate(-1)}>← Back</button>
  <button className="nav-btn" onClick={() => navigate('/')}> Home</button>
  <div className="avatar">
    {fullName ? fullName.charAt(0).toUpperCase() : "U"}
  </div>
  <span className="username">{fullName}</span>
  <span className="logout" onClick={() => { localStorage.clear(); navigate('/'); }}>
    Logout
  </span>
</div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <h1>Welcome, {fullName}!</h1>
        <p>Choose a service to get started</p>

        <div className="cards">
          <div
            className="card"
            onClick={() => navigate(`/${role}/printout`)}
          >
            <div className="icon-box">
              <FaPrint size={28} />
            </div>
            <h3>Printout</h3>
            <p>
              Upload documents, configure print settings, and manage your
              print requests
            </p>
            <span className="get-started">Get Started →</span>
          </div>

          <div className="card">
            <div className="icon-box">
              <FaStore size={28} />
            </div>
            <h3>Bookstore</h3>
            <p>Browse items and manage orders</p>
            <span className="get-started">Get Started →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;