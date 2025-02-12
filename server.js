require("dotenv").config(); // Load environment variables at the top


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000; // Use environment variable for port if available

// ** Middleware **
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable cross-origin requests
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded images

// ** Connect to MongoDB Using Env Variable **
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Connection Error:", err));
