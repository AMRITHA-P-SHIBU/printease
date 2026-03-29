import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaUpload, FaClipboardList, FaHistory, FaArrowLeft, FaPrint } from "react-icons/fa";
import './Dashboard.css';

function Printout() {
  const navigate = useNavigate();
  const { role } = useParams();

  const fullName = localStorage.getItem("full_name");

  const printoutOptions = [
    {
      id: 'submit',
      title: 'Submit Print Request',
      description: 'Upload documents and configure print settings',
      icon: <FaUpload size={24} />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:shadow-blue-100',
      route: `/${role}/printout/submit`
    },
    {
      id: 'status',
      title: 'Check Print Status',
      description: 'Track your current print job progress',
      icon: <FaClipboardList size={24} />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:shadow-green-100',
      route: `/${role}/printout/status`
    },
    {
      id: 'history',
      title: 'Print History',
      description: 'View your previous print activities',
      icon: <FaHistory size={24} />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:shadow-purple-100',
      route: `/${role}/printout/history`
    }
  ];

  return (
    <div className="printout-page">
      {/* Navbar — same as Dashboard */}
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

      {/* Main Content */}
      <div className="printout-container">
        <div className="printout-header">
          <div className="header-icon">
            <FaPrint size={32} />
          </div>
          <h1 className="printout-title">Print Services</h1>
          <p className="printout-subtitle">Choose your printing service</p>
        </div>

        <div className="printout-grid">
          {printoutOptions.map((option, index) => (
            <div
              key={option.id}
              className="printout-card"
              onClick={() => navigate(option.route)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="card-icon">
                {option.icon}
              </div>
              <div className="card-content">
                <h3 className="card-title">{option.title}</h3>
                <p className="card-description">{option.description}</p>
              </div>
              <div className="card-arrow">
                →
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Printout;