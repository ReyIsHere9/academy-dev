/* ============================================================
   CAROUSEL SCRIPT — drives the course showcase on courses.html
   ------------------------------------------------------------
   LESSON — WHAT THIS FILE DOES, STEP BY STEP:
   1. LOAD the page's empty containers (the "slots")
   2. BUILD the slides from the LEVELS data (see levels-data.js)
   3. LISTEN for arrow clicks
   4. MOVE the slide strip (CSS does the smooth sliding)
   5. REFRESH the details section under the banner

   LESSON — THE MENTAL MODEL OF JAVASCRIPT:
   HTML = the skeleton, CSS = the looks, JS = the BEHAVIOUR.
   JS reads the data file, creates HTML elements on the fly,
   and updates the page when the visitor clicks.

   IMPORTANT ORDERING: this file must load AFTER levels-data.js,
   because it USES the LEVELS variable defined there.
   (courses.html loads them in that order — check the bottom!)
   ============================================================ */


/* ============ 1. FIND THE EMPTY CONTAINERS ============
   document.querySelector(".name") finds the FIRST element
   with that class on the page and gives us "a handle" to it.
   The page starts with empty slots — we fill them below. */
const track      = document.querySelector(".showcase-track");
const detailsBox = document.querySelector("#level-details");
const counterEl  = document.querySelector(".showcase-counter");
const prevBtn    = document.querySelector(".arrow-prev");
const nextBtn    = document.querySelector(".arrow-next");

/* "currentIndex" = which slide we are looking at now.
   let = a variable whose VALUE can change later.
   (const = cannot change, let = can. We change this one!) */
let currentIndex = 0;


/* ============ 2. BUILD ALL SLIDES ONCE ============
   LESSON — TEMPLATE LITERALS:
   `text ${variable} text` = a string you can insert
   variables into using ${...}. Notice the BACKTICK
   character (`), not a normal quote (').

   LESSON — LOOP: for (let level of LEVELS) repeats the
   code inside for each level object in the array.
   We build one slide per level and stack them in the
   track. Each slide is a full-width "page" of the strip. */
function buildSlides() {
    for (let level of LEVELS) {

        /* 1) make the slide <div> and give it its background */
        const slide = document.createElement("div");
        slide.classList.add("slide");
        slide.style.background = level.gradient;
        /* .style.background = ... sets an INLINE style,
           exactly like style="..." in HTML. This is where
           each level's colors come from (the data file). */

        /* 2) the top row: the four skill pills */
        const top = document.createElement("div");
        top.classList.add("slide-top");
        for (let skill of level.skills) {
            const pill = document.createElement("span");
            pill.classList.add("chip");
            pill.textContent = skill.name;
            top.appendChild(pill);
        }
        /* LESSON — appendChild: "put this element inside
           that element". We build small parts and nest
           them, exactly like HTML nesting. */

        /* 3) the bottom block: fancy title + tagline */
        const bottom = document.createElement("div");
        bottom.classList.add("slide-bottom");

        const title = document.createElement("h2");
        title.classList.add("slide-title");
        title.textContent = level.label;
        /* textContent = the plain text of an element.
           (NOT innerHTML — textContent cannot inject
           code, which makes it the safe choice for
           text that comes from data.) */

        const tagline = document.createElement("p");
        tagline.classList.add("slide-tagline");
        tagline.textContent = level.tagline;

        bottom.appendChild(title);
        bottom.appendChild(tagline);

        /* 4) assemble slide: top on top, bottom at the bottom */
        slide.appendChild(top);
        slide.appendChild(bottom);
        track.appendChild(slide);
    }
}


/* ============ 3. MOVE THE STRIP ============
   LESSON — THE CORE TRICK OF EVERY CAROUSEL:
   The track is a long flexible strip holding all slides
   side by side. To show slide #3, we shift the WHOLE strip
   left by (3 × 100%) — CSS transition makes it slide smoothly.
   translateX(-300%) = "move left by 3 times its own width". */
function goTo(index) {
    track.style.transform = `translateX(-${index * 100}%)`;
    /* Updating the counter text ("1 / 6") */
    counterEl.textContent = `${index + 1} / ${LEVELS.length}`;
    updateDetails(index);
}

function changeSlide(direction) {
    /* LESSON — WRAP-AROUND with the ternary operator:
       condition ? valueIfTrue : valueIfFalse
       If we go past the last slide (index +1 > last),
       jump back to 0. If we go before the first (-1),
       jump to the last one. Endless loop both ways! */
    const lastIndex = LEVELS.length - 1;
    currentIndex = (direction === "next")
        ? (currentIndex >= lastIndex ? 0 : currentIndex + 1)
        : (currentIndex <= 0 ? lastIndex : currentIndex - 1);
    goTo(currentIndex);
}


/* ============ 4. REFRESH THE DETAILS SECTION ============
   Every time we flip, the section under the banner is
   rebuilt to match the current level. It uses the SAME
   data — that's the beauty of data-driven pages: one
   source of truth, many views of it. */
function updateDetails(index) {
    const level = LEVELS[index];

    /* LESSON — innerHTML: replace everything inside the
       section with a fresh HTML string. Fine here because
       ALL content comes from our own data file. */
    detailsBox.innerHTML = `

        <div class="level-header">
            <h3 class="level-title">${level.label}</h3>
            <p>${level.summary}</p>
        </div>

        <div class="skills-grid">
            ${level.skills.map(skill => `
                <article class="card skill-card">
                    <h4>${skill.name}</h4>
                    <p>${skill.blurb}</p>
                    <ul class="feature-list">
                        ${skill.points.map(point => `<li>${point}</li>`).join("")}
                    </ul>
                    <div class="course-footer">
                        <span class="lessons">${skill.lessons}</span>
                        <a class="btn btn-small btn-primary"
                           href="course.html?level=${level.id}&skill=${skill.name}">
                           View Course</a>
                    </div>
                </article>
            `).join("")}
        </div>
    `;
    /* LESSON — .map() = "build a new list from each item".
       .join("") = glue the pieces together into one string.
       The ?level=A1&skill=... in the link passes info to the
       future course detail page (Module 3). This is a URL
       QUERY STRING — we'll use it later! */

    /* Restart the little fade-in animation on refresh:
       remove the class, force a reflow, add it back. */
    detailsBox.classList.remove("reveal");
    void detailsBox.offsetWidth;   /* "browser, please re-draw" */
    detailsBox.classList.add("reveal");
}


/* ============ 5. START THE SHOW ============
   When the page finishes loading this script runs:
   - build all slides once
   - show slide #1 (index 0)
   - attach "click -> changeSlide" to both arrows
   addEventListener("click", fn) = "when this element is
   clicked, run this function". */
buildSlides();
goTo(0);

prevBtn.addEventListener("click", () => changeSlide("prev"));
nextBtn.addEventListener("click", () => changeSlide("next"));


/* ============ BONUS: KEYBOARD SUPPORT ============
   Left/right arrow keys flip the showcase too.
   document = the whole page. "keydown" fires on any
   key press; e.key tells us which key. */
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft")  changeSlide("prev");
    if (event.key === "ArrowRight") changeSlide("next");
});
