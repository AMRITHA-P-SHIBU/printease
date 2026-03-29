import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaBook, FaBox, FaHistory } from "react-icons/fa";
import "./Bookstore.css";
import "./Dashboard.css";

export default function Bookstore() {
  const navigate = useNavigate();
  const { role } = useParams();
  const fullName = localStorage.getItem("full_name") || "User";

  const cards = [
    {
      id: 1,
      icon: <FaBook size={24} />,
      title: "Browse Bookstore Items",
      subtitle: "Explore and select what you need",
      route: `/${role}/bookstore/items`,
    },
    {
      id: 2,
      icon: <FaBox size={24} />,
      title: "Order Status",
      subtitle: "Track your current orders",
      route: `/${role}/bookstore/status`,
    },
    {
      id: 3,
      icon: <FaHistory size={24} />,
      title: "Previous Orders",
      subtitle: "Review your past purchases",
      route: `/${role}/bookstore/history`,
    },
  ];

  return (
    <div className="bookstore-dashboard-page">
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
            {fullName.charAt(0).toUpperCase()}
          </div>
          <span
            className="username"
            onClick={() => navigate(`/${role}/profile`)}
            style={{ cursor: "pointer" }}
          >
            {fullName}
          </span>
          <span
            className="logout"
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            Logout
          </span>
        </div>
      </div>

      <div className="bookstore-dashboard-content">
        <div className="bookstore-header">
          <div className="bookstore-icon-circle"><FaBook size={32} /></div>
          <h1>Bookstore</h1>
          <p>Browse and manage your bookstore items</p>
        </div>

        <div className="bookstore-card-row">
          {cards.map((card) => (
            <button
              key={card.id}
              className="bookstore-card"
              onClick={() => navigate(card.route)}
              type="button"
            >
              <div className="card-icon">{card.icon}</div>
              <div className="card-content">
                <h3>{card.title}</h3>
                <p>{card.subtitle}</p>
              </div>
              <div className="card-arrow">→</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}