# MOBILE QA — the phone pass (Samsung / Xiaomi / Apple)

This is the manual checklist for testing the site on real phones.
Three test devices cover ~95% of what our students use:

| Device | Browser(s) to test | Notes |
|---|---|---|
| Samsung Galaxy S23 Ultra (teacher's) | **Samsung Internet** AND Chrome | Samsung Internet is not Chrome — it has its own dark-mode handling and quirks |
| Poco F7 (owner's) | Chrome (+ Mi/Xiaomi browser if installed) | tall 20:9 screen; MIUI font-scaling can differ |
| Any iPhone | **Safari** | the strictest engine of the three; fixes here help everywhere |

---

## 1. How to open the dev site on a phone (5 minutes)

The site is plain files — serve them once, open them everywhere:

1. On the PC, run the site (VS Code **Live Server** on `index.html`).
2. Open a terminal and find the PC's local IP:
   ```
   ipconfig
   ```
   Look for **IPv4 Address** under the Wi-Fi adapter (e.g. `192.168.1.42`).
3. Make sure the phones are on the **same Wi-Fi network**.
4. On each phone, open:
   ```
   http://192.168.1.42:5500
   ```
   (Live Server's default port is 5500 — check VS Code's status bar if different.)
5. If Windows Firewall blocks it, allow **Node.js / Live Server** on private networks.

> The demo store lives in each phone's browser, so first visits show
> fallback settings — that's expected and part of the test (see #4).

---

## 2. Cross-brand checks (every phone, every browser)

Open the site, then walk these:

- [ ] **No horizontal scrolling anywhere** — swipe sideways on: home, courses, class room, dashboards, admin tables
- [ ] **Header**: logo, nav rows, theme toggle all tappable; nothing overlaps
- [ ] **Theme toggle** works and *sticks* after a reload
- [ ] **Cookie bar** sits above the bottom edge (not under the home bar)
- [ ] **WhatsApp button** floats above the bottom edge and doesn't cover important UI
- [ ] **Tap targets**: Mic / Camera / Raise hand / class tools are finger-size (≥40px)
- [ ] **Inputs don't zoom the page** when focused (the 16px rule) — type in chat, login, contact
- [ ] **Keyboard**: open the chat input — layout stays usable, Send reachable
- [ ] **Tables scroll inside their card**, the page itself doesn't

## 3. Where the brands differ (what to look for)

**Samsung Internet (S23 Ultra):**
- [ ] Its own **dark mode** may repaint the page — toggle site theme vs browser theme and check contrast on: gold/red status chips, lesson tip boxes, the class tool rail
- [ ] Edge panel swipes shouldn't fight the class room's left tool rail
- [ ] Tall screen: the mobile **controls hamburger sheet** should open fully and close on outside tap

**Xiaomi / Poco (Chrome):**
- [ ] Set **system font size to Large** (Settings → Display) and re-check: no clipped buttons, nav still wraps cleanly
- [ ] Default browser (if MIUI browser): check form selects and the rich editor toolbar
- [ ] Rotate to landscape in the class room: video + chat should both remain usable

**iPhone Safari:**
- [ ] **Focus an input** — the page must NOT zoom (16px fix); if it zooms, report the field
- [ ] Home-bar area: the controls sheet, toasts and WhatsApp button sit above it (`safe-area`)
- [ ] Pull-to-refresh shouldn't trigger while scrolling inside chat/messages
- [ ] Pop-out chat window (`class-chat.html`): full height, input visible above the keyboard

## 4. First-visit vs returning (the store)

- [ ] **First visit (fresh browser)**: WhatsApp button visible, sensible defaults, student page shows the login gate
- [ ] Log in as a demo student (gate has one-click logins) → dashboard loads, bell counts work
- [ ] Log in as teacher → Today / Gradebook / Inbox usable; open the **Sessions → Attendance** panel and mark someone
- [ ] Log in as admin → Users table scrolls inside its card; Content → broadcast editor toolbar wraps on one line or two, never overflows
- [ ] Student side: complete a lesson; the dashboard "Continue lesson" deep-link opens the right unit

## 5. Known-good expectations

- Dark theme is the default on phones that prefer dark — both themes are first-class
- Modals (confirm dialogs, compose panes) close on outside tap
- Rich editor popovers (colors / table grid) fit on a 360px-wide screen
- The class room on phones: **video → chat → "In this class" → tiles**, controls behind the ☰ button

## 6. Reporting a problem (what to send)

Screenshot + the page URL + device/browser. Example:

> `class.html` — Samsung Internet, S23 Ultra — the ☰ controls sheet
> opened under the browser toolbar; marks for Mic unreachable.

That's everything needed to reproduce and fix it.
