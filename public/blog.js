document.addEventListener("DOMContentLoaded", async () => {
    const blogList = document.getElementById("blogList");

    try {
        const response = await fetch("/api/blogs"); // Adjust the API route if needed
        if (!response.ok) throw new Error("Failed to fetch blogs");

        const blogs = await response.json();
        blogList.innerHTML = blogs.map(blog => `
            <div class="blog-post">
                <h2>${blog.title}</h2>
                <p>${blog.content.substring(0, 100)}...</p>
                <img src="${blog.coverImage}" alt="Cover Image" width="200">
                <p>Views: ${blog.views}</p>
                <a href="blog-details.html?id=${blog._id}">Read More</a>
            </div>
        `).join("");
    } catch (error) {
        console.error("Error loading blogs:", error);
    }
});
