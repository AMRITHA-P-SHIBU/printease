import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
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
    <div className="register-container-modern">
      <style>{`
        .register-container-modern {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f0f4f8;
          position: relative;
          overflow-x: hidden;
          padding: 40px 20px;
          font-family: 'Segoe UI', sans-serif;
        }
        
        /* Floating background decoration */
        .page-bg-accent {
          position: fixed;
          top: -20%;
          left: -10%;
          width: 50vw;
          height: 50vw;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          z-index: 0;
          pointer-events: none;
        }
        .page-bg-accent-2 {
          position: fixed;
          bottom: -20%;
          right: -10%;
          width: 60vw;
          height: 60vw;
          background: radial-gradient(circle, rgba(43, 181, 160, 0.08) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          z-index: 0;
          pointer-events: none;
        }

        .register-content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 520px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .back-circle-btn {
          position: absolute;
          top: 24px;
          left: 24px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.1rem;
          color: #4b5563;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          z-index: 20;
        }
        .back-circle-btn:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          color: #111827;
        }

        .register-brand {
          font-size: 2.2rem;
          font-weight: 800;
          color: #2bb5a0;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .register-subtitle {
          font-size: 1.1rem;
          color: #6b7280;
          margin: 8px 0 32px 0;
          font-weight: 500;
        }

        /* Antigravity Card */
        @keyframes floatIdle {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }

        .register-card-modern {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(31, 38, 135, 0.05), 0 2px 10px rgba(0,0,0,0.02);
          width: 100%;
          box-sizing: border-box;
          animation: floatIdle 6s ease-in-out infinite;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .register-card-modern:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
          border-color: rgba(255, 255, 255, 1);
          animation-play-state: paused;
        }

        .ag-input-group {
          margin-bottom: 20px;
          text-align: left;
          width: 100%;
        }

        .ag-input-row {
          display: flex;
          gap: 16px;
          width: 100%;
        }
        .ag-input-row .ag-input-group {
          flex: 1;
        }

        .ag-input-group label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 8px;
        }

        .ag-input-group input, .ag-input-group select {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 1);
          border-radius: 12px;
          font-size: 1rem;
          color: #1f2937;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
          box-sizing: border-box;
        }

        .ag-input-group input:focus, .ag-input-group select:focus {
          outline: none;
          background: #ffffff;
          border-color: #2bb5a0;
          box-shadow: 0 0 0 4px rgba(43, 181, 160, 0.15), inset 0 2px 4px rgba(0,0,0,0.01);
          transform: translateY(-2px);
        }

        .ag-input-group input.input-error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .ag-field-error {
          display: block;
          color: #ef4444;
          font-size: 0.85rem;
          margin-top: 6px;
          font-weight: 500;
        }

        .ag-btn-submit {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #2bb5a0, #1a9e8e);
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 6px 15px rgba(26, 158, 142, 0.3);
          margin-top: 10px;
        }

        .ag-btn-submit:not(:disabled):hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(26, 158, 142, 0.4);
          background: linear-gradient(135deg, #32cdb6, #1fbaaa);
        }

        .ag-btn-submit:disabled {
          background: #a0c4b8;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .ag-message-error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 0.95rem;
          font-weight: 600;
          text-align: center;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .ag-message-success {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 0.95rem;
          font-weight: 600;
          text-align: center;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .ag-footer-text {
          margin-top: 24px;
          color: #6b7280;
          font-size: 1rem;
          font-weight: 500;
          text-align: center;
        }

        .ag-link {
          color: #1a9e8e;
          cursor: pointer;
          font-weight: 700;
          transition: color 0.2s;
        }
        .ag-link:hover {
          color: #157d70;
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .register-card-modern {
            padding: 30px 20px;
          }
          .ag-input-row {
            flex-direction: column;
            gap: 0;
          }
        }
      `}</style>
      
      <div className="page-bg-accent"></div>
      <div className="page-bg-accent-2"></div>

      <button 
        className="back-circle-btn" 
        onClick={() => navigate(`/login/${role}`)}
        title="Back to Login"
        aria-label="Go back to login page"
      >
        <FaArrowLeft />
      </button>

      <div className="register-content">
        <h1 className="register-brand">PRINTEASE</h1>
        <p className="register-subtitle">
          Create {role?.charAt(0).toUpperCase() + role?.slice(1)} Account
        </p>

        <div className="register-card-modern">
          <form onSubmit={handleRegister}>
            <div className="ag-input-group">
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
                <span className="ag-field-error">{fieldErrors.full_name}</span>
              )}
            </div>

            <div className="ag-input-group">
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
                <span className="ag-field-error">{fieldErrors.email}</span>
              )}
            </div>

            <div className="ag-input-group">
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
                <span className="ag-field-error">{fieldErrors.username}</span>
              )}
            </div>

            {/* Branch & Year ONLY for Students */}
            {role === "student" && (
              <div className="ag-input-row">
                <div className="ag-input-group">
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

                <div className="ag-input-group">
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

            <div className="ag-input-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => {
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
                <span className="ag-field-error">{fieldErrors.phone}</span>
              )}
            </div>

            <div className="ag-input-group">
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
                <span className="ag-field-error">{fieldErrors.password}</span>
              )}
            </div>

            <div className="ag-input-group">
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
                <span className="ag-field-error">{fieldErrors.confirmPassword}</span>
              )}
            </div>

            {error && <div className="ag-message-error">{error}</div>}
            {success && <div className="ag-message-success">{success}</div>}

            <button className="ag-btn-submit" type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="ag-footer-text">
            Already have an account?{" "}
            <span
              className="ag-link"
              onClick={() => navigate(`/login/${role}`)}
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;