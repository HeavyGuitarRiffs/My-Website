require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const blogRoutes = require("./routes/blogRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/blogDB";

// ✅ Ensure `/uploads` directory exists (to store screenshots)
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Middleware
app.use(express.json()); // Parse JSON body
app.use(cors()); // Enable Cross-Origin Requests

// ✅ Serve static files (Ensures screenshots always load)
app.use("/uploads", express.static(uploadDir)); // Serve uploaded images
app.use("/assets", express.static(path.join(__dirname, "public/assets"))); // Serve JavaScript, CSS
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend files

// ✅ Log when an image is requested
app.use("/uploads/:filename", (req, res, next) => {
    const filePath = path.join(uploadDir, req.params.filename);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Image not found: ${req.params.filename}`);
        return res.status(404).send("Image not found");
    }
    console.log(`📸 Serving image: ${req.params.filename}`);
    next();
});

// ✅ Use Blog Routes
app.use("/api", blogRoutes);

// ✅ Catch-all Route for Undefined Routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
