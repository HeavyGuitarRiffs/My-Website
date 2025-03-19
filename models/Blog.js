const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
    title: String,
    content: String,
    coverImage: String,
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Prevent redefining the model
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

module.exports = Blog;
