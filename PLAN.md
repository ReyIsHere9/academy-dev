# Academy Site — DEV Build Plan (generic test version)

Public learning/dev repo. Everything here is generic (placeholder
name, example courses, classic look). Branded "real" version lives
in the private academy-live repo.

## Site modules (build order)

- [x] **Module 1 — Home** (`index.html`) + shared `css/styles.css`
- [x] **Module 2 — Courses catalog** (`courses.html`) — A1–C2 showcase carousel + skills grid (built on `Deltaone`)
- [x] **Module 3 — Course detail** (`course.html`) — reads `?level=&skill=` from URL, 24 courses from one template (built on `Deltaone`)
- [x] **Module 4 — About** (`about.html`) — writer's-note template (built on `Deltaone` branch)
- [x] **Module 5 — Contact** (`contact.html`) — form (mailto engine), icon list, socials, live open/closed hours, map slot (built on `Deltaone`)
- [x] **Theme system** — global light/dark via CSS variables + `js/theme.js` toggle, `.grad-*` banner classes, future pages auto-ready (built on `Deltaone`)
- [x] **Pricing module** — header mega-dropdown on every page + `pricing.html` (billing toggle, comparison matrix, lifetime offer hook)
- [x] **Auth entry UI** — header Login/Register button, `login.html` (User ID + password + eye toggle + demo session), `recovery.html`. DEMO ONLY: real auth needs a backend (see security notes in `js/auth.js`)
- [x] **Live class room (UI shell)** — `class.html` (student), `class-teacher.html` (teacher tools: screen share + resizable censor boxes, whiteboard with zoom/pan/pinch + viewbar, media showcase for uploaded PDFs/images/videos/audio on stage, per-surface ink layers — every surface AND every uploaded file keeps its own drawings, text, censor boxes and undo history, Photoshop-style vertical tool rail with collapse + per-tool size flyouts + cursor rings + eyedropper loupe + white + bucket fill, pen/highlighter/text/both erasers/9th eyedropper swatch/undo-redo, recording, materials drag-drop, pop-out chat), `class-admin.html` (full teacher room + Admin tab: participant list with remove, add user, broadcast announcement, empty stage content, clear chat, lower all hands, end class, activity log), `class-chat.html` (pop-out window). Stage view modes for everyone: chat show/hide drawer (YouTube-comments style, also works as a floating drawer in theater + fullscreen), theater mode, lights-out (only video + tool rail + bulb stay lit), native fullscreen of the whole layout. Chat with EN/FA/emoji/images, hand raise, roles, custom colored titles, connection bars, class-time/clock toggle. Demo data via `js/class-data.js`
- [ ] **Module 6 — Account spaces** — `dashboard.html` (student), `dashboard-teacher.html` (teacher studio), `dashboard-admin.html` (admin console) sharing one `js/space.js` engine + `js/space-data.js` demo database (localStorage, relative times). Header session chip (`js/session.js`) shows "Dashboard" when logged in. Each space gets a personal accent color; the admin console can edit data the public pages read back.
    - [x] Phase 0 — store + login gate (one-click demo logins) + shell (nav, greeting, accent, logout) + UI kit (toast, confirm) + student Home (next class, announcements)
    - [x] Phase 1 — student space: Home stats + continue learning, My courses (progress), Classes (schedule + join by code), Assignments (list filters, detail view, drag-&-drop submission with allowed types / size limit / naming convention + auto-rename + comments thread, unsubmit, grade + feedback), Materials (search + honest demo downloads), Achievements (badge showcase + live First Steps unlock), Profile (avatar color, bio, accent color, notification prefs, save) + public `profile.html` (safe fields only)
    - [x] Phase 2 — teacher studio: Today (stats, next class, grading queue, activity), My classes (course instances + create-a-class with student enrollment), Gradebook (interactive student × assignment matrix, per-cell grading/commenting, click-through to grader), Assignments (create task/worksheet/exam for a class, save/reuse/delete templates, delete assignments), grading assistance (quick scores, rubric → suggested score, feedback phrase library, inbox notify), Inbox (threaded direct messages with students, unread badges), Students (award/remove badges, private notes), Materials upload/delete (students see them instantly), Profile. Student space also gained an Inbox + "Ask your teacher" from assignments
    - [x] Phase 3 — admin console: Overview (stats, payment bars, attention list, activity), Users (edit/rename IDs across the whole store/reset passwords with auth integration/suspend/view-as impersonation/create/delete), Payments (subscriptions vs one-time, paid/pending/failed overrides, revenue), Catalog (edit labels, taglines, summaries, grammar, skill blurbs, highlights, unit titles — overrides levels-data.js on public course pages), Media (upload/URL/clear every photo spot: logo, hero, teacher photo, map — painted by js/site.js), Classes (reassign teachers, codes, meetings, rosters, delete), Content (site settings + announcement broadcast), Badges (edit/add/delete catalog), Danger zone (reset demo DB). Every admin action writes to the activity log
    - [ ] Phase 4 — polish, responsive pass, docs
- [ ] **Real class backend** — WebRTC/streaming service, real recording, server-side uploads, cross-device sync (backend phase)
- [ ] **Real authentication** — server-side hashing (bcrypt/argon2), httpOnly sessions, rate limiting, 2FA, reset tokens (backend phase)

## Later upgrades (v2+)

- [ ] Lesson player module (watch/read lessons per course)
- [ ] Pricing / checkout (course selling)
- [ ] Blog module
- [ ] Rebrand + polish → finalize into `academy-live` (private)

## Workflow notes

- Everything starts in this repo (dev). Finalized modules get
  cleaned & branded, then copied to the live repo.
- Public repo = always-working diary. Risky experiments go on
  branches and only merge when they work.
- Daily ritual: `git status` → `git add .` → `git commit -m "..."` →
  `git push origin main`
