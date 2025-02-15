const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
        type: String,
        required: [true, "Content is required"],
        trim: true,
        minlength: [10, "Content must be at least 10 characters long"],
    },
    author: {
        type: String,
        required: [true, "Author name is required"],
        trim: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    views: { 
        type: Number, 
        default: 0,
    },
    reads: { 
        type: Number, 
        default: 0,
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        index: true, 
    },
});

// Auto-increment views when reading a blog
blogSchema.pre("findOneAndUpdate", function (next) {
    if (this.getUpdate().$inc?.views === undefined) {
        this.updateOne({}, { $inc: { views: 1 } });
    }
    next();
});

module.exports = mongoose.model("Blog", blogSchema);
