import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaArrowLeft } from "react-icons/fa";
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const fullName = localStorage.getItem("full_name");
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");
  const phone = localStorage.getItem("phone");
  const branch = localStorage.getItem("branch");
  const year = localStorage.getItem("year");

  // Role name display
  const roleName =
    role === "student" ? "Student" :
    role === "faculty" ? "Faculty / Staff" : "Admin";

  return (
    <div className="profile-wrapper">
      <div className="profile-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="profile-nav-icon-btn" 
            onClick={() => navigate(-1)}
            title="Go Back"
            aria-label="Go back to previous page"
          >
            <FaArrowLeft />
          </button>
          <h2 className="profile-brand">PRINTEASE</h2>
        </div>
        <div className="profile-nav-right">
          <button 
            className="profile-nav-icon-btn" 
            onClick={() => navigate('/')}
            title="Go Home"
            aria-label="Go to home page"
          >
            <FaHome />
          </button>
          <span className="profile-logout" onClick={() => { localStorage.clear(); navigate('/'); }}>
            Logout
          </span>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {fullName ? fullName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="profile-heading">
              <h1>{fullName}</h1>
              <p className="profile-role">{roleName}</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-section">
              <h3>Account Information</h3>
              
              <div className="detail-item">
                <label>Full Name</label>
                <p>{fullName || "N/A"}</p>
              </div>

              <div className="detail-item">
                <label>Role</label>
                <p>{roleName}</p>
              </div>

              <div className="detail-item">
                <label>SJCET ID</label>
                <p>{username || "N/A"}</p>
              </div>

              <div className="detail-item">
                <label>Email</label>
                <p>{email || "N/A"}</p>
              </div>

              <div className="detail-item">
                <label>Phone Number</label>
                <p>{phone || "N/A"}</p>
              </div>

              {role === "student" && (
                <>
                  <div className="detail-item">
                    <label>Branch</label>
                    <p>{branch || "N/A"}</p>
                  </div>

                  <div className="detail-item">
                    <label>Year</label>
                    <p>{year ? `${year}${getYearSuffix(year)}` : "N/A"}</p>
                  </div>
                </>
              )}
            </div>

            <div className="profile-actions">
              <button className="btn-primary" onClick={() => navigate(-1)}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getYearSuffix(year) {
  if (year === "1") return "st Year";
  if (year === "2") return "nd Year";
  if (year === "3") return "rd Year";
  return "th Year";
}

export default Profile;
