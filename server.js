document.addEventListener("DOMContentLoaded", function () {
    setupPageTransitions();
    loadBlogs(); // ✅ Ensure blogs load on page load
});

/* 🌟 Page Transitions (If Applicable) */
function setupPageTransitions() {
    const pageContent = document.querySelector(".page-content");
    if (!pageContent) return;

    document.querySelectorAll("nav a").forEach(link => {
        link.addEventListener("click", function (event) {
            if (this.href.includes(location.hostname)) {
                event.preventDefault();
                pageContent.classList.add("fade-out");

                setTimeout(() => {
                    window.location.href = this.href;
                }, 400);
            }
        });
    });
}

/* 🌟 Load Blog Posts and Display Them */
async function loadBlogs() {
    const blogPostsDiv = document.getElementById("blog-list");
    if (!blogPostsDiv) {
        console.error("❌ ERROR: blog-list not found in the HTML!");
        return;
    }

    blogPostsDiv.innerHTML = "<p>Loading...</p>";

    try {
        const response = await fetch("http://localhost:5000/api/blogs");
        if (!response.ok) throw new Error("Failed to fetch blog posts.");

        const blogs = await response.json();

        if (blogs.length === 0) {
            blogPostsDiv.innerHTML = "<p>No blog posts found.</p>";
            return;
        }

        // ✅ Sort posts by newest first
        blogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        blogPostsDiv.innerHTML = "";
        blogs.forEach(blog => {
            let postDiv = document.createElement("div");
            postDiv.classList.add("blog-item");

            let imageUrl = blog.imageUrl.startsWith("/uploads/")
                ? `http://localhost:5000${blog.imageUrl}`
                : blog.imageUrl;

            postDiv.innerHTML = `
                <h3><a href="blogpost.html?id=${blog._id}" style="text-decoration: none; color: black;">${blog.title}</a></h3>
                <img src="${imageUrl}" class="cover-img-small" alt="Blog Image">
                <p><strong>Author:</strong> ${blog.author}</p>
                <p><strong>Views:</strong> ${blog.views}</p>
                <button onclick="editPost('${blog._id}')">✏️ Edit</button>
                <button onclick="deletePost('${blog._id}')">🗑 Delete</button>
            `;
            blogPostsDiv.appendChild(postDiv);
        });

    } catch (error) {
        console.error("❌ Error fetching blogs:", error);
        blogPostsDiv.innerHTML = "<p>Error loading blog posts.</p>";
    }
}
