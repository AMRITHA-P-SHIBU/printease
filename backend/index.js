require("dotenv").config();

const express = require("express");
const mysql   = require("mysql2");
const cors    = require("cors");
const bcrypt  = require("bcrypt");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// ── Make sure uploads folder exists ──
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ── Serve uploaded files statically ──
app.use("/uploads", express.static(uploadsDir));

// ── MySQL connection ──
const db = mysql.createConnection({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) console.error("Database connection failed:", err);
  else console.log("Connected to MySQL Database");
});

// ── MULTER CONFIG ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();
  allowed.includes(ext) ? cb(null, true) : cb(new Error("File type not supported"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ════════════════════════════════════════
//  ROUTES
// ════════════════════════════════════════

// Test route
app.get("/", (req, res) => res.send("Backend is running 🚀"));

// ── Register ──
app.post("/api/register", async (req, res) => {
  const { full_name, email, username, branch, year, phone, password, role } = req.body;

  try {
    if (role === "admin") {
      return res.status(403).json({ success: false, message: "Admin registration is not allowed" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (full_name, email, username, branch, year, phone, password, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [full_name, email, username, branch, year, phone, hashedPassword, role || "student"], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ success: false, message: "Email or Username already exists" });
        }
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

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Server error" });
    if (results.length === 0) return res.status(400).json({ success: false, message: "User not found" });

    const user = results[0];

    if (user.role !== role) {
      return res.status(403).json({ success: false, message: "Access denied: Incorrect role" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, message: "Invalid password" });

    res.json({ success: true, message: "Login successful", role: user.role, full_name: user.full_name });
  });
});

// ── Print Request ──
app.post("/api/print-request", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { mode, copies, print_type, page_numbers, description, total_pages } = req.body;

    if (!mode || !copies || !print_type) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const sql = `
      INSERT INTO print_requests (file_path, mode, copies, print_type, page_numbers, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      req.file.path,
      mode,
      parseInt(copies),
      print_type,
      page_numbers || null,
      description  || null
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }
      return res.status(200).json({
        success:     true,
        message:     "Print request submitted successfully",
        request_id:  result.insertId,
        total_pages: parseInt(total_pages) || 1   // ← returned to frontend for payment calc
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

  const sql = "UPDATE print_requests SET payment_status='paid', amount=? WHERE id=?";
  db.query(sql, [amount, request_id], (err) => {
    if (err) {
      console.error("Payment confirm error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json({ success: true, message: "Payment confirmed" });
  });
});

// ── Start Server ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));