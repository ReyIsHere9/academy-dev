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
- [x] **Live class room (UI shell)** — `class.html` (student), `class-teacher.html` (teacher tools: screen share + resizable censor boxes, whiteboard with zoom/pan/pinch + viewbar, media showcase for uploaded PDFs/images/videos/audio on stage, per-surface ink layers — every surface AND every uploaded file keeps its own drawings, text, censor boxes and undo history, Photoshop-style vertical tool rail with collapse + per-tool size flyouts + cursor rings + eyedropper loupe + white + bucket fill, pen/highlighter/text/both erasers/9th eyedropper swatch/undo-redo, recording, materials drag-drop, pop-out chat), `class-chat.html` (pop-out window). Chat with EN/FA/emoji/images, hand raise, roles, custom colored titles, connection bars, class-time/clock toggle. Demo data via `js/class-data.js`
- [ ] **Real class backend** — WebRTC/streaming service, real recording, server-side uploads, cross-device sync (backend phase)
- [ ] **Real authentication** — server-side hashing (bcrypt/argon2), httpOnly sessions, rate limiting, 2FA, reset tokens (backend phase)

## Later upgrades (v2+)

- [ ] Lesson player module (watch/read lessons per course)
- [ ] Pricing / checkout (course selling)
- [ ] Blog module
- [ ] Student accounts
- [ ] Rebrand + polish → finalize into `academy-live` (private)

## Workflow notes

- Everything starts in this repo (dev). Finalized modules get
  cleaned & branded, then copied to the live repo.
- Public repo = always-working diary. Risky experiments go on
  branches and only merge when they work.
- Daily ritual: `git status` → `git add .` → `git commit -m "..."` →
  `git push origin main`
