document.addEventListener("DOMContentLoaded", function () {
    setupPageTransitions();
    loadBlogPosts();
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

/* 🌟 2. Blog Post Handling (Save & Load) */
function saveBlogPost() {
    const title = document.getElementById("blogTitle")?.value;
    const content = document.getElementById("blogContent")?.value;

    if (!title || !content || title.trim() === "" || content.trim() === "") {
        alert("Please enter both a title and content.");
        return;
    }

    let posts = JSON.parse(localStorage.getItem("blogPosts")) || [];
    posts.push({ title, content, date: new Date().toISOString() });

    // Sort posts alphabetically by title
    posts.sort((a, b) => a.title.localeCompare(b.title));

    localStorage.setItem("blogPosts", JSON.stringify(posts));
    loadBlogPosts();

    // Clear input fields
    document.getElementById("blogTitle").value = "";
    document.getElementById("blogContent").value = "";
}

function loadBlogPosts() {
    const blogPostsDiv = document.getElementById("blogPosts");
    if (!blogPostsDiv) return; // Prevent errors if the blog page is not loaded

    blogPostsDiv.innerHTML = "";

    let posts = JSON.parse(localStorage.getItem("blogPosts")) || [];

    posts.forEach(post => {
        let postDiv = document.createElement("div");
        postDiv.classList.add("blog-post");
        postDiv.innerHTML = `<h3>${post.title}</h3><p>${post.content}</p>`;
        blogPostsDiv.appendChild(postDiv);
    });
}
