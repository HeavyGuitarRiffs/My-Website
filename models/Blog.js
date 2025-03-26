const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
    title: String,
    content: String,
    coverImage: String, // Stores image URL
    views: { type: Number, default: 0 },
    date: { type: String, default: () => new Date().toLocaleString() }
}, { timestamps: true });

// ✅ Ensure the model is registered only once
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

module.exports = Blog;
