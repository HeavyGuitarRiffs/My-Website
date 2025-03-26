const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
    title: String,
    content: String,
    coverImage: String, // Stores image URL
    views: { type: Number, default: 0 },
    date: { type: String, default: () => new Date().toLocaleString() }
}, { timestamps: true }); // ✅ Corrected placement of timestamps

module.exports = mongoose.model("Blog", BlogSchema, "blogs_main");
