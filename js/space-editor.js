/* ============================================================
   RICH TEXT EDITOR — shared by the inbox composer and the admin
   broadcast box.
   ------------------------------------------------------------
   WHY THIS FILE EXISTS: teachers (and admins) write things that
   are documents, not chat lines — announcements, instructions,
   feedback with bullets, tables of dates… This is the "Word-lite"
   toolbar for those moments.

   HOW: a contenteditable surface + document.execCommand.
   execCommand is officially deprecated — but it is universally
   supported, needs ZERO dependencies and no build step, which is
   exactly right for this project. A real product would adopt a
   maintained editor library; the API below is shaped so swapping
   one in later touches only THIS file.

   ⚠️ SECURITY — READ THIS BEFORE TRUSTING ANY HTML:
   Everything the user types becomes HTML, and HTML from one
   browser is rendered in another (BroadcastChannel, exports,
   future server). Rendering raw HTML is how XSS worms happen.
   So: NOTHING is ever rendered without passing through
   spaceSanitizeHtml() first — a whitelist cleaner that strips
   scripts, event handlers and dangerous styles. The server
   must repeat this in a real build (client-side cleaning is
   UX, never security — house rule).
   ============================================================ */

/* ---------- 1. THE SANITIZER ----------
   Whitelist of tags we allow through. Anything else is either
   unwrapped (kept as text) or deleted entirely. */
const RICH_DELETE_TAGS = ["script", "style", "iframe", "object", "embed",
                          "form", "input", "button", "textarea", "link", "meta"];
const RICH_KEEP_TAGS = ["p", "div", "br", "b", "strong", "i", "em", "u", "s",
                        "strike", "span", "mark", "sub", "sup", "small",
                        "h1", "h2", "h3", "ul", "ol", "li",
                        "blockquote", "code", "pre", "hr",
                        "table", "thead", "tbody", "tr", "th", "td",
                        "a", "img"];

/* only these CSS properties survive (no url(), no position, no
   behavior — nothing that can break out of its box or track) */
const RICH_SAFE_STYLES = ["color", "background-color", "font-size",
                          "font-weight", "font-style", "text-decoration",
                          "text-align"];

function spaceSanitizeHtml(html) {
    /* Node/test fallback: no DOM parser available -> escape it all.
       Safe by default; line breaks survive via <br>. */
    if (typeof DOMParser === "undefined") {
        return String(html == null ? "" : html)
            .replace(/[&<>"']/g, c => ({
                "&": "&amp;", "<": "&lt;", ">": "&gt;",
                '"': "&quot;", "'": "&#39;"
            }[c]))
            .replace(/\r?\n/g, "<br>");
    }

    const doc = new DOMParser().parseFromString(
        "<body>" + String(html == null ? "" : html) + "</body>", "text/html");
    const body = doc.body;

    /* walk a snapshot: removing nodes while walking is chaotic */
    const all = Array.from(body.querySelectorAll("*"));
    for (const el of all) {
        const tag = el.tagName.toLowerCase();

        if (RICH_DELETE_TAGS.includes(tag)) {
            el.remove();
            continue;
        }

        if (!RICH_KEEP_TAGS.includes(tag)) {
            /* keep the CONTENT of unknown wrappers, drop the tag */
            while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
            el.remove();
            continue;
        }

        /* filter every attribute */
        for (const attr of Array.from(el.attributes)) {
            const name = attr.name.toLowerCase();
            const value = attr.value;

            /* never allow event handlers or data-* */
            if (name.startsWith("on") || name.startsWith("data-")) {
                el.removeAttribute(attr.name);
                continue;
            }

            if (name === "style") {
                const kept = value.split(";").map(part => {
                    const [prop, ...rest] = part.split(":");
                    const propName = (prop || "").trim().toLowerCase();
                    const propValue = rest.join(":").trim();
                    if (!RICH_SAFE_STYLES.includes(propName)) return "";
                    if (/url\s*\(|expression|javascript:/i.test(propValue)) return "";
                    return propName + ": " + propValue;
                }).filter(Boolean).join("; ");
                if (kept) el.setAttribute("style", kept);
                else el.removeAttribute("style");
                continue;
            }

            if (name === "href" || name === "src") {
                const ok = /^(https?:|mailto:|#)/i.test(value) ||
                           (name === "src" && /^data:image\//i.test(value));
                if (!ok) el.removeAttribute(attr.name);
                continue;
            }

            /* the only other attributes allowed, per tag */
            const allowed = {
                a: ["target", "rel", "title"],
                img: ["alt", "title", "width", "height"],
                td: ["colspan", "rowspan"],
                th: ["colspan", "rowspan"],
                table: ["border"]
            }[tag] || [];
            if (!allowed.includes(name)) el.removeAttribute(attr.name);
        }

        /* links open safely, if they open at all */
        if (tag === "a" && el.getAttribute("href")) {
            el.setAttribute("target", "_blank");
            el.setAttribute("rel", "noopener noreferrer");
        }
        /* images live inside the box */
        if (tag === "img") {
            el.style.maxWidth = "100%";
            el.style.height = "auto";
        }
    }

    return body.innerHTML;
}

/* cheap plain-text version of some HTML — used for list previews
   and message notification snippets */
function spaceHtmlToText(html) {
    return String(html == null ? "" : html)
        .replace(/<(br|\/p|\/div|\/li|\/tr)>/gi, " ")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();
}

/* ---------- 2. ICONS (compact 17px strokes, same style as the
   rest of the site) ---------- */
const RICH_ICONS = {
    bold:      `<b style="font-size:14px">B</b>`,
    italic:    `<i style="font-size:14px">I</i>`,
    underline: `<u style="font-size:14px">U</u>`,
    strike:    `<s style="font-size:14px">S</s>`,
    color:     `<span style="font-size:13px">A</span><span style="display:block;height:3px;width:12px;border-radius:2px;background:currentColor"></span>`,
    highlight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11-6 6v3h9l3-3"></path><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"></path></svg>`,
    ul:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><circle cx="3.5" cy="6" r="1" fill="currentColor"></circle><circle cx="3.5" cy="12" r="1" fill="currentColor"></circle><circle cx="3.5" cy="18" r="1" fill="currentColor"></circle></svg>`,
    ol:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><text x="2" y="8" font-size="7" fill="currentColor" stroke="none">1</text><text x="2" y="14" font-size="7" fill="currentColor" stroke="none">2</text><text x="2" y="20" font-size="7" fill="currentColor" stroke="none">3</text></svg>`,
    outdent:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 8 3 12 7 16"></polyline><line x1="21" y1="12" x2="11" y2="12"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>`,
    indent:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 8 7 12 3 16"></polyline><line x1="21" y1="12" x2="11" y2="12"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>`,
    alignLeft:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="14" y2="12"></line><line x1="3" y1="18" x2="18" y2="18"></line></svg>`,
    alignCenter:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="5" y1="18" x2="19" y2="18"></line></svg>`,
    alignRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="6" y1="18" x2="21" y2="18"></line></svg>`,
    quote:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h3"></path><path d="M14 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h3"></path></svg>`,
    link:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
    clear:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"></path><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line><line x1="17" y1="17" x2="22" y2="22"></line><line x1="22" y1="17" x2="17" y2="22"></line></svg>`,
    table:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="12" y1="3" x2="12" y2="21"></line></svg>`,
    attach:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>`,
    undo:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>`,
    redo:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 14 20 9 15 4"></polyline><path d="M4 20v-7a4 4 0 0 1 4-4h12"></path></svg>`
};

/* palettes for the color + highlight popovers */
const RICH_TEXT_COLORS = ["#1e293b", "#64748b", "#dc2626", "#ea580c",
                          "#ca8a04", "#16a34a", "#2563eb", "#7c3aed"];
const RICH_HIGHLIGHTS = ["#fef08a", "#fde68a", "#bbf7d0", "#bfdbfe",
                         "#e9d5ff", "#fecaca", "#e2e8f0"];

/* ---------- 3. THE EDITOR ----------
   createRichEditor(host, options?) builds toolbar + surface inside
   `host` and returns a small API. Only ONE instance per host.

   options = {
     placeholder: "Write the announcement…",
     minHeight:   140          (px)
   }
*/
function createRichEditor(host, options) {
    if (!host) return null;
    options = options || {};

    host.classList.add("rich-editor-host");
    host.innerHTML = `
    <div class="rich-toolbar" role="toolbar" aria-label="Formatting">
        <button type="button" class="rich-btn" data-cmd="undo" title="Undo">${RICH_ICONS.undo}</button>
        <button type="button" class="rich-btn" data-cmd="redo" title="Redo">${RICH_ICONS.redo}</button>
        <span class="rich-sep"></span>
        <button type="button" class="rich-btn" data-cmd="bold" title="Bold">${RICH_ICONS.bold}</button>
        <button type="button" class="rich-btn" data-cmd="italic" title="Italic">${RICH_ICONS.italic}</button>
        <button type="button" class="rich-btn" data-cmd="underline" title="Underline">${RICH_ICONS.underline}</button>
        <button type="button" class="rich-btn" data-cmd="strikeThrough" title="Strikethrough">${RICH_ICONS.strike}</button>
        <select class="rich-size" title="Text size">
            <option value="">Size</option>
            <option value="2">Small</option>
            <option value="3">Normal</option>
            <option value="5">Large</option>
            <option value="7">Huge</option>
        </select>
        <button type="button" class="rich-btn" data-pop="color" title="Text color">${RICH_ICONS.color}</button>
        <button type="button" class="rich-btn" data-pop="highlight" title="Highlight">${RICH_ICONS.highlight}</button>
        <span class="rich-sep"></span>
        <button type="button" class="rich-btn" data-cmd="insertUnorderedList" title="Bullet list">${RICH_ICONS.ul}</button>
        <button type="button" class="rich-btn" data-cmd="insertOrderedList" title="Numbered list">${RICH_ICONS.ol}</button>
        <button type="button" class="rich-btn" data-cmd="outdent" title="Decrease indent">${RICH_ICONS.outdent}</button>
        <button type="button" class="rich-btn" data-cmd="indent" title="Increase indent">${RICH_ICONS.indent}</button>
        <span class="rich-sep"></span>
        <button type="button" class="rich-btn" data-cmd="justifyLeft" title="Align left">${RICH_ICONS.alignLeft}</button>
        <button type="button" class="rich-btn" data-cmd="justifyCenter" title="Align center">${RICH_ICONS.alignCenter}</button>
        <button type="button" class="rich-btn" data-cmd="justifyRight" title="Align right">${RICH_ICONS.alignRight}</button>
        <button type="button" class="rich-btn" data-cmd="formatBlock" data-value="blockquote" title="Quote">${RICH_ICONS.quote}</button>
        <button type="button" class="rich-btn" data-cmd="createLink" title="Insert link">${RICH_ICONS.link}</button>
        <span class="rich-sep"></span>
        <button type="button" class="rich-btn" data-pop="table" title="Insert table">${RICH_ICONS.table}</button>
        <button type="button" class="rich-btn" data-attach="1" title="Attach a file">${RICH_ICONS.attach}</button>
        <button type="button" class="rich-btn" data-cmd="removeFormat" title="Clear formatting">${RICH_ICONS.clear}</button>

        <!-- popovers (positioned under their button) -->
        <div class="rich-popover" data-pop-panel="color" hidden>
            <p class="rich-pop-title">Text color</p>
            <div class="rich-swatches">
                ${RICH_TEXT_COLORS.map(c =>
                    `<button type="button" class="rich-swatch" data-rich-color="${c}" style="--sw:${c}" title="${c}"></button>`).join("")}
            </div>
            <button type="button" class="rich-pop-reset" data-rich-reset="color">Reset color</button>
        </div>

        <div class="rich-popover" data-pop-panel="highlight" hidden>
            <p class="rich-pop-title">Highlight</p>
            <div class="rich-swatches">
                ${RICH_HIGHLIGHTS.map(c =>
                    `<button type="button" class="rich-swatch" data-rich-mark="${c}" style="--sw:${c}" title="${c}"></button>`).join("")}
            </div>
            <button type="button" class="rich-pop-reset" data-rich-reset="highlight">No highlight</button>
        </div>

        <div class="rich-popover rich-table-pop" data-pop-panel="table" hidden>
            <p class="rich-pop-title">Insert table</p>
            <div class="rich-grid" id="rich-grid-${Math.random().toString(36).slice(2, 7)}"></div>
        </div>
    </div>

    <div class="rich-surface" contenteditable="true"
         data-placeholder="${String(options.placeholder || "Write here…").replace(/"/g, "&quot;")}"
         style="min-height:${Number(options.minHeight) || 140}px"></div>

    <div class="rich-attachments" hidden></div>
    <input type="file" class="rich-file" multiple hidden>`;

    const surface = host.querySelector(".rich-surface");
    const toolbar = host.querySelector(".rich-toolbar");
    const fileInput = host.querySelector(".rich-file");
    const attachBox = host.querySelector(".rich-attachments");
    const gridBox = host.querySelector(".rich-grid");
    const attachments = [];

    /* ---- command helper: keep focus + scroll stable ---- */
    function cmd(name, value) {
        if (typeof document.execCommand !== "function") return;
        surface.focus();
        document.execCommand(name, false, value || null);
    }

    /* ---- toolbar clicks ---- */
    toolbar.addEventListener("click", (event) => {
        const btn = event.target.closest("button");
        if (!btn) return;

        /* popover openers */
        const pop = btn.dataset.pop;
        if (pop) {
            const panel = host.querySelector(`[data-pop-panel="${pop}"]`);
            const wasHidden = panel.hidden;
            closePopovers();
            panel.hidden = !wasHidden;
            return;
        }
        /* palette picks */
        if (btn.dataset.richColor) {
            cmd("foreColor", btn.dataset.richColor);
            closePopovers();
            return;
        }
        if (btn.dataset.richMark) {
            cmd("hiliteColor", btn.dataset.richMark);
            closePopovers();
            return;
        }
        if (btn.dataset.richReset === "color") {
            cmd("foreColor", "#1e293b");
            closePopovers();
            return;
        }
        if (btn.dataset.richReset === "highlight") {
            cmd("hiliteColor", "transparent");
            closePopovers();
            return;
        }
        /* attachments */
        if (btn.dataset.attach) {
            fileInput.click();
            return;
        }
        /* normal commands */
        if (btn.dataset.cmd === "createLink") {
            const url = window.prompt("Link address (https://…)");
            if (url) cmd("createLink", url);
            return;
        }
        if (btn.dataset.cmd) {
            cmd(btn.dataset.cmd, btn.dataset.value);
        }
    });

    /* size dropdown */
    const sizeSelect = host.querySelector(".rich-size");
    sizeSelect.addEventListener("change", () => {
        if (!sizeSelect.value) return;
        cmd("fontSize", sizeSelect.value);
        sizeSelect.value = "";
    });

    /* ---- popover outside-click / Esc ---- */
    function closePopovers() {
        host.querySelectorAll(".rich-popover").forEach(p => { p.hidden = true; });
    }
    document.addEventListener("click", (event) => {
        if (!host.contains(event.target)) closePopovers();
    });
    host.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closePopovers();
    });

    /* ---- table picker: a 4x4 hover grid, like the grown-ups ---- */
    if (gridBox) {
        gridBox.innerHTML = Array.from({ length: 16 }, (_, i) =>
            `<button type="button" class="rich-grid-cell"></button>`).join("");
        gridBox.addEventListener("mouseover", (event) => {
            const cells = Array.from(gridBox.querySelectorAll(".rich-grid-cell"));
            const index = cells.indexOf(event.target);
            if (index < 0) return;
            const r = Math.floor(index / 4);
            const c = index % 4;
            cells.forEach((cell, i) => {
                const cr = Math.floor(i / 4);
                const cc = i % 4;
                cell.classList.toggle("is-on", cr <= r && cc <= c);
            });
        });
        gridBox.addEventListener("mouseleave", () => {
            gridBox.querySelectorAll(".rich-grid-cell")
                .forEach(c => c.classList.remove("is-on"));
        });
        gridBox.addEventListener("click", (event) => {
            const cells = Array.from(gridBox.querySelectorAll(".rich-grid-cell"));
            const index = cells.indexOf(event.target);
            if (index < 0) return;
            const rows = Math.floor(index / 4) + 1;
            const cols = index % 4 + 1;

            let table = '<table class="rich-table"><tbody>';
            for (let r = 0; r < rows; r++) {
                table += "<tr>";
                for (let c = 0; c < cols; c++) {
                    table += r === 0
                        ? "<th><br></th>"
                        : "<td><br></td>";
                }
                table += "</tr>";
            }
            table += "</tbody></table><p><br></p>";
            cmd("insertHTML", table);
            closePopovers();
        });
    }

    /* ---- attachments: images go inline, files become chips ----
       ⚠️ demo: the clipboard of a message stores metadata only;
       real uploads arrive with the server. Small images embed as
       data URLs so they survive a reload in the demo store. */
    fileInput.addEventListener("change", () => {
        for (const file of fileInput.files) {
            const kb = Math.max(1, Math.round(file.size / 1024));
            if (file.type.startsWith("image/") && file.size <= 250 * 1024 &&
                typeof FileReader !== "undefined") {
                const reader = new FileReader();
                reader.onload = () => cmd("insertImage", reader.result);
                reader.readAsDataURL(file);
            } else {
                attachments.push({ name: file.name, sizeKB: kb });
                renderAttachments();
                if (file.size > 250 * 1024) {
                    spaceToast("Big file — kept as a demo chip, not embedded", "bad");
                }
            }
        }
        fileInput.value = "";
    });

    function renderAttachments() {
        attachBox.hidden = attachments.length === 0;
        attachBox.innerHTML = attachments.map((a, i) => `
            <span class="attach-chip">
                &#128206; ${spaceEsc(a.name)}
                <span class="attach-size">${a.sizeKB} KB</span>
                <button type="button" data-att-remove="${i}" title="Remove">&times;</button>
            </span>`).join("");
    }
    attachBox.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-att-remove]");
        if (!btn) return;
        attachments.splice(Number(btn.dataset.attRemove), 1);
        renderAttachments();
    });

    /* ---- the public API (same shape a real editor would give) ---- */
    const api = {
        getHTML: () => surface.innerHTML,
        setHTML: (html) => { surface.innerHTML = html || ""; },
        getText: () => spaceHtmlToText(surface.innerHTML),
        getAttachments: () => attachments.slice(),
        isEmpty: () => !spaceHtmlToText(surface.innerHTML) && attachments.length === 0,
        clear: () => {
            surface.innerHTML = "";
            attachments.length = 0;
            renderAttachments();
        },
        focus: () => surface.focus()
    };
    host._richEditor = api;
    return api;
}
