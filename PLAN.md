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
