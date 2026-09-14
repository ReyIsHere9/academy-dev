/* ============================================================
   SPACE ENGINE — shared by dashboard.html (student),
   dashboard-teacher.html (teacher) and dashboard-admin.html (admin)
   ------------------------------------------------------------
   HOW THREE PAGES SHARE ONE SCRIPT (same pattern as classroom.js):
   every block below is GUARDED — it checks "does my element exist
   on this page?" and "which role am I?" before it runs.
   Teacher pages mark themselves with <body class="role-teacher">,
   the admin page with class="role-admin", student with
   class="role-student".

   WHAT'S IN THIS FILE (grows phase by phase):
     §0 STORE     — the tiny localStorage "database" (seed lives
                    in js/space-data.js; edits survive reloads)
     §1 GATE      — who is allowed in? (demo session check +
                    one-click demo logins for fast testing)
     §2 SHELL     — greeting, avatar, accent color, nav, logout
     §3 UI KIT    — toast + confirm dialog, reused everywhere

   ⚠️ DEMO REALITY CHECK: all "permissions" here are client-side
   theater — a visitor can fake the session from dev tools. The
   real build checks every role on the SERVER and only sends the
   data a role is allowed to see.
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

/* tiny HTML escaper (classroom.js has its own; pages never load
   both engines, so each file stays self-contained) */
const spaceEsc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

/* ============ 0. STORE ============
   ONE localStorage key holds the whole demo database:
   profiles, schedule, announcements, assignments, activity,
   settings. spaceLoad() hands you the object; call spaceSave()
   after any change. Version number: if we ever change the seed
   shape, bump SPACE_DB_VERSION and old stores re-seed. */
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

/* ============ small time formatters (relative times!) ============ */
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

    const avatar = document.getElementById("space-avatar");
    if (avatar) {
        avatar.textContent = profile.name.trim().charAt(0).toUpperCase();
        avatar.style.background = profile.avatarColor;
    }

    const dateEl = document.getElementById("space-date");
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString([], {
            weekday: "long", month: "long", day: "numeric"
        });
    }

    /* --- personal accent color: ONE css variable repaints the
       active nav, links and highlights of this space only --- */
    if (document.body.style && document.body.style.setProperty) {
        document.body.style.setProperty("--space-accent", profile.accent);
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

    /* --- role-specific home panels (more arrive each phase) --- */
    if (SPACE_ROLE === "student") renderStudentHome(db, session);
}

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

/* ============ 2. STUDENT HOME (Phase 1 fills the rest) ============ */
function renderStudentHome(db, session) {
    const nextBox = document.getElementById("space-next-class");
    if (nextBox) {
        const upcoming = db.schedule
            .filter(s => s.startsInMinutes >= 0)
            .sort((a, b) => a.startsInMinutes - b.startsInMinutes);
        const next = upcoming[0];

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

/* ============ 3. UI KIT — toast + confirm dialog ============
   Built once here, used by every later phase (submitting an
   assignment, admin actions, danger zone...). */
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
    /* auto-dismiss after a few seconds */
    setTimeout(() => el.remove(), 3400);
}

/* spaceConfirm returns a PROMISE so callers can read naturally:
     if (await spaceConfirm({...})) { doTheThing(); }
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
