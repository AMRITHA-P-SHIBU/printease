import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaUpload, FaClipboardList, FaHistory } from "react-icons/fa";

function Printout() {
  const navigate = useNavigate();
  const { role } = useParams(); // 👈 VERY IMPORTANT

  const fullName = localStorage.getItem("full_name");

  return (
    <div className="printout-page">
      {/* Navbar */}
      <div className="navbar">
        <h2 className="brand">PRINTEASE</h2>

        <div className="nav-right">
          <span className="username">{fullName}</span>
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