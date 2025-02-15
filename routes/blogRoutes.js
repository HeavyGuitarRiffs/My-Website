const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Blog = require("../models/Blog");

const router = express.Router();

// ✅ Ensure `/uploads` directory exists
if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads", { recursive: true });
}

// ✅ Set up Multer for image uploads
const storage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage });

// ✅ Get all blog posts (sorted by newest first)
router.get("/blogs", async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ error: "Error fetching blogs" });
    }
});

// ✅ Get a single blog post by ID (increment views)
router.get("/blogs/:id", async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
        if (!blog) return res.status(404).json({ error: "Post not found" });

        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: "Error fetching post" });
    }
});

// ✅ Create a new blog post
router.post("/blogs", upload.single("image"), async (req, res) => {
    try {
        const { title, content, author } = req.body;
        if (!title || !content || !author || !req.file) {
            return res.status(400).json({ error: "All fields including image are required" });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        const newBlog = new Blog({ title, content, author, imageUrl });
        await newBlog.save();

        res.status(201).json(newBlog);
    } catch (error) {
        res.status(500).json({ error: "Error creating blog" });
    }
});

// ✅ Delete a blog post
router.delete("/blogs/:id", async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if (!deletedBlog) return res.status(404).json({ error: "Post not found" });

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting blog" });
    }
});

module.exports = router;
