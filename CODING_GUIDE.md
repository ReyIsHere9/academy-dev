# Coding Guide — how this site is built (read me before every session)

This document exists so EVERY future session (human or AI)
builds modules the same way. If you follow it, the site stays
consistent, readable, and easy to upgrade forever.

---

## 1. The two-repo rule (dev vs live)

| Repo | Purpose | Rules |
|---|---|---|
| `academy-dev` (public) | Learning + testing playground | Generic content only. "The English Academy", example courses, classic blue look. Debug/customization stuff allowed. |
| `academy-live` (private) | The real site | Branded "Blue Seashell Academy". Ocean + silver + gold + purple + red modern look. Only clean, finalized modules. |

- Everything is born in `dev`. Nothing gets copied to `live`
  until it works and is finalized.
- Never ask brand/course questions for `dev` content — it's
  generic on purpose. Brand details belong to `live`.

---

## 2. Project structure (add files only here)

```
academy-dev/
├── index.html        # Module: Home
├── courses.html      # Module: Courses catalog
├── course.html       # Module: Course detail (one per course template)
├── about.html        # Module: About
├── contact.html      # Module: Contact
├── PLAN.md           # roadmap + module checklist (update it!)
├── CODING_GUIDE.md   # this file
├── css/
│   └── styles.css    # ONE shared stylesheet for every page
└── assets/
    └── images/       # photos go here (later: /audio, /video per module)
```

Rules:
- Page files live in the ROOT folder, flat (no nested pages/ folder).
- All new pages link the same stylesheet: `css/styles.css`.
- New folders appear only when a feature really needs them.

---

## 3. HTML rules (every page follows this exact anatomy)

```
<!DOCTYPE html>
<html lang="en">
  <head>
    meta charset, meta viewport, <title>, <link> to styles.css
  </head>
  <body>
    <header class="site-header">   → same menu on every page
    main page content in sections:
      <section class="hero">         (only on Home)
      <section class="section">      (normal white block)
      <section class="section section-alt">  (alternate gray block)
    <footer class="site-footer">    → same footer on every page
  </body>
</html>
```

Class naming rules (CRITICAL):
- Use **semantic class names**, never style by appearance:
  `card`, `feature-card`, `course-card`, `btn`, `badge`, `hero`
- One HTML element can carry many classes: `class="card course-card"`
- One class may be reused everywhere (`card` on any page).
- A page marks itself in the menu: `class="active"` on its own nav link.
- `h1` appears exactly ONCE per page. Sections use `h2`, cards use `h3`.

Commenting style (keep it!):
- Big banner comment at the top of every NEW page explaining
  its purpose, plus a short HTML anatomy reminder.
- Section comments like `<!-- ====== HERO ====== -->` before each block.
- Teach-inline-comments on first-time concepts, then stop
  repeating them on later pages (comments shrink as user learns).
- Explain WHAT a block does when the tag isn't obvious
  (`<nav>`, `<article>`, `<section>`), never explain plain text content.

---

## 4. CSS rules (styles.css stays the single source of truth)

Order inside the file — always top to bottom:
1. Big banner comment (what this file does + CSS mini-lesson)
2. `:root` variables — ALL colors, spacing, radius, container width
3. Global reset (`*` margin/padding, box-sizing)
4. Base tags (body, a, img, h1–h3)
5. Layout (.container)
6. Reusable components (.btn, .card, .badge — alphabetical-ish)
7. Page sections (header, hero, footer, then page-specific)
8. Media queries at the VERY bottom (mobile overrides)

Style rules:
- ALL colors via variables: `var(--color-primary)` — never type
  a hex code in page rules if a variable already exists.
- Rebranding = editing ONLY the `:root` block. Design the
  variables so `live` needs nothing but new values there.
- Reuse components before writing new CSS. If `.btn` exists,
  don't invent `.button2` — extend with modifiers (`.btn-small`).
- Flexbox for one-direction rows, Grid for card columns.
  gap, never margin-spacing between flex/grid children.
- Mobile: one media query at bottom, collapse grids to 1 column.
- New module CSS gets its own labeled section in the SAME file,
  unless the page needs truly unique styles → then a small
  page-specific section, still in styles.css. No separate files per page.

---

## 5. The module build checklist (do this for EVERY new module)

1. Read this guide + PLAN.md first.
2. Copy the skeleton from the most similar existing page
   (header/footer/section structure — NEVER retype from scratch).
3. New classes in HTML FIRST, then add their CSS rules.
4. Fill with GENERIC content (dev repo).
5. Test: open via Live Server, resize window to mobile width.
6. Update PLAN.md: tick the checkbox.
7. Commit with a clear message: `git add .` →
   `git commit -m "Add Module 4: about page"` → `git push origin main`
8. Walk the user through the module afterward (they're learning!):
   what was added, what each new class does, what changed in CSS.

---

## 6. Git workflow reminders (the ritual)

```
git status          → check what changed (run before every commit)
git add .           → stage
git commit -m "msg" → message = what was done, past tense, descriptive
git push origin main→ post to GitHub
```

- Branch naming: `feat-`, `fix-`, `chore-`, `learn-` + short name.
- One commit per logical unit ("Add module 2" = one commit,
  not 20 small ones).
- Public `dev` repo must ALWAYS be in working condition.
  Risky experiments live on branches and merge only when they work.
- Commit messages in past tense, no emojis, no periods.

---

## 7. Teaching style (this project teaches as it builds)

Every session should explain — chat level or code comments:
- One core concept per module (flexbox, grid, media queries, forms...)
- New HTML tags with one-line meaning
- New CSS properties with a plain-English "why"
- Beginner analogies, zero jargon without translation
- Short recap at the end of what was learned + what's next
