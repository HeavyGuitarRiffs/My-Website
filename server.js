const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ** Middleware **
app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET", "POST", "PATCH", "DELETE"], allowedHeaders: ["Content-Type"] }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

// ** Ensure uploads directory exists **
const dir = path.join(__dirname, "uploads/");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

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
    coverImage: String,
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    date: { type: String, default: () => new Date().toLocaleString() }
});

const Blog = mongoose.model("Blog", BlogSchema);

// ** Multer Storage Configuration **
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
        allowedMimeTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error("Invalid file type."));
    }
});

// ** Routes **

// 📌 Get all blog posts
app.get("/api/blogs", async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs.map(blog => ({
            id: blog._id,
            title: blog.title,
            content: blog.content,
            coverImage: blog.coverImage,
            views: blog.views,
            createdAt: blog.createdAt,
            date: blog.date
        })));
    } catch (error) {
        console.error("❌ Error fetching blogs:", error);
        res.status(500).json({ error: "Server Error" });
    }
});

// 📌 Get a single blog post by ID & increase view count
app.get("/api/blogs/:id", async (req, res) => {
    try {
        const blogId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({ error: "Invalid blog ID format" });
        }

        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ error: "Post not found" });

        blog.views += 1;
        await blog.save();

        res.json({
            id: blog._id,
            title: blog.title,
            content: blog.content,
            coverImage: blog.coverImage,
            views: blog.views,
            createdAt: blog.createdAt,
            date: blog.date
        });
    } catch (error) {
        console.error("❌ Error fetching blog post:", error);
        res.status(500).json({ error: "Server Error" });
    }
});

// 📌 Create a new blog post
app.post("/api/blogs", upload.single("coverImage"), async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) return res.status(400).json({ error: "Title and content are required" });

        const coverImagePath = req.file ? `/uploads/${req.file.filename}` : null;
        const newBlog = new Blog({ title, content, coverImage: coverImagePath, date: new Date().toLocaleString() });

        await newBlog.save();

        res.status(201).json({
            id: newBlog._id,
            title: newBlog.title,
            content: newBlog.content,
            coverImage: newBlog.coverImage,
            views: newBlog.views,
            createdAt: newBlog.createdAt,
            date: newBlog.date
        });
    } catch (error) {
        console.error("❌ Error creating blog post:", error);
        res.status(500).json({ error: "Error creating blog post" });
    }
});

// 📌 Update a blog post
app.patch("/api/blogs/:id", async (req, res) => {
    try {
        const { title, content, coverImage } = req.body;
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            { title, content, coverImage },
            { new: true }
        );

        if (!updatedBlog) return res.status(404).json({ error: "Blog not found" });

        res.json({
            id: updatedBlog._id,
            title: updatedBlog.title,
            content: updatedBlog.content,
            coverImage: updatedBlog.coverImage,
            views: updatedBlog.views,
            createdAt: updatedBlog.createdAt,
            date: updatedBlog.date
        });
    } catch (error) {
        console.error("❌ Error updating blog post:", error);
        res.status(500).json({ error: "Error updating blog post" });
    }
});

// 📌 Delete a blog post
app.delete("/api/blogs/:id", async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if (!deletedBlog) return res.status(404).json({ error: "Blog not found" });

        // Delete associated image file
        if (deletedBlog.coverImage) {
            const filePath = path.join(__dirname, deletedBlog.coverImage);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        res.json({ message: "Blog deleted successfully", id: req.params.id });
    } catch (error) {
        console.error("❌ Error deleting blog post:", error);
        res.status(500).json({ error: "Error deleting blog post" });
    }
});

// ** Start Server **
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on http://0.0.0.0:${PORT}`));

