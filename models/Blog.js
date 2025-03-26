const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        coverImage: { type: String, default: "" }, // Default empty string to prevent undefined issues
        views: { type: Number, default: 0 }
    },
    { timestamps: true } // ✅ Ensures createdAt & updatedAt fields
);

// Prevent redefining the model
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

module.exports = Blog;
