document.addEventListener("DOMContentLoaded", async () => {
    const blogList = document.getElementById("blogList");

    try {
        const response = await fetch("/api/blogs");
        if (!response.ok) throw new Error("Failed to fetch blogs");

        const blogs = await response.json();
        blogList.innerHTML = ""; // Clear previous content if any

        blogs.forEach(blog => {
            const blogPost = document.createElement("div");
            blogPost.classList.add("blog-post");

            const title = document.createElement("h2");
            title.textContent = blog.title;

            const content = document.createElement("p");
            content.textContent = blog.content.substring(0, 100) + "...";

            const img = document.createElement("img");
            img.src = blog.coverImage ? blog.coverImage : "default-image.jpg"; // Fallback image
            img.alt = "Cover Image";
            img.width = 200;

            const views = document.createElement("p");
            views.textContent = `Views: ${blog.views}`;

            const link = document.createElement("a");
            link.href = `blog-details.html?id=${blog._id}`;
            link.textContent = "Read More";
            link.rel = "noopener";

            blogPost.appendChild(title);
            blogPost.appendChild(content);
            blogPost.appendChild(img);
            blogPost.appendChild(views);
            blogPost.appendChild(link);

            blogList.appendChild(blogPost);
        });
    } catch (error) {
        console.error("Error loading blogs:", error);
        blogList.innerHTML = "<p>Failed to load blogs. Please try again later.</p>";
    }
});
