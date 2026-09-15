/* ============================================================
   BLOG ENGINE — powers blog.html (list) and post.html (article)
   ------------------------------------------------------------
   Same guarded pattern as always: this file checks which root
   exists and runs only that job.
     #blog-root -> the list: featured post, category chips,
                   search box, post grid
     #post-root -> one article: hero, body blocks, author card,
                   share row, related posts
   ============================================================ */

const blogRoot = document.getElementById("blog-root");
const postRoot = document.getElementById("post-root");

/* small shared helpers (self-contained: pages don't load
   classroom.js or space.js) */
function blogEsc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}
function blogAgo(days) {
    if (days < 1) return "today";
    if (days === 1) return "1 day ago";
    if (days < 30) return days + " days ago";
    const months = Math.round(days / 30);
    return months === 1 ? "1 month ago" : months + " months ago";
}
function blogDate(post) {
    return new Date(Date.now() - post.daysAgo * 24 * 60 * 60000)
        .toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
}
function authorChip(post, small) {
    return `
    <span class="blog-author ${small ? "is-small" : ""}">
        <span class="msg-avatar" style="background:${blogEsc(post.author.color)}">${blogEsc(post.author.name.trim().charAt(0).toUpperCase())}</span>
        <span>${blogEsc(post.author.name)} · ${blogEsc(post.author.role)}</span>
    </span>`;
}

/* ============ BLOG LIST (blog.html) ============ */
if (blogRoot) {
    const params = new URLSearchParams(location.search);
    let activeCat = params.get("cat") || "All";
    let query = "";

    /* category chips */
    const chips = document.getElementById("blog-chips");
    if (chips) {
        chips.innerHTML = BLOG_CATEGORIES.map(cat => `
            <button type="button" class="blog-chip ${cat === activeCat ? "is-active" : ""}"
                    data-cat="${blogEsc(cat)}">${blogEsc(cat)}</button>`).join("");
        chips.addEventListener("click", (event) => {
            const btn = event.target.closest("[data-cat]");
            if (!btn) return;
            activeCat = btn.dataset.cat;
            chips.querySelectorAll(".blog-chip").forEach(b =>
                b.classList.toggle("is-active", b === btn));
            renderList();
        });
    }

    /* search box */
    const search = document.getElementById("blog-search");
    if (search) {
        search.addEventListener("input", () => {
            query = search.value.trim().toLowerCase();
            renderList();
        });
    }

    function filtered() {
        return BLOG_POSTS.filter(p =>
            (activeCat === "All" || p.category === activeCat) &&
            (!query ||
                p.title.toLowerCase().includes(query) ||
                p.excerpt.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query) ||
                p.tags.some(t => t.toLowerCase().includes(query))));
    }

    function cardHtml(post) {
        return `
        <a class="blog-card" href="post.html?slug=${encodeURIComponent(post.slug)}">
            <div class="blog-card-cover ${blogEsc(post.grad)}">
                <span class="blog-card-cat">${blogEsc(post.category)}</span>
            </div>
            <div class="blog-card-body">
                <h3>${blogEsc(post.title)}</h3>
                <p>${blogEsc(post.excerpt)}</p>
                <p class="blog-card-meta">${blogEsc(post.author.name)} &middot;
                   ${blogDate(post)} &middot; ${post.readMinutes} min read</p>
            </div>
        </a>`;
    }

    function renderList() {
        const list = filtered();
        const featuredBox = document.getElementById("blog-featured");
        const grid = document.getElementById("blog-grid");
        const count = document.getElementById("blog-count");
        if (count) {
            count.textContent = list.length + (list.length === 1 ? " article" : " articles");
        }

        /* featured = newest of the CURRENT filter, but only in the
           unfiltered view (search/filter results show plain cards) */
        const showFeatured = activeCat === "All" && !query && list.length > 0;
        if (featuredBox) {
            if (showFeatured) {
                const post = list[0];
                featuredBox.innerHTML = `
                <a class="blog-featured ${blogEsc(post.grad)}" href="post.html?slug=${encodeURIComponent(post.slug)}">
                    <div class="blog-featured-inner">
                        <span class="blog-card-cat">Featured · ${blogEsc(post.category)}</span>
                        <h2>${blogEsc(post.title)}</h2>
                        <p>${blogEsc(post.excerpt)}</p>
                        <p class="blog-card-meta">${blogEsc(post.author.name)} &middot;
                           ${blogDate(post)} &middot; ${post.readMinutes} min read</p>
                    </div>
                </a>`;
            } else {
                featuredBox.innerHTML = "";
            }
        }

        const rest = showFeatured ? list.slice(1) : list;
        if (grid) {
            grid.innerHTML = rest.length ? rest.map(cardHtml).join("")
                : '<p class="space-empty-inline">Nothing matches that search.</p>';
        }
    }

    renderList();
}

/* ============ ONE ARTICLE (post.html) ============ */
if (postRoot) {
    const params = new URLSearchParams(location.search);
    const slug = params.get("slug");
    const post = BLOG_POSTS.find(p => p.slug === slug);

    if (!post) {
        postRoot.innerHTML = `
        <section class="section">
            <div class="container">
                <div class="card not-found-card">
                    <h2>Article not found</h2>
                    <p>That link doesn't point to an article we know.
                       The blog index has everything we've published.</p>
                    <a class="btn btn-primary" href="blog.html">Back to the blog</a>
                </div>
            </div>
        </section>`;
    } else {
        document.title = post.title + " | The English Academy";

        /* render one body block */
        function blockHtml(block) {
            if (block.h) return `<h2>${blogEsc(block.h)}</h2>`;
            if (block.p) return `<p>${blogEsc(block.p)}</p>`;
            if (block.list) return `<ul>${block.list.map(li =>
                `<li>${blogEsc(li)}</li>`).join("")}</ul>`;
            if (block.quote) return `
                <blockquote>
                    <p>${blogEsc(block.quote.text)}</p>
                    <cite>— ${blogEsc(block.quote.by)}</cite>
                </blockquote>`;
            if (block.tip) return `<div class="post-tip"><strong>Tip:</strong> ${blogEsc(block.tip)}</div>`;
            return "";
        }

        const related = BLOG_POSTS
            .filter(p => p.slug !== post.slug && p.category === post.category)
            .slice(0, 2);

        postRoot.innerHTML = `
        <section class="hero hero-sm post-hero ${blogEsc(post.grad)}">
            <div class="container">
                <p class="course-kicker">${blogEsc(post.category)}</p>
                <h1>${blogEsc(post.title)}</h1>
                <p class="hero-subtitle">${blogEsc(post.excerpt)}</p>
                <p class="blog-card-meta is-light">
                    ${blogEsc(post.author.name)} &middot; ${blogDate(post)} &middot;
                    ${post.readMinutes} min read</p>
            </div>
        </section>

        <section class="section">
            <div class="container post-layout">
                <article class="post-body">
                    ${post.blocks.map(blockHtml).join("")}

                    <div class="post-share">
                        <span class="muted small">Share this article:</span>
                        <button type="button" class="btn btn-ghost btn-small" id="post-copy">
                            Copy link</button>
                        <a class="btn btn-ghost btn-small" href="contact.html">Write to us</a>
                    </div>
                </article>

                <aside class="card post-side">
                    <h3>Written by</h3>
                    ${authorChip(post)}
                    <p class="muted small">${blogEsc(post.author.role)} at The English Academy.</p>
                    <div class="post-tags">
                        ${post.tags.map(t => `<span class="meta-pill">#${blogEsc(t)}</span>`).join("")}
                    </div>
                    <a class="btn btn-ghost btn-block btn-small" href="blog.html">&larr; Back to the blog</a>
                </aside>
            </div>
        </section>

        ${related.length ? `
        <section class="section section-alt">
            <div class="container">
                <h2 class="section-title">More in ${blogEsc(post.category)}</h2>
                <div class="blog-grid">
                    ${related.map(p => `
                    <a class="blog-card" href="post.html?slug=${encodeURIComponent(p.slug)}">
                        <div class="blog-card-cover ${blogEsc(p.grad)}">
                            <span class="blog-card-cat">${blogEsc(p.category)}</span>
                        </div>
                        <div class="blog-card-body">
                            <h3>${blogEsc(p.title)}</h3>
                            <p>${blogEsc(p.excerpt)}</p>
                            <p class="blog-card-meta">${blogDate(p)} &middot; ${p.readMinutes} min read</p>
                        </div>
                    </a>`).join("")}
                </div>
            </div>
        </section>` : ""}`;

        /* copy-link button (demo-safe: clipboard API needs https or
           localhost; file:// falls back to a prompt-free message) */
        const copyBtn = document.getElementById("post-copy");
        if (copyBtn) {
            copyBtn.addEventListener("click", () => {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(location.href).then(
                        () => { copyBtn.textContent = "Copied!"; },
                        () => { copyBtn.textContent = "Copy failed"; });
                } else {
                    copyBtn.textContent = "Copy the URL above";
                }
                setTimeout(() => { copyBtn.textContent = "Copy link"; }, 2000);
            });
        }
    }
}
