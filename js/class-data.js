/* ============================================================
   LIVE CLASS DATA — demo participants, chat, badges, class info
   ------------------------------------------------------------
   ⚠️ DEMO ONLY. In the real build all of this arrives from a
   realtime service (WebSocket / WebRTC SFU). The UI is already
   shaped to fit exactly that future data. */

const CLASS_INFO = {
    title: "Present Perfect — Deep Dive",
    course: "B2 · Speaking",
    presenterId: "Tch-1001",
    startedMinutesAgo: 37,     // class has been live for 37 min
    recStartedMinutesAgo: 12,  // recording started 12 min ago
    recording: true,           // the red REC indicator state
    youJoinedMinutesLate: 6    // "you joined late" note (demo)
};

/* ROLES — in order of power. Colors live in the CSS.
   presenter = running the class, speaker = allowed to talk,
   moderator = can manage people, participant = everyone else. */
const ROLES = {
    presenter:   { label: "Presenter",   order: 1 },
    speaker:     { label: "Speaker",     order: 2 },
    moderator:   { label: "Moderator",   order: 3 },
    participant: { label: "Participant", order: 4 }
};

/* BADGES — the fun honors the teacher can hand out.
   Each badge can be shown in any color (teacher picks).
   "president" gets extra glory: it shows on the stage too. */
const BADGES = [
    { id: "president",  label: "Class President" },
    { id: "star",       label: "Star Speaker" },
    { id: "helper",     label: "Class Helper" },
    { id: "streak",     label: "Streak Keeper" },
    { id: "homework",   label: "Homework Hero" }
];

const BADGE_COLORS = ["#f59e0b", "#ef4444", "#10b981", "#3b82f6",
                      "#8b5cf6", "#ec4899"];

/* PARTICIPANTS — conn = connection quality 1-4 (the classic
   four-bar antenna). hand = raised hand. */
const PARTICIPANTS = [
    { id: "Tch-1001", name: "Ms. Demo Teacher", role: "presenter",
      conn: 4, mic: true,  cam: true,  hand: false, badge: null },
    { id: "admin", name: "Site Admin", role: "moderator",
      conn: 4, mic: false, cam: false, hand: false, badge: null },
    { id: "Stu-2001", name: "Demo Student", role: "participant",
      conn: 4, mic: false, cam: false, hand: false, badge: null },
    { id: "Stu-2002", name: "Ryan", role: "speaker",
      conn: 3, mic: true,  cam: true,  hand: false, badge: null },
    { id: "Stu-2003", name: "Negar", role: "participant",
      conn: 4, mic: false, cam: true,  hand: true,
      badge: { id: "president", color: "#f59e0b" } },
    { id: "Stu-2004", name: "Arash", role: "participant",
      conn: 2, mic: false, cam: false, hand: true, badge: null },
    { id: "Stu-2005", name: "Liam", role: "participant",
      conn: 4, mic: false, cam: false, hand: false,
      badge: { id: "homework", color: "#10b981" } }
];

/* SEED CHAT — mixed English + Persian + emoji.
   elapsedSec = seconds since class start (powers the
   "Class time / Clock time" toggle). */
const CHAT_SEED = [
    { fromId: "Tch-1001", text: "Welcome back everyone! Today: Present Perfect vs Past Simple 🎯", elapsedSec: 40 },
    { fromId: "Stu-2002", text: "Ready! 👍", elapsedSec: 95 },
    { fromId: "Stu-2003", text: "سلام! آماده‌ام برای کلاس امروز 😊", elapsedSec: 130 },
    { fromId: "Tch-1001", text: "Quick recap: \"I have lived here for 3 years\" vs \"I lived there in 2019\" 📝", elapsedSec: 420 },
    { fromId: "Stu-2004", text: "Can you repeat the last example please?", elapsedSec: 445 },
    { fromId: "Tch-1001", text: "Of course — I'll put it on the next slide.", elapsedSec: 470 },
    { fromId: "Stu-2003", text: "ممنون! خیلی واضح بود 🌟", elapsedSec: 505 },
    { fromId: "Stu-2005", text: "Great lesson so far ❤️", elapsedSec: 640 }
];

/* QUICK EMOJIS for the chat bar */
const QUICK_EMOJIS = ["😀", "😂", "👍", "🙏", "❤️", "🎉", "✋", "💯"];
