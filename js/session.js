/* ============================================================
   SESSION HELPER — "who is logged in?" for every page
   ------------------------------------------------------------
   This is a small SHARED utility, loaded by every page that has
   the site header. Two jobs:

   1. Read the demo session that js/auth.js wrote on login.
      Stored in sessionStorage under "demoSession" as:
      { id, role, name }

   2. Swap the header's "Login / Register" button for a
      "Dashboard" link when someone is logged in — pointing at
      the right space for their role.

   ⚠️ DEMO ONLY, same warning as auth.js: a visitor can fake this
   session from dev tools. The REAL build asks the server (via an
   httpOnly cookie) — JavaScript can't read that cookie, and
   every role check happens on the server. Client checks are UX
   sugar, never security.
   ============================================================ */

/* NOTE ON THE NAME: js/auth.js already declares SESSION_KEY, and
   login.html loads both files. Two `const SESSION_KEY` in the
   same page = crash ("already declared"), so this one uses a
   distinct name while pointing at the same storage key. */
const ACADEMY_SESSION_KEY = "demoSession";

/* Where does each role belong? One map, used by the header
   chip, the login page and the dashboards' gates. */
const DASHBOARDS = {
    admin:   "dashboard-admin.html",
    teacher: "dashboard-teacher.html",
    student: "dashboard.html"
};

function dashboardFor(role) {
    return DASHBOARDS[role] || "dashboard.html";
}

/* ---------- read / save / clear ---------- */
function sessionRead() {
    try {
        return JSON.parse(sessionStorage.getItem(ACADEMY_SESSION_KEY));
    } catch {
        return null;
    }
}

function sessionSave(user) {
    sessionStorage.setItem(ACADEMY_SESSION_KEY, JSON.stringify({
        id: user.id, role: user.role, name: user.name
    }));
}

function sessionClear() {
    sessionStorage.removeItem(ACADEMY_SESSION_KEY);
}

/* ---------- header chip ----------
   Any page with <a class="btn-login"> gets upgraded when a
   session exists. Kept as a NAMED function so js/auth.js can
   call it right after login/logout (no page reload needed). */
function refreshHeaderChip() {
    const btn = document.querySelector(".header-inner .btn-login");
    if (!btn) return;                    // no header: nothing to do

    const session = sessionRead();
    if (!session) {
        /* logged out: restore the original button */
        btn.href = "login.html";
        btn.textContent = "Login / Register";
        btn.title = "";
        btn.classList.remove("is-logged-in");
        return;
    }

    /* logged in: same spot, new destination. The title carries
       the full identity for hover, in case two people share a
       first name. */
    btn.href = dashboardFor(session.role);
    btn.textContent = "Dashboard";
    btn.title = `Logged in as ${session.name} (${session.id}) — ${session.role}`;
    btn.classList.add("is-logged-in");
}

document.addEventListener("DOMContentLoaded", refreshHeaderChip);
