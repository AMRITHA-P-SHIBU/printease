import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPrint, FaStore, FaArrowLeft, FaHome } from "react-icons/fa";
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const fullName = localStorage.getItem("full_name");
  const role = localStorage.getItem("role");

  return (
    <div className="dashboard-wrapper">
      <div className="navbar">
        <div className="nav-left">
          <button 
            className="nav-icon-btn" 
            onClick={() => navigate(-1)}
            title="Go Back"
            aria-label="Go back to previous page"
          >
            <FaArrowLeft />
          </button>
          <h2 className="brand">PRINTEASE</h2>
        </div>
        <div className="nav-right">
          <button 
            className="nav-icon-btn" 
            onClick={() => navigate('/')}
            title="Go Home"
            aria-label="Go to home page"
          >
            <FaHome />
          </button>
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
          >
            {fullName}
          </span>
          <span className="logout" onClick={() => { localStorage.clear(); navigate('/'); }}>
            Logout
          </span>
        </div>
      </div>

      <div className="dashboard-content">
        <h1>Welcome, {fullName}!</h1>
        <p>Choose a service to get started</p>

        <div className="cards">
          <div className="card" onClick={() => navigate(`/${role}/printout`)}>
            <div className="icon-box">
              <FaPrint size={28} />
            </div>
            <h3>Printout</h3>
            <p>Upload documents, configure print settings, and manage your print requests</p>
            <span className="get-started">Get Started →</span>
          </div>

          <div className="card" onClick={() => navigate(`/${role}/bookstore`)}>
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