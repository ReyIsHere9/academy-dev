# The English Academy — Dev Build

A hand-built English academy website: course catalog, pricing, live online
classroom, and student/teacher tooling. **No frameworks, no CMS** — plain
HTML, CSS and JavaScript, built and documented module by module.

> This is the **public dev/learning repo**. All content is intentionally
> generic (placeholder academy name, example courses, classic theme).
> The branded production version lives in a separate private repo.

---

## What's built so far

| Page | What it does |
|---|---|
| `index.html` | Home page — hero, features, featured courses |
| `courses.html` | A1–C2 level showcase carousel + skills grid |
| `course.html` | Course detail — reads `?level=A2&skill=Writing` from the URL |
| `about.html` | About page built as a "writer's note" template |
| `contact.html` | Contact form (mailto engine), hours, socials, map slot |
| `pricing.html` | Billing toggle, OpenAI-style comparison matrix, lifetime offer |
| `login.html` / `recovery.html` | Auth entry UI (demo) |
| `class.html` | Live class room — student view |
| `class-teacher.html` | Live class room — teacher view (whiteboard, screen share, censor boxes, annotation toolkit, materials, pop-out chat) |
| `class-chat.html` | Pop-out chat window |

Supporting files: `css/styles.css` (one shared stylesheet for everything),
`js/` (data files + per-page engines), `PLAN.md` (module roadmap),
`CODING_GUIDE.md` (conventions and commit rules).

## Run it locally

No build step, no install:

1. Open the folder in VS Code
2. Right-click `index.html` → **Open with Live Server**
3. Edits + `Ctrl+S` refresh the browser instantly

Every page works by direct double-click too, except things that need a
local server (clipboard, some media APIs are stricter on `file://`).

## Notable systems

- **Theme engine** — light/dark mode via CSS variables + `js/theme.js`,
  remembered per visitor, follows the OS by default.
- **Data-driven pages** — course levels, pricing tiers and class data all
  live in small `*-data.js` files; pages render from them.
- **Per-surface ink layers** — every class surface (video, screen share,
  whiteboard, each uploaded file) keeps its own drawings, text, censor
  boxes and undo history.
- **Annotation toolkit** — pen/highlighter/text, two kinds of erasers,
  fill bucket, eyedropper with loupe, per-tool sizes, undo/redo.

## Demo vs. real

Everything here runs 100% in the browser, so authentication, payments,
live A/V streaming, class recording and real uploads are **demo shells** —
the UI and the flows are complete, and the backend swap-ins are documented
in code comments (see `js/auth.js` and `js/classroom.js`).

## Workflow

Daily ritual: `git status` → `git add .` → `git commit -m "..."` →
`git push origin main`. Commit messages describe what was done, in the
past tense. See `CODING_GUIDE.md` for the full conventions.
