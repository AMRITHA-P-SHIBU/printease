
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye } from "react-icons/fa";

function Login() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({
          username,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("full_name", data.full_name);
        localStorage.setItem("role", data.role);

        navigate("/" + data.role + "/dashboard");
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
      <button className="back-btn" onClick={() => navigate("/")}>
        ← Back to Welcome
      </button>

      <h1 className="login-brand">PRINTEASE</h1>
      <p className="login-subtitle">Sign in to your account</p>

      <div className="login-card">
        <div className="role-badge">{roleName}</div>

        <form onSubmit={handleLogin}>

          <div className="input-group">
  <label>{role === "admin" ? "Username" : "Sjcet Id"}</label>
  <div className="input-wrapper">
    <FaUser className="input-icon" />
    <input
      type="text"
      placeholder={
        role === "admin"
          ? "Enter your username"
          : "Enter your Sjcet Id"
      }
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

        {/* 👇 Hide Create Account for Admin */}
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
  );
}

export default Login;