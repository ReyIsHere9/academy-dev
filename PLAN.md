# Academy Site — DEV Build Plan (generic test version)

Public learning/dev repo. Everything here is generic (placeholder
name, example courses, classic look). Branded "real" version lives
in the private academy-live repo.

## Site modules (build order)

- [x] **Module 1 — Home** (`index.html`) + shared `css/styles.css`
- [x] **Module 2 — Courses catalog** (`courses.html`) — A1–C2 showcase carousel + skills grid (built on `Deltaone`)
- [x] **Module 3 — Course detail** (`course.html`) — reads `?level=&skill=` from URL, 24 courses from one template (built on `Deltaone`)
- [x] **Module 4 — About** (`about.html`) — writer's-note template (built on `Deltaone` branch)
- [x] **Module 5 — Contact** (`contact.html`) — form (mailto engine + every submission is also stored for the admin console's Website messages inbox), trial-booking topic link, icon list, socials, live open/closed hours, map slot (built on `Deltaone`)
- [x] **Theme system** — global light/dark via CSS variables + `js/theme.js` toggle, `.grad-*` banner classes, future pages auto-ready (built on `Deltaone`)
- [x] **Pricing module** — header mega-dropdown on every page + `pricing.html` (billing toggle, comparison matrix, lifetime offer hook)
- [x] **Auth entry UI** — header Login/Register button, `login.html` (User ID + password + eye toggle + demo session), `recovery.html`. DEMO ONLY: real auth needs a backend (see security notes in `js/auth.js`)
- [x] **Live class room (UI shell)** — `class.html` (student), `class-teacher.html` (teacher tools: screen share + resizable censor boxes, whiteboard with zoom/pan/pinch + viewbar, media showcase for uploaded PDFs/images/videos/audio on stage, per-surface ink layers — every surface AND every uploaded file keeps its own drawings, text, censor boxes and undo history, Photoshop-style vertical tool rail with collapse + per-tool size flyouts + cursor rings + eyedropper loupe + white + bucket fill, pen/highlighter/text/both erasers/9th eyedropper swatch/undo-redo, recording, materials drag-drop, pop-out chat), `class-admin.html` (full teacher room + Admin tab: participant list with remove, add user, broadcast announcement, empty stage content, clear chat, lower all hands, end class, activity log), `class-chat.html` (pop-out window). Stage view modes for everyone: chat show/hide drawer (YouTube-comments style, also works as a floating drawer in theater + fullscreen), theater mode, lights-out (only video + tool rail + bulb stay lit), native fullscreen of the whole layout. Chat with EN/FA/emoji/images, hand raise, roles, custom colored titles, connection bars, class-time/clock toggle. Demo data via `js/class-data.js`
- [x] **Module 6 — Account spaces (all four phases shipped)** — `dashboard.html` (student), `dashboard-teacher.html` (teacher studio), `dashboard-admin.html` (admin console) sharing one `js/space.js` engine + `js/space-data.js` demo database (localStorage, relative times, currently v8). Header session chip (`js/session.js`) shows "Dashboard" when logged in. Each space gets a personal accent color; the admin console can edit data the public pages read back.
    - [x] Phase 0 — store + login gate (one-click demo logins) + shell (nav, greeting, accent, logout) + UI kit (toast, confirm) + student Home (next class, announcements)
    - [x] Phase 1 — student space: Home stats + continue learning, My courses (progress), Classes (schedule + join by code), Assignments (list filters, detail view, drag-&-drop submission with allowed types / size limit / naming convention + auto-rename + comments thread, unsubmit, grade + feedback), Materials (search + honest demo downloads), Achievements (badge showcase + live First Steps unlock), Profile (avatar color, bio, accent color, notification prefs, save) + public `profile.html` (safe fields only)
    - [x] Phase 2 — teacher studio: Today (stats, next class, grading queue, activity), My classes (course instances + create-a-class with student enrollment), Gradebook (interactive student × assignment matrix, per-cell grading/commenting, click-through to grader), Assignments (create task/worksheet/exam for a class, save/reuse/delete templates, delete assignments), grading assistance (quick scores, rubric → suggested score, feedback phrase library, inbox notify), Inbox (threaded direct messages with students, unread badges), Students (award/remove badges, private notes), Materials upload/delete (students see them instantly), Profile. Student space also gained an Inbox + "Ask your teacher" from assignments
    - [x] Phase 3 — admin console: Overview (stats, payment bars, attention list, activity), Users (edit/rename IDs across the whole store/reset passwords with auth integration/suspend/view-as impersonation/create/delete), Payments (subscriptions vs one-time, paid/pending/failed overrides, revenue, add/delete records), Catalog (edit labels, taglines, summaries, grammar, skill blurbs, highlights, unit titles + add/delete levels and skills — overrides levels-data.js on public course pages, custom levels get a generic banner), Media (upload/URL/clear every photo spot: logo, hero, teacher photo, map — painted by js/site.js), Classes (create classes with any teacher + roster, reassign teachers, codes, meetings, delete), Content (site settings + announcement broadcast), Badges (edit/add/delete catalog), Danger zone (reset demo DB). Every admin action writes to the activity log
    - [x] Phase 4 — polish: responsive pass on every dashboard/console panel (stacking nav, single-column forms, wrap-friendly headers, scrollable tables, mobile payment bars), empty states, docs finalized. Smoke-test harnesses stay OUTSIDE the repo — they live in the sibling `test-harness/` folder (space-smoke, space-flows, classroom-smoke, editor-smoke, dup-id-check), never on git
- [ ] **Real class backend** — WebRTC/streaming service, real recording, server-side uploads, cross-device sync (backend phase)
- [ ] **Real authentication** — server-side hashing (bcrypt/argon2), httpOnly sessions, rate limiting, 2FA, reset tokens (backend phase)

## Later upgrades (v2+)

- [x] **Lesson player module** — `lesson.html` + `js/lessons-data.js` + `js/lesson.js`: authored showcase lessons (objectives, vocabulary, sections, quizzes with instant feedback) plus a generated outline lesson for EVERY other unit (never a dead link). Course pages link each unit to its lesson; the sidebar tracks completion checkmarks; "mark lesson complete" saves to the demo store and syncs the student's course progress
- [x] **Pricing / checkout (course selling)** — `checkout.html` + `js/checkout.js`: sells subscriptions (live interval switching), the lifetime single-course offer, and single courses; demo coupon codes; shape-only card validation (never stored); orders create payment records the admin console sees instantly; course purchases auto-enroll logged-in students
- [x] **Blog module** — `blog.html` / `post.html` + `js/blog-data.js` + `js/blog.js`: featured article, category chips, live search, article pages with paragraphs/lists/quotes/tip boxes, author cards, tags, share button and related posts. Blog link added to every header and footer
- [x] **Placement test** — `test.html` + `js/test.js`: 12 questions across CEFR bands, per-band scoring, recommended level + matching plan, saved to student accounts (`db.placements`)
- [x] **Rich text editor** — `js/space-editor.js`: contenteditable + execCommand toolbar (bold/italic/underline/strike, text size, text color, highlight, bullet + numbered lists, indent, alignment, quote, link, clear formatting), table picker (4×4 hover grid), attachments (small images embed inline, other files become chips), undo/redo. Sanitized on EVERY render (`spaceSanitizeHtml` whitelist). Used by the inbox "New message" composer and the admin broadcast box — the inbox now shows exactly ONE writing area at a time (thread reply OR composer pane, never both)
- [x] **Client-review batch** — RTL-safe inbox (`dir="auto"`), admin **Website messages** inbox fed by contact.html (unread bell rows, reply/mark/delete), student **Billing** panel (orders + receipts + totals), **free-trial booking** path (`contact.html?topic=trial`), editable **dated class sessions** (shared teacher/admin editor over `db.schedule`), **"Continue lesson" deep links** into the exact next unfinished unit, floating **WhatsApp button** (admin-editable number), footer **newsletter signups** + admin readout, checkout **terms checkbox** + receipt pointers, class-room **mobile layout: chat moves directly under the video (`display:contents` + order) and the control row collapses into a hamburger bottom sheet (`classroom.js` §6c)**, home featured cards now link to real courses (prices stay placeholder copy)
- [x] **Pre-push audit fixes** — first-visit fallback settings (WhatsApp + overrides work before the store seeds), RTL announcements (`dir="auto"`), fresh-account messaging fallback (any teacher), materials filtered to the student's courses, **assignment editing** (deadlines/instructions update in place with submissions kept), session changes refresh Today instantly, "No courses yet" links the catalog, guest checkouts labelled "Guest purchase", newsletter trimmed to public pages
- [x] **Register / enrollment** — `register.html` + `js/register.js`: creates a real student account in the demo store (unique Stu-ID, profile, credential), signs in, lands on the dashboard; login now accepts store-created accounts
- [x] **Certificates** — `certificate.html` + `js/certificate.js`: issued when every unit of a course is complete (lesson player hands you over on the final unit), stable serial + issue date, print-ready sheet
- [x] **Recordings library** — `recordings.html` + `js/recordings.js`: replay list behind the class REC button (honest demo player), linked from the student Classes panel
- [x] **Notification bell** — derived notifications per role (unread messages, due assignments, grading queue, payment attention), count badge + jump-to-panel rows on every dashboard
- [x] **Admin backup** — export the whole demo database as JSON + restore-from-file with confirmation
- [x] **Launch hygiene** — favicon, 404 page, meta description + Open Graph, robots.txt, sitemap.xml, privacy + terms stubs, skip-link + focus-visible + reduced-motion, print styles, cookie/honesty notice, Blog link everywhere
- [ ] Rebrand + polish → finalize into `academy-live` (private)

## Future candidates (not scheduled — ideas from build + reviews)

None of these are promises; they're the running wish-list so nothing
gets lost:

- **Attendance marking per session** (teacher) — dated sessions exist; marking who showed up is the natural next step
- **Public certificate verification** — a page that looks up a serial (EA-A1-SP-2001)
- **Teacher class announcements** — today only the admin broadcasts globally; teachers announce via chat/inbox
- **Newsletter → mailing service** — currently a local demo list; live build wires Mailchimp/Buttondown
- **Payment search/filter + user email column** in the admin tables
- **Course finder** — filter the catalog by level × skill on `courses.html`
- **Pricing copy vs reality** — "downloadable audio lessons" and the "AI conversation partner" are promises in the pricing matrix that need the backend phase
- **Full Persian / RTL version** — chat and inbox messages are already RTL-aware (`dir="auto"`); the rest of the site would need a language layer
- **Lesson checkpoints** — resume a video lesson where you stopped (needs real recordings)

## Workflow notes

- Everything starts in this repo (dev). Finalized modules get
  cleaned & branded, then copied to the live repo.
- Public repo = always-working diary. Risky experiments go on
  branches and only merge when they work.
- Daily ritual: `git status` → `git add .` → `git commit -m "..."` →
  `git push origin main`
