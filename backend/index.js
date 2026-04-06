require("dotenv").config();

const express  = require("express");
const mysql    = require("mysql2");
const cors     = require("cors");
const bcrypt   = require("bcrypt");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");
const crypto   = require("crypto");
const XLSX     = require("xlsx");
const AdmZip   = require("adm-zip");
const { PDFParse } = require("pdf-parse");
const pdfParse = async (dataBuffer) => {
  const parser = new PDFParse({ data: dataBuffer });
  return await parser.getInfo();
};
const mammoth  = require("mammoth");
const { calculateAmount } = require("./calcHelper");
const db       = require("./db");
const Razorpay = require("razorpay");

const app = express();
app.use(cors());
app.use(express.json());

// ── Razorpay Instance ──
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
      email:     user.email,
      phone:     user.phone,
      branch:    user.branch,
      year:      user.year
    });
  });
});

// ── Count Pages in Document ──
app.post("/api/count-pages", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    const fileName = req.file.originalname.toLowerCase();
    let pageCount = 1;

    console.log(`\n[Page Count Request]`);
    console.log(`File: ${fileName}`);
    console.log(`Type: ${fileType}`);
    console.log(`Path: ${filePath}`);

    // PDF file
    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      try {
        const pdfData = fs.readFileSync(filePath);
        const info = await pdfParse(pdfData);
        
        console.log(`📄 PDF parsed successfully`);
        console.log(`✓ Pages detected from PDF: ${info.total}`);
        pageCount = info.total || 1;
        
        if (pageCount < 1) {
          pageCount = 1;
          console.log(`⚠ Invalid page count, defaulting to 1`);
        }
        
        console.log(`✓ Final PDF pages: ${pageCount}`);
      } catch (err) {
        console.error("❌ PDF parsing error:", err.message);
        pageCount = 1;
      }
    }
    // Word document (.docx)
    else if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      try {
        const zip = new AdmZip(filePath);
        const docXml = zip.readAsText("word/document.xml");
        
        // Count paragraphs as a more reliable page estimate
        // Each paragraph is roughly 1-2 lines, and a page has ~30 lines
        const paragraphs = (docXml.match(/<w:p>/g) || []).length;
        
        // Count page breaks in the document
        const pageBreaks = (docXml.match(/<w:br w:type="page"\/>/g) || []).length;
        
        // If explicit page breaks exist, use them as base
        if (pageBreaks > 0) {
          pageCount = Math.max(1, pageBreaks + 1); // +1 for content after last break
          console.log(`✓ DOCX page breaks detected: ${pageCount} pages`);
        } else {
          // Estimate: paragraphs / 20 paragraphs per page (average)
          pageCount = Math.max(1, Math.ceil(paragraphs / 20));
          console.log(`✓ DOCX paragraphs: ${paragraphs}, estimated pages: ${pageCount}`);
        }
      } catch (err) {
        console.error("❌ DOCX XML parsing error:", err.message);
        // Fallback: try mammoth text extraction
        try {
          const result = await mammoth.extractRawText({ path: filePath });
          let text = result.value || "";
          text = text.replace(/\s+/g, " ").trim();
          const words = text.split(/\s+/).filter(w => w.length > 1);
          const wordCount = words.length;
          pageCount = Math.max(1, Math.ceil(wordCount / 250));
          console.log(`✓ DOCX fallback (mammoth): ${wordCount} words → ${pageCount} pages`);
        } catch (mammothErr) {
          console.error("❌ Mammoth fallback failed:", mammothErr.message);
          pageCount = 1;
        }
      }
    }
    // PowerPoint (.pptx)
    else if (
      fileType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      fileName.endsWith(".pptx")
    ) {
      try {
        const zip = new AdmZip(filePath);
        const presentation = zip.readAsText("ppt/presentation.xml");
        const slideMatches = presentation.match(/<p:sldId /g) || [];
        pageCount = Math.max(1, slideMatches.length);
        console.log(`✓ PPTX slides detected: ${pageCount}`);
      } catch (err) {
        console.error("❌ PPTX parsing error:", err.message);
        pageCount = 1;
      }
    }
    // Old Word format (.doc)
    else if (fileType === "application/msword" || fileName.endsWith(".doc")) {
      try {
        const stats = fs.statSync(filePath);
        const fileSizeKB = stats.size / 1024;
        // .doc files are less compressed - use ~40KB per page estimate
        pageCount = Math.max(1, Math.ceil(fileSizeKB / 40));
        console.log(`✓ DOC file size: ${fileSizeKB}KB → ${pageCount} pages (est.)`);
      } catch (err) {
        console.error("❌ DOC document error:", err.message);
        pageCount = 1;
      }
    }
    // Image files
    else if (fileType && fileType.startsWith("image/")) {
      pageCount = 1;
      console.log(`✓ Image file → 1 page`);
    } 
    // Other file types
    else {
      pageCount = 1;
      console.log(`ℹ Unknown file type → 1 page (default)`);
    }

    // Clean up uploaded file
    fs.unlink(filePath, (err) => {
      if (err) console.error("⚠ Error deleting temp file:", err.message);
    });

    console.log(`[Result] Pages: ${pageCount}\n`);

    res.json({
      success: true,
      pages: pageCount,
      message: `Detected ${pageCount} page${pageCount !== 1 ? "s" : ""}`
    });

  } catch (err) {
    console.error("❌ Page counting error:", err);
    res.status(500).json({ success: false, message: "Error counting pages" });
  }
});

// ── Print Request ──
app.post("/api/print-request", upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    const { mode, copies, print_type, print_layout, page_numbers, description, spiral_binding, total_pages, username } = req.body;
    if (!mode || !copies || !print_type || !print_layout || !total_pages) {
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
        (file_path, original_name, mode, copies, print_type, print_layout, page_numbers, description, total_pages, spiral_binding, amount, username)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      req.file.path,
      req.file.originalname,
      mode,
      parseInt(copies),
      print_type,
      print_layout,
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
        final_amount:   finalAmount,
        print_layout:   print_layout
      });
    });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── Create Razorpay Order ──
app.post("/api/create-razorpay-order", (req, res) => {
  console.log("Create order endpoint hit", req.body);
  const { amount, currency = "INR", receipt } = req.body;
  if (!amount) return res.status(400).json({ success: false, message: "Amount required" });

  const options = {
    amount: amount * 100, // Razorpay expects amount in paisa
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
  };

  razorpay.orders.create(options, (err, order) => {
    if (err) {
      console.error("Razorpay Order Creation Error:", err);
      return res.status(500).json({ success: false, message: "Failed to create order" });
    }
    console.log("Order created:", order);
    res.json({ success: true, order });
  });
});

// ── Payment Confirm ──
app.post("/api/payment-confirm", (req, res) => {
  const { request_id, amount, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  if (!request_id || !amount) {
    return res.status(400).json({ success: false, message: "Missing request_id or amount" });
  }

  // Verify Razorpay signature if provided
  if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }
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
    SELECT id, file_path, original_name, mode, copies, print_type, print_layout, page_numbers, total_pages,
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
    `SELECT id, file_path, original_name, mode, copies, print_type, print_layout, page_numbers, total_pages,
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
    SELECT id, file_path, original_name, mode, copies, print_type, print_layout, page_numbers,
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