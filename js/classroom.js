/* ============================================================
   CLASSROOM ENGINE — shared by class.html, class-teacher.html
   and class-chat.html
   ------------------------------------------------------------
   HOW THREE PAGES SHARE ONE SCRIPT:
   Every block below is GUARDED — it checks "does my element
   exist on this page?" and only then runs. Same pattern as
   pricing.js, so one file safely powers all three pages:
     class.html          -> student room
     class-teacher.html  -> teacher room (extra tools)
     class-chat.html     -> pop-out chat window
   Teacher pages mark themselves with <body class="teacher-mode">,
   the popup with class="popup-mode".

   ⚠️ WHAT'S REAL vs DEMO:
   REAL (pure front-end logic): timers, class-time/clock toggle,
   chat send + emoji + image preview (<5MB), hand raise,
   role/badge assignment UI, censor boxes, material file list.
   DEMO DATA: participants and messages come from class-data.js.
   NEEDS BACKEND (future phase): actual A/V streaming, real
   cross-user sync, real screen capture and class recording.
   ============================================================ */

const IS_TEACHER = document.body.classList.contains("teacher-mode");
const IS_POPUP   = document.body.classList.contains("popup-mode");

/* ============ 1. CLOCKS ============
   The class "started" 37 minutes ago per CLASS_INFO. All times
   derive from that single moment:
   - "Live for" timer      = now - class start (ticks up)
   - REC timer             = now - recording start
   - wall clock for a msg  = class start + elapsed seconds */
const CLASS_START_MS = Date.now() - CLASS_INFO.startedMinutesAgo * 60000;
let recStartMs = Date.now() - CLASS_INFO.recStartedMinutesAgo * 60000;

function fmtDuration(totalSec) {
    const s = Math.max(0, Math.floor(totalSec));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const two = n => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${two(m)}:${two(sec)}` : `${m}:${two(sec)}`;
}

function wallClockFor(elapsedSec) {
    /* the actual clock time a message was sent:
       class start moment + how far into class it was sent */
    return new Date(CLASS_START_MS + elapsedSec * 1000)
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function tickClocks() {
    const liveEl = document.getElementById("live-for");
    if (liveEl) liveEl.textContent = fmtDuration((Date.now() - CLASS_START_MS) / 1000);

    const recEl = document.getElementById("rec-chip");
    if (recEl) {
        const on = CLASS_INFO.recording;
        recEl.classList.toggle("is-off", !on);
        recEl.querySelector("span:last-child").textContent = on
            ? "REC " + fmtDuration((Date.now() - recStartMs) / 1000)
            : "Not recording";
    }
}
setInterval(tickClocks, 1000);

/* ============ 2. PEOPLE ============
   A working copy of the demo participants (so toggles below
   don't edit the original data file). Each person gets an
   avatar color from a small palette. */
const AVATAR_COLORS = ["#2563eb", "#7c3aed", "#db2777", "#059669",
                       "#d97706", "#0891b2", "#e11d48"];

const YOU_ID = IS_TEACHER ? CLASS_INFO.presenterId : "Stu-2001";

let participants = PARTICIPANTS.map((p, i) => ({
    ...p,
    badge: p.badge ? { ...p.badge } : null,
    color: AVATAR_COLORS[i % AVATAR_COLORS.length]
}));

const you = () => participants.find(p => p.id === YOU_ID);
const initialOf = name => name.trim().charAt(0).toUpperCase();

/* four-bar connection antenna: level 1-4, colored in CSS */
function connBars(conn) {
    return `<span class="conn-bars conn-${conn}"
        title="Connection: ${conn}/4"><i></i><i></i><i></i><i></i></span>`;
}

function badgePill(badge) {
    /* titles are FREE TEXT now — any label, any color */
    const text = badge.text || "";
    if (!text) return "";
    return `<span class="badge-pill" style="--badge-color:${esc(badge.color)}">
        &#9733; ${esc(text)}</span>`;
}

/* tiny HTML escaper. Teacher-typed titles are USER INPUT —
   never inject raw user text into innerHTML (XSS lesson).
   & < > " ' all become safe entities first. */
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

/* SVG icon strings (kept tiny, reused everywhere) */
const ICONS = {
    micOn:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`,
    micOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`,
    camOn:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`,
    camOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
};

/* ============ 3. RENDER PARTICIPANTS ============ */
function renderParticipants() {
    const strip = document.getElementById("participants-strip");
    const list  = document.getElementById("people-list");

    /* --- the tile grid under the stage --- */
    if (strip) {
        strip.innerHTML = participants.map(p => `
            <div class="p-tile">
                <span class="p-avatar" style="background:${p.color}">
                    ${initialOf(p.name)}
                    ${connBars(p.conn)}
                    ${p.hand ? `<span class="hand-flag" title="Hand raised">&#9995;</span>` : ""}
                </span>
                <p class="p-name">${p.name}</p>
                <span class="role-tag role-${p.role}">${ROLES[p.role].label}</span>
                ${p.badge ? badgePill(p.badge) : ""}
                <span class="p-icons">
                    ${p.mic ? ICONS.micOn : ICONS.micOff}
                    ${p.cam ? ICONS.camOn : ICONS.camOff}
                </span>
            </div>
        `).join("");
    }

    /* --- the detailed People tab (teacher gets controls) --- */
    if (list) {
        list.innerHTML =
            /* preset title suggestions for the datalist dropdown */
            `<datalist id="badge-presets">${BADGES.map(b =>
                `<option value="${esc(b.label)}"></option>`).join("")}</datalist>` +
            participants.map(p => `
            <div class="person-row" data-person="${p.id}">
                <span class="msg-avatar" style="background:${p.color}">${initialOf(p.name)}</span>
                <div class="person-info">
                    <div class="person-name">
                        ${esc(p.name)}${p.id === YOU_ID ? " (you)" : ""}
                        ${p.hand ? `<span class="hand-flag" title="Hand raised">&#9995;</span>` : ""}
                    </div>
                    <div class="person-tags">
                        <span class="role-tag role-${p.role}">${ROLES[p.role].label}</span>
                        ${p.badge ? badgePill(p.badge) : ""}
                        ${connBars(p.conn)}
                    </div>
                </div>
                ${IS_TEACHER && !IS_POPUP ? `
                <div class="teacher-controls">
                    <select class="mini-select" data-action="role"
                            title="Change role">
                        ${Object.entries(ROLES).map(([id, r]) =>
                            `<option value="${id}" ${p.role === id ? "selected" : ""}>${r.label}</option>`
                        ).join("")}
                    </select>
                    <div class="title-row">
                        <input class="mini-input" data-action="title"
                               list="badge-presets"
                               value="${p.badge ? esc(p.badge.text) : ""}"
                               placeholder="Title…"
                               title="Give, edit or remove a title">
                        ${p.badge ? `<button type="button" class="title-clear"
                            data-action="clear-title" title="Remove title">&times;</button>` : ""}
                    </div>
                    <input type="color" class="color-input" data-action="color"
                           value="${p.badge ? p.badge.color : "#f59e0b"}"
                           title="Title color">
                </div>` : ""}
            </div>
        `).join("");
    }
}

/* teacher-only: react to role / title / color changes */
const peopleList = document.getElementById("people-list");
if (peopleList && IS_TEACHER && !IS_POPUP) {
    peopleList.addEventListener("change", (event) => {
        const row = event.target.closest("[data-person]");
        if (!row) return;
        const person = participants.find(p => p.id === row.dataset.person);
        if (!person) return;
        const action = event.target.dataset.action;

        if (action === "role") {
            person.role = event.target.value;
        }

        if (action === "title") {
            /* "change" (not "input") on purpose: we re-render the
               list after this, and re-rendering on every keystroke
               would steal focus from the text box mid-typing. */
            const text = event.target.value.trim();
            const colorInput = row.querySelector('[data-action="color"]');
            person.badge = text
                ? { text, color: colorInput ? colorInput.value : "#f59e0b" }
                : null;   // empty title = remove the badge
        }

        if (action === "color" && person.badge) {
            person.badge.color = event.target.value;
        }

        renderParticipants();
    });

    /* the little × button removes a title immediately */
    peopleList.addEventListener("click", (event) => {
        const clearBtn = event.target.closest('[data-action="clear-title"]');
        if (!clearBtn) return;
        const row = clearBtn.closest("[data-person]");
        const person = participants.find(p => p.id === row.dataset.person);
        if (person) {
            person.badge = null;
            renderParticipants();
        }
    });
}

/* ============ 4. YOUR CONTROLS (mic / cam / hand) ============ */
function renderControls() {
    const me = you();
    if (!me) return;

    const micBtn = document.getElementById("mic-btn");
    if (micBtn) {
        micBtn.classList.toggle("is-active", me.mic);
        micBtn.setAttribute("aria-pressed", String(me.mic));
    }
    const camBtn = document.getElementById("cam-btn");
    if (camBtn) {
        camBtn.classList.toggle("is-active", me.cam);
        camBtn.setAttribute("aria-pressed", String(me.cam));
    }
    const handBtn = document.getElementById("hand-btn");
    if (handBtn) {
        handBtn.classList.toggle("is-raised", me.hand);
        handBtn.querySelector("span").textContent =
            me.hand ? "Lower hand" : "Raise hand";
    }
}

const micBtn = document.getElementById("mic-btn");
if (micBtn) micBtn.addEventListener("click", () => {
    const me = you(); me.mic = !me.mic;
    renderControls(); renderParticipants();
});

const camBtn = document.getElementById("cam-btn");
if (camBtn) camBtn.addEventListener("click", () => {
    const me = you(); me.cam = !me.cam;
    renderControls(); renderParticipants();
    /* ⚠️ note: this only flips the icon in the demo. Real video
       needs getUserMedia() + a streaming service (backend phase). */
});

const handBtn = document.getElementById("hand-btn");
if (handBtn) handBtn.addEventListener("click", () => {
    const me = you(); me.hand = !me.hand;
    renderControls(); renderParticipants();
});

/* ============ 5. CHAT ============
   Messages live here in memory + sessionStorage (so a reload
   keeps them) and sync between windows via BroadcastChannel —
   that's what makes the pop-out chat work without a server.
   ⚠️ Images are NOT persisted (sessionStorage is only ~5MB);
   real apps upload the image and share a URL instead. */
const CHAT_STORE = "academy-class-chat-demo-v1";
let messages;
try {
    const saved = JSON.parse(sessionStorage.getItem(CHAT_STORE));
    messages = (saved && saved.length)
        ? saved
        : CHAT_SEED.map((m, i) => ({ id: "seed-" + i, ...m }));
} catch {
    messages = CHAT_SEED.map((m, i) => ({ id: "seed-" + i, ...m }));
}

let timeMode = "class";   // "class" = time since start, "clock" = wall time

/* cross-window sync (main tab <-> pop-out chat) */
const chatChannel = "BroadcastChannel" in window
    ? new BroadcastChannel("academy-class-chat")
    : null;
if (chatChannel) {
    chatChannel.onmessage = (event) => {
        if (event.data && event.data.message) addMessage(event.data.message, true);
    };
}

function persistChat() {
    /* store text-only messages (images don't fit in storage) */
    const textOnly = messages
        .filter(m => !m.image)
        .map(m => ({ id: m.id, fromId: m.fromId, text: m.text, elapsedSec: m.elapsedSec }));
    try { sessionStorage.setItem(CHAT_STORE, JSON.stringify(textOnly)); } catch {}
}

function renderChat() {
    const list = document.getElementById("chat-messages");
    if (!list) return;

    list.innerHTML = "";
    for (const m of messages) {
        const author = participants.find(p => p.id === m.fromId)
            || { name: "Guest", role: "participant", color: "#64748b" };

        const row = document.createElement("div");
        row.className = "msg";

        const avatar = document.createElement("span");
        avatar.className = "msg-avatar";
        avatar.style.background = author.color;
        avatar.textContent = initialOf(author.name);

        const body = document.createElement("div");
        body.className = "msg-body";

        const head = document.createElement("div");
        head.className = "msg-head";
        const name = document.createElement("span");
        name.className = "msg-name";
        name.textContent = author.name + (m.fromId === YOU_ID ? " (you)" : "");
        const role = document.createElement("span");
        role.className = "role-tag role-" + author.role;
        role.textContent = ROLES[author.role].label;
        const time = document.createElement("span");
        time.className = "msg-time";
        time.textContent = timeMode === "class"
            ? fmtDuration(m.elapsedSec)          // e.g. "17:05"
            : wallClockFor(m.elapsedSec);        // e.g. "10:42 AM"
        head.append(name, role, time);

        const text = document.createElement("div");
        text.className = "msg-text";
        /* dir="auto": the browser detects RTL languages (Persian,
           Arabic, Hebrew...) and right-aligns them automatically.
           That's the whole trick for mixed-language chat! */
        text.dir = "auto";
        text.textContent = m.text || "";

        body.append(head);
        if (m.text) body.append(text);
        if (m.image) {
            const img = document.createElement("img");
            img.className = "msg-img";
            img.src = m.image;
            img.alt = "Shared image";
            body.append(img);
        }

        row.append(avatar, body);
        list.append(row);
    }
    list.scrollTop = list.scrollHeight;
}

function addMessage(msg, fromRemote) {
    if (messages.some(m => m.id === msg.id)) return;  // dedupe sync echoes
    messages.push(msg);
    persistChat();
    renderChat();
}

function sendChat(text, imageDataUrl) {
    const msg = {
        id: "m-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
        fromId: YOU_ID,
        text: text || "",
        elapsedSec: (Date.now() - CLASS_START_MS) / 1000,
        image: imageDataUrl || null
    };
    addMessage(msg, false);
    if (chatChannel) chatChannel.postMessage({ message: msg });
}

/* --- form + emoji + image --- */
const chatForm = document.getElementById("chat-form");
if (chatForm) {
    const input = document.getElementById("chat-input");

    chatForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        sendChat(text, null);
        input.value = "";
        input.focus();
    });

    /* emoji quick bar */
    const emojiBar = document.getElementById("emoji-bar");
    if (emojiBar) {
        emojiBar.innerHTML = QUICK_EMOJIS
            .map(e => `<button type="button" class="emoji-btn">${e}</button>`)
            .join("");
        emojiBar.addEventListener("click", (event) => {
            const btn = event.target.closest(".emoji-btn");
            if (!btn) return;
            input.value += btn.textContent;
            input.focus();
        });
    }

    /* image sharing, max 5 MB (client-side check only —
       a real upload must be validated on the server too!) */
    const imageInput = document.getElementById("chat-image");
    const imageBtn = document.getElementById("image-btn");
    const chatError = document.getElementById("chat-error");

    if (imageBtn && imageInput) {
        imageBtn.addEventListener("click", () => imageInput.click());

        imageInput.addEventListener("change", () => {
            const file = imageInput.files[0];
            imageInput.value = "";           // allow re-picking same file
            if (!file) return;

            const FIVE_MB = 5 * 1024 * 1024;
            if (file.size > FIVE_MB) {
                if (chatError) {
                    chatError.hidden = false;
                    chatError.textContent =
                        "That image is " + (file.size / 1024 / 1024).toFixed(1) +
                        " MB — the limit is 5 MB.";
                }
                return;
            }
            if (chatError) chatError.hidden = true;

            /* FileReader turns the file into a data URL we can
               show instantly (preview). Real apps upload the file
               and share the returned URL instead. */
            const reader = new FileReader();
            reader.onload = () => sendChat("", reader.result);
            reader.readAsDataURL(file);
        });
    }
}

/* --- Class time / Clock time toggle --- */
const seg = document.querySelector(".seg[data-role='timestamp']");
if (seg) {
    seg.addEventListener("click", (event) => {
        const btn = event.target.closest(".seg-btn");
        if (!btn) return;
        timeMode = btn.dataset.timeMode;
        seg.querySelectorAll(".seg-btn").forEach(b =>
            b.classList.toggle("is-active", b === btn));
        renderChat();
    });
}

/* ============ 6. TABS (Chat / People / Materials) ============ */
const tabsBox = document.querySelector(".tabs");
if (tabsBox) {
    tabsBox.addEventListener("click", (event) => {
        const btn = event.target.closest(".tab-btn");
        if (!btn) return;
        tabsBox.querySelectorAll(".tab-btn").forEach(b =>
            b.classList.toggle("is-active", b === btn));
        document.querySelectorAll(".tab-panel").forEach(panel =>
            panel.classList.toggle("is-active",
                panel.dataset.panel === btn.dataset.tab));
    });
}

/* ============ 7. TEACHER TOOLS (guarded by teacher-mode) ============ */
if (IS_TEACHER && !IS_POPUP) {

    /* --- recording on/off (demo: flips locally; in the real app
           this state arrives from the server so EVERYONE sees
           the same red light) --- */
    const recToggle = document.getElementById("rec-toggle");
    if (recToggle) {
        recToggle.addEventListener("click", () => {
            CLASS_INFO.recording = !CLASS_INFO.recording;
            if (CLASS_INFO.recording) recStartMs = Date.now();
            recToggle.classList.toggle("is-rec", CLASS_INFO.recording);
            recToggle.querySelector("span").textContent =
                CLASS_INFO.recording ? "Stop recording" : "Start recording";
            tickClocks();
        });
    }

    /* --- screen share + whiteboard + annotation toolkit.
           ⚠️ In the real app, hiding parts of a real screen share
           means compositing the captured video through a canvas
           BEFORE sending it on. You can't black out pixels on a
           stream that already left the machine. --- */
    const stage = document.getElementById("stage");
    const shareBtn = document.getElementById("share-btn");
    const boardBtn = document.getElementById("whiteboard-btn");
    const censorLayer = document.getElementById("censor-layer");
    const textLayer = document.getElementById("text-layer");
    const drawCanvas = document.getElementById("draw-canvas");
    const drawCtx = (drawCanvas && drawCanvas.getContext)
        ? drawCanvas.getContext("2d")
        : null;

    let sharing = false;
    let boardOn = false;

    /* ============ ANNOTATION DRAWING LAYER ============
       Strokes are stored as NORMALIZED points (0..1) so they
       survive window resizes — we always redraw from data.
       history = snapshots of the strokes list, for undo/redo. */
    const DRAW_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e",
                         "#3b82f6", "#8b5cf6", "#0f172a"];
    let currentTool = null;   // "pen" | "highlight" | "text" | "censor"
                              // | "erase-stroke" | "erase-circle"
    let drawColor = DRAW_COLORS[0];  // red by default

    /* BRUSH SIZES per tool: [small, medium, large] in pixels.
       pen        = ink stroke thickness
       highlight  = marker width
       erase-circle = radius of the round pixel eraser */
    const TOOL_SIZES = {
        pen: [2, 4, 7],
        highlight: [12, 20, 32],
        "erase-circle": [14, 26, 42]
    };
    let sizeLevel = 1;   // 0 small, 1 medium, 2 large

    let strokes = [];                // committed ink strokes
    let currentStroke = null;        // the one being drawn now
    let textItems = [];              // committed text boxes {x,y,text,color}
    let history = [{ strokes: [], texts: [] }];   // snapshots (index 0 = empty)
    let histIndex = 0;

    const copyStrokes = list =>
        list.map(s => ({ ...s, points: s.points.map(p => ({ ...p })) }));
    const copyTexts = list => list.map(t => ({ ...t }));

    function commitHistory() {
        history = history.slice(0, histIndex + 1);   // drop redo future
        history.push({
            strokes: copyStrokes(strokes),
            texts: copyTexts(textItems)
        });
        if (history.length > 80) history.shift();    // cap memory
        histIndex = history.length - 1;
        updateToolButtons();
    }

    /* restore both ink and text from a history snapshot */
    function applySnapshot(index) {
        const snap = history[index];
        strokes = copyStrokes(snap.strokes);
        textItems = copyTexts(snap.texts);
        renderTexts();
        redrawAll();
    }

    function updateToolButtons() {
        const undo = document.getElementById("tool-undo");
        const redo = document.getElementById("tool-redo");
        if (undo) undo.disabled = histIndex <= 0;
        if (redo) redo.disabled = histIndex >= history.length - 1;
    }

    function canvasSize() {
        const rect = stage.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        if (drawCanvas.width !== Math.round(rect.width * dpr) ||
            drawCanvas.height !== Math.round(rect.height * dpr)) {
            drawCanvas.width = Math.round(rect.width * dpr);
            drawCanvas.height = Math.round(rect.height * dpr);
            drawCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        return { w: rect.width, h: rect.height };
    }

    function paintStroke(stroke, size) {
        const pts = stroke.points.map(p => ({
            x: p.x * size.w,
            y: p.y * size.h
        }));
        if (!pts.length) return;

        drawCtx.save();
        drawCtx.strokeStyle = stroke.color;
        drawCtx.lineCap = "round";
        drawCtx.lineJoin = "round";

        /* use the stroke's own recorded size (from the S/M/L
           picker at creation time), falling back to defaults */
        drawCtx.lineWidth = stroke.size
            || (stroke.tool === "highlight" ? 16 : 3);

        if (stroke.tool === "highlight") {
            drawCtx.globalAlpha = 0.35;
            drawCtx.globalCompositeOperation = "multiply";
            /* "multiply" = the classic highlighter look: ink
               builds up darker where strokes cross text */
        } else {
            drawCtx.globalAlpha = 1;
        }

        if (pts.length === 1) {
            drawCtx.beginPath();
            drawCtx.arc(pts[0].x, pts[0].y,
                        drawCtx.lineWidth / 2, 0, Math.PI * 2);
            drawCtx.fillStyle = stroke.color;
            drawCtx.fill();
        } else {
            /* SMOOTHING: connect each pair of points with a
               quadratic curve through their MIDPOINTS — that's
               how you get fluid ink instead of jagged "Paint"
               polylines. */
            drawCtx.beginPath();
            drawCtx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length - 1; i++) {
                const mx = (pts[i].x + pts[i + 1].x) / 2;
                const my = (pts[i].y + pts[i + 1].y) / 2;
                drawCtx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
            }
            const last = pts[pts.length - 1];
            drawCtx.lineTo(last.x, last.y);
            drawCtx.stroke();
        }
        drawCtx.restore();
    }

    function redrawAll() {
        if (!drawCtx || !drawCanvas) return;
        const size = canvasSize();
        drawCtx.clearRect(0, 0, size.w, size.h);
        for (const s of strokes) paintStroke(s, size);
        if (currentStroke) paintStroke(currentStroke, size);
    }

    const posInCanvas = (event) => {
        const rect = drawCanvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) / rect.width,
            y: (event.clientY - rect.top) / rect.height
        };
    };

    let erasing = false;   // true while a circle-eraser swipe is active

    if (drawCanvas && drawCtx) {
        drawCanvas.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            drawCanvas.setPointerCapture(event.pointerId);

            if (currentTool === "pen" || currentTool === "highlight") {
                currentStroke = {
                    tool: currentTool,
                    color: drawColor,
                    size: TOOL_SIZES[currentTool][sizeLevel],
                    points: [posInCanvas(event)]
                };
            } else if (currentTool === "erase-stroke") {
                /* STROKE ERASER: removes WHOLE strokes at once.
                   Unlike a pixel eraser, it works on the vector
                   data — one clean swipe deletes entire lines. */
                eraseWholeStrokeAt(posInCanvas(event));
            } else if (currentTool === "erase-circle") {
                /* CIRCLE (PIXEL) ERASER: a round tip that SPLITS
                   strokes where it passes, leaving the parts
                   outside the circle untouched — like rubbing a
                   rubber tip across ink. */
                eraseCircleAt(posInCanvas(event));
                erasing = true;
            }
        });

        drawCanvas.addEventListener("pointermove", (event) => {
            if (currentStroke) {
                currentStroke.points.push(posInCanvas(event));
                redrawAll();      // live preview while drawing
                return;
            }
            if (erasing && currentTool === "erase-circle") {
                eraseCircleAt(posInCanvas(event));
            } else if (currentTool === "erase-stroke" && event.buttons) {
                eraseWholeStrokeAt(posInCanvas(event));
            }
        });

        const endStroke = () => {
            if (currentStroke) {
                strokes.push(currentStroke);
                currentStroke = null;
                commitHistory();
                redrawAll();
            }
            if (erasing) {
                erasing = false;
                commitHistory();     // one undo step per erase swipe
                redrawAll();
            }
        };
        drawCanvas.addEventListener("pointerup", endStroke);
        drawCanvas.addEventListener("pointercancel", endStroke);
    }

    /* how close (in canvas fraction) counts as "touching" a
       stroke — roughly: eraser sensitivity */
    const HIT_DISTANCE = 0.03;

    function eraseWholeStrokeAt(point) {
        const before = strokes.length;
        strokes = strokes.filter(stroke =>
            !stroke.points.some(p =>
                Math.hypot(p.x - point.x, p.y - point.y) < HIT_DISTANCE)
        );
        if (strokes.length !== before) redrawAll();
    }

    function eraseCircleAt(point) {
        /* radius in canvas fraction (same idea as HIT_DISTANCE) */
        const radius = (TOOL_SIZES["erase-circle"][sizeLevel] /
                        (drawCanvas.getBoundingClientRect().width || 1)) * 1.6;

        let changed = false;
        const next = [];

        /* keeps only fragments with 2+ points (single points
           would look like stray crumbs after a partial erase) */
        const pushRun = (stroke, points) => {
            if (points.length >= 2) {
                next.push({ ...stroke, points });
            }
        };

        for (const stroke of strokes) {
            /* split the stroke's points into runs OUTSIDE the
               eraser circle; each run becomes a stroke fragment */
            let run = [];
            for (const p of stroke.points) {
                const inside = Math.hypot(p.x - point.x, p.y - point.y) < radius;
                if (inside) {
                    changed = true;
                    pushRun(stroke, run);
                    run = [];
                } else {
                    run.push(p);
                }
            }
            pushRun(stroke, run);
        }

        if (changed) {
            strokes = next;
            redrawAll();
        }
    }

    /* ---- tool buttons + swatches + sizes ---- */
    const toolButtons = {
        pen: document.getElementById("tool-pen"),
        highlight: document.getElementById("tool-highlight"),
        text: document.getElementById("tool-text"),
        censor: document.getElementById("tool-censor"),
        "erase-stroke": document.getElementById("tool-erase-stroke"),
        "erase-circle": document.getElementById("tool-erase-circle")
    };

    function setTool(tool) {
        currentTool = tool;
        for (const [id, btn] of Object.entries(toolButtons)) {
            if (btn) btn.classList.toggle("is-active", id === tool);
        }
        /* the canvas only catches pointer events for ink and
           eraser tools — censor/text clicks fall through to the
           stage listener above */
        stage.classList.toggle("tool-draw",
            tool === "pen" || tool === "highlight" ||
            tool === "erase-stroke" || tool === "erase-circle");
    }

    for (const [id, btn] of Object.entries(toolButtons)) {
        if (btn) btn.addEventListener("click", () => setTool(
            currentTool === id ? null : id));
    }

    /* ---- SIZE PICKER (S / M / L) ----
       The chosen level feeds every tool's size table:
       TOOL_SIZES[tool][sizeLevel]. Buttons show growing dots. */
    const sizePicker = document.getElementById("size-picker");
    if (sizePicker) {
        sizePicker.innerHTML = [0, 1, 2].map(lvl => `
            <button type="button" class="size-btn ${lvl === sizeLevel ? "is-active" : ""}"
                    data-level="${lvl}"
                    aria-label="${["Small", "Medium", "Large"][lvl]} size">
                <span class="size-dot size-dot-${lvl}"></span>
            </button>
        `).join("");
        sizePicker.addEventListener("click", (event) => {
            const btn = event.target.closest(".size-btn");
            if (!btn) return;
            sizeLevel = Number(btn.dataset.level);
            sizePicker.querySelectorAll(".size-btn").forEach(b =>
                b.classList.toggle("is-active", b === btn));
        });
    }

    const swatchBox = document.getElementById("swatches");
    if (swatchBox) {
        swatchBox.innerHTML = DRAW_COLORS.map((color, i) => `
            <button type="button" class="swatch ${i === 0 ? "is-active" : ""}"
                    data-color="${color}" style="--sw:${color}"
                    aria-label="Ink color ${i + 1}"></button>
        `).join("");
        swatchBox.addEventListener("click", (event) => {
            const sw = event.target.closest(".swatch");
            if (!sw) return;
            drawColor = sw.dataset.color;
            swatchBox.querySelectorAll(".swatch").forEach(s =>
                s.classList.toggle("is-active", s === sw));
        });
    }

    const undoBtn = document.getElementById("tool-undo");
    if (undoBtn) undoBtn.addEventListener("click", () => {
        if (histIndex <= 0) return;
        histIndex--;
        applySnapshot(histIndex);   // restores ink AND text
        updateToolButtons();
    });

    const redoBtn = document.getElementById("tool-redo");
    if (redoBtn) redoBtn.addEventListener("click", () => {
        if (histIndex >= history.length - 1) return;
        histIndex++;
        applySnapshot(histIndex);
        updateToolButtons();
    });

    const clearBtn = document.getElementById("tool-clear");
    if (clearBtn) clearBtn.addEventListener("click", () => {
        strokes = [];
        textItems = [];
        currentStroke = null;
        commitHistory();          // clear is undoable too!
        renderTexts();
        redrawAll();
    });

    /* ============ TEXT BOXES (type directly on the board) ============
       Click with the Text tool -> a box appears with a caret.
       Type, Enter/blur commits it. Empty text = discarded.
       Committed boxes can be dragged + deleted, and they join
       the undo/redo history (see snapshots above). */
    const MAX_TEXTS = 30;

    function renderTexts() {
        if (!textLayer) return;
        textLayer.innerHTML = "";
        for (const item of textItems) {
            const el = document.createElement("div");
            el.className = "text-item";
            el.style.left = item.x + "%";
            el.style.top = item.y + "%";
            el.style.color = item.color;

            const span = document.createElement("span");
            span.className = "text-content";
            span.textContent = item.text;
            /* textContent again — never innerHTML for user text */
            el.appendChild(span);

            const del = document.createElement("button");
            del.type = "button";
            del.className = "text-del";
            del.title = "Remove text";
            del.innerHTML = "&times;";
            del.addEventListener("pointerdown", (e) => e.stopPropagation());
            del.addEventListener("click", (e) => {
                e.stopPropagation();
                textItems = textItems.filter(t => t !== item);
                commitHistory();
                renderTexts();
            });
            el.appendChild(del);

            /* drag the committed box around */
            el.addEventListener("pointerdown", (event) => {
                if (event.target.closest(".text-del")) return;
                event.preventDefault();
                event.stopPropagation();
                const stageRect = stage.getBoundingClientRect();
                const startX = event.clientX;
                const startY = event.clientY;
                const startLeft = item.x;
                const startTop = item.y;

                function onMove(moveEvent) {
                    const dx = (moveEvent.clientX - startX) / stageRect.width * 100;
                    const dy = (moveEvent.clientY - startY) / stageRect.height * 100;
                    item.x = Math.max(0, Math.min(92, startLeft + dx));
                    item.y = Math.max(0, Math.min(94, startTop + dy));
                    el.style.left = item.x + "%";
                    el.style.top = item.y + "%";
                }
                function onUp() {
                    window.removeEventListener("pointermove", onMove);
                    window.removeEventListener("pointerup", onUp);
                    commitHistory();   // final position joins the history
                }
                window.addEventListener("pointermove", onMove);
                window.addEventListener("pointerup", onUp);
            });

            textLayer.appendChild(el);
        }
    }

    function addTextBox(clientX, clientY) {
        if (!textLayer || textItems.length >= MAX_TEXTS) return;
        const rect = stage.getBoundingClientRect();
        const x = Math.max(0, Math.min(92,
            ((clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(94,
            ((clientY - rect.top) / rect.height) * 100));

        /* a temporary editing box (not yet in history) */
        const holder = document.createElement("div");
        holder.className = "text-item is-editing";
        holder.style.left = x + "%";
        holder.style.top = y + "%";
        holder.style.color = drawColor;

        const editor = document.createElement("textarea");
        editor.className = "text-editor";
        editor.rows = 1;
        editor.placeholder = "Type…";
        holder.appendChild(editor);
        textLayer.appendChild(holder);
        editor.focus();

        let committed = false;
        const commit = () => {
            if (committed) return;
            committed = true;
            const text = editor.value.replace(/\s+$/g, "").replace(/^\s+/g, "");
            holder.remove();
            if (!text) return;         // empty = never happened
            textItems.push({ x, y, text, color: drawColor });
            commitHistory();
            renderTexts();
        };

        /* textarea grows as you type (no scrollbars) */
        editor.addEventListener("input", () => {
            editor.style.height = "auto";
            editor.style.height = editor.scrollHeight + "px";
        });
        editor.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                editor.blur();          // Enter = done, Shift+Enter = newline
            }
            if (e.key === "Escape") {
                editor.value = "";
                editor.blur();
            }
        });
        editor.addEventListener("blur", commit);
    }

    /* ============ CENSOR BOXES (drag + 8 resize handles) ============
       Each box stores left/top/width/height in PERCENT of the
       stage, so everything survives window resizes.
       8 handles: 4 corners (nw/ne/se/sw) + 4 edges (n/e/s/w).
       Drag the body to move it, drag a handle to stretch it. */
    const HANDLE_DIRS = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
    const MIN_SIZE = 4;   // percent

    function addCensorBox(clientX, clientY) {
        const rect = stage.getBoundingClientRect();
        const w = 16, h = 22;
        const x = ((clientX - rect.left) / rect.width) * 100 - w / 2;
        const y = ((clientY - rect.top) / rect.height) * 100 - h / 2;

        const box = document.createElement("div");
        box.className = "censor-box";
        box.style.left = Math.max(0, Math.min(100 - w, x)) + "%";
        box.style.top = Math.max(0, Math.min(100 - h, y)) + "%";
        box.style.width = w + "%";
        box.style.height = h + "%";
        box.innerHTML =
            HANDLE_DIRS.map(d =>
                `<span class="censor-handle ch-${d}" data-dir="${d}"></span>`
            ).join("") +
            `<button type="button" class="censor-del" title="Remove box">&times;</button>`;

        censorLayer.appendChild(box);
    }

    function dragOrResize(event, box, dir) {
        event.preventDefault();
        event.stopPropagation();
        const stageRect = stage.getBoundingClientRect();
        const startX = event.clientX;
        const startY = event.clientY;
        const start = {
            left: parseFloat(box.style.left),
            top: parseFloat(box.style.top),
            width: parseFloat(box.style.width),
            height: parseFloat(box.style.height)
        };

        function onMove(moveEvent) {
            const dx = (moveEvent.clientX - startX) / stageRect.width * 100;
            const dy = (moveEvent.clientY - startY) / stageRect.height * 100;
            let { left, top, width, height } = start;

            if (!dir) {
                /* moving the whole box */
                left += dx;
                top += dy;
            } else {
                /* stretching from one side / corner */
                if (dir.includes("w")) { left += dx; width -= dx; }
                if (dir.includes("e")) { width += dx; }
                if (dir.includes("n")) { top += dy; height -= dy; }
                if (dir.includes("s")) { height += dy; }

                if (width < MIN_SIZE) {
                    if (dir.includes("w")) left = start.left + start.width - MIN_SIZE;
                    width = MIN_SIZE;
                }
                if (height < MIN_SIZE) {
                    if (dir.includes("n")) top = start.top + start.height - MIN_SIZE;
                    height = MIN_SIZE;
                }
            }

            /* clamp inside the stage */
            width = Math.min(width, 100);
            height = Math.min(height, 100);
            left = Math.max(0, Math.min(100 - width, left));
            top = Math.max(0, Math.min(100 - height, top));

            box.style.left = left + "%";
            box.style.top = top + "%";
            box.style.width = width + "%";
            box.style.height = height + "%";
        }

        function onUp() {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        }

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    }

    if (censorLayer) {
        censorLayer.addEventListener("pointerdown", (event) => {
            /* the small × = delete the box */
            const del = event.target.closest(".censor-del");
            if (del) {
                event.stopPropagation();
                del.closest(".censor-box").remove();
                return;
            }
            const box = event.target.closest(".censor-box");
            if (!box) return;
            const handle = event.target.closest(".censor-handle");
            dragOrResize(event, box, handle ? handle.dataset.dir : null);
        });
    }

    /* a plain stage click with the Censor tool drops a box;
       with the Text tool it opens a fresh text box */
    if (stage) {
        stage.addEventListener("click", (event) => {
            if (!(sharing || boardOn)) return;
            if (event.target.closest(".stage-topbar, .stage-tools, .censor-box, .text-item")) return;
            if (currentTool === "censor") {
                addCensorBox(event.clientX, event.clientY);
            } else if (currentTool === "text") {
                addTextBox(event.clientX, event.clientY);
            }
        });
    }

    /* ---- share / whiteboard toggles ---- */
    function syncToolLayer() {
        stage.classList.toggle("is-sharing", sharing);
        stage.classList.toggle("is-whiteboard", boardOn);
        if (sharing || boardOn) canvasSize();
        redrawAll();
    }

    if (shareBtn) {
        shareBtn.addEventListener("click", () => {
            sharing = !sharing;
            if (sharing) boardOn = false;      // the two surfaces are exclusive
            shareBtn.classList.toggle("is-active", sharing);
            shareBtn.setAttribute("aria-pressed", String(sharing));
            if (boardBtn) boardBtn.classList.toggle("is-active", boardOn);
            syncToolLayer();
        });
    }

    if (boardBtn) {
        boardBtn.addEventListener("click", () => {
            boardOn = !boardOn;
            if (boardOn) sharing = false;
            boardBtn.classList.toggle("is-active", boardOn);
            boardBtn.setAttribute("aria-pressed", String(boardOn));
            if (shareBtn) shareBtn.classList.toggle("is-active", sharing);
            syncToolLayer();
            if (boardOn && !currentTool) setTool("pen");
            /* a fresh whiteboard naturally starts with the pen */
        });
    }

    window.addEventListener("resize", () => {
        if (sharing || boardOn) redrawAll();
    });
    updateToolButtons();

    /* --- pop-out chat: a separate window you can drag to a
           second monitor; it syncs via BroadcastChannel --- */
    const popoutBtn = document.getElementById("popout-chat");
    if (popoutBtn) {
        popoutBtn.addEventListener("click", () => {
            window.open("class-chat.html", "AcademyClassChat",
                        "width=440,height=700");
        });
    }

    /* --- materials drag & drop (client-side list for now;
           real uploads need server storage) --- */
    const dropzone = document.getElementById("dropzone");
    if (dropzone) {
        const fileInput = document.getElementById("file-input");
        const fileList = document.getElementById("file-list");
        const materials = [];

        const fmtSize = bytes => bytes > 1048576
            ? (bytes / 1048576).toFixed(1) + " MB"
            : Math.max(1, Math.round(bytes / 1024)) + " KB";

        const typeTag = name => {
            const ext = name.split(".").pop().toLowerCase();
            if (["pdf"].includes(ext)) return "PDF";
            if (["ppt", "pptx"].includes(ext)) return "PPT";
            if (["doc", "docx"].includes(ext)) return "DOC";
            if (["mp4", "webm", "mov"].includes(ext)) return "VID";
            if (["mp3", "wav", "m4a"].includes(ext)) return "AUD";
            if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "IMG";
            return "FILE";
        };

        const renderFiles = () => {
            fileList.innerHTML = materials.length ? materials.map(f => `
                <div class="file-row">
                    <span class="file-type">${typeTag(f.name)}</span>
                    <span class="file-name">${f.name}</span>
                    <span class="file-size">${fmtSize(f.size)}</span>
                </div>
            `).join("") : `<p class="muted small">Nothing uploaded yet.</p>`;
        };

        const addFiles = (files) => {
            for (const f of files) materials.push(f);  // demo: in-memory
            renderFiles();
        };

        dropzone.addEventListener("click", () => fileInput.click());
        fileInput.addEventListener("change", () => addFiles(fileInput.files));

        ["dragenter", "dragover"].forEach(ev =>
            dropzone.addEventListener(ev, (e) => {
                e.preventDefault();
                dropzone.classList.add("is-drag");
            }));
        ["dragleave", "drop"].forEach(ev =>
            dropzone.addEventListener(ev, (e) => {
                e.preventDefault();
                dropzone.classList.remove("is-drag");
            }));
        dropzone.addEventListener("drop", (e) => addFiles(e.dataTransfer.files));

        renderFiles();
    }
}

/* ============ 8. BOOT ============ */
tickClocks();
renderParticipants();
renderControls();
renderChat();

/* page titles from data (keeps HTML tiny) */
const classTitle = document.getElementById("class-title");
if (classTitle) classTitle.textContent = CLASS_INFO.title;
const classCourse = document.getElementById("class-course");
if (classCourse) classCourse.textContent = CLASS_INFO.course;
const lateNote = document.getElementById("late-note");
if (lateNote) lateNote.textContent =
    `You joined ${CLASS_INFO.youJoinedMinutesLate} min late`;
