document.addEventListener("DOMContentLoaded", function () {
    setupPageTransitions();
    loadBlogs(); // ✅ Load blogs on page load
});

/* 🌟 1. Page Transitions (Fade-out Effect) */
function setupPageTransitions() {
    const pageContent = document.querySelector(".page-content");

    document.querySelectorAll("nav a").forEach(link => {
        link.addEventListener("click", function (event) {
            if (this.href.includes(location.hostname)) { // Prevent external links
                event.preventDefault();
                
                pageContent.classList.add("fade-out");

                setTimeout(() => {
                    window.location.href = this.href;
                }, 400); // Wait for fade-out to complete
            }
        });
    });
}

/* 🌟 2. Blog API Integration */
const API_URL = "http://localhost:5000/api/blogs"; // ✅ Ensure this is your actual backend URL

// ✅ Save Blog Post (Handles Image Upload & Refreshes Automatically)
document.getElementById("blogForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent form from refreshing

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
    formData.append("image", imageFile);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`❌ Server Error: ${response.statusText}`);
        }

        // ✅ Remove alert box and trigger page refresh immediately
        location.reload(); 
    } catch (error) {
        console.error("❌ Error saving blog post:", error);
        alert("❌ Failed to save blog post.");
    }
});

// ✅ Load Blog Posts (Fetches from API & Displays Titles as Clickable Links)
async function loadBlogs() {
    const blogPostsDiv = document.getElementById("blog-list");
    if (!blogPostsDiv) {
        console.error("❌ ERROR: blog-list not found in the HTML!");
        return;
    }

    blogPostsDiv.innerHTML = "<p>Loading...</p>";

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch blog posts.");

        const blogs = await response.json();

        if (blogs.length === 0) {
            blogPostsDiv.innerHTML = "<p>No blog posts found.</p>";
            return;
        }

        blogPostsDiv.innerHTML = "";
        blogs.forEach(blog => {
            let postDiv = document.createElement("div");
            postDiv.classList.add("blog-item");
            
            postDiv.innerHTML = `
                <h3><a href="blogpost.html?id=${blog._id}">${blog.title}</a></h3>
                <button onclick="deletePost('${blog._id}')" style="background-color: black; color: black; border: 1px solid black; padding: 5px 10px; cursor: pointer;">🗑 Delete</button>
            `;
            blogPostsDiv.appendChild(postDiv);
        });
    } catch (error) {
        console.error("❌ Error fetching blogs:", error);
        blogPostsDiv.innerHTML = "<p>Error loading blog posts.</p>";
    }
}

// ✅ Delete Blog Post (Fixed Clickability & Functionality)
async function deletePost(id) {
    if (!confirm("⚠ Are you sure you want to delete this post?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

        if (!response.ok) {
            throw new Error("Failed to delete blog post.");
        }

        location.reload(); // ✅ Refresh the page instantly after deletion
    } catch (error) {
        console.error("❌ Error deleting blog:", error);
        alert("❌ Something went wrong while deleting the post.");
    }
}
