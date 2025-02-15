document.addEventListener("DOMContentLoaded", function () {
    loadBlogs();
});

const API_URL = "http://localhost:5000/api/blogs";

// ✅ Load Blog Posts
async function loadBlogs() {
    const blogPostsDiv = document.getElementById("blog-list");
    if (!blogPostsDiv) return;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch blog posts.");

        const blogs = await response.json();

        blogPostsDiv.innerHTML = "";
        blogs.forEach(blog => {
            let postDiv = document.createElement("div");
            postDiv.classList.add("blog-item");

            let imageUrl = `http://localhost:5000${blog.imageUrl}`;

            postDiv.innerHTML = `
                <h3><a href="blogpost.html?id=${blog._id}" class="blog-title">${blog.title}</a></h3>
                <img src="${imageUrl}" class="cover-img-small" alt="Blog Image">
                <p><strong>Views:</strong> ${blog.views} | <strong>Reads:</strong> ${blog.reads}</p>
                <button onclick="deletePost('${blog._id}')">🗑 Delete</button>
            `;
            blogPostsDiv.appendChild(postDiv);
        });

    } catch (error) {
        console.error("❌ Error fetching blogs:", error);
    }
}

// ✅ Delete Blog Post
async function deletePost(id) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete blog post.");

        loadBlogs(); // Refresh posts list
    } catch (error) {
        console.error("❌ Error deleting blog post:", error);
    }
}
