require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const blogRoutes = require("./routes/blogRoutes"); // Import routes

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Ensure MONGO_URI is set
if (!process.env.MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is not defined in .env");
    process.exit(1); // Stop the server
}

// ✅ **Connect to MongoDB**
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
.then(() => console.log("✅ MongoDB Connected Successfully"))
.catch(err => console.log("❌ MongoDB Connection Error:", err));

// ✅ **Middleware**
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable CORS

// ✅ **Serve Static Files**
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded images
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend files

// ✅ **Use API Routes**
app.use("/api", blogRoutes); // Prefix all blog routes with "/api"

// ✅ **Test API Route**
app.get("/api/test", (req, res) => {
    res.json({ message: "API is working!" });
});

// ✅ **Serve the Frontend**
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ **Start Server Once**
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

