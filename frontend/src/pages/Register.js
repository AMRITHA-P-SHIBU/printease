import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Register() {
  const { role } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    username: "",
    branch: "",
    year: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          username: formData.username,
          branch: role === "student" ? formData.branch : null,
          year: role === "student" ? formData.year : null,
          phone: formData.phone,
          password: formData.password,
          role
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess("Account created successfully!");
        setTimeout(() => navigate(`/login/${role}`), 1500);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error");
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <button className="back-btn" onClick={() => navigate(`/login/${role}`)}>
        ← Back to Login
      </button>

      <h1 className="login-brand">PRINTEASE</h1>
      <p className="login-subtitle">
        Create {role?.charAt(0).toUpperCase() + role?.slice(1)} Account
      </p>

      <div className="login-card">
        <form onSubmit={handleRegister}>

          <div className="input-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="full_name"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Username *</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Branch & Year ONLY for Students */}
          {role === "student" && (
            <div className="input-row">
              <div className="input-group">
                <label>Branch *</label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select branch</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>

              <div className="input-group">
                <label>Year *</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year</option>
                </select>
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button className="signin-btn" type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <p className="create">
          Already have an account?{" "}
          <span
            style={{ cursor: "pointer", color: "#007bff" }}
            onClick={() => navigate(`/login/${role}`)}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;