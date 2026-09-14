/* ============================================================
   SPACE ENGINE — shared by dashboard.html (student),
   dashboard-teacher.html (teacher), dashboard-admin.html (admin)
   and profile.html (public profile)
   ------------------------------------------------------------
   HOW FOUR PAGES SHARE ONE SCRIPT (same pattern as classroom.js):
   every block below is GUARDED — it checks "does my element exist
   on this page?" and "which role am I?" before it runs.
   Teacher pages mark themselves with <body class="role-teacher">,
   the admin page with class="role-admin", student with
   class="role-student". profile.html has no role — it uses §11.

   WHAT'S IN THIS FILE (grows phase by phase):
     §0 STORE        — the tiny localStorage "database"
     §1 GATE         — who is allowed in? (demo session + quick logins)
     §2 SHELL        — greeting, avatar, accent, nav, logout
     §3 UI KIT       — toast + confirm dialog
     §4 HOME         — stats, continue learning, next class, news
     §5 MY COURSES   — enrollments + progress
     §6 CLASSES      — schedule + join by code
     §7 ASSIGNMENTS  — list, detail, dropzone submit, comments
     §8 MATERIALS    — download list + search
     §9 ACHIEVEMENTS — badge showcase
     §10 PROFILE     — avatar, bio, accent, notifications
     §11 PUBLIC PROFILE — profile.html (no login needed)

   ⚠️ DEMO REALITY CHECK: all "permissions" here are client-side
   theater — a visitor can fake the session from dev tools. The
   real build checks every role on the SERVER and only sends the
   data a role is allowed to see. Uploads do NOT really leave the
   machine in this demo (no server to receive them).
   ============================================================ */

const SPACE_ROLE = document.body.classList.contains("role-admin") ? "admin"
                 : document.body.classList.contains("role-teacher") ? "teacher"
                 : document.body.classList.contains("role-student") ? "student"
                 : null;

const SPACE_TITLES = {
    student: "Student space",
    teacher: "Teacher studio",
    admin: "Admin console"
};

/* which spaces exist yet? (links/redirects only point at real
   pages — flip these to true as each phase ships) */
const SPACE_READY = {
    student: true,
    teacher: false,
    admin: false
};

/* the personal color palette (avatar + accent choices) */
const SPACE_COLORS = [
    "#2563eb", "#7c3aed", "#db2777", "#059669",
    "#d97706", "#0891b2", "#e11d48", "#64748b"
];

/* tiny HTML escaper (classroom.js has its own; pages never load
   both engines, so each file stays self-contained) */
const spaceEsc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

/* ============ 0. STORE ============
   ONE localStorage key holds the whole demo database:
   profiles, schedule, enrollments, announcements, assignments,
   materials, badges, activity, settings. spaceLoad() hands you
   the object; call spaceSave() after any change. Version number:
   if we ever change the seed shape, bump SPACE_DB_VERSION and
   old stores re-seed. */
function spaceLoad() {
    try {
        const stored = JSON.parse(localStorage.getItem(SPACE_DB_KEY));
        if (stored && stored.version === SPACE_DB_VERSION) return stored;
    } catch {
        /* corrupt store? fall through and re-seed */
    }
    const fresh = JSON.parse(JSON.stringify(SPACE_SEED));  // deep copy
    spaceSave(fresh);
    return fresh;
}

function spaceSave(db) {
    try {
        localStorage.setItem(SPACE_DB_KEY, JSON.stringify(db));
    } catch {
        /* storage full / blocked — the demo just runs in memory */
    }
}

/* Danger zone (admin console, Phase 3) uses this */
function spaceResetStore() {
    localStorage.removeItem(SPACE_DB_KEY);
}

/* profiles are keyed by user id; unknown ids get a safe fallback
   so a freshly added user never crashes a template */
function spaceProfile(db, id) {
    return db.profiles[id] || {
        name: id, role: "student",
        avatarColor: "#64748b", accent: "#64748b", bio: "",
        prefs: { emailAssignments: false, emailAnnouncements: false, pingChat: false },
        joinedDaysAgo: 0
    };
}

/* ============ small formatters (relative times!) ============ */
function spaceWhen(minutes) {
    if (minutes < 1) return "starting now";
    if (minutes < 60) return "in " + minutes + " min";
    const hours = Math.round(minutes / 60);
    if (hours < 24) return "in " + hours + " h";
    const days = Math.round(hours / 24);
    return "in " + days + " day" + (days === 1 ? "" : "s");
}

function spaceAgo(minutesAgo) {
    if (minutesAgo < 1) return "just now";
    if (minutesAgo < 60) return minutesAgo + " min ago";
    const hours = Math.round(minutesAgo / 60);
    if (hours < 24) return hours + " h ago";
    const days = Math.round(hours / 24);
    return days + " day" + (days === 1 ? "" : "s") + " ago";
}

function spaceClock(minutesFromNow) {
    return new Date(Date.now() + minutesFromNow * 60000)
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* file helpers — used by assignments + materials */
const spaceExt = name => (String(name).split(".").pop() || "").toLowerCase();

const spaceSlug = s => String(s).toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function spaceSize(kb) {
    return kb >= 1024 ? (kb / 1024).toFixed(1) + " MB" : kb + " KB";
}

function spaceTypeTag(name) {
    const ext = spaceExt(name);
    if (ext === "pdf") return "PDF";
    if (["doc", "docx"].includes(ext)) return "DOC";
    if (["txt"].includes(ext)) return "TXT";
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "IMG";
    if (["mp3", "wav", "m4a"].includes(ext)) return "AUD";
    if (["mp4", "webm", "mov"].includes(ext)) return "VID";
    return "FILE";
}

/* assignment status, computed — not stored (one source of truth) */
function assignmentStatus(asg, studentId) {
    const sub = asg.submissions[studentId];
    if (sub && sub.score != null) return "graded";
    if (sub) return "submitted";
    if (asg.dueInHours < 0) return "overdue";
    return "todo";
}

const ASG_STATUS_LABEL = {
    todo: "To do", submitted: "Submitted", graded: "Graded", overdue: "Overdue"
};

function dueLabel(asg) {
    const minutes = asg.dueInHours * 60;
    return minutes >= 0
        ? "due " + spaceWhen(minutes)
        : "was due " + spaceAgo(-minutes);
}

/* unlock a badge once (returns true when it's newly earned) */
function unlockBadge(db, studentId, badgeId) {
    const list = db.earnedBadges[studentId] || (db.earnedBadges[studentId] = []);
    if (list.some(b => b.id === badgeId)) return false;
    list.push({ id: badgeId, earnedDaysAgo: 0 });
    return true;
}

/* ============ 1. SESSION + GATE ============
   sessionRead() comes from js/session.js (loaded on every page).
   The `typeof` guard keeps this file safe in pages/tests that
   don't load the session helper. */
const spaceSession = typeof sessionRead === "function" ? sessionRead() : null;
const spaceGate = document.getElementById("space-gate");
const spaceShell = document.getElementById("space-shell");

function showSpaceGate(message, isMismatch) {
    spaceGate.hidden = false;
    spaceShell.hidden = true;

    const msg = document.getElementById("space-gate-msg");
    if (msg) msg.textContent = message;

    /* "wrong door" extras: only when someone IS logged in but
       this isn't their space */
    const go = document.getElementById("space-gate-go");
    const logout = document.getElementById("space-gate-logout");
    if (go) {
        const ready = Boolean(isMismatch && spaceSession && SPACE_READY[spaceSession.role]);
        go.hidden = !ready;
        if (ready) go.href = dashboardFor(spaceSession.role);
    }
    if (logout) {
        logout.hidden = !isMismatch;
        logout.addEventListener("click", () => {
            sessionClear();
            window.location.reload();
        });
    }

    /* one-click demo logins (fast testing; a real build would
       simply link to the login page) */
    document.querySelectorAll(".space-quick").forEach(btn => {
        btn.addEventListener("click", () => {
            const user = DEMO_USERS.find(u => u.role === btn.dataset.role);
            if (!user) return;
            sessionSave(user);
            window.location.reload();
        });
    });
}

function startSpaceShell(session) {
    spaceGate.hidden = true;
    spaceShell.hidden = false;

    const db = spaceLoad();
    const profile = spaceProfile(db, session.id);

    /* --- greeting bar --- */
    const nameEl = document.getElementById("space-greeting-name");
    if (nameEl) nameEl.textContent = "Welcome back, " + profile.name + ".";

    const roleEl = document.getElementById("space-role-label");
    if (roleEl) roleEl.textContent = SPACE_TITLES[SPACE_ROLE] || "Space";

    const navTitle = document.getElementById("space-nav-title");
    if (navTitle) navTitle.textContent = SPACE_TITLES[SPACE_ROLE] || "Space";

    applyProfileToShell(db, session);

    const dateEl = document.getElementById("space-date");
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString([], {
            weekday: "long", month: "long", day: "numeric"
        });
    }

    /* --- logout --- */
    const logoutBtn = document.getElementById("space-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            sessionClear();
            window.location.href = "login.html";
        });
    }

    /* --- sidebar nav: buttons switch panels, no page reload --- */
    document.querySelectorAll(".space-nav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".space-nav-btn").forEach(b =>
                b.classList.toggle("is-active", b === btn));
            document.querySelectorAll(".space-panel").forEach(panel =>
                panel.classList.toggle("is-active",
                    panel.dataset.panel === btn.dataset.panel));
        });
    });

    /* --- role-specific panels (teacher/admin arrive later) --- */
    if (SPACE_ROLE === "student") startStudentSpace(db, session);
}

/* paint avatar + accent color from the profile (also reused after
   a profile save so changes appear instantly) */
function applyProfileToShell(db, session) {
    const profile = spaceProfile(db, session.id);

    const avatar = document.getElementById("space-avatar");
    if (avatar) {
        avatar.textContent = profile.name.trim().charAt(0).toUpperCase();
        avatar.style.background = profile.avatarColor;
    }

    if (document.body.style && document.body.style.setProperty) {
        document.body.style.setProperty("--space-accent", profile.accent);
    }
}

/* ============ 2. UI KIT — toast + confirm dialog ============
   Built once here, used by every panel (submitting an assignment,
   saving the profile, admin actions...). */
function spaceToastsBox() {
    let box = document.getElementById("space-toasts");
    if (!box) {
        box = document.createElement("div");
        box.id = "space-toasts";
        box.className = "space-toasts";
        document.body.appendChild(box);
    }
    return box;
}

function spaceToast(text, kind) {
    const el = document.createElement("div");
    el.className = "space-toast" + (kind ? " is-" + kind : "");
    el.textContent = text;
    el.addEventListener("click", () => el.remove());
    spaceToastsBox().appendChild(el);
    setTimeout(() => el.remove(), 3400);
}

/* spaceConfirm returns a PROMISE so callers can read naturally:
     spaceConfirm({...}).then(ok => { if (ok) doTheThing(); })
   Promise = "a value that arrives later" — click OK -> true,
   Cancel / Esc / backdrop -> false. */
function spaceConfirm(options) {
    return new Promise(resolve => {
        const wrap = document.createElement("div");
        wrap.className = "confirm-backdrop";
        wrap.innerHTML = `
            <div class="confirm-card" role="dialog" aria-modal="true"
                 aria-labelledby="space-confirm-title">
                <h2 id="space-confirm-title"></h2>
                <p class="muted" id="space-confirm-text"></p>
                <div class="confirm-actions">
                    <button type="button" class="btn btn-ghost" data-answer="no">Cancel</button>
                    <button type="button" class="btn confirm-danger" data-answer="yes"></button>
                </div>
            </div>`;
        document.body.appendChild(wrap);

        /* textContent (not innerHTML) for anything caller-supplied */
        wrap.querySelector("#space-confirm-title").textContent =
            options.title || "Are you sure?";
        wrap.querySelector("#space-confirm-text").textContent =
            options.text || "";
        const yes = wrap.querySelector('[data-answer="yes"]');
        yes.textContent = options.okLabel || "Confirm";
        if (!options.danger) yes.classList.remove("confirm-danger");

        yes.focus();

        function finish(answer) {
            wrap.remove();
            resolve(answer);
        }

        wrap.addEventListener("click", (event) => {
            if (event.target === wrap) finish(false);          // backdrop
            const btn = event.target.closest("[data-answer]");
            if (btn) finish(btn.dataset.answer === "yes");
        });
        document.addEventListener("keydown", function esc(event) {
            if (event.key === "Escape") {
                document.removeEventListener("keydown", esc);
                finish(false);
            }
        });
    });
}

/* ============ STUDENT SPACE ====================================
   Everything below renders into dashboard.html's panels. Called
   once when the shell starts; each render function is
   element-guarded so a missing panel can never crash the page. */

let spaceAsgFilter = "all";   // all | todo | submitted | graded
let spaceAsgOpen = null;      // { db, session, id } while a detail is open
let spaceFileState = null;    // the pending attachment for the open assignment
let spaceMatQuery = "";       // materials search text

function startStudentSpace(db, session) {
    renderHome(db, session);
    renderCourses(db, session);
    renderClasses(db, session);
    renderAssignments(db, session);
    renderMaterials(db, session);
    renderAchievements(db, session);
    renderProfile(db, session);
    wireStudentPanels(db, session);
}

/* ---------- §4 HOME ---------- */
function nextClassFor(db, session) {
    return db.schedule
        .filter(s => s.startsInMinutes >= 0 && s.students.includes(session.id))
        .sort((a, b) => a.startsInMinutes - b.startsInMinutes)[0] || null;
}

function renderHome(db, session) {
    const enrolled = db.enrollments.filter(e => e.student === session.id);
    const next = nextClassFor(db, session);

    /* stats row */
    const dueSoon = db.assignments.filter(a => {
        const st = assignmentStatus(a, session.id);
        return (st === "todo" || st === "overdue") && a.dueInHours <= 7 * 24;
    }).length;
    const badgeCount = (db.earnedBadges[session.id] || []).length;

    const statCourses = document.getElementById("stat-courses");
    if (statCourses) statCourses.textContent = enrolled.length;
    const statDue = document.getElementById("stat-due");
    if (statDue) statDue.textContent = dueSoon;
    const statBadges = document.getElementById("stat-badges");
    if (statBadges) statBadges.textContent = badgeCount;
    const statNext = document.getElementById("stat-next");
    if (statNext) statNext.textContent = next ? spaceWhen(next.startsInMinutes) : "—";

    /* continue learning = first unfinished course */
    const cont = document.getElementById("space-continue");
    if (cont) {
        const enr = enrolled.find(e => e.progress < 100) || enrolled[0];
        if (!enr) {
            cont.innerHTML = '<p class="space-empty-inline">No courses yet — browse the catalog to enroll.</p>';
        } else {
            const teacher = spaceProfile(db, enr.teacher);
            cont.innerHTML = `
                <p class="space-next-course">${spaceEsc(enr.title)}</p>
                <p class="space-next-meta">${spaceEsc(teacher.name)} &middot;
                   ${enr.sessionsDone}/${enr.sessionsTotal} classes</p>
                <div class="progress-track" title="${enr.progress}% complete">
                    <div class="progress-fill" style="--progress:${enr.progress}%"></div>
                </div>
                <p class="space-next-meta space-continue-next">${spaceEsc(enr.nextLesson)}</p>
                <a class="btn btn-primary btn-small"
                   href="course.html?level=${encodeURIComponent(enr.level)}&skill=${encodeURIComponent(enr.skill)}">
                   Open course</a>`;
        }
    }

    /* next live class */
    const nextBox = document.getElementById("space-next-class");
    if (nextBox) {
        if (!next) {
            nextBox.innerHTML =
                '<p class="space-empty-inline">No live class scheduled right now.</p>';
        } else {
            const teacher = spaceProfile(db, next.teacher);
            nextBox.innerHTML = `
                <div class="space-next">
                    <div>
                        <p class="space-next-course">${spaceEsc(next.course)}</p>
                        <p class="space-next-meta">
                            ${spaceEsc(teacher.name)} &middot; ${next.durationMin} min
                            &middot; ${spaceWhen(next.startsInMinutes)}
                            (${spaceClock(next.startsInMinutes)})
                        </p>
                    </div>
                    <a class="btn btn-primary" href="class.html">Join</a>
                </div>`;
        }
    }

    /* announcements */
    const annBox = document.getElementById("space-announcements");
    if (annBox) {
        annBox.innerHTML = db.announcements.slice(0, 3).map(a => `
            <div class="space-ann">
                <p class="space-ann-text">${spaceEsc(a.text)}</p>
                <p class="space-ann-meta">
                    ${spaceEsc(spaceProfile(db, a.fromId).name)}
                    &middot; ${spaceAgo(a.minutesAgo)}
                </p>
            </div>`).join("");
    }
}

/* ---------- §5 MY COURSES ---------- */
function renderCourses(db, session) {
    const box = document.getElementById("space-courses");
    if (!box) return;

    const enrolled = db.enrollments.filter(e => e.student === session.id);
    if (!enrolled.length) {
        box.innerHTML = `<p class="space-empty-inline">Nothing here yet.
            <a href="courses.html">Browse the catalog</a> to enroll.</p>`;
        return;
    }

    box.innerHTML = enrolled.map(enr => {
        const teacher = spaceProfile(db, enr.teacher);
        const href = "course.html?level=" + encodeURIComponent(enr.level) +
                     "&skill=" + encodeURIComponent(enr.skill);
        return `
        <div class="course-row">
            <div class="course-row-main">
                <p class="space-next-course">${spaceEsc(enr.title)}
                    <span class="level-tag">${spaceEsc(enr.level)}</span></p>
                <p class="space-next-meta">${spaceEsc(teacher.name)} &middot;
                   ${enr.sessionsDone}/${enr.sessionsTotal} classes</p>
                <div class="progress-track" title="${enr.progress}% complete">
                    <div class="progress-fill" style="--progress:${enr.progress}%"></div>
                </div>
                <p class="space-next-meta space-continue-next">Next: ${spaceEsc(enr.nextLesson)}</p>
            </div>
            <a class="btn btn-ghost btn-small" href="${href}">Open</a>
        </div>`;
    }).join("");
}

/* ---------- §6 CLASSES ---------- */
function renderClasses(db, session) {
    const upBox = document.getElementById("space-classes-upcoming");
    const pastBox = document.getElementById("space-classes-past");

    const mine = db.schedule.filter(s => s.students.includes(session.id));
    const upcoming = mine.filter(s => s.startsInMinutes >= 0)
        .sort((a, b) => a.startsInMinutes - b.startsInMinutes);
    const past = mine.filter(s => s.startsInMinutes < 0)
        .sort((a, b) => b.startsInMinutes - a.startsInMinutes);

    if (upBox) {
        upBox.innerHTML = upcoming.length ? upcoming.map(s => {
            const teacher = spaceProfile(db, s.teacher);
            return `
            <div class="class-row">
                <div>
                    <p class="space-next-course">${spaceEsc(s.course)}</p>
                    <p class="space-next-meta">${spaceEsc(teacher.name)} &middot;
                       ${spaceWhen(s.startsInMinutes)} (${spaceClock(s.startsInMinutes)})
                       &middot; ${s.durationMin} min</p>
                </div>
                <a class="btn btn-primary btn-small" href="class.html">Join</a>
            </div>`;
        }).join("") : '<p class="space-empty-inline">No upcoming classes.</p>';
    }

    if (pastBox) {
        pastBox.innerHTML = past.length ? past.map(s => {
            const teacher = spaceProfile(db, s.teacher);
            return `
            <div class="class-row is-past">
                <div>
                    <p class="space-next-course">${spaceEsc(s.course)}</p>
                    <p class="space-next-meta">${spaceEsc(teacher.name)} &middot;
                       ${spaceAgo(-s.startsInMinutes)}</p>
                </div>
                <span class="status-chip is-done">Attended</span>
            </div>`;
        }).join("") : '<p class="space-empty-inline">No past classes yet.</p>';
    }
}

/* ---------- §7 ASSIGNMENTS ---------- */
function renderAssignments(db, session) {
    const rows = document.getElementById("space-asg-rows");
    if (!rows) return;

    const rank = { overdue: 0, todo: 1, submitted: 2, graded: 3 };
    let list = db.assignments.map(a => ({ a, status: assignmentStatus(a, session.id) }));
    if (spaceAsgFilter !== "all") {
        list = list.filter(x => x.status === spaceAsgFilter ||
            (spaceAsgFilter === "todo" && x.status === "overdue"));
    }
    list.sort((x, y) => (rank[x.status] - rank[y.status]) ||
                        (x.a.dueInHours - y.a.dueInHours));

    if (!list.length) {
        rows.innerHTML = '<p class="space-empty-inline">Nothing in this filter.</p>';
        return;
    }

    rows.innerHTML = list.map(({ a, status }) => {
        const sub = a.submissions[session.id];
        return `
        <button type="button" class="asg-row" data-asg="${spaceEsc(a.id)}">
            <span class="asg-row-main">
                <span class="asg-row-title">${spaceEsc(a.title)}</span>
                <span class="asg-row-meta">${spaceEsc(a.course)} &middot; ${dueLabel(a)}</span>
            </span>
            ${status === "graded" ? `<span class="asg-score">${sub.score}/${a.maxScore}</span>` : ""}
            <span class="status-chip is-${status}">${ASG_STATUS_LABEL[status]}</span>
        </button>`;
    }).join("");
}

/* the file-name convention — THE teaching point:
   StuID_assignmentID_short-title.ext  (any tool, any platform) */
function suggestFileName(studentId, asg, ext) {
    return studentId + "_" + asg.id + "_" + spaceSlug(asg.title) + "." + (ext || "pdf");
}

/* what's wrong with the pending file? [] means good to go */
function fileIssues(state, asg, session) {
    const issues = [];
    const ext = spaceExt(state.name);
    if (!state.name.trim()) issues.push("Give the file a name.");
    if (ext && !asg.allowed.includes(ext)) {
        issues.push("." + ext + " isn't allowed here — use " +
                    asg.allowed.map(e => e.toUpperCase()).join(", ") + ".");
    }
    if (state.sizeKB > asg.maxMB * 1024) {
        issues.push("Too big (" + spaceSize(state.sizeKB) + ") — max " +
                    asg.maxMB + " MB.");
    }
    if (state.name && !state.name.trim().toLowerCase()
            .startsWith(session.id.toLowerCase() + "_")) {
        issues.push("Start the name with " + session.id + "_");
    }
    return issues;
}

function fileCardHTML(state, asg, session) {
    const issues = fileIssues(state, asg, session);
    const ok = issues.length === 0;
    return `
    <div class="file-row space-file-card">
        <span class="file-type">${spaceTypeTag(state.name)}</span>
        <div class="space-file-info">
            <input type="text" class="mini-input space-file-name" id="asg-file-name"
                   value="${spaceEsc(state.name)}" aria-label="File name">
            <p class="space-file-note ${ok ? "" : "is-error"}" id="asg-file-note">
                ${ok ? spaceSize(state.sizeKB) + " &middot; name looks good"
                     : spaceEsc(issues.join(" "))}
            </p>
        </div>
        <button type="button" class="btn btn-ghost btn-small"
                id="asg-file-suggest" ${ok ? "hidden" : ""}>Use suggested</button>
        <button type="button" class="admin-kick" id="asg-file-remove"
                title="Remove file">&times;</button>
    </div>`;
}

const SPACE_DROPZONE_HTML = `
    <div class="dropzone space-dropzone" id="asg-dropzone">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <p><strong>Drop your answer file here</strong><br>
           or click to choose from your computer</p>
        <input type="file" id="asg-file-input" hidden>
    </div>`;

function submissionFormHTML(asg, session, sub) {
    const rules = "Allowed: " + asg.allowed.map(e => e.toUpperCase()).join(" · ") +
                  " &middot; max " + asg.maxMB + " MB";
    return `
    <h3 class="space-subhead">Your answer</h3>
    <textarea class="chat-input space-textarea" id="asg-text" rows="5"
              placeholder="Type your answer here (or attach a file below)…">${spaceEsc(sub ? sub.text : "")}</textarea>
    <p class="space-counter" id="asg-counter"></p>

    <h3 class="space-subhead">Attachment</h3>
    <div id="asg-file-zone"></div>
    ${SPACE_DROPZONE_HTML}
    <p class="space-file-note" id="asg-rules">${rules} &middot;
       name files like <code>${spaceEsc(suggestFileName(session.id, asg, asg.allowed[0]))}</code></p>

    <p class="space-error" id="asg-error" hidden></p>
    <div class="space-submit-row">
        <button type="button" class="btn btn-primary" id="asg-submit">
            ${sub ? "Save changes" : "Submit assignment"}</button>
        ${sub ? `<button type="button" class="btn btn-ghost" id="asg-remove">Remove submission</button>` : ""}
    </div>`;
}

function submissionSummaryHTML(db, asg, sub) {
    return `
    <h3 class="space-subhead">Your submission</h3>
    ${sub.text ? `<p class="asg-answer">${spaceEsc(sub.text)}</p>` : ""}
    ${sub.fileName ? `
        <div class="file-row space-file-card is-static">
            <span class="file-type">${spaceTypeTag(sub.fileName)}</span>
            <div class="space-file-info">
                <p class="space-file-name-static">${spaceEsc(sub.fileName)}</p>
                <p class="space-file-note">${spaceSize(sub.sizeKB || 0)} &middot;
                   submitted ${spaceAgo(sub.submittedAtMinutesAgo)}</p>
            </div>
        </div>` : ""}`;
}

function commentsHTML(db, session, sub) {
    const rows = (sub.comments || []).map(c => {
        const author = spaceProfile(db, c.by);
        return `
        <div class="comment-row">
            <span class="msg-avatar" style="background:${author.avatarColor}">${spaceEsc(author.name.trim().charAt(0).toUpperCase())}</span>
            <div class="comment-body">
                <p class="comment-head">${spaceEsc(author.name)}
                   <span>${spaceAgo(c.minutesAgo)}</span></p>
                <p class="comment-text">${spaceEsc(c.text)}</p>
            </div>
        </div>`;
    }).join("");
    return `
    <div class="space-comments">
        <h3 class="space-subhead">Comments</h3>
        ${rows || '<p class="space-empty-inline">No comments yet.</p>'}
        <form class="comment-form" id="asg-comment-form">
            <input type="text" class="chat-input" id="asg-comment-input"
                   placeholder="Add a note for your teacher…" autocomplete="off">
            <button type="submit" class="btn btn-primary btn-small">Send</button>
        </form>
    </div>`;
}

function assignmentDetailHTML(db, asg, session) {
    const teacher = spaceProfile(db, asg.createdBy);
    const sub = asg.submissions[session.id];
    const status = assignmentStatus(asg, session.id);

    const head = `
    <div class="asg-head">
        <div>
            <h2>${spaceEsc(asg.title)}</h2>
            <p class="space-next-meta">${spaceEsc(asg.course)} &middot;
               from ${spaceEsc(teacher.name)} &middot; ${dueLabel(asg)} &middot;
               max ${asg.maxScore} points</p>
        </div>
        <span class="status-chip is-${status}">${ASG_STATUS_LABEL[status]}</span>
    </div>
    <p class="asg-instructions">${spaceEsc(asg.instructions)}</p>`;

    if (status === "graded") {
        return head + `
        <div class="grade-banner">
            <span class="grade-score">${sub.score}<span>/${asg.maxScore}</span></span>
            <div>
                <p class="grade-title">Graded</p>
                <p class="space-next-meta">Teacher feedback</p>
            </div>
        </div>
        <p class="asg-feedback">${spaceEsc(sub.feedback || "No written feedback.")}</p>` +
        submissionSummaryHTML(db, asg, sub) +
        commentsHTML(db, session, sub);
    }

    return head +
        submissionFormHTML(asg, session, sub) +
        (sub ? commentsHTML(db, session, sub) : "");
}

/* show the file card + name rules for the pending file */
function renderFileZone() {
    const zone = document.getElementById("asg-file-zone");
    if (!zone || !spaceAsgOpen) return;

    const { db, session, id } = spaceAsgOpen;
    const asg = db.assignments.find(a => a.id === id);
    if (!asg || !spaceFileState) {
        zone.innerHTML = "";
        return;
    }

    zone.innerHTML = fileCardHTML(spaceFileState, asg, session);

    const nameInput = document.getElementById("asg-file-name");
    const note = document.getElementById("asg-file-note");
    const suggestBtn = document.getElementById("asg-file-suggest");
    const removeBtn = document.getElementById("asg-file-remove");

    if (nameInput) {
        /* live validation WITHOUT re-rendering (the input keeps
           focus and the caret position) */
        nameInput.addEventListener("input", () => {
            spaceFileState.name = nameInput.value;
            const issues = fileIssues(spaceFileState, asg, session);
            const ok = issues.length === 0;
            if (note) {
                note.classList.toggle("is-error", !ok);
                note.innerHTML = ok
                    ? spaceSize(spaceFileState.sizeKB) + " &middot; name looks good"
                    : spaceEsc(issues.join(" "));
            }
            if (suggestBtn) suggestBtn.hidden = ok;
        });
    }
    if (suggestBtn) {
        suggestBtn.addEventListener("click", () => {
            spaceFileState.name = suggestFileName(session.id, asg,
                spaceExt(spaceFileState.name));
            renderFileZone();
        });
    }
    if (removeBtn) {
        removeBtn.addEventListener("click", () => {
            spaceFileState = null;
            renderFileZone();
        });
    }
}

/* a file was dropped or chosen */
function handlePendingFile(file) {
    if (!spaceAsgOpen) return;
    const { db, session, id } = spaceAsgOpen;
    const asg = db.assignments.find(a => a.id === id);
    if (!asg) return;

    const kb = Math.max(1, Math.round(file.size / 1024));
    spaceFileState = { name: file.name, sizeKB: kb, isNew: true };

    /* naming polish: if the name ignores the class convention,
       fix it for them and SAY SO — teaching, not nagging */
    const ext = spaceExt(file.name);
    const wanted = session.id.toLowerCase() + "_";
    if (!file.name.toLowerCase().startsWith(wanted)) {
        spaceFileState.name = suggestFileName(session.id, asg, ext);
        spaceToast("Renamed to the class convention — edit it if you like", "good");
    }
    renderFileZone();
}

function openAssignmentDetail(db, session, id) {
    const asg = db.assignments.find(a => a.id === id);
    if (!asg) return closeAssignmentDetail();

    spaceAsgOpen = { db, session, id };
    const sub = asg.submissions[session.id];
    spaceFileState = (sub && sub.fileName)
        ? { name: sub.fileName, sizeKB: sub.sizeKB || 1, isNew: false }
        : null;

    const list = document.getElementById("space-asg-list");
    const detail = document.getElementById("space-asg-detail");
    const card = document.getElementById("space-asg-detail-card");
    if (list) list.hidden = true;
    if (detail) detail.hidden = false;
    if (card) card.innerHTML = assignmentDetailHTML(db, asg, session);
    renderFileZone();
    wireDetail(db, session, asg);

    if (detail && detail.scrollIntoView) {
        detail.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function closeAssignmentDetail() {
    spaceAsgOpen = null;
    spaceFileState = null;
    const list = document.getElementById("space-asg-list");
    const detail = document.getElementById("space-asg-detail");
    if (list) list.hidden = false;
    if (detail) detail.hidden = true;
    if (spaceSession) renderAssignments(spaceLoad(), spaceSession);
}

/* wire the freshly rendered detail (elements are recreated on
   every render, so listeners are attached fresh every time) */
function wireDetail(db, session, asg) {
    const input = document.getElementById("asg-file-input");
    const zone = document.getElementById("asg-dropzone");
    const text = document.getElementById("asg-text");
    const counter = document.getElementById("asg-counter");

    if (zone && input) {
        zone.addEventListener("click", () => input.click());
        input.addEventListener("change", () => {
            if (input.files && input.files.length) handlePendingFile(input.files[0]);
        });
        ["dragenter", "dragover"].forEach(ev =>
            zone.addEventListener(ev, (e) => {
                e.preventDefault();
                zone.classList.add("is-drag");
            }));
        ["dragleave", "drop"].forEach(ev =>
            zone.addEventListener(ev, (e) => {
                e.preventDefault();
                zone.classList.remove("is-drag");
            }));
        zone.addEventListener("drop", (e) => {
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
                handlePendingFile(e.dataTransfer.files[0]);
            }
        });
    }

    /* character counter (polish: answers have a sane limit) */
    if (text && counter) {
        const paint = () => {
            counter.textContent = text.value.length + " / 2000 characters";
            counter.classList.toggle("is-over", text.value.length > 2000);
        };
        text.addEventListener("input", paint);
        paint();
    }

    const submitBtn = document.getElementById("asg-submit");
    if (submitBtn) submitBtn.addEventListener("click", () => submitAssignment(db, session, asg));

    const removeBtn = document.getElementById("asg-remove");
    if (removeBtn) {
        removeBtn.addEventListener("click", () => {
            spaceConfirm({
                title: "Remove your submission?",
                text: "The text, file and comments go away. You can submit again any time before grading.",
                okLabel: "Remove it",
                danger: true
            }).then(ok => {
                if (!ok) return;
                delete asg.submissions[session.id];
                spaceSave(db);
                spaceToast("Submission removed", "bad");
                renderAssignments(db, session);
                openAssignmentDetail(db, session, asg.id);
            });
        });
    }

    const form = document.getElementById("asg-comment-form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const field = document.getElementById("asg-comment-input");
            const value = field ? field.value.trim() : "";
            if (!value) return;
            const sub = asg.submissions[session.id];
            if (!sub) return;
            if (!sub.comments) sub.comments = [];
            sub.comments.push({ by: session.id, text: value, minutesAgo: 0 });
            spaceSave(db);
            spaceToast("Comment added", "good");
            openAssignmentDetail(db, session, asg.id);
        });
    }
}

function submitAssignment(db, session, asg) {
    const textEl = document.getElementById("asg-text");
    const text = textEl ? textEl.value.trim() : "";
    const err = document.getElementById("asg-error");

    const fail = (message) => {
        if (err) {
            err.textContent = message;
            err.hidden = false;
        }
    };
    if (err) err.hidden = true;

    if (!text && !spaceFileState) {
        return fail("Add a written answer or attach a file first.");
    }
    if (text.length > 2000) {
        return fail("Your answer is over the 2000-character limit.");
    }
    if (spaceFileState) {
        const issues = fileIssues(spaceFileState, asg, session);
        if (issues.length) return fail(issues.join(" "));
    }

    const prev = asg.submissions[session.id];
    asg.submissions[session.id] = {
        text,
        fileName: spaceFileState ? spaceFileState.name : (prev ? prev.fileName : null),
        sizeKB: spaceFileState ? spaceFileState.sizeKB : (prev ? prev.sizeKB : null),
        submittedAtMinutesAgo: 0,
        score: null,
        feedback: "",
        comments: prev ? (prev.comments || []) : []
    };

    const newBadge = unlockBadge(db, session.id, "first-steps");
    spaceSave(db);
    spaceFileState = null;

    spaceToast(prev ? "Submission updated" : "Assignment submitted. Nice work!", "good");
    if (newBadge) spaceToast("Badge unlocked — First Steps \u{1F331}", "good");

    renderAssignments(db, session);
    renderAchievements(db, session);
    renderHome(db, session);
    openAssignmentDetail(db, session, asg.id);
}

/* ---------- §8 MATERIALS ---------- */
function renderMaterials(db, session) {
    const box = document.getElementById("space-materials");
    if (!box) return;

    const q = spaceMatQuery.trim().toLowerCase();
    const list = db.materials.filter(m =>
        !q || m.title.toLowerCase().includes(q) ||
        m.fileName.toLowerCase().includes(q) ||
        m.course.toLowerCase().includes(q));

    if (!list.length) {
        box.innerHTML = '<p class="space-empty-inline">No files match.</p>';
        return;
    }

    box.innerHTML = list.map(m => {
        const teacher = spaceProfile(db, m.teacher);
        return `
        <div class="file-row mat-row">
            <span class="file-type">${spaceTypeTag(m.fileName)}</span>
            <div class="space-file-info">
                <p class="space-file-name-static">${spaceEsc(m.title)}</p>
                <p class="space-file-note">${spaceEsc(m.course)} &middot;
                   ${spaceEsc(teacher.name)} &middot;
                   ${spaceSize(m.sizeKB)} &middot; ${spaceAgo(m.minutesAgo)}</p>
            </div>
            <button type="button" class="btn btn-ghost btn-small"
                    data-download="${spaceEsc(m.id)}">Download</button>
        </div>`;
    }).join("");
}

/* ---------- §9 ACHIEVEMENTS ---------- */
function renderAchievements(db, session) {
    const earnedBox = document.getElementById("space-badges-earned");
    const lockedBox = document.getElementById("space-badges-locked");
    if (!earnedBox && !lockedBox) return;

    const earnedIds = (db.earnedBadges[session.id] || [])
        .slice().sort((a, b) => a.earnedDaysAgo - b.earnedDaysAgo);

    if (earnedBox) {
        earnedBox.innerHTML = earnedIds.length ? earnedIds.map(e => {
            const badge = db.badgeCatalog.find(b => b.id === e.id);
            if (!badge) return "";
            const when = e.earnedDaysAgo > 0
                ? spaceAgo(e.earnedDaysAgo * 24 * 60)
                : "just now";
            return `
            <div class="badge-card">
                <span class="badge-icon">${badge.icon}</span>
                <div>
                    <p class="badge-label">${spaceEsc(badge.label)}</p>
                    <p class="badge-desc">${spaceEsc(badge.desc)}</p>
                    <p class="badge-when">Earned ${when}</p>
                </div>
            </div>`;
        }).join("") : '<p class="space-empty-inline">No badges yet — they unlock as you learn.</p>';
    }

    if (lockedBox) {
        const locked = db.badgeCatalog.filter(b =>
            !earnedIds.some(e => e.id === b.id));
        lockedBox.innerHTML = locked.map(b => `
            <div class="badge-card is-locked">
                <span class="badge-icon">${b.icon}</span>
                <div>
                    <p class="badge-label">${spaceEsc(b.label)}</p>
                    <p class="badge-desc">${spaceEsc(b.desc)}</p>
                </div>
            </div>`).join("");
    }
}

/* ---------- §10 PROFILE ---------- */
function buildSwatches(box, activeColor) {
    if (!box) return;
    box.innerHTML = SPACE_COLORS.map(c => `
        <button type="button" class="space-swatch ${c === activeColor ? "is-active" : ""}"
                data-color="${c}" style="--sw:${c}" title="${c}"
                aria-label="Pick ${c}"></button>`).join("");
    box.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-color]");
        if (!btn) return;
        box.querySelectorAll(".space-swatch").forEach(b =>
            b.classList.toggle("is-active", b === btn));
    });
}

function renderProfile(db, session) {
    const p = spaceProfile(db, session.id);

    const nameInput = document.getElementById("prof-name");
    if (nameInput) nameInput.value = p.name;
    const bioInput = document.getElementById("prof-bio");
    if (bioInput) bioInput.value = p.bio || "";

    buildSwatches(document.getElementById("prof-avatar-colors"), p.avatarColor);
    buildSwatches(document.getElementById("prof-accent-colors"), p.accent);

    const prefA = document.getElementById("pref-assignments");
    if (prefA) prefA.checked = Boolean(p.prefs.emailAssignments);
    const prefN = document.getElementById("pref-announcements");
    if (prefN) prefN.checked = Boolean(p.prefs.emailAnnouncements);
    const prefC = document.getElementById("pref-chat");
    if (prefC) prefC.checked = Boolean(p.prefs.pingChat);

    const link = document.getElementById("prof-public-link");
    if (link) link.href = "profile.html?id=" + encodeURIComponent(session.id);
}

function pickedColor(box, fallback) {
    const active = box ? box.querySelector(".space-swatch.is-active") : null;
    return (active && active.dataset.color) ? active.dataset.color : fallback;
}

function saveProfile(db, session) {
    const p = spaceProfile(db, session.id);
    const nameInput = document.getElementById("prof-name");
    const bioInput = document.getElementById("prof-bio");

    const name = nameInput ? nameInput.value.trim() : p.name;
    if (!name) {
        spaceToast("Display name can't be empty", "bad");
        return;
    }

    p.name = name;
    p.bio = bioInput ? bioInput.value.trim() : p.bio;
    p.avatarColor = pickedColor(document.getElementById("prof-avatar-colors"), p.avatarColor);
    p.accent = pickedColor(document.getElementById("prof-accent-colors"), p.accent);
    p.prefs.emailAssignments = Boolean(document.getElementById("pref-assignments") &&
        document.getElementById("pref-assignments").checked);
    p.prefs.emailAnnouncements = Boolean(document.getElementById("pref-announcements") &&
        document.getElementById("pref-announcements").checked);
    p.prefs.pingChat = Boolean(document.getElementById("pref-chat") &&
        document.getElementById("pref-chat").checked);

    spaceSave(db);

    /* keep the session + shell in sync with the new name/colors */
    session.name = name;
    if (typeof sessionSave === "function") sessionSave(session);
    applyProfileToShell(db, session);
    const greeting = document.getElementById("space-greeting-name");
    if (greeting) greeting.textContent = "Welcome back, " + name + ".";
    if (typeof refreshHeaderChip === "function") refreshHeaderChip();

    const status = document.getElementById("prof-status");
    if (status) status.textContent = "Saved just now.";

    spaceToast("Profile saved", "good");
}

/* wire the panel listeners ONCE (containers are stable even when
   their insides are re-rendered) */
function wireStudentPanels(db, session) {
    /* class filters */
    document.querySelectorAll("#space-asg-filters .seg-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            spaceAsgFilter = btn.dataset.filter;
            document.querySelectorAll("#space-asg-filters .seg-btn").forEach(b =>
                b.classList.toggle("is-active", b === btn));
            if (spaceAsgOpen) closeAssignmentDetail();
            else renderAssignments(db, session);
        });
    });

    /* click an assignment row */
    const rows = document.getElementById("space-asg-rows");
    if (rows) {
        rows.addEventListener("click", (e) => {
            const row = e.target.closest("[data-asg]");
            if (row) openAssignmentDetail(db, session, row.dataset.asg);
        });
    }

    /* back to the list */
    const back = document.getElementById("space-asg-back");
    if (back) back.addEventListener("click", closeAssignmentDetail);

    /* join a class by its code */
    const joinForm = document.getElementById("space-join-form");
    if (joinForm) {
        joinForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const input = document.getElementById("space-join-code");
            const hint = document.getElementById("space-join-hint");
            const code = input ? input.value.trim().toUpperCase() : "";
            const found = db.schedule.find(s => s.code.toUpperCase() === code);
            if (!found) {
                if (hint) {
                    hint.textContent = "No class found for “" + code +
                        "”. Ask your teacher for the code.";
                    hint.classList.add("is-error");
                }
                return;
            }
            if (hint) {
                hint.textContent = "Found it — opening the room…";
                hint.classList.remove("is-error");
            }
            const enrolled = found.students.includes(session.id);
            spaceToast("Joining " + found.course + (enrolled ? "" : " (guest)"), "good");
            setTimeout(() => { window.location.href = "class.html"; }, 600);
        });
    }

    /* materials search */
    const search = document.getElementById("space-mat-search");
    if (search) {
        search.addEventListener("input", () => {
            spaceMatQuery = search.value;
            renderMaterials(db, session);
        });
    }

    /* download (honest demo: no server hosts the files yet) */
    const matBox = document.getElementById("space-materials");
    if (matBox) {
        matBox.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-download]");
            if (!btn) return;
            const mat = db.materials.find(m => m.id === btn.dataset.download);
            if (mat) {
                spaceToast("Demo file — real downloads arrive with the server", "bad");
            }
        });
    }

    /* profile save */
    const save = document.getElementById("prof-save");
    if (save) save.addEventListener("click", () => saveProfile(db, session));
}

/* ============ 11. PUBLIC PROFILE (profile.html) ============
   No login needed — it only ever shows what's safe to show:
   name, avatar, bio, member-since and badges. NEVER grades,
   email, schedule or anything private. That privacy line is the
   whole point of having a separate public page. */
function renderPublicProfile() {
    const box = document.getElementById("public-profile");
    if (!box) return;

    const params = new URLSearchParams(window.location.search || "");
    const id = params.get("id") || "Stu-2001";
    const db = spaceLoad();
    const profile = db.profiles[id];

    if (!profile) {
        box.innerHTML = `
            <div class="space-empty">
                <p><strong>Profile not found</strong></p>
                <p>No user with id “${spaceEsc(id)}”.</p>
            </div>`;
        return;
    }

    const earned = (db.earnedBadges[id] || []).map(e => {
        const badge = db.badgeCatalog.find(b => b.id === e.id);
        return badge ? { ...badge, earnedDaysAgo: e.earnedDaysAgo } : null;
    }).filter(Boolean);

    const member = spaceAgo(profile.joinedDaysAgo * 24 * 60)
        .replace(" ago", "");

    box.innerHTML = `
    <div class="public-head">
        <span class="space-avatar is-big" style="background:${spaceEsc(profile.avatarColor)}">${spaceEsc(profile.name.trim().charAt(0).toUpperCase())}</span>
        <div>
            <h1>${spaceEsc(profile.name)}</h1>
            <p class="space-sub">${spaceEsc(profile.role)} at The English Academy
               &middot; member for ${member}</p>
        </div>
    </div>
    ${profile.bio ? `<p class="public-bio">“${spaceEsc(profile.bio)}”</p>` : ""}
    <h2 class="public-subhead">Badges</h2>
    <div class="badge-grid">
        ${earned.length ? earned.map(b => `
            <div class="badge-card">
                <span class="badge-icon">${b.icon}</span>
                <div>
                    <p class="badge-label">${spaceEsc(b.label)}</p>
                    <p class="badge-desc">${spaceEsc(b.desc)}</p>
                </div>
            </div>`).join("")
        : '<p class="space-empty-inline">No badges yet.</p>'}
    </div>
    <p class="public-privacy">Grades, email and the class schedule stay private —
       this page only shows what's safe to share.</p>`;
}

/* public profile paints on its own (no role, no shell) */
renderPublicProfile();

/* ============ 12. BOOT: gate or shell ============ */
if (SPACE_ROLE && spaceGate && spaceShell) {
    if (!spaceSession) {
        showSpaceGate("Log in to open " + (SPACE_TITLES[SPACE_ROLE] || "your space") +
                      ". Demo accounts are one click away.");
    } else if (spaceSession.role !== SPACE_ROLE) {
        const here = SPACE_TITLES[SPACE_ROLE] || SPACE_ROLE;
        const extra = SPACE_READY[spaceSession.role]
            ? ""
            : " That space arrives in a later build phase.";
        showSpaceGate("You're logged in as " + spaceSession.name + " (" +
                      spaceSession.role + "). This page is the " +
                      here + "." + extra, true);
    } else {
        startSpaceShell(spaceSession);
    }
}
