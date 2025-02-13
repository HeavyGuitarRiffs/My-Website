require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const blogRoutes = require("./routes/blogRoutes");

const app = express();
const PORT = process.env.PORT || 5000; // ✅ Use Railway's dynamic port
const MONGO_URI = process.env.MONGO_URI;

// ✅ Debugging Logs: Environment Check
console.log("🚀 Starting server...");
console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`🔌 PORT: ${PORT}`);
console.log(`📡 MONGO_URI: ${MONGO_URI ? "Defined" : "Not Defined (Check .env)"}`);

// ✅ Ensure MONGO_URI is set
if (!MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is not defined in .env");
    process.exit(1);
}

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });

// ✅ Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable CORS

// ✅ Serve Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded images
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend files

// ✅ Use API Routes
app.use("/api", blogRoutes);

// ✅ Test API Route
app.get("/api/test", (req, res) => {
    console.log("📢 Test route accessed!");
    res.json({ message: "API is working!" });
});

// ✅ Serve the Frontend
app.get("/", (req, res) => {
    console.log("📢 Frontend served at /");
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Start Server with Logging
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
