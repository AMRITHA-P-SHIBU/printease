require("dotenv").config();

const express  = require("express");
const mysql    = require("mysql2");
const cors     = require("cors");
const bcrypt   = require("bcrypt");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");
const XLSX     = require("xlsx");
const { calculateAmount } = require("./calcHelper");
const db       = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// ── Uploads folder ──
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use("/uploads", express.static(uploadsDir));

// ── Excel uploads folder ──
const excelUploadsDir = path.join(__dirname, "excel_uploads");
if (!fs.existsSync(excelUploadsDir)) fs.mkdirSync(excelUploadsDir);

// ── Multer for documents ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".ppt", ".pptx", ".xls", ".xlsx"];
  const ext = path.extname(file.originalname).toLowerCase();
  allowed.includes(ext) ? cb(null, true) : cb(new Error("File type not supported"), false);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });

// ── Multer for Excel uploads ──
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "excel_uploads/"),
  filename:    (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const excelUpload = multer({
  storage: excelStorage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    [".xlsx", ".xls"].includes(ext) ? cb(null, true) : cb(new Error("Only Excel files allowed"), false);
  }
});

// ════════════════════════════════════════
//  ROUTES
// ════════════════════════════════════════

app.get("/", (req, res) => res.send("Backend is running 🚀"));

// ── Register ──
app.post("/api/register", async (req, res) => {
  const { full_name, email, username, branch, year, phone, password, role } = req.body;
  try {
    if (role === "admin") {
      return res.status(403).json({ success: false, message: "Admin registration is not allowed" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (full_name, email, username, branch, year, phone, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [full_name, email, username, branch, year, phone, hashedPassword, role || "student"], (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ success: false, message: "Email or Username already exists" });
        return res.status(500).json({ success: false, message: "Database error" });
      }
      res.json({ success: true, message: "Account created successfully" });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── Login ──
app.post("/api/login", (req, res) => {
  const { username, password, role } = req.body;
  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
    if (err)             return res.status(500).json({ success: false, message: "Server error" });
    if (!results.length) return res.status(400).json({ success: false, message: "User not found" });
    const user = results[0];
    if (user.role !== role) {
      return res.status(403).json({ success: false, message: "Access denied: Incorrect role" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, message: "Invalid password" });
    res.json({
      success:   true,
      message:   "Login successful",
      role:      user.role,
      full_name: user.full_name,
      username:  user.username,
    });
  });
});

// ── Print Request ──
app.post("/api/print-request", upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    const { mode, copies, print_type, page_numbers, description, spiral_binding, total_pages, username } = req.body;
    if (!mode || !copies || !print_type || !total_pages) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const tp = parseInt(total_pages) || 1;
    const finalAmount = calculateAmount({
      printType:      print_type,
      totalPages:     tp,
      colorPageInput: page_numbers || "",
      copies:         copies,
      spiralBinding:  spiral_binding,
      mode:           mode
    });
    const sql = `
      INSERT INTO print_requests 
        (file_path, original_name, mode, copies, print_type, page_numbers, description, total_pages, spiral_binding, amount, username)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      req.file.path,
      req.file.originalname,
      mode,
      parseInt(copies),
      print_type,
      page_numbers  || null,
      description   || null,
      tp,
      spiral_binding === "true" || spiral_binding === true ? 1 : 0,
      finalAmount,
      username || null
    ];
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }
      return res.status(200).json({
        success:        true,
        message:        "Print request submitted successfully",
        request_id:     result.insertId,
        total_pages:    tp,
        spiral_binding: spiral_binding === "true" || spiral_binding === true,
        final_amount:   finalAmount
      });
    });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── Payment Confirm ──
app.post("/api/payment-confirm", (req, res) => {
  const { request_id, amount } = req.body;
  if (!request_id || !amount) {
    return res.status(400).json({ success: false, message: "Missing request_id or amount" });
  }
  db.query(
    "UPDATE print_requests SET payment_status='paid', amount=? WHERE id=?",
    [amount, request_id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Database error" });
      res.json({ success: true, message: "Payment confirmed" });
    }
  );
});

// ── Get All Print Requests (Admin) ──
app.get("/api/admin/print-requests", (req, res) => {
  const sql = `
    SELECT id, file_path, original_name, mode, copies, print_type, page_numbers, total_pages,
           spiral_binding, amount, payment_status, print_status, created_at
    FROM print_requests
    ORDER BY created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    const data = results.map(row => ({
      ...row,
      file_url: `http://localhost:5000/${row.file_path.replace(/\\/g, "/")}`
    }));
    res.json({ success: true, data });
  });
});

// ── Update Print Status (Admin) ──
app.put("/api/admin/print-requests/:id/status", (req, res) => {
  const { id }     = req.params;
  const { status } = req.body;
  const allowed    = ["Pending", "Printing", "Completed"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }
  db.query("UPDATE print_requests SET print_status=? WHERE id=?", [status, id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    res.json({ success: true, message: "Status updated" });
  });
});

// ── Get Print Request by ID ──
app.get("/api/print-requests/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT id, file_path, original_name, mode, copies, print_type, page_numbers, total_pages,
            spiral_binding, amount, payment_status, print_status, created_at
     FROM print_requests WHERE id = ?`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Database error" });
      if (!results.length) return res.status(404).json({ success: false, message: "Request not found" });
      const row = results[0];
      row.file_url = `http://localhost:5000/${row.file_path ? row.file_path.replace(/\\/g, "/") : ""}`;
      res.json({ success: true, data: row });
    }
  );
});

// ── Get user's own print requests ──
app.get("/api/my-requests", (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ success: false, message: "Username required" });
  }
  const sql = `
    SELECT id, file_path, original_name, mode, copies, print_type, page_numbers,
           total_pages, spiral_binding, amount, payment_status, print_status, created_at
    FROM print_requests
    WHERE username = ?
    ORDER BY created_at DESC
  `;
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    res.json({ success: true, data: results });
  });
});

// ════════════════════════════════════════
// ════════════════════════════════════════
//  BOOKSTORE ROUTES
// ════════════════════════════════════════
const bookstoreRoutes = require('./bookstore_routes');
app.use('/api/bookstore', bookstoreRoutes);

// ── Start Server ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));