/* ============================================================
   AUTH DATA — DEMO USERS (⚠️ FRONT-END THEATRE, NOT SECURITY)
   ------------------------------------------------------------
   ⚠️ READ THIS FIRST ⚠️
   This file contains PASSWORDS IN PLAIN TEXT in the browser.
   That is 100% acceptable for a learning/dev demo and 100%
   UNACCEPTABLE for a real website. In the real build, passwords
   NEVER leave the server, and even there they are stored only
   as one-way HASHES (bcrypt / argon2). See the security notes
   at the bottom of this file and in js/auth.js.

   WHO CAN LOG IN (the three roles):
     admin   -> site + shop owner (control panel later)
     Tch-... -> teacher  (teacher pages later)
     Stu-... -> student  (student pages later)

   DEMO CREDENTIALS (shown on the login page too):
     admin     / Admin#2026
     Tch-1001  / Teacher#2026
     Stu-2001  / Student#2026
   ============================================================ */

const DEMO_USERS = [
    {
        id: "admin",
        password: "Admin#2026",
        role: "admin",
        name: "Site Admin"
    },
    {
        id: "Tch-1001",
        password: "Teacher#2026",
        role: "teacher",
        name: "Ms. Demo Teacher"
    },
    {
        id: "Stu-2001",
        password: "Student#2026",
        role: "student",
        name: "Demo Student"
    }
];

/* ------------------------------------------------------------
   USER ID FORMAT RULES (enforced by auth.js):
     admin  -> exactly "admin"
     Tch-X  -> starts with "Tch-"  (any letters/numbers after)
     Stu-X  -> starts with "Stu-"  (any letters/numbers after)
   Matching is case-insensitive on the PREFIX only, so
   "tch-1001" and "Tch-1001" are the same person.
   ------------------------------------------------------------ */

/* ============================================================
   [DESIGN NOTE] — THE "MASTER KEY" FAILSAFE (NOT IMPLEMENTED)
   ------------------------------------------------------------
   The request: a master key that, used 5 times, grants admin
   access as an emergency override.
   Honest engineering advice: DO NOT build it like that.
   A shared key with a use-counter is the single most
   attractive attack target on a site — one leak = full admin.

   If we ever need an emergency admin path (we might!), these
   are the industry patterns, safest first:

   1) BREAK-GLASS ADMIN ACCOUNT (recommended)
      A normal admin account with a unique long password,
      2FA enabled, and alerting. "Emergency" = you log in
      with it. No special code paths, nothing extra to hack.

   2) ONE-TIME RECOVERY CODES (also great)
      Server generates ~10 single-use codes (like GitHub's).
      Each code works ONCE, expires, and is stored hashed
      server-side. Losing the list = regenerate them.

   3) SERVER-SIDE SECRET + STRICT RULES (if truly needed)
      - secret lives in a server environment variable (never
        in HTML/JS — client-side keys are readable by anyone)
      - compared as a hash, never plain text
      - rate-limited (e.g. 1 try/minute) and attempts LOGGED
      - every use emails/notifies the owner immediately
      - requires the second factor before granting access
      - auto-expires after N minutes

   WHY "USE IT 5 TIMES" IS WEAK:
   - a counter can be reset/edited by anyone who reaches the DB
   - you can't tell WHO used it (no identity)
   - after 5 uses it silently stops working — maybe exactly
     when you're locked out and need it most

   DECISION FOR NOW: no master key. When we build the real
   backend, we start with pattern 1 and add pattern 2.
   ============================================================ */
