/* ============================================================
   COURSE DETAIL SCRIPT — fills course.html
   ------------------------------------------------------------
   WHAT IT DOES:
   The visitor arrives with a "question" in the URL:
     course.html?level=A2&skill=Writing
   This script:
   1. READS the question marks (?level=...&skill=...) from URL
   2. FINDS the matching level + skill in the LEVELS data
   3. PAINTS a full page about that course
   4. HANDLES a bad/invalid link gracefully

   LESSON — THE URL QUERY STRING:
   Everything after "?" in a URL is the query string:
     course.html?level=A2&skill=Writing
                 ^ ^^^ ^^  ^^^^^
                 | |   |   | skill value
                 | |   |   "&" separates key-value pairs
                 | |  key ("level")
                 | "?" starts the query string
   URLs are the ONLY way pages can pass data to each other
   without a server. That's how the carousel cards already
   link here! We use URLSearchParams, a built-in tool that
   reads these pairs safely.
   ============================================================ */

/* ============ 1. READ THE QUESTION FROM THE URL ============
   location.search = the raw "?level=A2&skill=Writing" part.
   URLSearchParams parses it into pairs we can ask for by key. */
const params   = new URLSearchParams(location.search);
const levelId  = params.get("level");
const skillName = params.get("skill");

/* ============ 2. FIND THE RIGHT DATA ============
   .find() walks the LEVELS array and returns the FIRST
   object where our test is true (or undefined if none).
   We then find the matching skill inside that level. */
const level = LEVELS.find(l => l.id === levelId);
const skill = level
    ? level.skills.find(s => s.name === skillName)
    : undefined;

/* ============ 3. GRACEFUL FAILURE ============
   If someone visits course.html WITHOUT a valid query
   (or types nonsense), we still show something useful:
   a friendly card with a way back. Never a dead page. */
if (!level || !skill) {
    document.getElementById("course-root").innerHTML = `
        <div class="card not-found-card">
            <h2>Course not found</h2>
            <p>That link doesn't point to a course we know.
               Try browsing the full catalog instead.</p>
            <a class="btn btn-primary" href="courses.html">
                Back to all courses</a>
        </div>
    `;
} else {
    /* ============ 4. PAINT THE COURSE PAGE ============
       Everything below only runs when we HAVE a course.
       Template literals build the whole page as one big
       HTML string — same trick as the carousel details,
       just bigger. Data flows: level.* and skill.*. */

    /* update the browser tab title too (nice detail):
       "A2 · Writing | The English Academy" */
    document.title = `${level.id} · ${skill.name} | The English Academy`;

    /* Which skills of THIS level exist? We use them for the
       "other skills" links in the sidebar. */
    const otherSkills = level.skills
        .filter(s => s.name !== skill.name)
        .map(s => `
            <a href="course.html?level=${level.id}&skill=${s.name}"
               class="skill-switch-link">${s.name}</a>
        `).join(" · ");

    /* Build the units list, numbered (index i + 1). */
    const unitsHtml = skill.units.map((unit, i) => `
        <li class="unit-row">
            <span class="unit-num">${i + 1}</span>
            <span class="unit-text">${unit}</span>
        </li>
    `).join("");

    /* Build the grammar topics as a simple list. */
    const grammarHtml = level.grammar
        .map(topic => `<li>${topic}</li>`)
        .join("");

    const details = `
        <!-- The colored banner: same gradient as the level's
             showcase slide — visual continuity between pages -->
        <section class="hero hero-sm course-hero">
            <div class="container">
                <p class="course-kicker">Course · ${level.id} · ${skill.name}</p>
                <h1>${level.label} ${skill.name}</h1>
                <p class="hero-subtitle">${skill.blurb}</p>
            </div>
        </section>

        <section class="section">
            <div class="container course-layout">

                <!-- ============ MAIN COLUMN ============ -->
                <div class="course-main">

                    <div class="block">
                        <h2 class="block-title">Course Overview</h2>
                        <p>${level.summary}</p>
                        <p>This course sharpens your <strong>${skill.name.toLowerCase()}</strong>
                           at ${level.id} level — ${level.tagline.toLowerCase()}</p>
                    </div>

                    <div class="block">
                        <h2 class="block-title">Unit Outline</h2>
                        <ul class="unit-list">${unitsHtml}</ul>
                    </div>

                    <div class="block">
                        <h2 class="block-title">Grammar & Language Focus</h2>
                        <p class="muted">The ${level.id} grammar engine shared by all
                           four skills of this level:</p>
                        <ul class="topic-list">${grammarHtml}</ul>
                    </div>

                </div>

                <!-- ============ SIDEBAR ============ -->
                <aside class="card sidebar-card">
                    <h3>Course Facts</h3>

                    <div class="fact-row">
                        <span class="fact-label">Level</span>
                        <span class="fact-value">${level.id} · ${level.tagline}</span>
                    </div>
                    <div class="fact-row">
                        <span class="fact-label">Skill focus</span>
                        <span class="fact-value">${skill.name}</span>
                    </div>
                    <div class="fact-row">
                        <span class="fact-label">Units</span>
                        <span class="fact-value">${skill.units.length} units</span>
                    </div>
                    <div class="fact-row">
                        <span class="fact-label">Format</span>
                        <span class="fact-value">Self-paced online</span>
                    </div>

                    <div class="other-skills">
                        <p class="fact-label">Other skills at ${level.id}</p>
                        <p>${otherSkills}</p>
                    </div>

                    <!-- Course selling comes in a later upgrade.
                         Until then, the honest call-to-action is
                         a conversation, not a checkout. -->
                    <a class="btn btn-primary btn-block"
                       href="contact.html?course=${level.id}%20${skill.name}">
                       Enquire about this course</a>
                    <a class="btn btn-ghost btn-block"
                       href="courses.html">Back to all levels</a>
                </aside>

            </div>
        </section>
    `;

    document.getElementById("course-root").innerHTML = details;

    /* Give the banner its level gradient (see .style.background
       trick in carousel.js — same idea, direct on the hero). */
    const hero = document.querySelector(".course-hero");
    if (hero) {
        hero.style.background = level.gradient;
    }
}
