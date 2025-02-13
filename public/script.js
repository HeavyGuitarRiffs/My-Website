document.addEventListener("DOMContentLoaded", function () {
    setupPageTransitions();
    fetchBlogs(); // Load blogs from API
});

/* 🌟 1. Page Transitions (Fade-out Effect) */
function setupPageTransitions() {
    const pageContent = document.querySelector(".page-content");

    document.querySelectorAll("nav a").forEach(link => {
        link.addEventListener("click", function (event) {
            if (this.href.includes(location.hostname)) { // Prevent external links
                event.preventDefault();
                
                // Apply fade-out class (defined in styles.css)
                pageContent.classList.add("fade-out");

                setTimeout(() => {
                    window.location.href = this.href;
                }, 400); // Wait for fade-out to complete
            }
        });
    });
}

/* 🌟 2. Blog API Integration */
const API_URL = "https://thorough-radiance-production.up.railway.app/api/blogs";

// ✅ Save Blog Post (Handles Image Upload)
document.getElementById("blogForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent form from refreshing page

    const title = document.getElementById("blogTitle").value.trim();
    const content = document.getElementById("blogContent").value.trim();
    const author = document.getElementById("blogAuthor").value.trim();
    const imageFile = document.getElementById("coverImage").files[0];

    if (!title || !content || !author || !imageFile) {
        alert("❌ Please fill in all fields and select an image.");
        return;
    }

    let formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("author", author);
    formData.append("image", imageFile); // ✅ Attach selected image

    console.log("📤 Submitting form data:", formData); // Debugging

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`❌ Server Error: ${response.statusText}`);
        }

        alert("✅ Blog post saved!");
        document.getElementById("blogForm").reset();
        fetchBlogs(); // Reload blog list
    } catch (error) {
        console.error("❌ Error saving blog post:", error);
        alert("❌ Failed to save blog post.");
    }
});

// ✅ Load Blog Posts (Now Fetches from API)
async function fetchBlogs() {
    const blogPostsDiv = document.getElementById("blogPosts");
    if (!blogPostsDiv) return;

    blogPostsDiv.innerHTML = "<p>Loading...</p>";

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch blog posts.");

        const blogs = await response.json();

        blogPostsDiv.innerHTML = "";
        blogs.forEach(blog => {
            let postDiv = document.createElement("div");
            postDiv.classList.add("blog-post");
            postDiv.innerHTML = `
                <h3>${blog.title}</h3>
                <p><strong>By:</strong> ${blog.author}</p>
                ${blog.imageUrl ? `<img src="${blog.imageUrl}" class="cover-img" alt="Blog Image">` : ""}
                <p>${blog.content}</p>
                <p><strong>Views:</strong> ${blog.views} | <strong>Reads:</strong> ${blog.reads}</p>
                <button onclick="deletePost('${blog._id}')">🗑 Delete</button>
            `;
            blogPostsDiv.appendChild(postDiv);
        });
    } catch (error) {
        console.error("❌ Error fetching blogs:", error);
        blogPostsDiv.innerHTML = "<p>Error loading blog posts.</p>";
    }
}

// ✅ Delete Blog Post (Sends DELETE Request)
async function deletePost(id) {
    if (!confirm("⚠ Are you sure you want to delete this post?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

        if (!response.ok) {
            throw new Error("Failed to delete blog post.");
        }

        alert("✅ Blog deleted successfully!");
        fetchBlogs(); // Reload the blog list
    } catch (error) {
        console.error("❌ Error deleting blog:", error);
        alert("❌ Something went wrong while deleting the post.");
    }
}

