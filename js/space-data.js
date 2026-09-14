/* ============================================================
   SPACE DATA — SEED CONTENT FOR THE ACCOUNT SPACES
   ------------------------------------------------------------
   WHO USES THIS: dashboard.html (student), dashboard-teacher.html
   and dashboard-admin.html. js/space.js loads this seed, copies
   it into localStorage once, and from then on reads/writes the
   stored copy (so profile edits, grades and admin changes
   survive reloads — like a tiny demo database).

   WHY RELATIVE TIMES? Every time here is "minutes from NOW"
   (minutesAgo / startsInMinutes / dueInHours). A fixed date
   would go stale the moment the demo sits for a week; relative
   times recompute on every page load, so the schedule ALWAYS
   looks alive. (Same trick as CLASS_INFO.startedMinutesAgo in
   class-data.js.)

   ⚠️ THE REAL BUILD: this file is replaced by API calls. The
   server owns the truth, the browser asks for it, and the
   localStorage copy disappears entirely.
   ============================================================ */

const SPACE_DB_KEY = "academySpaceDB";
const SPACE_DB_VERSION = 1;

const SPACE_SEED = {
    version: 1,

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
       "submitted, waiting for grading". */
    assignments: [
        {
            id: "asg-1", course: "B1 · Grammar", skill: "Grammar",
            title: "Present Perfect — worksheet 4",
            instructions: "Complete exercises 1–12. Write FULL sentences, not just the verb.",
            createdBy: "Tch-1001", dueInHours: 20, maxScore: 100,
            submissions: {
                "Stu-2002": {
                    text: "1. I have lived here for three years…",
                    fileName: "ryan-pp4.pdf", submittedAtMinutesAgo: 95,
                    score: null, feedback: ""
                }
            }
        },
        {
            id: "asg-2", course: "B1 · Grammar", skill: "Grammar",
            title: "Present Perfect vs Past Simple",
            instructions: "Write 10 pairs of sentences showing the difference.",
            createdBy: "Tch-1001", dueInHours: -30, maxScore: 100,
            submissions: {
                "Stu-2001": {
                    text: "1. I have visited London three times. / I visited London in 2019.",
                    fileName: "demo-student-hw2.pdf", submittedAtMinutesAgo: 40 * 60,
                    score: 92,
                    feedback: "Excellent control of the present perfect. Watch the third-person -s."
                },
                "Stu-2003": {
                    text: "My ten pairs…", fileName: "negar-hw2.docx",
                    submittedAtMinutesAgo: 39 * 60, score: null, feedback: ""
                }
            }
        },
        {
            id: "asg-3", course: "A2 · Writing", skill: "Writing",
            title: "A short story about your week",
            instructions: "80–120 words. Use at least five past-simple verbs.",
            createdBy: "Tch-2002", dueInHours: 3 * 24, maxScore: 50,
            submissions: {}
        }
    ],

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
        homeBanner: "",
        lifetimeOffer: true
    }
};
