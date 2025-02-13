require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/blogDB";

// ✅ Ensure `/uploads` folder exists
if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads", { recursive: true });
}

// ✅ Set up Multer for image uploads
const storage = multer.diskStorage({
    destination: "./uploads", // ✅ Save images here
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});
const upload = multer({ storage });

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Define Blog Schema & Model (Ensures Consistency)
const BlogSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: String,
    imageUrl: String,
    views: { type: Number, default: 0 },
    reads: { type: Number, default: 0 }
});
const Blog = mongoose.model("Blog", BlogSchema);

// ✅ Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // ✅ Serve images
app.use(express.static(path.join(__dirname, "public"))); // ✅ Serve frontend files

// ✅ Create Blog Post
app.post("/api/blogs", upload.single("image"), async (req, res) => {
    console.log("📤 Uploading Image:", req.file);
    console.log("📝 Blog Data:", req.body);

    if (!req.file) {
        return res.status(400).json({ error: "❌ Image upload failed. No file received." });
    }

    try {
        const { title, content, author } = req.body;
        if (!title || !content || !author) {
            return res.status(400).json({ error: "❌ Missing title, content, or author." });
        }

        // ✅ Correct image URL to be fully accessible
        const imageUrl = `/uploads/${req.file.filename}`;

        const blog = new Blog({ title, content, author, imageUrl });
        await blog.save();

        console.log("✅ Blog Post Saved:", blog);
        res.status(201).json(blog);
    } catch (err) {
        console.error("❌ Error Saving Blog:", err);
        res.status(500).json({ error: "❌ Could not save blog" });
    }
});

// ✅ Get All Blog Posts
app.get("/api/blogs", async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.json(blogs);
    } catch (err) {
        console.error("❌ Error Fetching Blogs:", err);
        res.status(500).json({ error: "❌ Could not fetch blogs" });
    }
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
