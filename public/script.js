document.addEventListener("DOMContentLoaded", function () {
    loadBlogs(); // ✅ Load blogs on page load
});

const API_URL = "http://localhost:5000/api/blogs";

// ✅ Load Blog Posts
async function loadBlogs() {
    const blogPostsDiv = document.getElementById("blog-list");
    if (!blogPostsDiv) {
        console.error("❌ ERROR: blog-list not found in the HTML!");
        return;
    }

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("❌ Failed to fetch blog posts.");

        const blogs = await response.json();

        if (blogs.length === 0) {
            blogPostsDiv.innerHTML = "<p>No blog posts found.</p>";
            return;
        }

        // ✅ Sort posts from newest to oldest
        blogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        blogPostsDiv.innerHTML = "";
        blogs.forEach(blog => {
            let postDiv = document.createElement("div");
            postDiv.classList.add("blog-item");

            let imageUrl = blog.imageUrl.startsWith("/uploads/")
                ? `http://localhost:5000${blog.imageUrl}`
                : "default-image.png"; // Fallback image if missing

            postDiv.innerHTML = `
                <h3><a href="blogpost.html?id=${blog._id}" class="blog-title">${blog.title}</a></h3>
                <img src="${imageUrl}" class="cover-img-small" alt="Blog Image">
                <p><strong>👁 Views:</strong> ${blog.views} | <strong>📖 Reads:</strong> ${blog.reads}</p>
                <button class="delete-btn" onclick="deletePost('${blog._id}')">🗑 Delete</button>
            `;
            blogPostsDiv.appendChild(postDiv);
        });

    } catch (error) {
        console.error("❌ Error fetching blogs:", error);
        blogPostsDiv.innerHTML = "<p>Error loading blog posts.</p>";
    }
}

// ✅ Delete Blog Post
async function deletePost(id) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("❌ Failed to delete blog post.");

        alert("✅ Blog post deleted successfully!");
        loadBlogs(); // ✅ Refresh posts list
    } catch (error) {
        console.error("❌ Error deleting blog post:", error);
        alert("❌ Error deleting blog post. Try again.");
    }
}
