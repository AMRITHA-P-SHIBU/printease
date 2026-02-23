import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaUpload, FaClipboardList, FaHistory } from "react-icons/fa";
import './Dashboard.css';

function Printout() {
  const navigate = useNavigate();
  const { role } = useParams();

  const fullName = localStorage.getItem("full_name");

  return (
    <div className="printout-page">
      {/* Navbar — same as Dashboard */}
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

      {/* Content */}
      <div className="printout-content">
        <div
          className="print-card"
          onClick={() => navigate(`/${role}/printout/submit`)}
        >
          <FaUpload size={22} />
          <span>Submit Print Request</span>
          <span className="arrow">→</span>
        </div>

        <div
          className="print-card"
          onClick={() => navigate(`/${role}/printout/status`)}
        >
          <FaClipboardList size={22} />
          <span>Show Status</span>
          <span className="arrow">→</span>
        </div>

        <div
          className="print-card"
          onClick={() => navigate(`/${role}/printout/history`)}
        >
          <FaHistory size={22} />
          <span>Previous Activity</span>
          <span className="arrow">→</span>
        </div>
      </div>
    </div>
  );
}

export default Printout;