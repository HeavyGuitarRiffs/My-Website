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

// ✅ Save Blog Post (Now Sends to Backend API)
async function saveBlogPost() {
    const title = document.getElementById("blogTitle").value;
    const content = document.getElementById("blogContent").value;

    if (!title || !content || title.trim() === "" || content.trim() === "") {
        alert("Please enter both a title and content.");
        return;
    }

    const formData = { title, content };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert("Blog post saved successfully!");
            document.getElementById("blogTitle").value = "";
            document.getElementById("blogContent").value = "";
            fetchBlogs(); // Reload the blog list
        } else {
            alert("Error saving blog post!");
        }
    } catch (error) {
        console.error("Error uploading blog:", error);
        alert("Something went wrong!");
    }
}

// ✅ Load Blog Posts (Now Fetches from API)
async function fetchBlogs() {
    const blogPostsDiv = document.getElementById("blogPosts");
    if (!blogPostsDiv) return;

    blogPostsDiv.innerHTML = "<p>Loading...</p>";

    try {
        const response = await fetch(API_URL);
        const blogs = await response.json();

        blogPostsDiv.innerHTML = "";
        blogs.forEach(blog => {
            let postDiv = document.createElement("div");
            postDiv.classList.add("blog-post");
            postDiv.innerHTML = `
                <h3>${blog.title}</h3>
                <p>${blog.content}</p>
                <button onclick="deletePost('${blog._id}')">Delete</button>
            `;
            blogPostsDiv.appendChild(postDiv);
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        blogPostsDiv.innerHTML = "<p>Error loading blog posts.</p>";
    }
}

// ✅ Delete Blog Post (Sends DELETE Request)
async function deletePost(id) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Blog deleted successfully!");
            fetchBlogs(); // Reload the blog list
        } else {
            alert("Error deleting blog post!");
        }
    } catch (error) {
        console.error("Error deleting blog:", error);
        alert("Something went wrong!");
    }
}
