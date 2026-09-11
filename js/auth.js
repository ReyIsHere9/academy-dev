/* ============================================================
   AUTH ENGINE — demo login, password eye toggle, recovery form
   ------------------------------------------------------------
   ⚠️ DEMO ONLY ⚠️
   Everything here runs in the BROWSER. That means:
     - anyone can view-source the passwords (see auth-data.js)
     - anyone can fake a session via dev tools
   This is UI + flow practice. The REAL version of this file
   will talk to a server, and the server does the checks.

   WHAT THIS FILE HANDLES:
   1. Show/hide password ("blinking eye")
   2. Login form: validate User ID format, check demo user,
      store a demo session, show role + logout
   3. Recovery form: validate contact info, show the
      deliberately GENERIC confirmation message
   ============================================================ */

/* ============ 1. THE PASSWORD EYE ============
   Any .password-toggle button flips its sibling input between
   type="password" and type="text". The two SVGs (eye / eye-off)
   swap via a CSS class — same trick as the theme toggle. */
document.querySelectorAll(".password-toggle").forEach(button => {
    button.addEventListener("click", () => {
        const input = button.parentElement.querySelector("input");
        const visible = input.type === "text";
        input.type = visible ? "password" : "text";
        button.classList.toggle("is-visible", !visible);
        button.setAttribute("aria-pressed", String(!visible));
        button.setAttribute("aria-label",
            visible ? "Show password" : "Hide password");
    });
});


/* ============ 2. LOGIN ============
   USER ID FORMAT CHECK — first line of defense:
   the form itself rejects nonsense before any "login attempt".
   (In the real build the server validates again, always.) */
function idFormatValid(raw) {
    const id = raw.trim().toLowerCase();
    if (id === "admin") return true;
    if (id.startsWith("tch-") && id.length > 4) return true;
    if (id.startsWith("stu-") && id.length > 4) return true;
    return false;
}

const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const loginSuccess = document.getElementById("login-success");
const sessionPanel = document.getElementById("session-panel");

/* A "session" here = sessionStorage, which forgets when the
   tab closes. The real build uses an httpOnly cookie from the
   server (see security notes below). */
const SESSION_KEY = "demoSession";

function saveSession(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        id: user.id, role: user.role, name: user.name
    }));
}

function readSession() {
    try {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY));
    } catch {
        return null;
    }
}

function showLoggedIn(user) {
    loginForm.hidden = true;
    sessionPanel.hidden = false;
    document.getElementById("session-text").textContent =
        `Logged in as ${user.name} (${user.id}) — role: ${user.role}. ` +
        `Your ${user.role} dashboard arrives in a later module.`;
}

if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        loginError.hidden = true;

        const idInput = document.getElementById("login-id");
        const pwInput = document.getElementById("login-pass");
        const id = idInput.value.trim();

        /* format check first (fast, local, free) */
        if (!idFormatValid(id)) {
            loginError.textContent =
                "That User ID doesn't look right. Use admin, Tch-… or Stu-…";
            loginError.hidden = false;
            return;
        }

        /* LESSON — GENERIC ERROR MESSAGES:
           Never reveal WHICH part was wrong ("no such user" vs
           "wrong password") — attackers harvest valid user IDs
           that way. One vague message for both. */
        const user = DEMO_USERS.find(u =>
            u.id.toLowerCase() === id.toLowerCase());

        if (!user || user.password !== pwInput.value) {
            loginError.textContent = "User ID or password is incorrect.";
            loginError.hidden = false;
            return;
        }

        /* success: remember the session and greet the role */
        saveSession(user);
        showLoggedIn(user);
    });

    /* already logged in? show that instead of the form */
    const existing = readSession();
    if (existing) showLoggedIn(existing);
}

/* logout button (inside the session panel) */
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem(SESSION_KEY);
        sessionPanel.hidden = true;
        loginForm.hidden = false;
        loginForm.reset();
    });
}


/* ============ 3. RECOVERY FORM ============
   Deliberately vague success message, on purpose:
   "If an account matches, we sent instructions."
   Saying "we found your account!" would let strangers test
   which emails/phones exist on the site (user enumeration). */

const recoveryForm = document.getElementById("recovery-form");

if (recoveryForm) {
    const methodSelect = document.getElementById("recovery-method");
    const recoveryInput = document.getElementById("recovery-input");
    const recoverySuccess = document.getElementById("recovery-success");

    /* the input placeholder + type follow the chosen method */
    const placeholders = {
        email: "you@example.com",
        phone: "+1 555 010 0000",
        userid: "admin, Tch-1001, Stu-2001…"
    };

    methodSelect.addEventListener("change", () => {
        recoveryInput.placeholder = placeholders[methodSelect.value];
        recoveryInput.type = methodSelect.value === "email" ? "email" : "text";
    });

    recoveryForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const method = methodSelect.value;
        const value = recoveryInput.value.trim();
        let valid = value.length > 0;

        /* light format checks — the server repeats all of these */
        if (method === "email") valid = value.includes("@") && value.includes(".");
        if (method === "phone") valid = value.replace(/\D/g, "").length >= 7;
        if (method === "userid") valid = idFormatValid(value);

        if (!valid) {
            recoveryInput.classList.add("is-invalid");
            return;
        }
        recoveryInput.classList.remove("is-invalid");

        /* generic confirmation — same words for every outcome */
        recoverySuccess.hidden = false;
        recoveryForm.hidden = true;
    });
}

/* ============================================================
   SECURITY NOTES — WHAT THE REAL BUILD NEEDS
   ------------------------------------------------------------
   1. HTTPS everywhere (no exceptions, ever).
   2. Passwords hashed server-side with bcrypt/argon2.
      Hashing = one-way: you can check a guess, never recover
      the original. Plain text and "encryption" are both wrong.
   3. Sessions via httpOnly + Secure + SameSite cookies issued
      by the server — JavaScript must NOT be able to read them
      (that's what stops XSS from stealing logins).
   4. Rate limiting + lockouts: e.g. 5 tries/minute per IP,
      temporary lock after repeated failures, all logged.
   5. Generic error messages (see lesson above).
   6. 2FA: TOTP app codes or passkeys (WebAuthn) — strongly
      recommended for admin/teacher accounts.
   7. Password reset: emailed/SMS single-use token, random,
      stored HASHED, expires in ~30 minutes, invalidated after
      one use.
   8. Server-side validation of EVERYTHING. Client-side checks
      are UX sugar, never security.
   9. Never log passwords; don't put secrets in front-end code.
   10. When we reach the backend phase we'll pick a stack
       (Node/Express or a service like Supabase/Auth0) and
       implement all ten properly.
   ============================================================ */
