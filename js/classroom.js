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
    const found = BADGES.find(b => b.id === badge.id);
    if (!found) return "";
    return `<span class="badge-pill" style="--badge-color:${badge.color}">
        &#9733; ${found.label}</span>`;
}

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
        list.innerHTML = participants.map(p => `
            <div class="person-row" data-person="${p.id}">
                <span class="msg-avatar" style="background:${p.color}">${initialOf(p.name)}</span>
                <div class="person-info">
                    <div class="person-name">
                        ${p.name}${p.id === YOU_ID ? " (you)" : ""}
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
                    <select class="mini-select" data-action="badge"
                            title="Give a badge">
                        <option value="none">No badge</option>
                        ${BADGES.map(b =>
                            `<option value="${b.id}" ${p.badge && p.badge.id === b.id ? "selected" : ""}>${b.label}</option>`
                        ).join("")}
                    </select>
                    <input type="color" class="color-input" data-action="color"
                           value="${p.badge ? p.badge.color : "#3b82f6"}"
                           title="Badge color">
                </div>` : ""}
            </div>
        `).join("");
    }
}

/* teacher-only: react to role / badge / color changes */
const peopleList = document.getElementById("people-list");
if (peopleList && IS_TEACHER && !IS_POPUP) {
    peopleList.addEventListener("change", (event) => {
        const row = event.target.closest("[data-person]");
        if (!row) return;
        const person = participants.find(p => p.id === row.dataset.person);
        if (!person) return;

        if (event.target.dataset.action === "role") {
            person.role = event.target.value;
        }
        if (event.target.dataset.action === "badge") {
            const chosen = event.target.value;
            if (chosen === "none") {
                person.badge = null;
            } else {
                const colorInput = row.querySelector('[data-action="color"]');
                person.badge = { id: chosen, color: colorInput.value };
            }
        }
        if (event.target.dataset.action === "color" && person.badge) {
            person.badge.color = event.target.value;
        }
        renderParticipants();
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

    /* --- screen share (demo surface) + censor boxes.
           ⚠️ In the real app, hiding parts of a real screen share
           means compositing the captured video through a canvas
           BEFORE sending it on. You can't black out pixels on a
           stream that already left the machine. --- */
    const stage = document.getElementById("stage");
    const shareBtn = document.getElementById("share-btn");
    let sharing = false;

    if (stage && shareBtn) {
        shareBtn.addEventListener("click", () => {
            sharing = !sharing;
            stage.classList.toggle("is-sharing", sharing);
            shareBtn.classList.toggle("is-active", sharing);
            shareBtn.setAttribute("aria-pressed", String(sharing));
        });

        stage.addEventListener("click", (event) => {
            if (!sharing) return;
            if (event.target.closest(".stage-topbar")) return;

            /* click a box -> remove it (un-censor) */
            const box = event.target.closest(".censor-box");
            if (box) { box.remove(); return; }

            /* click the shared screen -> drop a censor box */
            const rect = stage.getBoundingClientRect();
            const w = 16, h = 22;   // box size in %
            const x = ((event.clientX - rect.left) / rect.width) * 100 - w / 2;
            const y = ((event.clientY - rect.top) / rect.height) * 100 - h / 2;

            const div = document.createElement("div");
            div.className = "censor-box";
            div.title = "Click to remove this censor box";
            div.style.left = Math.max(0, Math.min(100 - w, x)) + "%";
            div.style.top = Math.max(0, Math.min(100 - h, y)) + "%";
            div.style.width = w + "%";
            div.style.height = h + "%";
            document.getElementById("censor-layer").appendChild(div);
        });
    }

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
