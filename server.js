const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

// ** Middleware **
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable cross-origin requests
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded images

// ** Connect to MongoDB **
mongoose.connect("mongodb+srv://Just214:goldenin89@serverlessinstance0.hrofcqp.mongodb.net/?retryWrites=true&w=majority&appName=ServerlessInstance0", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// ** Blog Schema & Model **
const BlogSchema = new mongoose.Schema({
    title: String,
    content: String,
    coverImage: String,
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Blog = mongoose.model("Blog", BlogSchema);

// ** Image Upload Configuration **
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

// ** Routes **

// 📌 Get all blog posts
app.get("/api/blogs", async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

// 📌 Get a single blog post by ID & increase view count
app.get("/api/blogs/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (blog) {
            blog.views += 1;
            await blog.save();
            res.json(blog);
        } else {
            res.status(404).json({ error: "Blog not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

// 📌 Create a new blog post with optional image upload
app.post("/api/blogs", upload.single("coverImage"), async (req, res) => {
    try {
        const { title, content } = req.body;
        const newBlog = new Blog({
            title,
            content,
            coverImage: req.file ? `/uploads/${req.file.filename}` : null
        });

        await newBlog.save();
        res.status(201).json(newBlog);
    } catch (error) {
        res.status(500).json({ error: "Error creating blog post" });
    }
});

// 📌 Delete a blog post
app.delete("/api/blogs/:id", async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if (!deletedBlog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        // Delete associated image file if it exists
        if (deletedBlog.coverImage) {
            const filePath = path.join(__dirname, deletedBlog.coverImage);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.json({ message: "Blog deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting blog post" });
    }
});

// ** Start Server **
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
