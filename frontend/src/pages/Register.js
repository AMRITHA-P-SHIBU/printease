import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  validateSJCETID,
  validatePhoneNumber,
  validateCollegeEmail,
  validateFullName,
  validateEmail
} from "../utils/validation";

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
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear field error when user starts typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: ""
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    // Validate full name
    const fullNameValidation = validateFullName(formData.full_name);
    if (!fullNameValidation.valid) {
      setError(fullNameValidation.message);
      setFieldErrors({ full_name: fullNameValidation.message });
      return;
    }

    // Validate email (basic validation for all, college email validation for students)
    if (role === "student") {
      const collegeEmailValidation = validateCollegeEmail(
        formData.email,
        formData.full_name,
        formData.username,
        "student"
      );
      if (!collegeEmailValidation.valid) {
        setError(collegeEmailValidation.message);
        setFieldErrors({ email: collegeEmailValidation.message });
        return;
      }
    } else if (role === "faculty") {
      const collegeEmailValidation = validateCollegeEmail(
        formData.email,
        formData.full_name,
        formData.username,
        "faculty"
      );
      if (!collegeEmailValidation.valid) {
        setError(collegeEmailValidation.message);
        setFieldErrors({ email: collegeEmailValidation.message });
        return;
      }
    } else {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.valid) {
        setError(emailValidation.message);
        setFieldErrors({ email: emailValidation.message });
        return;
      }
    }

    // Validate SJCET ID for students and faculty
    if (role === "student" || role === "faculty") {
      const sjcetValidation = validateSJCETID(formData.username, role);
      if (!sjcetValidation.valid) {
        setError(sjcetValidation.message);
        setFieldErrors({ username: sjcetValidation.message });
        return;
      }
    }

    // Validate phone number
    const phoneValidation = validatePhoneNumber(formData.phone);
    if (!phoneValidation.valid) {
      setError(phoneValidation.message);
      setFieldErrors({ phone: phoneValidation.message });
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setFieldErrors({ password: "Password must be at least 6 characters long" });
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
              className={fieldErrors.full_name ? "input-error" : ""}
              required
            />
            {fieldErrors.full_name && (
              <span className="field-error">{fieldErrors.full_name}</span>
            )}
          </div>

          <div className="input-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your college email id"
              value={formData.email}
              onChange={handleChange}
              className={fieldErrors.email ? "input-error" : ""}
              required
            />
            {fieldErrors.email && (
              <span className="field-error">{fieldErrors.email}</span>
            )}
          </div>

          <div className="input-group">
            <label>SJCET ID *</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your sjcet id"
              value={formData.username}
              onChange={handleChange}
              className={fieldErrors.username ? "input-error" : ""}
              required
            />
            {fieldErrors.username && (
              <span className="field-error">{fieldErrors.username}</span>
            )}
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
                  <option value="CSE">CSE (cs)</option>
                  <option value="ECE">ECE (ec)</option>
                  <option value="EEE">EEE (ee)</option>
                  <option value="CY">CY (cy)</option>
                  <option value="ECS">ECS (es)</option>
                  <option value="AI&DS">AI&DS (ad)</option>
                  <option value="MECH">MECH (me)</option>
                  <option value="CIVIL">CIVIL (ce)</option>
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
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => {
                // Only allow digits
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData({ ...formData, phone: value });
                if (fieldErrors.phone) {
                  setFieldErrors({ ...fieldErrors, phone: "" });
                }
              }}
              maxLength="10"
              className={fieldErrors.phone ? "input-error" : ""}
              required
            />
            {fieldErrors.phone && (
              <span className="field-error">{fieldErrors.phone}</span>
            )}
            <small style={{ color: "#666", marginTop: "4px", display: "block" }}>
               
            </small>
          </div>

          <div className="input-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              className={fieldErrors.password ? "input-error" : ""}
              required
            />
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
          </div>

          <div className="input-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={fieldErrors.confirmPassword ? "input-error" : ""}
              required
            />
            {fieldErrors.confirmPassword && (
              <span className="field-error">{fieldErrors.confirmPassword}</span>
            )}
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