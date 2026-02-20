import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaUserGraduate, FaUserShield } from "react-icons/fa";


function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1 className="welcome">WELCOME</h1>
      <h1 className="brand">PRINTEASE</h1>
      <p className="subtitle">
        Your complete printing and bookstore management solution
      </p>

      <div className="card-container">
        <div className="card" onClick={() => navigate("/login/student")}>
          <div className="icon student">
            <FaUser />
          </div>
          <h3>Student</h3>
          <p className="continue">Continue →</p>
        </div>

        <div className="card" onClick={() => navigate("/login/faculty")}>
          <div className="icon faculty">
            <FaUserGraduate />
          </div>
          <h3>Faculty / Staff</h3>
          <p className="continue">Continue →</p>
        </div>

        <div className="card" onClick={() => navigate("/login/admin")}>
          <div className="icon admin">
            <FaUserShield />
          </div>
          <h3>Admin</h3>
          <p className="continue">Continue →</p>
        </div>
      </div>

      <p className="bottom-text">
        Select your role to continue to the login page
      </p>
    </div>
  );
}

export default Welcome;