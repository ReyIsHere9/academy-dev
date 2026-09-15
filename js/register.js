/* ============================================================
   REGISTER ENGINE — creates a student account in the demo store
   ------------------------------------------------------------
   WHAT HAPPENS ON SUBMIT:
     1. validate (name, email shape, password length + match, terms)
     2. pick the next free User ID (Stu-3001, Stu-3002, …)
     3. write the PROFILE + the CREDENTIAL into the demo store
     4. sign the new student in and send them to the dashboard

   ⚠️ DEMO ONLY: in the real build the server creates the account
   and hashes the password (bcrypt/argon2) — nothing about
   credentials ever lives in localStorage. See js/auth.js.
   ============================================================ */

const registerForm = document.getElementById("register-form");

if (registerForm) {
    const db = spaceLoad();

    /* level interest dropdown straight from the catalog */
    const levelSelect = document.getElementById("reg-level");
    if (levelSelect && typeof academyCatalog === "function") {
        levelSelect.innerHTML = `<option value="">Not sure — take the placement test</option>` +
            academyCatalog().map(l =>
                `<option value="${spaceEsc(l.id)}">${spaceEsc(l.label)}</option>`).join("");
    }

    registerForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const errorBox = document.getElementById("register-error");
        const fail = (message) => {
            errorBox.textContent = message;
            errorBox.hidden = false;
        };
        errorBox.hidden = true;

        const name = document.getElementById("reg-name").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const pass = document.getElementById("reg-pass").value;
        const pass2 = document.getElementById("reg-pass2").value;
        const terms = document.getElementById("reg-terms");
        const level = levelSelect ? levelSelect.value : "";

        /* --- validation (server would repeat ALL of this) --- */
        if (!name) return fail("Please enter your full name.");

        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailOk) return fail("That email doesn't look right.");

        const emailTaken = Object.values(db.profiles)
            .some(p => (p.email || "").toLowerCase() === email.toLowerCase());
        if (emailTaken) return fail("An account with that email already exists. Try logging in.");

        if (pass.length < 8) return fail("Password needs at least 8 characters.");
        if (pass !== pass2) return fail("The two passwords don't match.");
        if (!terms || !terms.checked) return fail("Please accept the terms and privacy policy.");

        /* --- next free User ID: Stu-3001, Stu-3002, … --- */
        let nextId = 3001;
        Object.keys(db.profiles).forEach(id => {
            const match = id.match(/^Stu-(\d+)$/i);
            if (match) nextId = Math.max(nextId, Number(match[1]) + 1);
        });
        const newId = "Stu-" + nextId;

        /* --- create profile + credential --- */
        const color = SPACE_COLORS[Object.keys(db.profiles).length % SPACE_COLORS.length];
        db.profiles[newId] = {
            name, role: "student", email,
            avatarColor: color, accent: color,
            bio: "",
            prefs: { emailAssignments: true, emailAnnouncements: true, pingChat: false },
            joinedDaysAgo: 0
        };
        db.credentials[newId] = pass;

        /* if they picked a level, remember it as their placement */
        if (level) {
            if (!db.placements) db.placements = {};
            db.placements[newId] = {
                level, correct: null, total: null, minutesAgo: 0
            };
        }

        /* the admin activity feed hears about the signup */
        db.activity.unshift({
            id: "act-" + Date.now(),
            kind: "user",
            text: "New account: " + name + " (" + newId + ")",
            minutesAgo: 0
        });

        spaceSave(db);

        /* --- sign in + welcome screen --- */
        sessionSave({ id: newId, role: "student", name });
        if (typeof refreshHeaderChip === "function") refreshHeaderChip();

        registerForm.hidden = true;
        const success = document.getElementById("register-success");
        success.hidden = false;
        document.getElementById("register-success-text").textContent =
            `Your account is ready, ${name}. Your User ID is ${newId} — ` +
            `remember it for logging in. Taking you to your dashboard…`;

        spaceToast("Account created — welcome, " + name + "!", "good");
        setTimeout(() => { window.location.href = "dashboard.html"; }, 1400);
    });
}
