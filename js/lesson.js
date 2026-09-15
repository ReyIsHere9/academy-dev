/* ============================================================
   LESSON PLAYER ENGINE — fills lesson.html
   ------------------------------------------------------------
   THE QUESTION IN THE URL:
     lesson.html?level=B1&skill=Speaking&unit=2
   js/lesson.js:
    1. reads level + skill + unit from the URL
    2. finds the course in the CATALOG (admin edits included)
    3. picks the AUTHORED lesson, or builds an OUTLINE lesson
       from the catalog data (honest, never a dead link)
    4. paints the player + sidebar
    5. runs the quiz + "mark complete" (saved in the space store,
       which updates the student's course progress)

   THE STORE: js/space-data.js keeps `completedLessons`:
     { "Stu-2001": ["B1|Speaking|0", ...] }
   "Mark complete" flips the key and recalculates the matching
   enrollment's progress percentage — so the dashboard moves too.
   ============================================================ */

const params = new URLSearchParams(location.search);
const levelId = params.get("level");
const skillName = params.get("skill");
const unitIndex = Math.max(0, Number(params.get("unit")) || 0);

const CATALOG = academyCatalog();
const level = CATALOG.find(l => l.id === levelId);
const skill = level ? level.skills.find(s => s.name === skillName) : undefined;

const root = document.getElementById("lesson-root");

/* ============ OUTLINE LESSON (generated) ============
   Every unit that has no authored lesson still opens a real
   page: goals from the level's grammar + the skill's own
   highlights, plus a practice task shaped to the skill. */
function buildOutlineLesson(level, skill, unitIndex) {
    const unitTitle = skill.units[unitIndex];
    const practiceBySkill = {
        Speaking: "Record a 60-second answer using this unit's language. Listen back once — improve one sentence and re-record.",
        Writing: "Write 80–120 words using the unit's language. Reread for one grammar check before you finish.",
        Reading: "Read any short English text (menu, article, message). Underline every example of the unit's pattern you can find.",
        Listening: "Find slow English audio. Listen once for meaning, once for endings, once with shadowing. Three passes, ten minutes."
    };
    return {
        level: level.id,
        skill: skill.name,
        unit: unitIndex,
        title: unitTitle,
        minutes: 13,
        intro: "A guided outline for this unit: what you'll practise, the grammar behind it, and a task that makes it real.",
        objectives: [
            ...level.grammar.slice(0, 3),
            ...skill.points.slice(0, 2)
        ],
        vocab: [],
        sections: [
            {
                type: "text",
                title: "What this unit covers",
                body: unitTitle + ". Work through the goals below in order — they build on each other."
            },
            {
                type: "text",
                title: "Grammar engine for " + level.id,
                body: "This unit draws on the level's shared grammar: " +
                      level.grammar.slice(0, 2).join("; ") + "."
            },
            {
                type: "tip",
                title: "How to practise like a student, not a tourist",
                body: "Ten focused minutes beat an hour of background listening. Do the task below once, actively, then stop. Come back tomorrow."
            },
            {
                type: "practice",
                title: "Your unit task",
                body: practiceBySkill[skill.name] || practiceBySkill.Reading
            }
        ],
        quiz: null
    };
}

/* ============ GRACEFUL FAILURE ============ */
if (!root) {
    /* nothing to do on pages that don't have the root */
} else if (!level || !skill || !skill.units[unitIndex]) {
    root.innerHTML = `
        <section class="section">
            <div class="container">
                <div class="card not-found-card">
                    <h2>Lesson not found</h2>
                    <p>That link doesn't point to a lesson we know.
                       Browse the catalog and pick a unit to start.</p>
                    <a class="btn btn-primary" href="courses.html">Back to all courses</a>
                </div>
            </div>
        </section>`;
} else {

    const authored = authoredLesson(level.id, skill.name, unitIndex);
    const lesson = authored || buildOutlineLesson(level, skill, unitIndex);
    const key = level.id + "|" + skill.name + "|" + unitIndex;
    const unitCount = skill.units.length;

    /* ---- who is watching? ---- */
    const me = typeof sessionRead === "function" ? sessionRead() : null;
    const isStudent = Boolean(me && me.role === "student");
    const db = spaceLoad();

    function completedList(studentId) {
        if (!db.completedLessons) db.completedLessons = {};
        if (!db.completedLessons[studentId]) db.completedLessons[studentId] = [];
        return db.completedLessons[studentId];
    }
    function isComplete() {
        return isStudent && completedList(me.id).includes(key);
    }
    function courseDoneCount() {
        if (!isStudent) return 0;
        const list = completedList(me.id);
        return skill.units.filter((u, i) =>
            list.includes(level.id + "|" + skill.name + "|" + i)).length;
    }

    document.title = lesson.title + " | The English Academy";

    /* ---- the player column ---- */
    const objectivesHtml = lesson.objectives.length ? `
        <div class="lesson-block">
            <h2>What you'll be able to do</h2>
            <ul class="lesson-goals">
                ${lesson.objectives.map(o => `<li>${spaceEsc(o)}</li>`).join("")}
            </ul>
        </div>` : "";

    const vocabHtml = lesson.vocab.length ? `
        <div class="lesson-block">
            <h2>Words for this lesson</h2>
            <div class="vocab-list">
                ${lesson.vocab.map(v => `
                    <div class="vocab-row">
                        <span class="vocab-word">${spaceEsc(v.word)}</span>
                        <span class="vocab-meaning">${spaceEsc(v.meaning)}</span>
                    </div>`).join("")}
            </div>
        </div>` : "";

    const sectionsHtml = lesson.sections.map(s => `
        <div class="lesson-block lesson-${spaceEsc(s.type)}">
            <h2>${spaceEsc(s.title)}</h2>
            <p>${spaceEsc(s.body)}</p>
        </div>`).join("");

    const quizHtml = lesson.quiz ? `
        <div class="lesson-block lesson-quiz" id="lesson-quiz">
            <h2>Quick check</h2>
            <p class="quiz-question">${spaceEsc(lesson.quiz.question)}</p>
            <div class="quiz-options">
                ${lesson.quiz.options.map((opt, i) => `
                    <label class="quiz-option">
                        <input type="radio" name="quiz" value="${i}">
                        <span>${spaceEsc(opt)}</span>
                    </label>`).join("")}
            </div>
            <button type="button" class="btn btn-primary btn-small" id="quiz-check">
                Check answer</button>
            <p class="quiz-result" id="quiz-result" hidden></p>
        </div>` : `
        <div class="lesson-block lesson-tip">
            <h2>Self-check</h2>
            <p>No quiz for this outline — the real check is the task above:
               do it once, actively, and you've earned the unit.</p>
        </div>`;

    const completeLabel = isComplete() ? "Completed — click to undo" : "Mark lesson complete";

    root.innerHTML = `
    <section class="hero hero-sm lesson-hero">
        <div class="container">
            <p class="course-kicker">Lesson &middot; ${spaceEsc(level.id)} &middot; ${spaceEsc(skill.name)} &middot;
               Unit ${unitIndex + 1} of ${unitCount}</p>
            <h1>${spaceEsc(lesson.title)}</h1>
            <p class="hero-subtitle">${spaceEsc(lesson.intro)}</p>
            <p class="lesson-meta">
                <span class="meta-pill">${lesson.minutes} min</span>
                <span class="meta-pill">${authored ? "Full lesson" : "Unit outline"}</span>
                ${isStudent ? `<span class="meta-pill">Your progress: ${courseDoneCount()}/${unitCount} units</span>` : ""}
            </p>
        </div>
    </section>

    <section class="section">
        <div class="container lesson-layout">

            <main class="lesson-main">

                <!-- the video slot (honest demo) -->
                <div class="lesson-player">
                    <div class="lesson-screen">
                        <span class="lesson-play">&#9654;</span>
                        <p class="lesson-screen-note">Lesson video arrives with the backend phase</p>
                    </div>
                    <div class="lesson-player-bar">
                        <span class="lesson-time">00:00 / ${String(lesson.minutes).padStart(2, "0")}:00</span>
                        <div class="lesson-progress-track"><div class="lesson-progress-fill"></div></div>
                    </div>
                </div>

                ${objectivesHtml}
                ${vocabHtml}
                ${sectionsHtml}
                ${quizHtml}

                <div class="lesson-block lesson-complete-block">
                    <h2>Finished this unit?</h2>
                    ${isStudent
                        ? `<p class="muted">Marking it complete updates your course progress on the dashboard.</p>
                           <button type="button" class="btn ${isComplete() ? "btn-ghost" : "btn-primary"}"
                                   id="lesson-complete">${completeLabel}</button>`
                        : `<p class="muted">Log in as a student to track progress across lessons.</p>
                           <a class="btn btn-primary" href="login.html">Log in to track progress</a>`}
                </div>

                <div class="lesson-nav-row">
                    ${unitIndex > 0
                        ? `<a class="btn btn-ghost" href="lesson.html?level=${encodeURIComponent(level.id)}&skill=${encodeURIComponent(skill.name)}&unit=${unitIndex - 1}">&larr; Previous unit</a>`
                        : `<span></span>`}
                    ${unitIndex < unitCount - 1
                        ? `<a class="btn btn-primary" href="lesson.html?level=${encodeURIComponent(level.id)}&skill=${encodeURIComponent(skill.name)}&unit=${unitIndex + 1}">Next unit &rarr;</a>`
                        : `<a class="btn btn-primary" href="course.html?level=${encodeURIComponent(level.id)}&skill=${encodeURIComponent(skill.name)}">Course overview</a>`}
                </div>

            </main>

            <!-- sidebar: the whole course at a glance -->
            <aside class="card lesson-side">
                <h3>${spaceEsc(level.label)} ${spaceEsc(skill.name)}</h3>
                <p class="course-duration muted">${skill.lessons} &middot; ${unitCount} units</p>
                ${isStudent ? `
                    <div class="progress-track" title="${courseDoneCount()}/${unitCount} units complete">
                        <div class="progress-fill" style="--progress:${Math.round(courseDoneCount() / unitCount * 100)}%"></div>
                    </div>` : ""}
                <div class="lesson-unit-list">
                    ${skill.units.map((unit, i) => {
                        const done = isStudent && completedList(me.id)
                            .includes(level.id + "|" + skill.name + "|" + i);
                        return `
                        <a class="lesson-unit-row ${i === unitIndex ? "is-current" : ""}"
                           href="lesson.html?level=${encodeURIComponent(level.id)}&skill=${encodeURIComponent(skill.name)}&unit=${i}">
                            <span class="lesson-unit-status">${done ? "&#10003;" : i + 1}</span>
                            <span class="lesson-unit-name">${spaceEsc(unit)}</span>
                        </a>`;
                    }).join("")}
                </div>
                <a class="btn btn-ghost btn-block btn-small"
                   href="course.html?level=${encodeURIComponent(level.id)}&skill=${encodeURIComponent(skill.name)}">
                   Course overview</a>
            </aside>

        </div>
    </section>`;

    /* ============ INTERACTIONS ============ */

    /* --- the quiz --- */
    const quizBox = document.getElementById("lesson-quiz");
    if (quizBox && lesson.quiz) {
        const checkBtn = document.getElementById("quiz-check");
        const result = document.getElementById("quiz-result");
        checkBtn.addEventListener("click", () => {
            const picked = quizBox.querySelector('input[name="quiz"]:checked');
            if (!picked) {
                result.hidden = false;
                result.className = "quiz-result";
                result.textContent = "Pick an answer first.";
                return;
            }
            const right = Number(picked.value) === lesson.quiz.answer;
            quizBox.querySelectorAll(".quiz-option").forEach(opt => {
                const input = opt.querySelector("input");
                opt.classList.remove("is-right", "is-wrong");
                if (Number(input.value) === lesson.quiz.answer) {
                    opt.classList.add("is-right");
                } else if (input.checked) {
                    opt.classList.add("is-wrong");
                }
                input.disabled = true;
            });
            result.hidden = false;
            result.className = "quiz-result " + (right ? "is-right" : "is-wrong");
            result.textContent = (right ? "Correct. " : "Not quite. ") + lesson.quiz.explain;
            checkBtn.hidden = true;
        });
    }

    /* --- mark complete / undo --- */
    const completeBtn = document.getElementById("lesson-complete");
    if (completeBtn) {
        completeBtn.addEventListener("click", () => {
            const list = completedList(me.id);
            const wasDone = list.includes(key);

            if (wasDone) {
                db.completedLessons[me.id] = list.filter(k => k !== key);
            } else {
                list.push(key);
            }

            /* keep the student's enrollment progress in sync:
               progress %, and the next unfinished unit's title.
               Matching is loose on purpose: admin/teacher-created
               courses have custom titles ("B1 · Conversation"), so
               we accept an exact level+skill match OR a title that
               contains the skill name. */
            const enr = db.enrollments.find(e =>
                e.student === me.id && e.level === level.id &&
                (e.skill === skill.name ||
                 String(e.title || "").toLowerCase().includes(skill.name.toLowerCase())));
            if (enr) {
                const doneNow = skill.units.filter((u, i) => completedList(me.id)
                    .includes(level.id + "|" + skill.name + "|" + i)).length;
                enr.progress = Math.round(doneNow / unitCount * 100);
                /* note: sessionsDone is NOT touched — live classes and
                   completed units are separate metrics (a unit can
                   span several classes) */
                const nextIdx = skill.units.findIndex((u, i) =>
                    !completedList(me.id).includes(level.id + "|" + skill.name + "|" + i));
                enr.nextLesson = nextIdx === -1
                    ? "All units complete — review any time!"
                    : skill.units[nextIdx];
            }

            const allDone = !wasDone && skill.units.every((u, i) =>
                completedList(me.id).includes(level.id + "|" + skill.name + "|" + i));

            spaceSave(db);
            spaceToast(allDone
                ? "Course complete — your certificate is ready!"
                : (wasDone
                    ? "Marked as not complete"
                    : "Lesson complete — progress updated"),
                wasDone ? "bad" : "good");

            /* finishing the LAST unit lands you on the certificate */
            if (allDone) {
                setTimeout(() => {
                    window.location.href = "certificate.html?level=" +
                        encodeURIComponent(level.id) + "&skill=" +
                        encodeURIComponent(skill.name);
                }, 1100);
                return;
            }

            /* repaint the page state (sidebar + button + meta) */
            window.location.reload();
        });
    }
}
