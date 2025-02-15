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

// ✅ Multer Setup for Image Uploads
const storage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});
const upload = multer({ storage });

// ✅ Get all blog posts (Sorted Newest to Oldest)
router.get("/blogs", async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        console.error("❌ Error fetching blogs:", error);
        res.status(500).json({ error: "Error fetching blogs" });
    }
});

// ✅ Get a single blog post by ID (Auto-Increment Views)
router.get("/blogs/:id", async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });

        if (!blog) return res.status(404).json({ error: "Post not found" });

        res.json(blog);
    } catch (error) {
        console.error("❌ Error fetching post:", error);
        res.status(500).json({ error: "Error fetching post" });
    }
});

// ✅ Create a New Blog Post with Image Upload
router.post("/blogs", upload.single("image"), async (req, res) => {
    try {
        const { title, content, author } = req.body;

        if (!title || !content || !author) {
            return res.status(400).json({ error: "Title, content, and author are required" });
        }

        const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

        const newBlog = new Blog({ title, content, author, imageUrl });
        await newBlog.save();

        res.status(201).json(newBlog);
    } catch (error) {
        console.error("❌ Error saving blog:", error);
        res.status(500).json({ error: "Error creating blog" });
    }
});

// ✅ Update a Blog Post by ID
router.put("/blogs/:id", async (req, res) => {
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedBlog) return res.status(404).json({ error: "Post not found" });

        res.json(updatedBlog);
    } catch (error) {
        console.error("❌ Error updating blog:", error);
        res.status(500).json({ error: "Error updating blog" });
    }
});

// ✅ Delete a Blog Post by ID
router.delete("/blogs/:id", async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if (!deletedBlog) return res.status(404).json({ error: "Post not found" });

        res.json({ message: "Post deleted" });
    } catch (error) {
        console.error("❌ Error deleting blog:", error);
        res.status(500).json({ error: "Error deleting blog" });
    }
});

module.exports = router;
