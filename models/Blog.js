const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: String, // Stores image URL
    views: { type: Number, default: 0 },
    date: { type: String, default: () => new Date().toLocaleString() }
}, { timestamps: true });

// ✅ Ensure the model is registered only once



module.exports = mongoose.model('Blog', blogSchema);