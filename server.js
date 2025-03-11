const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const os = require("os");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ** Middleware **
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors({ origin: "*" }));

// ** Serve Static Files **
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use("/uploads", express.static(uploadDir));
app.use(express.static(path.join(__dirname, "public")));

// ** Content Security Policy Middleware **
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; object-src 'none';"
    );
    next();
});

// ** MongoDB Connection **
if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing from .env file.");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });

// ** Blog Schema & Model **
const BlogSchema = new mongoose.Schema({
    title: String,
    content: String,
    coverImage: String, // Stores image URL
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    date: { type: String, default: () => new Date().toLocaleString() }
});

const Blog = mongoose.model("Blog", BlogSchema);

// ** Image Upload Configuration **
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
        if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Invalid file type. Only JPEG, PNG, and GIF allowed."));
    }
});

// ** API Routes **

// ✅ 1. Get all blogs
app.get("/api/blogs", async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        console.error("❌ Error fetching blogs:", error);
        res.status(500).json({ error: "Server Error" });
    }
});

// ✅ 2. Get a single blog by ID
app.get("/api/blogs/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: "Blog not found" });

        blog.views += 1;
        await blog.save();
        res.json(blog);
    } catch (error) {
        console.error("❌ Error fetching blog post:", error);
        res.status(500).json({ error: "Server Error" });
    }
});

// ✅ 3. Create a blog post (with optional image upload)
app.post("/api/blogs", upload.single("coverImage"), async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) return res.status(400).json({ error: "Title and content are required" });

        const coverImagePath = req.file ? `/uploads/${req.file.filename}` : null;
        const newBlog = new Blog({ title, content, coverImage: coverImagePath });

        await newBlog.save();
        res.status(201).json(newBlog);
    } catch (error) {
        console.error("❌ Error creating blog post:", error);
        res.status(500).json({ error: "Error creating blog post" });
    }
});

// ✅ 4. Delete a blog post
app.delete("/api/blogs/:id", async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if (!deletedBlog) return res.status(404).json({ error: "Blog not found" });

        if (deletedBlog.coverImage) {
            const filePath = path.join(__dirname, deletedBlog.coverImage);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        res.json({ message: "Blog deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting blog post:", error);
        res.status(500).json({ error: "Error deleting blog post" });
    }
});

// ✅ 5. Update a blog post
app.patch("/api/blogs/:id", async (req, res) => {
    try {
        const { title, content, coverImage } = req.body;
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id, { title, content, coverImage }, { new: true }
        );

        if (!updatedBlog) return res.status(404).json({ error: "Blog not found" });
        res.json(updatedBlog);
    } catch (error) {
        console.error("❌ Error updating blog post:", error);
        res.status(500).json({ error: "Error updating blog post" });
    }
});

// ** Start Server **
app.listen(PORT, "0.0.0.0", () => {
    const networkInterfaces = os.networkInterfaces();
    let localIP = "localhost";

    Object.values(networkInterfaces).forEach((interfaces) => {
        interfaces?.forEach((iface) => {
            if (iface.family === "IPv4" && !iface.internal) {
                localIP = iface.address;
            }
        });
    });

    console.log(`🚀 Server running on:
- Local:    http://localhost:${PORT}
- Network:  http://${localIP}:${PORT} (Try this on your phone)`);
});
