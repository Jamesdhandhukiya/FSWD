const express = require("express");
const path = require("path");
const multer = require("multer");

const app = express();

// Set EJS as template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware for static files
app.use(express.static(path.join(__dirname, "public")));

// Configure multer storage (store in /public/uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique file name
  },
});

// File filter (only PDFs allowed)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

// Initialize multer
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter,
});

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", upload.single("resume"), (req, res) => {
  res.render("upload", { file: req.file });
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(400).send(err.message);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
