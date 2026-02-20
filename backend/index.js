require("dotenv").config(); // ✅ Load .env variables

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MySQL connection using .env
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL Database");
  }
});

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ Register API
app.post("/api/register", async (req, res) => {
  const {
    full_name,
    email,
    username,
    branch,
    year,
    phone,
    password,
    role
  } = req.body;

  try {
    // ❌ Block admin registration
    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin registration is not allowed"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users 
      (full_name, email, username, branch, year, phone, password, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        full_name,
        email,
        username,
        branch,
        year,
        phone,
        hashedPassword,
        role || "student"
      ],
      (err, result) => {
        if (err) {
          console.log(err);

          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
              success: false,
              message: "Email or Username already exists"
            });
          }

          return res.status(500).json({
            success: false,
            message: "Database error"
          });
        }

        res.json({
          success: true,
          message: "Account created successfully"
        });
      }
    );

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// ✅ Login API
app.post("/api/login", (req, res) => {
  const { username, password, role } = req.body;

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const user = results[0];

    // 🔐 Role check
    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Incorrect role"
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    res.json({
      success: true,
      message: "Login successful",
      role: user.role,
      full_name: user.full_name
    });
  });
});

// ✅ Use PORT from .env
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});