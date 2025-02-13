require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const blogRoutes = require("./routes/blogRoutes");
const Blog = require("./models/Blog"); // ✅ Ensure the Blog model is imported

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Debugging Logs: Environment Check
console.log("🚀 Starting server...");
console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`🔌 PORT: ${PORT}`);
console.log(`📡 MONGO_URI: ${MONGO_URI ? "Defined" : "Not Defined (Check .env)"}`);

// ✅ Ensure /uploads folder exists
if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads", { recursive: true });
}

// ✅ Setup Multer Storage
const storage = multer.diskStorage({
    destination: "./uploads", // ✅ Images are saved here
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});
const upload = multer({ storage });

// ✅ Ensure MONGO_URI is set
if (!MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is not defined in .env");
    process.exit(1);
}

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });

// ✅ Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable CORS
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded images
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend files

// ✅ Handle Blog Post Creation (Image Upload + Save to MongoDB)
app.post("/api/blogs", upload.single("image"), async (req, res) => {
    console.log("📸 Received File:", req.file);
    console.log("📝 Received Data:", req.body);

    if (!req.file) {
        return res.status(400).json({ error: "❌ Image upload failed. No file received." });
    }

    try {
        const { title, content, author } = req.body;
        const imageUrl = `/uploads/${req.file.filename}`; // ✅ Save image path

        const blog = new Blog({ title, content, author, imageUrl });
        await blog.save();
        console.log("✅ Blog Post Saved:", blog);

        res.status(201).json(blog);
    } catch (err) {
        console.error("❌ Error Saving Blog:", err);
        res.status(500).json({ error: "❌ Could not save blog" });
    }
});

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

// ✅ Start Server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
