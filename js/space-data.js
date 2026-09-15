/* ============================================================
   SPACE DATA — SEED CONTENT FOR THE ACCOUNT SPACES
   ------------------------------------------------------------
   WHO USES THIS: dashboard.html (student), profile.html (public
   profile), dashboard-teacher.html and dashboard-admin.html.
   js/space.js loads this seed, copies it into localStorage once,
   and from then on reads/writes the stored copy (so profile
   edits, submissions, comments and admin changes survive
   reloads — like a tiny demo database).

   WHY RELATIVE TIMES? Every time here is "minutes from NOW"
   (minutesAgo / startsInMinutes / dueInHours / earnedDaysAgo).
   A fixed date would go stale the moment the demo sits for a
   week; relative times recompute on every page load, so the
   schedule ALWAYS looks alive. (Same trick as
   CLASS_INFO.startedMinutesAgo in class-data.js.)

   ⚠️ THE REAL BUILD: this file is replaced by API calls. The
   server owns the truth, the browser asks for it, and the
   localStorage copy disappears entirely.
   ============================================================ */

const SPACE_DB_KEY = "academySpaceDB";
const SPACE_DB_VERSION = 4;   /* v4: Phase 3 (credentials, payments, media) */

const SPACE_SEED = {
    version: 4,

    /* ============ PROFILES ============
       One per demo user. `accent` is the personal highlight
       color of their space (stored as --space-accent on the
       body — see js/space.js §2). `prefs` are the notification
       switches on the profile panel. */
    profiles: {
        admin: {
            name: "Site Admin", role: "admin",
            avatarColor: "#2563eb", accent: "#2563eb",
            bio: "Keeper of the academy — courses, people, prices, everything.",
            prefs: { emailAssignments: true, emailAnnouncements: true, pingChat: true },
            joinedDaysAgo: 400
        },
        "Tch-1001": {
            name: "Ms. Demo Teacher", role: "teacher",
            avatarColor: "#7c3aed", accent: "#7c3aed",
            bio: "Grammar nerd. Believes speaking practice beats memorizing every time.",
            prefs: { emailAssignments: true, emailAnnouncements: true, pingChat: true },
            joinedDaysAgo: 220
        },
        "Tch-2002": {
            name: "Mr. Sample Tutor", role: "teacher",
            avatarColor: "#0891b2", accent: "#0891b2",
            bio: "Writing coach. Turns essays into arguments people actually enjoy reading.",
            prefs: { emailAssignments: true, emailAnnouncements: false, pingChat: true },
            joinedDaysAgo: 150
        },
        "Stu-2001": {
            name: "Demo Student", role: "student",
            avatarColor: "#059669", accent: "#059669",
            bio: "Learning English one live class at a time.",
            prefs: { emailAssignments: true, emailAnnouncements: false, pingChat: true },
            joinedDaysAgo: 64
        },
        "Stu-2002": {
            name: "Ryan", role: "student",
            avatarColor: "#d97706", accent: "#d97706",
            bio: "Here for the speaking club.",
            prefs: { emailAssignments: true, emailAnnouncements: true, pingChat: false },
            joinedDaysAgo: 51
        },
        "Stu-2003": {
            name: "Negar", role: "student",
            avatarColor: "#db2777", accent: "#db2777",
            bio: "Essay lover. Probably reading right now.",
            prefs: { emailAssignments: true, emailAnnouncements: false, pingChat: true },
            joinedDaysAgo: 47
        },
        "Stu-2004": {
            name: "Arash", role: "student",
            avatarColor: "#e11d48", accent: "#e11d48",
            bio: "Trying to stop translating in my head.",
            prefs: { emailAssignments: false, emailAnnouncements: true, pingChat: true },
            joinedDaysAgo: 33
        },
        "Stu-2005": {
            name: "Liam", role: "student",
            avatarColor: "#0891b2", accent: "#0891b2",
            bio: "New here. Nervous but excited.",
            prefs: { emailAssignments: true, emailAnnouncements: true, pingChat: true },
            joinedDaysAgo: 6
        }
    },

    /* ============ SCHEDULE ============
       Live-class sessions. Negative startsInMinutes = already
       finished (history). `code` is what a student types in
       "join by code" if they lose the link. */
    schedule: [
        {
            id: "ses-1", course: "B1 · Conversation", skill: "Speaking",
            teacher: "Tch-1001", students: ["Stu-2001", "Stu-2002", "Stu-2003"],
            startsInMinutes: 42, durationMin: 60, code: "B1-SPEAK"
        },
        {
            id: "ses-2", course: "B1 · Grammar", skill: "Grammar",
            teacher: "Tch-1001", students: ["Stu-2001", "Stu-2004"],
            startsInMinutes: 26 * 60, durationMin: 60, code: "B1-GRAM"
        },
        {
            id: "ses-3", course: "A2 · Writing", skill: "Writing",
            teacher: "Tch-2002", students: ["Stu-2001", "Stu-2003"],
            startsInMinutes: -20 * 60, durationMin: 60, code: "A2-WRIT"
        }
    ],

    /* ============ ENROLLMENTS ============
       One row per student per course. `progress` drives the
       progress bars; `nextLesson` is what "Continue learning"
       shows. level+skill map to course.html?level=…&skill=… */
    enrollments: [
        {
            id: "enr-1", student: "Stu-2001", level: "B1", skill: "Conversation",
            title: "B1 · Conversation", teacher: "Tch-1001",
            progress: 64, sessionsDone: 9, sessionsTotal: 14,
            nextLesson: "Lesson 12 — Telling a story"
        },
        {
            id: "enr-2", student: "Stu-2001", level: "B1", skill: "Grammar",
            title: "B1 · Grammar", teacher: "Tch-1001",
            progress: 48, sessionsDone: 7, sessionsTotal: 14,
            nextLesson: "Unit 5 — Present perfect continuous"
        },
        {
            id: "enr-3", student: "Stu-2001", level: "A2", skill: "Writing",
            title: "A2 · Writing", teacher: "Tch-2002",
            progress: 82, sessionsDone: 16, sessionsTotal: 20,
            nextLesson: "Lesson 19 — Opinion paragraphs"
        }
    ],

    /* ============ COURSE INSTANCES (teacher's "classes") ============
       A course instance = one real group running a level+skill:
       "B1 · Conversation — Evening Group". Teachers own these,
       open their rooms, manage rosters and create new ones in the
       studio. `code` is the join code students type in their
       Classes panel. */
    courseInstances: [
        {
            id: "cls-1", title: "B1 · Conversation", level: "B1", skill: "Conversation",
            teacher: "Tch-1001", students: ["Stu-2001", "Stu-2002", "Stu-2003"],
            meetings: "Mondays & Wednesdays · 18:00", code: "B1-SPEAK",
            sessionsTotal: 14, progress: 64
        },
        {
            id: "cls-2", title: "B1 · Grammar", level: "B1", skill: "Grammar",
            teacher: "Tch-1001", students: ["Stu-2001", "Stu-2002", "Stu-2003", "Stu-2004"],
            meetings: "Saturdays · 10:00", code: "B1-GRAM",
            sessionsTotal: 14, progress: 48
        },
        {
            id: "cls-3", title: "A2 · Writing", level: "A2", skill: "Writing",
            teacher: "Tch-2002", students: ["Stu-2001", "Stu-2003"],
            meetings: "Fridays · 16:00", code: "A2-WRIT",
            sessionsTotal: 20, progress: 82
        }
    ],

    /* ============ ANNOUNCEMENTS ============ */
    announcements: [
        {
            id: "ann-1", fromId: "Tch-1001",
            text: "Bring your Present Perfect worksheet to the next class.",
            minutesAgo: 90
        },
        {
            id: "ann-2", fromId: "admin",
            text: "New speaking club opens Monday — free for every student.",
            minutesAgo: 300
        },
        {
            id: "ann-3", fromId: "Tch-1001",
            text: "Great energy in today's conversation class, keep it up!",
            minutesAgo: 1500
        }
    ],

    /* ============ ASSIGNMENTS ============
       submissions is keyed by student id. score = null means
       "submitted, waiting for grading". `allowed` + `maxMB` are
       the upload RULES the dropzone enforces (the real build
       enforces them again on the server — always). */
    assignments: [
        {
            id: "asg-1", classId: "cls-2", kind: "worksheet",
            course: "B1 · Grammar", skill: "Grammar",
            title: "Present Perfect — worksheet 4",
            instructions: "Complete exercises 1–12. Write FULL sentences, not just the verb.",
            createdBy: "Tch-1001", dueInHours: 20, maxScore: 100,
            allowed: ["pdf", "docx", "jpg", "png"], maxMB: 5,
            submissions: {
                "Stu-2002": {
                    text: "1. I have lived here for three years…",
                    fileName: "Stu-2002_asg-1_present-perfect-worksheet-4.pdf",
                    sizeKB: 310, submittedAtMinutesAgo: 95,
                    score: null, feedback: "",
                    comments: []
                }
            }
        },
        {
            id: "asg-2", classId: "cls-2", kind: "worksheet",
            course: "B1 · Grammar", skill: "Grammar",
            title: "Present Perfect vs Past Simple",
            instructions: "Write 10 pairs of sentences showing the difference.",
            createdBy: "Tch-1001", dueInHours: -30, maxScore: 100,
            allowed: ["pdf", "docx", "txt"], maxMB: 5,
            submissions: {
                "Stu-2001": {
                    text: "1. I have visited London three times. / I visited London in 2019.",
                    fileName: "Stu-2001_asg-2_present-perfect-vs-past-simple.pdf",
                    sizeKB: 184, submittedAtMinutesAgo: 40 * 60,
                    score: 92,
                    feedback: "Excellent control of the present perfect. Watch the third-person -s.",
                    comments: [
                        {
                            by: "Tch-1001",
                            text: "Great work! I left two small notes on page 2.",
                            minutesAgo: 38 * 60
                        },
                        {
                            by: "Stu-2001",
                            text: "Thank you! I fixed both of them in my notebook.",
                            minutesAgo: 37 * 60
                        }
                    ]
                },
                "Stu-2003": {
                    text: "My ten pairs…", fileName: "Stu-2003_asg-2_present-perfect-vs-past-simple.docx",
                    sizeKB: 96, submittedAtMinutesAgo: 39 * 60,
                    score: null, feedback: "", comments: []
                }
            }
        },
        {
            id: "asg-4", classId: "cls-1", kind: "task",
            course: "B1 · Conversation", skill: "Conversation",
            title: "Record a 1-minute self-introduction (write it first)",
            instructions: "Write 60–90 words you would say out loud. Bring it to class and record it there.",
            createdBy: "Tch-1001", dueInHours: 6 * 24, maxScore: 50,
            allowed: ["pdf", "docx", "txt"], maxMB: 5,
            submissions: {}
        },
        {
            id: "asg-3", classId: "cls-3", kind: "task",
            course: "A2 · Writing", skill: "Writing",
            title: "A short story about your week",
            instructions: "80–120 words. Use at least five past-simple verbs.",
            createdBy: "Tch-2002", dueInHours: 3 * 24, maxScore: 50,
            allowed: ["pdf", "docx", "txt", "jpg", "png"], maxMB: 5,
            submissions: {}
        }
    ],

    /* ============ ASSIGNMENT TEMPLATES ============
       Pre-made task/worksheet/exam shells. "Use template" fills
       the create form; "Save as template" stores the current
       form values here, so a teacher never retypes a standard
       exam twice. */
    assignmentTemplates: [
        {
            id: "tpl-1", kind: "worksheet",
            title: "Vocabulary worksheet — unit ___",
            instructions: "Complete the vocabulary exercises. Write full sentences.",
            allowed: ["pdf", "docx", "jpg", "png"], maxMB: 5, maxScore: 100
        },
        {
            id: "tpl-2", kind: "task",
            title: "Short writing task",
            instructions: "Write 80–120 words. Use the grammar from this week's lesson.",
            allowed: ["pdf", "docx", "txt"], maxMB: 5, maxScore: 50
        },
        {
            id: "tpl-3", kind: "exam",
            title: "Monthly progress exam",
            instructions: "Answer every section. No notes or dictionaries. 45 minutes.",
            allowed: ["pdf", "docx", "jpg", "png"], maxMB: 10, maxScore: 100
        }
    ],

    /* ============ MATERIALS LIBRARY ============
       Teacher uploads a course's students can download. The demo
       can't host real files, so "Download" explains itself
       (honest > fake). */
    materials: [
        {
            id: "mat-1", course: "B1 · Grammar",
            title: "Present Perfect cheat sheet",
            fileName: "b1-present-perfect.pdf", sizeKB: 236,
            teacher: "Tch-1001", minutesAgo: 120
        },
        {
            id: "mat-2", course: "B1 · Conversation",
            title: "50 discussion questions",
            fileName: "b1-conversation-questions.pdf", sizeKB: 410,
            teacher: "Tch-1001", minutesAgo: 300
        },
        {
            id: "mat-3", course: "A2 · Writing",
            title: "Paragraph structure worksheet",
            fileName: "a2-paragraph-structure.docx", sizeKB: 88,
            teacher: "Tch-2002", minutesAgo: 16 * 60
        },
        {
            id: "mat-4", course: "B1 · Grammar",
            title: "Irregular verbs audio drill",
            fileName: "b1-irregular-verbs.mp3", sizeKB: 1450,
            teacher: "Tch-1001", minutesAgo: 43 * 60
        }
    ],

    /* ============ INBOX (direct messages) ============
       One shared thread list for teachers AND students. Each
       thread has exactly TWO participants; every screen computes
       "the other person" from the session. readBy[] tracks who
       has seen each message (a real backend would do this per
       account, server-side). */
    messages: [
        {
            id: "thr-1", participants: ["Tch-1001", "Stu-2001"],
            subject: "Present Perfect worksheet",
            messages: [
                { by: "Stu-2001", text: "Hi! Can I get a hint for question 4?", minutesAgo: 180, readBy: ["Tch-1001"] },
                { by: "Tch-1001", text: "Of course — think about 'for' vs 'since'.", minutesAgo: 150, readBy: ["Stu-2001"] },
                { by: "Stu-2001", text: "Got it, thank you! One more thing — is question 7 like question 4?", minutesAgo: 24, readBy: [] },
                { by: "Tch-1001", text: "Exactly like it — same pattern, different time word.", minutesAgo: 18, readBy: [] }
            ]
        },
        {
            id: "thr-2", participants: ["Tch-1001", "Stu-2002"],
            subject: "Speaking club",
            messages: [
                { by: "Tch-1001", text: "Great progress in today's class, Ryan!", minutesAgo: 320, readBy: ["Stu-2002"] },
                { by: "Stu-2002", text: "Thanks! Is the club open to A2 students too?", minutesAgo: 300, readBy: ["Tch-1001"] }
            ]
        },
        {
            id: "thr-3", participants: ["Tch-2002", "Stu-2003"],
            subject: "Essay feedback",
            messages: [
                { by: "Stu-2003", text: "Should I rewrite the ending of my story?", minutesAgo: 45, readBy: [] }
            ]
        }
    ],

    /* ============ TEACHER NOTES (private, teacher-only) ============
       Keyed by student id. Students never see these. */
    notes: {
        "Stu-2001": "Strong grammar, needs confidence in speaking. Encourage longer answers.",
        "Stu-2002": "Very active in chat. Remind about homework deadlines."
    },

    /* ============ ACHIEVEMENTS ============
       badgeCatalog = every badge that exists.
       earnedBadges = who has which, and when (days ago).
       ("first-steps" is ALSO unlocked live by js/space.js the
       first time a student submits anything — watch it pop.) */
    badgeCatalog: [
        { id: "first-steps", label: "First Steps",   icon: "\u{1F331}", desc: "Sent your first assignment" },
        { id: "star",        label: "Star Speaker",  icon: "\u2B50",     desc: "Spoke in 10 live classes" },
        { id: "helper",      label: "Class Helper",  icon: "\u{1F91D}", desc: "Helped a classmate in chat" },
        { id: "streak",      label: "Streak Keeper", icon: "\u{1F525}", desc: "Attended 4 classes in a row" },
        { id: "homework",    label: "Homework Hero", icon: "\u{1F4DA}", desc: "Five assignments aced" },
        { id: "perfect",     label: "Perfect Score", icon: "\u{1F4AF}", desc: "Scored 100 on an assignment" }
    ],
    earnedBadges: {
        "Stu-2001": [
            { id: "star",   earnedDaysAgo: 12 },
            { id: "streak", earnedDaysAgo: 5 }
        ],
        "Stu-2002": [
            { id: "star",        earnedDaysAgo: 20 },
            { id: "first-steps", earnedDaysAgo: 3 }
        ]
    },

    /* ============ CREDENTIALS (admin console override) ============
       WHAT THIS IS: a copy of the demo passwords that the ADMIN
       CONSOLE can edit ("reset password" tool). js/auth.js checks
       these FIRST, then falls back to DEMO_USERS in auth-data.js.
       ⚠️ Plain text in localStorage — same demo-only warning as
       auth-data.js. Real builds hash passwords on the server. */
    credentials: {
        "admin":    "Admin#2026",
        "Tch-1001": "Teacher#2026",
        "Tch-2002": "Teacher#2026",
        "Stu-2001": "Student#2026",
        "Stu-2002": "Student#2026",
        "Stu-2003": "Student#2026",
        "Stu-2004": "Student#2026",
        "Stu-2005": "Student#2026"
    },

    /* ============ PAYMENTS / SUBSCRIPTIONS ============
       The admin billing overview reads this table. plan values:
       monthly / quarterly / yearly = SUBSCRIPTIONS,
       lifetime = one-time purchase.
       status: paid | pending | failed */
    payments: [
        { id: "pay-1", student: "Stu-2001", plan: "quarterly", amount: 216, status: "paid",    daysAgo: 12, method: "card" },
        { id: "pay-2", student: "Stu-2002", plan: "monthly",   amount: 80,  status: "paid",    daysAgo: 3,  method: "paypal" },
        { id: "pay-3", student: "Stu-2003", plan: "yearly",    amount: 720, status: "pending", daysAgo: 1,  method: "bank" },
        { id: "pay-4", student: "Stu-2004", plan: "monthly",   amount: 80,  status: "failed",  daysAgo: 5,  method: "card" },
        { id: "pay-5", student: "Stu-2005", plan: "lifetime",  amount: 990, status: "paid",    daysAgo: 6,  method: "card" },
        { id: "pay-6", student: "Stu-2002", plan: "monthly",   amount: 80,  status: "paid",    daysAgo: 33, method: "paypal" }
    ],

    /* ============ SITE MEDIA (photo spots) ============
       Image values are DATA URLs (the picture stored as text) so
       the demo can show them without a server. The admin console
       uploads/clears these; js/site.js paints them into the slots
       on index.html, about.html and contact.html. */
    media: {
        teacherPhoto: "",
        contactMap: "",
        heroImage: "",
        logoImage: ""
    },

    /* ============ ACTIVITY LOG (admin / teacher overview) ============ */
    activity: [
        { id: "act-1", kind: "join",   text: "Demo Student joined the B1 · Conversation room", minutesAgo: 12 },
        { id: "act-2", kind: "submit", text: "Ryan submitted “Present Perfect — worksheet 4”", minutesAgo: 95 },
        { id: "act-3", kind: "grade",  text: "Ms. Demo Teacher graded Demo Student's homework (92)", minutesAgo: 260 },
        { id: "act-4", kind: "user",   text: "Site Admin added Liam (Stu-2005)", minutesAgo: 24 * 60 },
        { id: "act-5", kind: "pay",    text: "Arash upgraded to the Pro plan (demo)", minutesAgo: 3 * 24 * 60 }
    ],

    /* ============ SITE SETTINGS ============
       What the admin console will edit later (Phase 3): the
       public pages read these values back, so changes stick. */
    settings: {
        siteName: "The English Academy",
        tagline: "Learn English with live teachers and small classes.",
        contactEmail: "hello@example-academy.com",
        contactPhone: "+1 (555) 010-3456",
        address: "123 Grammar Lane, Englishville, EV 45000",
        homeBanner: "",
        lifetimeOffer: true
    }
};
