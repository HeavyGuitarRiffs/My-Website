require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000; // Use environment variable for port if available

// ✅ **Connect to MongoDB**
mongoose.connect(`${process.env.MONGO_URI}?tls=true`, {
    serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds if no connection
})
.then(() => console.log("✅ MongoDB Connected Successfully"))
.catch(err => console.log("❌ MongoDB Connection Error:", err));

// ✅ **Middleware**
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable cross-origin requests
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded images

// ✅ **Serve Static Files (Frontend)**
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from "public" directory
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ **API Routes (Define Your API Endpoints Below)**
app.get("/api/test", (req, res) => {
    res.json({ message: "API is working!" });
});

// Add more API routes here as needed...

// ✅ **Start the Server**
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
