import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye } from "react-icons/fa";
import "./Login.css";

function Login() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminType, setAdminType] = useState("printease");

  const roleName =
    role === "student"
      ? "Student"
      : role === "faculty"
      ? "Faculty / Staff"
      : "Admin";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("full_name", data.full_name);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", username); // ← NEWLY ADDED

        if (data.role === "admin") {
          localStorage.setItem("adminType", adminType);
          // Assuming for now both go to the same or admin can be handled if separate paths are created
          navigate("/admin/dashboard");
        } else {
          navigate("/" + data.role + "/dashboard");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    }

    setLoading(false);
  };

  const handleCreateAccount = () => {
    navigate(`/register/${role}`);
  };

  return (
    <div className="login-page">
      <div className="login-navbar">
        <h2 className="login-nav-brand">PRINTEASE</h2>
        <div className="login-nav-right">
          <button className="login-nav-btn" onClick={() => navigate(-1)}>← Back</button>
          <button className="login-nav-btn" onClick={() => navigate('/')}>🏠 Home</button>
        </div>
      </div>

      <div className="login-body">
        <h1 className="login-brand">
          {role === "student"
            ? "Student Login"
            : role === "faculty"
            ? "Faculty/Staff Login"
            : "Admin Login"}
        </h1>
        <p className="login-subtitle">Sign in to your account</p>

        <div className="login-card">
          <div className="role-badge">{roleName}</div>

          {role === "admin" && (
            <div className="admin-toggle-container">
              <div className={`admin-toggle-slider ${adminType}`} />
              <button
                type="button"
                className={`admin-toggle-btn ${adminType === "printease" ? "active" : ""}`}
                onClick={() => setAdminType("printease")}
              >
                PrintEase
              </button>
              <button
                type="button"
                className={`admin-toggle-btn ${adminType === "bookstore" ? "active" : ""}`}
                onClick={() => setAdminType("bookstore")}
              >
                Bookstore
              </button>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>{role === "admin" ? "Username" : "Sjcet Id"}</label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  placeholder={role === "admin" ? "Enter your username" : "Enter your Sjcet Id"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <FaEye className="eye-icon" />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button className="signin-btn" type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="forgot">Forgot your password?</p>

          {role !== "admin" && (
            <p className="create">
              Don't have an account?{" "}
              <span
                style={{ cursor: "pointer", color: "#007bff" }}
                onClick={handleCreateAccount}
              >
                Create an account
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;