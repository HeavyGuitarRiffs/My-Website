const API_URL = "https://your-project-name.up.railway.app/api/blogs";

// ✅ Run functions when page loads
document.addEventListener("DOMContentLoaded", () => {
    fetchBlogs(); // Load existing blogs
    setupBlogForm(); // Handle blog creation
});

// 📌 Fetch and display all blog posts
async function fetchBlogs() {
    try {
        const response = await fetch(API_URL);
        const blogs = await response.json();
        const blogList = document.getElementById("blog-list");

        blogList.innerHTML = blogs.map(blog => `
            <div class="blog-item">
                <h2>${blog.title}</h2>
                <p>${blog.content.substring(0, 150)}...</p>
                ${blog.coverImage ? `<img src="${API_URL.replace('/api/blogs', '')}${blog.coverImage}" class="cover-img">` : ""}
                <button onclick="deletePost('${blog._id}')">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error fetching blogs:", error);
    }
}

// 📌 Handle Blog Post Submission
function setupBlogForm() {
    document.getElementById("savePostButton").addEventListener("click", async function (e) {
        e.preventDefault();

        const title = document.getElementById("blogTitle").value;
        const content = document.getElementById("blogContent").value;
        const coverImageInput = document.getElementById("coverImage");

        if (!title.trim() || !content.trim()) {
            alert("Please enter both a title and content.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        if (coverImageInput.files.length > 0) {
            formData.append("coverImage", coverImageInput.files[0]);
        }

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                alert("Blog post saved successfully!");
                document.getElementById("blogTitle").value = "";
                document.getElementById("blogContent").value = "";
                document.getElementById("coverImage").value = "";
                fetchBlogs();
            } else {
                alert("Error saving blog post!");
            }
        } catch (error) {
            console.error("Error uploading blog:", error);
        }
    });
}

// 📌 Delete a Blog Post
async function deletePost(blogId) {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
        const response = await fetch(`${API_URL}/${blogId}`, { method: "DELETE" });

        if (response.ok) {
            alert("Blog post deleted.");
            fetchBlogs(); // Refresh blog list
        } else {
            alert("Error deleting blog post.");
        }
    } catch (error) {
        console.error("Error deleting blog:", error);
    }
}
