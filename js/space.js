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
    teacher: true,
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

    /* --- role-specific panels (admin console arrives later) --- */
    if (SPACE_ROLE === "student") startStudentSpace(db, session);
    else if (SPACE_ROLE === "teacher") startTeacherSpace(db, session);
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
    wireProfilePanel(db, session);
    setupInbox(db, session.id, "stu", studentAudience(db, session));
}

/* who may a student message? The teachers of their classes. */
function studentAudience(db, session) {
    const mine = db.courseInstances.filter(c => c.students.includes(session.id));
    return [...new Set(mine.map(c => c.teacher))];
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
    const dueSoon = studentAssignments(db, session).filter(a => {
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
/* a student sees assignments for their classes only */
function studentAssignments(db, session) {
    const myClassIds = db.courseInstances
        .filter(c => c.students.includes(session.id))
        .map(c => c.id);
    return db.assignments.filter(a => !a.classId || myClassIds.includes(a.classId));
}

function renderAssignments(db, session) {
    const rows = document.getElementById("space-asg-rows");
    if (!rows) return;

    const rank = { overdue: 0, todo: 1, submitted: 2, graded: 3 };
    let list = studentAssignments(db, session)
        .map(a => ({ a, status: assignmentStatus(a, session.id) }));
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
    <p class="asg-instructions">${spaceEsc(asg.instructions)}</p>
    <button type="button" class="btn btn-ghost btn-small" id="asg-ask"
            data-ask="${spaceEsc(asg.createdBy)}">Ask your teacher</button>`;

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

    /* "Ask your teacher" opens Messages with a prefilled draft */
    const askBtn = document.getElementById("asg-ask");
    if (askBtn) {
        askBtn.addEventListener("click", () => {
            const navBtn = document.querySelector('.space-nav-btn[data-panel="messages"]');
            if (navBtn) navBtn.click();
            if (window.spaceInboxOpenWith) {
                window.spaceInboxOpenWith(askBtn.dataset.ask,
                    'About "' + asg.title + '": ');
            }
        });
    }

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
}

/* the profile panel is IDENTICAL on every space page — one
   wiring helper serves student + teacher + admin */
function wireProfilePanel(db, session) {
    const save = document.getElementById("prof-save");
    if (save) save.addEventListener("click", () => saveProfile(db, session));
}

/* ============ MESSAGES / INBOX (shared by student + teacher) ===
   One thread list, two perspectives. Each thread has exactly TWO
   participants; every screen shows "the other person". setupInbox
   is parameterized by a PREFIX (stu-/tch-) so both pages reuse
   this one implementation. */
function otherOf(thread, meId) {
    return thread.participants.find(id => id !== meId);
}

function threadUnread(thread, meId) {
    return thread.messages.filter(m => m.by !== meId &&
        !(m.readBy || []).includes(meId)).length;
}

function unreadTotal(db, meId) {
    return db.messages
        .filter(t => t.participants.includes(meId))
        .reduce((n, t) => n + threadUnread(t, meId), 0);
}

function setupInbox(db, meId, prefix, audience) {
    const listBox = document.getElementById(prefix + "-inbox-list");
    const viewBox = document.getElementById(prefix + "-inbox-view");
    const composeTo = document.getElementById(prefix + "-inbox-new-to");
    const composeText = document.getElementById(prefix + "-inbox-new-text");
    const composeBtn = document.getElementById(prefix + "-inbox-new-send");
    if (!listBox || !viewBox) return;

    let openId = null;

    /* audience dropdown for brand-new conversations */
    if (composeTo) {
        composeTo.innerHTML = audience.map(id => {
            const p = spaceProfile(db, id);
            return `<option value="${spaceEsc(id)}">${spaceEsc(p.name)}</option>`;
        }).join("");
    }

    const myThreads = () => db.messages.filter(t => t.participants.includes(meId));

    function paintBadges() {
        const n = unreadTotal(db, meId);
        const badge = document.getElementById(prefix + "-inbox-badge");
        if (badge) {
            badge.textContent = n;
            badge.hidden = n === 0;
        }
        const stat = document.getElementById("tstat-unread");
        if (stat && SPACE_ROLE === "teacher") stat.textContent = n;
    }

    function renderList() {
        const threads = myThreads();
        if (!threads.length) {
            listBox.innerHTML = '<p class="space-empty-inline">No conversations yet.</p>';
            paintBadges();
            return;
        }
        listBox.innerHTML = threads.map(t => {
            const other = spaceProfile(db, otherOf(t, meId));
            const last = t.messages[t.messages.length - 1];
            const unread = threadUnread(t, meId);
            return `
            <button type="button" class="thread-row ${t.id === openId ? "is-open" : ""}"
                    data-thread="${t.id}">
                <span class="msg-avatar" style="background:${other.avatarColor}">${spaceEsc(other.name.trim().charAt(0).toUpperCase())}</span>
                <span class="thread-info">
                    <span class="thread-name">${spaceEsc(other.name)}
                        ${unread ? `<span class="unread-dot">${unread}</span>` : ""}</span>
                    <span class="thread-preview">${last ? spaceEsc(last.text) : ""}</span>
                </span>
            </button>`;
        }).join("");
        paintBadges();
    }

    function renderView() {
        const thread = myThreads().find(t => t.id === openId);
        if (!thread) {
            viewBox.innerHTML = '<p class="space-empty-inline">Pick a conversation to read it here.</p>';
            return;
        }
        const other = spaceProfile(db, otherOf(thread, meId));
        viewBox.innerHTML = `
            <div class="thread-head">
                <span class="msg-avatar" style="background:${other.avatarColor}">${spaceEsc(other.name.trim().charAt(0).toUpperCase())}</span>
                <div>
                    <p class="thread-name">${spaceEsc(other.name)}</p>
                    <p class="thread-subject">${spaceEsc(thread.subject || "Conversation")}</p>
                </div>
            </div>
            <div class="thread-messages">
                ${thread.messages.map(m => {
                    const mine = m.by === meId;
                    return `
                    <div class="bubble-row ${mine ? "is-mine" : ""}">
                        <div class="bubble ${mine ? "is-mine" : ""}">
                            <p>${spaceEsc(m.text)}</p>
                            <span class="bubble-time">${spaceAgo(m.minutesAgo)}</span>
                        </div>
                    </div>`;
                }).join("")}
            </div>
            <form class="comment-form" id="${prefix}-inbox-reply">
                <input type="text" class="chat-input" id="${prefix}-inbox-input"
                       placeholder="Write a reply…" autocomplete="off">
                <button type="submit" class="btn btn-primary btn-small">Send</button>
            </form>`;

        const replyForm = document.getElementById(prefix + "-inbox-reply");
        if (replyForm) {
            replyForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const input = document.getElementById(prefix + "-inbox-input");
                sendThreadMessage(thread, input ? input.value : "");
            });
        }
    }

    function sendThreadMessage(thread, raw) {
        const text = (raw || "").trim();
        if (!text) return;
        thread.messages.push({ by: meId, text, minutesAgo: 0, readBy: [meId] });
        spaceSave(db);
        renderList();
        renderView();
        spaceToast("Message sent", "good");
    }

    function openThread(id) {
        openId = id;
        const thread = myThreads().find(t => t.id === id);
        if (thread) {
            /* reading marks the OTHER side's messages as seen */
            thread.messages.forEach(m => {
                if (m.by === meId) return;
                if (!m.readBy) m.readBy = [];
                if (!m.readBy.includes(meId)) m.readBy.push(meId);
            });
            spaceSave(db);
        }
        renderList();
        renderView();
    }

    /* open (or create) the thread with a specific person, with an
       optional prefilled draft — used by "Ask your teacher" and
       "Message" buttons across the spaces */
    function openWith(otherId, prefill) {
        let thread = myThreads().find(t => otherOf(t, meId) === otherId);
        if (!thread) {
            thread = {
                id: "thr-" + Date.now(),
                participants: [meId, otherId],
                subject: "New conversation",
                messages: []
            };
            db.messages.push(thread);
            spaceSave(db);
        }
        openId = thread.id;
        renderList();
        renderView();
        const input = document.getElementById(prefix + "-inbox-input");
        if (input) {
            input.value = prefill || "";
            input.focus();
        }
    }
    window.spaceInboxOpenWith = openWith;

    listBox.addEventListener("click", (event) => {
        const row = event.target.closest("[data-thread]");
        if (row) openThread(row.dataset.thread);
    });

    if (composeBtn) {
        composeBtn.addEventListener("click", () => {
            const to = composeTo ? composeTo.value : null;
            const text = composeText ? composeText.value.trim() : "";
            if (!to || !text) {
                spaceToast("Pick a person and write a message", "bad");
                return;
            }
            let thread = myThreads().find(t => otherOf(t, meId) === to);
            if (!thread) {
                thread = {
                    id: "thr-" + Date.now(),
                    participants: [meId, to],
                    subject: "New conversation",
                    messages: []
                };
                db.messages.push(thread);
            }
            if (composeText) composeText.value = "";
            openId = thread.id;
            sendThreadMessage(thread, text);
        });
    }

    renderList();
    renderView();
}

/* ============ TEACHER SPACE ====================================
   Everything below renders into dashboard-teacher.html's panels.
   Same element-guarded style as the student space. */

const GRADING_PHRASES = [
    "Great work — clear and accurate!",
    "Nice effort — watch your verb tenses.",
    "Good ideas; focus on paragraph structure.",
    "Almost there — check the third-person -s.",
    "Please review the present perfect form.",
    "Excellent vocabulary range. Keep it up!"
];

const GRADING_RUBRIC = [
    { id: "task",    weight: 25, label: "Task fully completed" },
    { id: "grammar", weight: 25, label: "Grammar mostly accurate" },
    { id: "vocab",   weight: 25, label: "Good range of vocabulary" },
    { id: "struct",  weight: 25, label: "Clear structure" }
];

const TEACHER_KIND_LABEL = { task: "Task", worksheet: "Worksheet", exam: "Exam" };

let gbClassId = null;   // gradebook: which class is selected
let gbGrader = null;    // { stuId, asgId } while the grader is open

function teacherClasses(db, session) {
    return db.courseInstances.filter(c => c.teacher === session.id);
}

function teacherStudents(db, session) {
    const ids = new Set();
    teacherClasses(db, session).forEach(c => c.students.forEach(s => ids.add(s)));
    return [...ids];
}

function teacherAssignments(db, session) {
    const clsIds = teacherClasses(db, session).map(c => c.id);
    return db.assignments.filter(a => clsIds.includes(a.classId));
}

function startTeacherSpace(db, session) {
    renderTeacherToday(db, session);
    renderTeacherClasses(db, session);
    renderGradebook(db, session);
    renderTeacherAssignments(db, session);
    renderTeacherStudents(db, session);
    renderTeacherMaterials(db, session);
    renderProfile(db, session);
    wireProfilePanel(db, session);
    setupInbox(db, session.id, "tch", teacherStudents(db, session));
    wireTeacherPanels(db, session);
}

/* ---------- teacher: TODAY ---------- */
function renderTeacherToday(db, session) {
    const students = teacherStudents(db, session);
    const asgs = teacherAssignments(db, session);

    let ungraded = 0;
    asgs.forEach(a => Object.values(a.submissions)
        .forEach(s => { if (s.score == null) ungraded++; }));

    const stStudents = document.getElementById("tstat-students");
    if (stStudents) stStudents.textContent = students.length;
    const stUngraded = document.getElementById("tstat-ungraded");
    if (stUngraded) stUngraded.textContent = ungraded;
    const stUnread = document.getElementById("tstat-unread");
    if (stUnread) stUnread.textContent = unreadTotal(db, session.id);

    const next = db.schedule
        .filter(s => s.teacher === session.id && s.startsInMinutes >= 0)
        .sort((a, b) => a.startsInMinutes - b.startsInMinutes)[0] || null;
    const stNext = document.getElementById("tstat-next");
    if (stNext) stNext.textContent = next ? spaceWhen(next.startsInMinutes) : "—";

    const nextBox = document.getElementById("tch-next-class");
    if (nextBox) {
        nextBox.innerHTML = next ? `
            <div class="space-next">
                <div>
                    <p class="space-next-course">${spaceEsc(next.course)}</p>
                    <p class="space-next-meta">${next.students.length} students &middot;
                       ${spaceWhen(next.startsInMinutes)} (${spaceClock(next.startsInMinutes)})
                       &middot; code <code>${spaceEsc(next.code)}</code></p>
                </div>
                <a class="btn btn-primary" href="class-teacher.html">Open room</a>
            </div>` : '<p class="space-empty-inline">No live class scheduled right now.</p>';
    }

    const queue = document.getElementById("tch-ungraded-list");
    if (queue) {
        const items = [];
        asgs.forEach(a => {
            const cls = db.courseInstances.find(c => c.id === a.classId);
            Object.entries(a.submissions).forEach(([stuId, sub]) => {
                if (sub.score == null) items.push({ a, stuId, cls });
            });
        });
        queue.innerHTML = items.length ? items.slice(0, 5).map(({ a, stuId }) => {
            const student = spaceProfile(db, stuId);
            return `
            <div class="today-row">
                <span class="msg-avatar" style="background:${student.avatarColor}">${spaceEsc(student.name.trim().charAt(0).toUpperCase())}</span>
                <div class="today-row-main">
                    <p class="space-next-course">${spaceEsc(student.name)}</p>
                    <p class="space-next-meta">${spaceEsc(a.title)} &middot; ${dueLabel(a)}</p>
                </div>
                <button type="button" class="btn btn-ghost btn-small"
                        data-grade-now="${spaceEsc(a.id)}|${spaceEsc(stuId)}">Grade</button>
            </div>`;
        }).join("") : '<p class="space-empty-inline">Nothing waiting for grading. 🎉</p>';
    }

    const activity = document.getElementById("tch-activity");
    if (activity) {
        activity.innerHTML = db.activity.slice(0, 5).map(act => `
            <div class="today-row">
                <span class="activity-dot"></span>
                <div class="today-row-main">
                    <p class="space-next-meta">${spaceEsc(act.text)}</p>
                    <p class="space-next-meta muted">${spaceAgo(act.minutesAgo)}</p>
                </div>
            </div>`).join("");
    }
}

/* ---------- teacher: MY CLASSES (course instances) ---------- */
function renderTeacherClasses(db, session) {
    const box = document.getElementById("tch-classes");
    if (box) {
        const mine = teacherClasses(db, session);
        box.innerHTML = mine.length ? mine.map(c => `
            <div class="class-manage">
                <div class="class-manage-main">
                    <p class="space-next-course">${spaceEsc(c.title)}
                        <span class="level-tag">${spaceEsc(c.level)}</span></p>
                    <p class="space-next-meta">${spaceEsc(c.meetings)} &middot;
                       ${c.students.length} students &middot;
                       code <code>${spaceEsc(c.code)}</code></p>
                    <div class="progress-track" title="${c.progress}% average progress">
                        <div class="progress-fill" style="--progress:${c.progress}%"></div>
                    </div>
                </div>
                <div class="class-manage-actions">
                    <a class="btn btn-primary btn-small" href="class-teacher.html">Open room</a>
                    <button type="button" class="btn btn-ghost btn-small"
                            data-gb-class="${spaceEsc(c.id)}">Gradebook</button>
                </div>
            </div>`).join("")
            : '<p class="space-empty-inline">No classes yet — create your first one below.</p>';
    }

    /* level + skill picker comes from the real course catalog */
    const levelSelect = document.getElementById("tch-new-level");
    if (levelSelect && typeof LEVELS !== "undefined") {
        levelSelect.innerHTML = LEVELS.map(level =>
            level.skills.map(skill => {
                const value = level.id + "|" + skill.name;
                return `<option value="${spaceEsc(value)}">${spaceEsc(level.id)} ·
                        ${spaceEsc(skill.name)}</option>`;
            }).join("")
        ).join("");
    }

    /* who can be enrolled? every demo student profile */
    const picker = document.getElementById("tch-new-students");
    if (picker) {
        const students = Object.keys(db.profiles)
            .filter(id => db.profiles[id].role === "student");
        picker.innerHTML = students.map(id => {
            const p = db.profiles[id];
            return `
            <label class="pick-row">
                <input type="checkbox" value="${spaceEsc(id)}">
                ${spaceEsc(p.name)} <span class="muted small">(${spaceEsc(id)})</span>
            </label>`;
        }).join("");
    }
}

function createTeacherInstance(db, session) {
    const levelSel = document.getElementById("tch-new-level");
    const groupInput = document.getElementById("tch-new-group");
    const meetingsInput = document.getElementById("tch-new-meetings");
    const sessionsInput = document.getElementById("tch-new-sessions");
    if (!levelSel) return;

    const [level, skill] = levelSel.value.split("|");
    if (!level || !skill) return;
    const group = groupInput ? groupInput.value.trim() : "";
    const meetings = meetingsInput && meetingsInput.value.trim()
        ? meetingsInput.value.trim() : "Schedule to be announced";
    const sessionsTotal = sessionsInput && Number(sessionsInput.value) > 0
        ? Number(sessionsInput.value) : 10;

    /* unique join code, e.g. B1-CONV or B1-CONV-2 */
    let code = level.toUpperCase() + "-" + skill.slice(0, 4).toUpperCase();
    let n = 2;
    while (db.courseInstances.some(c => c.code === code)) {
        code = level.toUpperCase() + "-" + skill.slice(0, 4).toUpperCase() + "-" + n;
        n++;
    }

    const students = [...document.querySelectorAll("#tch-new-students input:checked")]
        .map(input => input.value);

    const instance = {
        id: "cls-" + Date.now(),
        title: level + " · " + skill + (group ? " — " + group : ""),
        level, skill,
        teacher: session.id,
        students,
        meetings, code,
        sessionsTotal,
        progress: 0
    };
    db.courseInstances.push(instance);

    /* enrolled students get the course on their dashboard too */
    students.forEach((stuId, i) => {
        const already = db.enrollments.some(e =>
            e.student === stuId && e.title === instance.title);
        if (already) return;
        db.enrollments.push({
            id: "enr-" + Date.now() + "-" + i,
            student: stuId, level, skill,
            title: instance.title, teacher: session.id,
            progress: 0, sessionsDone: 0, sessionsTotal,
            nextLesson: "First lesson — orientation"
        });
    });

    spaceSave(db);
    spaceToast("Class created — students see it on their dashboards", "good");
    if (groupInput) groupInput.value = "";
    if (meetingsInput) meetingsInput.value = "";
    renderTeacherClasses(db, session);
    renderGradebook(db, session);
    renderTeacherToday(db, session);
}

/* ---------- teacher: GRADEBOOK (the interactive matrix) ---------- */
function renderGradebook(db, session) {
    const select = document.getElementById("gb-class");
    const tableBox = document.getElementById("gb-table");
    const mine = teacherClasses(db, session);

    if (select) {
        select.innerHTML = mine.map(c =>
            `<option value="${spaceEsc(c.id)}">${spaceEsc(c.title)}</option>`
        ).join("");
        if (!gbClassId || !mine.some(c => c.id === gbClassId)) {
            gbClassId = mine.length ? mine[0].id : null;
        }
        if (gbClassId) select.value = gbClassId;
    }
    if (!tableBox || !gbClassId) {
        if (tableBox) tableBox.innerHTML =
            '<p class="space-empty-inline">Create a class first.</p>';
        return;
    }

    const cls = db.courseInstances.find(c => c.id === gbClassId);
    const asgs = db.assignments.filter(a => a.classId === gbClassId)
        .sort((a, b) => a.dueInHours - b.dueInHours);

    if (!cls.students.length) {
        tableBox.innerHTML = '<p class="space-empty-inline">No students in this class yet.</p>';
        return;
    }

    const head = `
        <tr>
            <th class="gb-sticky">Student</th>
            ${asgs.map(a => `
                <th>
                    <span class="gb-asg-title">${spaceEsc(a.title)}</span>
                    <span class="kind-chip is-${spaceEsc(a.kind)}">${TEACHER_KIND_LABEL[a.kind] || "Task"}</span>
                    <span class="gb-due">${dueLabel(a)}</span>
                </th>`).join("")}
            <th>Average</th>
        </tr>`;

    const rows = cls.students.map(stuId => {
        const student = spaceProfile(db, stuId);
        let gradedPct = [];

        const cells = asgs.map(a => {
            const sub = a.submissions[stuId];
            const status = assignmentStatus(a, stuId);
            if (sub && sub.score != null) {
                gradedPct.push(sub.score / a.maxScore);
                return `<td><button type="button" class="gb-cell is-graded"
                    data-stu="${spaceEsc(stuId)}" data-asg="${spaceEsc(a.id)}"
                    title="Graded ${sub.score}/${a.maxScore}">${sub.score}</button></td>`;
            }
            if (sub) {
                return `<td><button type="button" class="gb-cell is-submitted"
                    data-stu="${spaceEsc(stuId)}" data-asg="${spaceEsc(a.id)}"
                    title="Submitted — waiting for a grade">Grade</button></td>`;
            }
            const missing = status === "overdue";
            return `<td><button type="button" class="gb-cell ${missing ? "is-missing" : "is-none"}"
                data-stu="${spaceEsc(stuId)}" data-asg="${spaceEsc(a.id)}"
                title="${missing ? "Not submitted (overdue)" : "Not submitted yet"}">${missing ? "–" : "·"}</button></td>`;
        }).join("");

        const avg = gradedPct.length
            ? Math.round(gradedPct.reduce((x, y) => x + y, 0) / gradedPct.length * 100) + "%"
            : "—";

        return `
        <tr>
            <td class="gb-sticky">
                <span class="msg-avatar" style="background:${student.avatarColor}">${spaceEsc(student.name.trim().charAt(0).toUpperCase())}</span>
                <span class="gb-name">${spaceEsc(student.name)}</span>
            </td>
            ${cells}
            <td class="gb-avg">${avg}</td>
        </tr>`;
    }).join("");

    tableBox.innerHTML = `
        <div class="gb-scroll">
            <table class="gb-table">
                <thead>${head}</thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
        <p class="space-hint">Click any cell to grade, read or message the student.
           · <span class="gb-key is-graded">score</span>
           <span class="gb-key is-submitted">needs grading</span>
           <span class="gb-key is-missing">missing</span></p>`;
}

function graderHTML(db, session, asg, student, sub) {
    const status = assignmentStatus(asg, student.id);
    const cls = db.courseInstances.find(c => c.id === asg.classId);

    const head = `
    <div class="asg-head">
        <div>
            <h2>${spaceEsc(student.name)} — ${spaceEsc(asg.title)}</h2>
            <p class="space-next-meta">${spaceEsc(cls ? cls.title : asg.course)} &middot;
               ${TEACHER_KIND_LABEL[asg.kind] || "Task"} &middot; ${dueLabel(asg)} &middot;
               max ${asg.maxScore} points</p>
        </div>
        <span class="status-chip is-${status}">${ASG_STATUS_LABEL[status]}</span>
        <button type="button" class="btn btn-ghost btn-small" id="gr-close">Close</button>
    </div>
    <div class="grade-actions">
        <button type="button" class="btn btn-ghost btn-small"
                data-msg-student="${spaceEsc(student.id)}">Message ${spaceEsc(student.name)}</button>
    </div>`;

    if (!sub) {
        return head + `
        <p class="space-empty-inline">No submission yet from this student.</p>`;
    }

    const fileRow = sub.fileName ? `
        <div class="file-row space-file-card is-static">
            <span class="file-type">${spaceTypeTag(sub.fileName)}</span>
            <div class="space-file-info">
                <p class="space-file-name-static">${spaceEsc(sub.fileName)}</p>
                <p class="space-file-note">${spaceSize(sub.sizeKB || 0)}</p>
            </div>
        </div>` : "";

    const comments = (sub.comments || []).map(c => {
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

    return head + `
    <h3 class="space-subhead">Submission (${spaceAgo(sub.submittedAtMinutesAgo)})</h3>
    ${sub.text ? `<p class="asg-answer">${spaceEsc(sub.text)}</p>` : ""}
    ${fileRow}

    <h3 class="space-subhead">Grading tools</h3>
    <div class="grade-tools">
        <div class="grade-tool-block">
            <p class="space-label">Quick score</p>
            <div class="quick-scores">
                ${[0, 50, 75, 85, 95].map(pct =>
                    `<button type="button" class="btn btn-ghost btn-small"
                             data-score-pct="${pct}">${pct}%</button>`).join("")}
                <button type="button" class="btn btn-ghost btn-small"
                        data-score-pct="100">Full marks</button>
            </div>
            <p class="space-label">Score (out of ${asg.maxScore})</p>
            <input type="number" class="mini-input" id="gr-score" min="0"
                   max="${asg.maxScore}" value="${sub.score != null ? sub.score : ""}">
        </div>
        <div class="grade-tool-block">
            <p class="space-label">Rubric — tick what the work shows</p>
            ${GRADING_RUBRIC.map(r => `
                <label class="pick-row">
                    <input type="checkbox" class="gr-rubric" value="${r.weight}">
                    ${spaceEsc(r.label)} <span class="muted small">${r.weight}%</span>
                </label>`).join("")}
            <p class="space-hint">Suggested: <strong id="gr-suggest">—</strong>
                <button type="button" class="btn btn-ghost btn-small"
                        id="gr-apply-suggest" hidden>Apply</button></p>
        </div>
        <div class="grade-tool-block grade-tool-wide">
            <p class="space-label">Feedback to the student</p>
            <div class="phrase-row">
                <select class="mini-select" id="gr-phrase">
                    ${GRADING_PHRASES.map(p =>
                        `<option value="${spaceEsc(p)}">${spaceEsc(p)}</option>`).join("")}
                </select>
                <button type="button" class="btn btn-ghost btn-small"
                        id="gr-insert">Insert</button>
            </div>
            <textarea class="chat-input space-textarea" id="gr-feedback" rows="4"
                      placeholder="What went well? What should they fix?">${spaceEsc(sub.feedback || "")}</textarea>
            <label class="switch-row">
                <input type="checkbox" id="gr-notify" ${sub.score == null ? "checked" : ""}>
                Also send the feedback as an inbox message</label>
        </div>
    </div>

    <div class="space-submit-row">
        <button type="button" class="btn btn-primary" id="gr-save">Save grade</button>
        ${sub.score != null ? `<button type="button" class="btn btn-ghost" id="gr-clear">Remove grade</button>` : ""}
    </div>

    <h3 class="space-subhead">Comments</h3>
    ${comments || '<p class="space-empty-inline">No comments yet.</p>'}
    <form class="comment-form" id="gr-comment-form">
        <input type="text" class="chat-input" id="gr-comment-input"
               placeholder="Leave a comment on the submission…" autocomplete="off">
        <button type="submit" class="btn btn-primary btn-small">Send</button>
    </form>`;
}

function openGrader(db, session, stuId, asgId) {
    const box = document.getElementById("gb-grader");
    const card = document.getElementById("gb-grader-card");
    if (!box || !card) return;

    const asg = db.assignments.find(a => a.id === asgId);
    if (!asg) return;
    gbGrader = { stuId, asgId };

    const student = spaceProfile(db, stuId);
    const sub = asg.submissions[stuId];
    card.innerHTML = graderHTML(db, session, asg, student, sub);
    wireGrader(db, session, asg, stuId);
    box.hidden = false;
    if (box.scrollIntoView) box.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeGrader() {
    gbGrader = null;
    const box = document.getElementById("gb-grader");
    if (box) box.hidden = true;
}

function wireGrader(db, session, asg, stuId) {
    const closeBtn = document.getElementById("gr-close");
    if (closeBtn) closeBtn.addEventListener("click", closeGrader);

    const msgBtn = document.querySelector("#gb-grader-card [data-msg-student]");
    if (msgBtn) {
        msgBtn.addEventListener("click", () => {
            const navBtn = document.querySelector('.space-nav-btn[data-panel="inbox"]');
            if (navBtn) navBtn.click();
            if (window.spaceInboxOpenWith) {
                window.spaceInboxOpenWith(stuId, 'About "' + asg.title + '": ');
            }
        });
    }

    const scoreInput = document.getElementById("gr-score");
    if (scoreInput) {
        document.querySelectorAll("[data-score-pct]").forEach(btn => {
            btn.addEventListener("click", () => {
                const pct = Number(btn.dataset.scorePct);
                scoreInput.value = Math.round(pct / 100 * asg.maxScore);
            });
        });
    }

    /* rubric -> suggested score */
    const suggestEl = document.getElementById("gr-suggest");
    const applyBtn = document.getElementById("gr-apply-suggest");
    const rubricBoxes = document.querySelectorAll(".gr-rubric");
    function updateSuggestion() {
        let sum = 0;
        rubricBoxes.forEach(b => { if (b.checked) sum += Number(b.value); });
        const suggested = Math.round(sum / 100 * asg.maxScore);
        if (suggestEl) {
            suggestEl.textContent = sum ? suggested + " / " + asg.maxScore : "—";
        }
        if (applyBtn) applyBtn.hidden = sum === 0;
    }
    rubricBoxes.forEach(b => b.addEventListener("change", updateSuggestion));

    if (applyBtn) {
        applyBtn.addEventListener("click", () => {
            let sum = 0;
            rubricBoxes.forEach(b => { if (b.checked) sum += Number(b.value); });
            if (scoreInput) scoreInput.value = Math.round(sum / 100 * asg.maxScore);
        });
    }

    const insertBtn = document.getElementById("gr-insert");
    const phraseSel = document.getElementById("gr-phrase");
    const feedback = document.getElementById("gr-feedback");
    if (insertBtn && phraseSel && feedback) {
        insertBtn.addEventListener("click", () => {
            feedback.value = (feedback.value ? feedback.value + "\n" : "") + phraseSel.value;
            feedback.focus();
        });
    }

    const saveBtn = document.getElementById("gr-save");
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            const sub = asg.submissions[stuId];
            if (!sub) return;
            const raw = scoreInput ? Number(scoreInput.value) : NaN;
            if (isNaN(raw) || scoreInput.value === "") {
                spaceToast("Enter a score (or use a quick score)", "bad");
                return;
            }
            const score = Math.max(0, Math.min(asg.maxScore, Math.round(raw)));
            sub.score = score;
            sub.feedback = feedback ? feedback.value.trim() : "";

            const notifyBox = document.getElementById("gr-notify");
            if (notifyBox && notifyBox.checked) {
                const student = spaceProfile(db, stuId);
                let thread = db.messages.find(t =>
                    t.participants.includes(session.id) && t.participants.includes(stuId));
                if (!thread) {
                    thread = {
                        id: "thr-" + Date.now(),
                        participants: [session.id, stuId],
                        subject: "Grade posted",
                        messages: []
                    };
                    db.messages.push(thread);
                }
                thread.messages.push({
                    by: session.id,
                    text: "Grade posted for \"" + asg.title + "\": " + score + "/" +
                          asg.maxScore + (sub.feedback ? " — " + sub.feedback : ""),
                    minutesAgo: 0,
                    readBy: [session.id]
                });
            }

            spaceSave(db);
            spaceToast("Grade saved — " + spaceProfile(db, stuId).name + ": " +
                       score + "/" + asg.maxScore, "good");
            renderGradebook(db, session);
            renderTeacherToday(db, session);
            openGrader(db, session, stuId, asg.id);
        });
    }

    const clearBtn = document.getElementById("gr-clear");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            const sub = asg.submissions[stuId];
            if (!sub) return;
            sub.score = null;
            sub.feedback = "";
            spaceSave(db);
            spaceToast("Grade removed — back in the queue", "bad");
            renderGradebook(db, session);
            renderTeacherToday(db, session);
            openGrader(db, session, stuId, asg.id);
        });
    }

    const commentForm = document.getElementById("gr-comment-form");
    if (commentForm) {
        commentForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const input = document.getElementById("gr-comment-input");
            const text = input ? input.value.trim() : "";
            if (!text) return;
            const sub = asg.submissions[stuId];
            if (!sub) return;
            if (!sub.comments) sub.comments = [];
            sub.comments.push({ by: session.id, text, minutesAgo: 0 });
            spaceSave(db);
            spaceToast("Comment added", "good");
            openGrader(db, session, stuId, asg.id);
        });
    }
}

/* ---------- teacher: ASSIGNMENTS + TEMPLATES ---------- */
function asgFormAllowed() {
    return [...document.querySelectorAll('input[name="tch-asg-type"]:checked')]
        .map(input => input.value);
}

function readAsgForm(db) {
    const title = document.getElementById("tch-asg-title");
    const classSel = document.getElementById("tch-asg-class");
    const kind = document.getElementById("tch-asg-kind");
    const instructions = document.getElementById("tch-asg-instructions");
    const due = document.getElementById("tch-asg-due");
    const dueUnit = document.getElementById("tch-asg-due-unit");
    const max = document.getElementById("tch-asg-max");
    const maxmb = document.getElementById("tch-asg-maxmb");

    return {
        title: title ? title.value.trim() : "",
        classId: classSel ? classSel.value : "",
        kind: kind ? kind.value : "task",
        instructions: instructions ? instructions.value.trim() : "",
        hours: due && Number(due.value) > 0 ? Number(due.value) : 48,
        unit: dueUnit ? dueUnit.value : "hours",
        maxScore: max && Number(max.value) > 0 ? Number(max.value) : 100,
        maxMB: maxmb && Number(maxmb.value) > 0 ? Number(maxmb.value) : 5,
        allowed: asgFormAllowed()
    };
}

function renderTeacherAssignments(db, session) {
    /* class dropdown */
    const classSel = document.getElementById("tch-asg-class");
    const mine = teacherClasses(db, session);
    if (classSel) {
        classSel.innerHTML = mine.map(c =>
            `<option value="${spaceEsc(c.id)}">${spaceEsc(c.title)}</option>`
        ).join("");
    }

    /* templates */
    const tplBox = document.getElementById("tch-templates");
    if (tplBox) {
        tplBox.innerHTML = db.assignmentTemplates.length
            ? db.assignmentTemplates.map(t => `
                <div class="file-row tpl-row">
                    <span class="kind-chip is-${spaceEsc(t.kind)}">${TEACHER_KIND_LABEL[t.kind] || "Task"}</span>
                    <div class="space-file-info">
                        <p class="space-file-name-static">${spaceEsc(t.title)}</p>
                        <p class="space-file-note">max ${t.maxScore} pts &middot; up to ${t.maxMB} MB</p>
                    </div>
                    <button type="button" class="btn btn-ghost btn-small"
                            data-use-template="${spaceEsc(t.id)}">Use</button>
                    <button type="button" class="admin-kick" data-del-template="${spaceEsc(t.id)}"
                            title="Delete template">&times;</button>
                </div>`).join("")
            : '<p class="space-empty-inline">No saved templates yet.</p>';
    }

    /* existing assignments */
    const list = document.getElementById("tch-asg-list");
    if (list) {
        const asgs = teacherAssignments(db, session)
            .sort((a, b) => a.dueInHours - b.dueInHours);
        list.innerHTML = asgs.length ? asgs.map(a => {
            const cls = db.courseInstances.find(c => c.id === a.classId);
            const total = cls ? cls.students.length : 0;
            const submitted = Object.keys(a.submissions).length;
            let ungraded = 0;
            Object.values(a.submissions).forEach(s => { if (s.score == null) ungraded++; });
            return `
            <div class="file-row tpl-row">
                <span class="kind-chip is-${spaceEsc(a.kind)}">${TEACHER_KIND_LABEL[a.kind] || "Task"}</span>
                <div class="space-file-info">
                    <p class="space-file-name-static">${spaceEsc(a.title)}</p>
                    <p class="space-file-note">${spaceEsc(cls ? cls.title : a.course)} &middot;
                       ${dueLabel(a)} &middot; ${submitted}/${total} submitted &middot;
                       ${ungraded} waiting</p>
                </div>
                <button type="button" class="admin-kick" data-del-asg="${spaceEsc(a.id)}"
                        title="Delete assignment">&times;</button>
            </div>`;
        }).join("")
        : '<p class="space-empty-inline">No assignments yet — create one above.</p>';
    }
}

function createTeacherAssignment(db, session) {
    const form = readAsgForm(db);
    if (!form.title) return spaceToast("Give the assignment a title", "bad");
    if (!form.classId) return spaceToast("Pick a class", "bad");
    if (!form.allowed.length) return spaceToast("Pick at least one allowed file type", "bad");

    const cls = db.courseInstances.find(c => c.id === form.classId);
    const dueInHours = form.unit === "days" ? form.hours * 24 : form.hours;

    db.assignments.push({
        id: "asg-" + Date.now(),
        classId: form.classId,
        kind: form.kind,
        course: cls ? cls.title : "Course",
        skill: cls ? cls.skill : "",
        title: form.title,
        instructions: form.instructions || "See the attached task.",
        createdBy: session.id,
        dueInHours,
        maxScore: form.maxScore,
        allowed: form.allowed,
        maxMB: form.maxMB,
        submissions: {}
    });

    spaceSave(db);
    spaceToast("Assignment created for " + (cls ? cls.title : "class"), "good");
    renderTeacherAssignments(db, session);
    renderGradebook(db, session);
    renderTeacherToday(db, session);
}

function fillAsgForm(template) {
    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el && value !== undefined) el.value = value;
    };
    set("tch-asg-title", template.title);
    set("tch-asg-kind", template.kind);
    set("tch-asg-instructions", template.instructions);
    set("tch-asg-max", template.maxScore);
    set("tch-asg-maxmb", template.maxMB);
    document.querySelectorAll('input[name="tch-asg-type"]').forEach(input => {
        input.checked = template.allowed.includes(input.value);
    });
    spaceToast("Template loaded — pick a class and due date", "good");
}

/* ---------- teacher: STUDENTS (badges + notes) ---------- */
function renderTeacherStudents(db, session) {
    const box = document.getElementById("tch-students");
    if (!box) return;
    const ids = teacherStudents(db, session);

    box.innerHTML = ids.length ? ids.map(id => {
        const student = spaceProfile(db, id);
        const classes = teacherClasses(db, session)
            .filter(c => c.students.includes(id))
            .map(c => c.title);
        const earned = (db.earnedBadges[id] || []).map(e => {
            const badge = db.badgeCatalog.find(b => b.id === e.id);
            return badge ? `
                <span class="badge-chip">${badge.icon} ${spaceEsc(badge.label)}
                    <button type="button" data-badge-remove="${spaceEsc(badge.id)}"
                            data-student="${spaceEsc(id)}" title="Remove badge">&times;</button>
                </span>` : "";
        }).join("");
        const unearned = db.badgeCatalog.filter(b =>
            !(db.earnedBadges[id] || []).some(e => e.id === b.id));

        return `
        <div class="student-card">
            <div class="student-head">
                <span class="msg-avatar" style="background:${student.avatarColor}">${spaceEsc(student.name.trim().charAt(0).toUpperCase())}</span>
                <div class="student-head-info">
                    <p class="space-next-course">${spaceEsc(student.name)}</p>
                    <p class="space-next-meta">${spaceEsc(classes.join(" · "))}</p>
                </div>
                <button type="button" class="btn btn-ghost btn-small"
                        data-msg-student="${spaceEsc(id)}">Message</button>
            </div>
            <p class="space-label">Badges</p>
            <div class="badge-chips">${earned || '<span class="space-empty-inline">No badges yet.</span>'}</div>
            ${unearned.length ? `
            <div class="award-row">
                <select class="mini-select" data-badge-select="${spaceEsc(id)}">
                    ${unearned.map(b =>
                        `<option value="${spaceEsc(b.id)}">${b.icon} ${spaceEsc(b.label)}</option>`).join("")}
                </select>
                <button type="button" class="btn btn-primary btn-small"
                        data-badge-award="${spaceEsc(id)}">Award</button>
            </div>` : ""}
            <p class="space-label">Private note (students never see this)</p>
            <textarea class="chat-input space-textarea" rows="2"
                      data-note="${spaceEsc(id)}">${spaceEsc(db.notes[id] || "")}</textarea>
            <div class="award-row">
                <button type="button" class="btn btn-ghost btn-small"
                        data-note-save="${spaceEsc(id)}">Save note</button>
            </div>
        </div>`;
    }).join("") : '<p class="space-empty-inline">No students yet — create a class first.</p>';
}

/* ---------- teacher: MATERIALS ---------- */
function renderTeacherMaterials(db, session) {
    const courseSel = document.getElementById("tch-mat-course");
    const list = document.getElementById("tch-materials");

    if (courseSel) {
        courseSel.innerHTML = teacherClasses(db, session).map(c =>
            `<option value="${spaceEsc(c.title)}">${spaceEsc(c.title)}</option>`
        ).join("");
    }

    if (list) {
        const mine = db.materials.filter(m => m.teacher === session.id);
        list.innerHTML = mine.length ? mine.map(m => `
            <div class="file-row tpl-row">
                <span class="file-type">${spaceTypeTag(m.fileName)}</span>
                <div class="space-file-info">
                    <p class="space-file-name-static">${spaceEsc(m.title)}</p>
                    <p class="space-file-note">${spaceEsc(m.course)} &middot;
                       ${spaceSize(m.sizeKB)} &middot; ${spaceAgo(m.minutesAgo)}</p>
                </div>
                <button type="button" class="admin-kick" data-del-material="${spaceEsc(m.id)}"
                        title="Delete material">&times;</button>
            </div>`).join("")
        : '<p class="space-empty-inline">Nothing uploaded yet.</p>';
    }
}

/* ---------- teacher: panel wiring ---------- */
function wireTeacherPanels(db, session) {
    /* class dropdown in the gradebook */
    const gbSelect = document.getElementById("gb-class");
    if (gbSelect) {
        gbSelect.addEventListener("change", () => {
            gbClassId = gbSelect.value;
            closeGrader();
            renderGradebook(db, session);
        });
    }

    /* gradebook cells (delegated: the table re-renders a lot) */
    const gbTable = document.getElementById("gb-table");
    if (gbTable) {
        gbTable.addEventListener("click", (event) => {
            const cell = event.target.closest("[data-stu]");
            if (!cell) return;
            openGrader(db, session, cell.dataset.stu, cell.dataset.asg);
        });
    }

    /* class cards: "Gradebook" jumps into the table for that class */
    const classBox = document.getElementById("tch-classes");
    if (classBox) {
        classBox.addEventListener("click", (event) => {
            const btn = event.target.closest("[data-gb-class]");
            if (!btn) return;
            gbClassId = btn.dataset.gbClass;
            renderGradebook(db, session);
            const navBtn = document.querySelector('.space-nav-btn[data-panel="gradebook"]');
            if (navBtn) navBtn.click();
        });
    }

    /* create a course instance */
    const createBtn = document.getElementById("tch-new-create");
    if (createBtn) {
        createBtn.addEventListener("click", () => createTeacherInstance(db, session));
    }

    /* today's grading queue: jump straight to the grader */
    const queue = document.getElementById("tch-ungraded-list");
    if (queue) {
        queue.addEventListener("click", (event) => {
            const btn = event.target.closest("[data-grade-now]");
            if (!btn) return;
            const [asgId, stuId] = btn.dataset.gradeNow.split("|");
            const asg = db.assignments.find(a => a.id === asgId);
            if (asg) gbClassId = asg.classId;
            renderGradebook(db, session);
            const navBtn = document.querySelector('.space-nav-btn[data-panel="gradebook"]');
            if (navBtn) navBtn.click();
            openGrader(db, session, stuId, asgId);
        });
    }

    /* new-message shortcut from the students list */
    const studentsBox = document.getElementById("tch-students");
    if (studentsBox) {
        studentsBox.addEventListener("click", (event) => {
            const msg = event.target.closest("[data-msg-student]");
            if (msg) {
                const navBtn = document.querySelector('.space-nav-btn[data-panel="inbox"]');
                if (navBtn) navBtn.click();
                if (window.spaceInboxOpenWith) {
                    window.spaceInboxOpenWith(msg.dataset.msgStudent, "");
                }
                return;
            }

            const removeBtn = event.target.closest("[data-badge-remove]");
            if (removeBtn) {
                const badgeId = removeBtn.dataset.badgeRemove;
                const stuId = removeBtn.dataset.student;
                db.earnedBadges[stuId] = (db.earnedBadges[stuId] || [])
                    .filter(b => b.id !== badgeId);
                spaceSave(db);
                renderTeacherStudents(db, session);
                spaceToast("Badge removed", "bad");
                return;
            }

            const awardBtn = event.target.closest("[data-badge-award]");
            if (awardBtn) {
                const stuId = awardBtn.dataset.badgeAward;
                const sel = studentsBox.querySelector(`[data-badge-select="${stuId}"]`);
                if (!sel) return;
                if (unlockBadge(db, stuId, sel.value)) {
                    spaceSave(db);
                    renderTeacherStudents(db, session);
                    const badge = db.badgeCatalog.find(b => b.id === sel.value);
                    spaceToast("Badge awarded — " + (badge ? badge.label : sel.value), "good");
                }
                return;
            }

            const noteBtn = event.target.closest("[data-note-save]");
            if (noteBtn) {
                const stuId = noteBtn.dataset.noteSave;
                const area = studentsBox.querySelector(`[data-note="${stuId}"]`);
                db.notes[stuId] = area ? area.value.trim() : "";
                spaceSave(db);
                spaceToast("Note saved", "good");
            }
        });
    }

    /* assignments form */
    const createAsg = document.getElementById("tch-asg-create");
    if (createAsg) {
        createAsg.addEventListener("click", () => createTeacherAssignment(db, session));
    }
    const tplSave = document.getElementById("tch-asg-template-save");
    if (tplSave) {
        tplSave.addEventListener("click", () => {
            const form = readAsgForm(db);
            if (!form.title) return spaceToast("Give the template a title", "bad");
            db.assignmentTemplates.push({
                id: "tpl-" + Date.now(),
                kind: form.kind,
                title: form.title,
                instructions: form.instructions,
                allowed: form.allowed.length ? form.allowed : ["pdf"],
                maxMB: form.maxMB,
                maxScore: form.maxScore
            });
            spaceSave(db);
            renderTeacherAssignments(db, session);
            spaceToast("Saved as a reusable template", "good");
        });
    }
    const tplBox = document.getElementById("tch-templates");
    if (tplBox) {
        tplBox.addEventListener("click", (event) => {
            const use = event.target.closest("[data-use-template]");
            if (use) {
                const tpl = db.assignmentTemplates.find(t =>
                    t.id === use.dataset.useTemplate);
                if (tpl) fillAsgForm(tpl);
                return;
            }
            const del = event.target.closest("[data-del-template]");
            if (del) {
                spaceConfirm({
                    title: "Delete this template?",
                    text: "The template disappears for every future assignment.",
                    okLabel: "Delete",
                    danger: true
                }).then(ok => {
                    if (!ok) return;
                    db.assignmentTemplates = db.assignmentTemplates
                        .filter(t => t.id !== del.dataset.delTemplate);
                    spaceSave(db);
                    renderTeacherAssignments(db, session);
                    spaceToast("Template deleted", "bad");
                });
            }
        });
    }
    const asgList = document.getElementById("tch-asg-list");
    if (asgList) {
        asgList.addEventListener("click", (event) => {
            const del = event.target.closest("[data-del-asg]");
            if (!del) return;
            spaceConfirm({
                title: "Delete this assignment?",
                text: "It disappears from every student's dashboard, including any grades.",
                okLabel: "Delete",
                danger: true
            }).then(ok => {
                if (!ok) return;
                db.assignments = db.assignments.filter(a =>
                    a.id !== del.dataset.delAsg);
                spaceSave(db);
                renderTeacherAssignments(db, session);
                renderGradebook(db, session);
                renderTeacherToday(db, session);
                spaceToast("Assignment deleted", "bad");
            });
        });
    }

    /* materials */
    const addMat = document.getElementById("tch-mat-add");
    if (addMat) {
        addMat.addEventListener("click", () => {
            const course = document.getElementById("tch-mat-course");
            const title = document.getElementById("tch-mat-title");
            const file = document.getElementById("tch-mat-file");
            if (!file || !file.files || !file.files.length) {
                return spaceToast("Pick a file first", "bad");
            }
            const f = file.files[0];
            db.materials.push({
                id: "mat-" + Date.now(),
                course: course ? course.value : "General",
                title: title && title.value.trim() ? title.value.trim() : f.name,
                fileName: f.name,
                sizeKB: Math.max(1, Math.round(f.size / 1024)),
                teacher: session.id,
                minutesAgo: 0
            });
            spaceSave(db);
            if (title) title.value = "";
            file.value = "";
            renderTeacherMaterials(db, session);
            spaceToast("Material added — students can see it now", "good");
        });
    }
    const matList = document.getElementById("tch-materials");
    if (matList) {
        matList.addEventListener("click", (event) => {
            const del = event.target.closest("[data-del-material]");
            if (!del) return;
            spaceConfirm({
                title: "Delete this material?",
                text: "Students will no longer see it in their Materials panel.",
                okLabel: "Delete",
                danger: true
            }).then(ok => {
                if (!ok) return;
                db.materials = db.materials.filter(m =>
                    m.id !== del.dataset.delMaterial);
                spaceSave(db);
                renderTeacherMaterials(db, session);
                spaceToast("Material deleted", "bad");
            });
        });
    }
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
