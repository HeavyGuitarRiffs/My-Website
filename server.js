require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const blogRoutes = require("./routes/blogRoutes");
const multer = require("multer");
const app = express();
const PORT = process.env.PORT || 5000; // ✅ Use Railway's dynamic port
const MONGO_URI = process.env.MONGO_URI;

// ✅ Setup storage for images
const storage = multer.diskStorage({
    destination: "./uploads", // ✅ Images will be saved here
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});
const upload = multer({ storage });

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

    app.post("/api/blogs", upload.single("image"), async (req, res) => {
        try {
            const { title, content, author } = req.body;
            const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // ✅ Save image path
    
            const blog = new Blog({ title, content, author, imageUrl });
            await blog.save();
            res.status(201).json(blog);
        } catch (err) {
            res.status(500).json({ error: "❌ Could not save blog" });
        }
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

