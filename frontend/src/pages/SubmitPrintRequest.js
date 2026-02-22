import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function SubmitPrintRequest() {
  const navigate = useNavigate();
  const { role } = useParams();

  const fullName = localStorage.getItem("full_name") || "User";
  const initial = fullName.charAt(0).toUpperCase();

  const [documentFile, setDocumentFile] = useState(null);
  const [mode, setMode] = useState("Fast Track");
  const [copies, setCopies] = useState(1);
  const [printType, setPrintType] = useState("Color");
  const [pageNumbers, setPageNumbers] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setDocumentFile(e.target.files[0]);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!documentFile) {
      alert("Please upload a document.");
      return;
    }

    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
      alert("Session expired. Please login again.");
      navigate("/");
      return;
    }

    const formData = new FormData();
    formData.append("document", documentFile);
    formData.append("user_id", user_id);
    formData.append("mode", mode);
    formData.append("copies", copies);
    formData.append("print_type", printType);
    formData.append("page_numbers", pageNumbers);
    formData.append("description", description);

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/print-request", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Print request submitted successfully!");
        navigate(`/${role}/printout`);
      } else {
        alert(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Could not connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const isColor = printType === "Color";

  return (
    <div style={styles.pageWrapper}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.brand}>PRINTEASE</h2>
        <div style={styles.navRight}>
          <div style={styles.avatar}>{initial}</div>
          <span style={styles.username}>{fullName}</span>
          <span style={styles.logout} onClick={handleLogout}>Logout</span>
        </div>
      </div>

      {/* Card */}
      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <h2 style={styles.heading}>Submit Print Request</h2>

          <form onSubmit={handleSubmit}>

            {/* Upload Document */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Upload Document <span style={styles.required}>*</span></label>
              <label style={styles.fileUploadBox}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <div style={styles.fileUploadInner}>
                  <span style={styles.fileIcon}>📄</span>
                  <span style={styles.fileText}>
                    {documentFile ? documentFile.name : "Click to choose a file"}
                  </span>
                  <span style={styles.fileSub}>
                    {documentFile ? "" : "PDF, Word, or Image"}
                  </span>
                </div>
              </label>
            </div>

            {/* Mode */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Mode <span style={styles.required}>*</span></label>
              <div style={styles.selectWrapper}>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  required
                  style={styles.select}
                >
                  <option>Fast Track</option>
                  <option>General</option>
                </select>
                <span style={styles.chevron}>▾</span>
              </div>
            </div>

            {/* Number of Copies */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Number of Copies <span style={styles.required}>*</span></label>
              <div style={styles.copiesRow}>
                <button
                  type="button"
                  style={styles.copiesBtn}
                  onClick={() => setCopies(copies > 1 ? copies - 1 : 1)}
                >
                  −
                </button>
                <input
                  type="number"
                  value={copies}
                  min={1}
                  required
                  onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
                  style={styles.copiesInput}
                />
                <button
                  type="button"
                  style={styles.copiesBtn}
                  onClick={() => setCopies(copies + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Print Type */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Print Type <span style={styles.required}>*</span></label>
              <div style={styles.selectWrapper}>
                <select
                  value={printType}
                  onChange={(e) => setPrintType(e.target.value)}
                  required
                  style={styles.select}
                >
                  <option>Color</option>
                  <option>Black &amp; White</option>
                </select>
                <span style={styles.chevron}>▾</span>
              </div>
            </div>

            {/* Page Numbers - only shown for Color */}
            {isColor && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Page Numbers <span style={styles.optional}>(optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. 1,3-5"
                  value={pageNumbers}
                  onChange={(e) => setPageNumbers(e.target.value)}
                  style={styles.input}
                />
              </div>
            )}

            {/* Description - only shown for Color */}
            {isColor && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Description <span style={styles.optional}>(optional)</span></label>
                <textarea
                  placeholder="Additional notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={styles.textarea}
                />
              </div>
            )}

            <button
              type="submit"
              style={loading ? styles.submitBtnDisabled : styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    background: "#f0f4f2",
    fontFamily: "'Segoe UI', sans-serif",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 60px",
    background: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  brand: {
    color: "#1b8a6b",
    fontWeight: "800",
    fontSize: "28px",
    margin: 0,
    letterSpacing: "0.5px",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#1b8a6b",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "15px",
  },
  username: {
    fontWeight: "600",
    fontSize: "15px",
    color: "#1e293b",
  },
  logout: {
    color: "#e74c3c",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  cardContainer: {
    display: "flex",
    justifyContent: "center",
    padding: "50px 20px",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    padding: "40px 45px",
    width: "100%",
    maxWidth: "520px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },
  heading: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "30px",
    marginTop: "0",
  },
  fieldGroup: {
    marginBottom: "22px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    fontSize: "14px",
    color: "#374151",
  },
  required: {
    color: "#e74c3c",
    marginLeft: "3px",
  },
  optional: {
    color: "#9ca3af",
    fontWeight: "400",
    fontSize: "12px",
    marginLeft: "4px",
  },
  fileUploadBox: {
    display: "block",
    border: "2px dashed #d1d5db",
    borderRadius: "12px",
    padding: "20px",
    cursor: "pointer",
    background: "#f9fafb",
    textAlign: "center",
  },
  fileUploadInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },
  fileIcon: {
    fontSize: "28px",
  },
  fileText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    wordBreak: "break-all",
  },
  fileSub: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  selectWrapper: {
    position: "relative",
  },
  select: {
    width: "100%",
    padding: "12px 40px 12px 16px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    background: "#f3f4f6",
    fontSize: "15px",
    color: "#1f2937",
    appearance: "none",
    cursor: "pointer",
    outline: "none",
  },
  chevron: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#6b7280",
    pointerEvents: "none",
    fontSize: "16px",
  },
  copiesRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  copiesBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    background: "#f3f4f6",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#374151",
    fontWeight: "500",
  },
  copiesInput: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    background: "#f3f4f6",
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    outline: "none",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    background: "#f3f4f6",
    fontSize: "15px",
    color: "#1f2937",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    background: "#f3f4f6",
    fontSize: "15px",
    color: "#1f2937",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'Segoe UI', sans-serif",
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #1b8a6b, #3ccf9f)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
  },
  submitBtnDisabled: {
    width: "100%",
    padding: "14px",
    background: "#a0c4b8",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "not-allowed",
    marginTop: "10px",
  },
};

export default SubmitPrintRequest;