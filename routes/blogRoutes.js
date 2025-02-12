const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog"); // Import Blog model

// ✅ Get all blog posts (sorted by newest first)
router.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: "Error fetching blogs" });
  }
});

// ✅ Get a single blog post by ID and track views
router.get("/api/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Post not found" });

    blog.views += 1; // Increment views count
    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: "Error fetching post" });
  }
});

// ✅ Create a new blog post
router.post("/api/blogs", async (req, res) => {
  try {
    const { title, content, coverImage } = req.body;

    // Basic validation
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const newBlog = new Blog({ title, content, coverImage });
    await newBlog.save();
    res.status(201).json({ message: "Blog saved!", post: newBlog });
  } catch (error) {
    res.status(500).json({ error: "Error creating blog" });
  }
});

// ✅ Update a blog post by ID
router.put("/api/blogs/:id", async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return updated document
      runValidators: true, // Ensure validation rules are enforced
    });

    if (!updatedBlog) return res.status(404).json({ error: "Post not found" });

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ error: "Error updating blog" });
  }
});

// ✅ Delete a blog post by ID
router.delete("/api/blogs/:id", async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) return res.status(404).json({ error: "Post not found" });

    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting blog" });
  }
});

module.exports = router;
