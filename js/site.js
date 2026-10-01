/* ============================================================
   SITE OVERRIDES — admin edits, painted onto the public pages
   ------------------------------------------------------------
   The ADMIN CONSOLE (dashboard-admin.html) can change the site's
   text and photos. Those edits live in the demo store
   (js/space-data.js -> localStorage); this helper reads them and
   paints the matching spots:

     [data-site="key"]     -> text from settings (contact info…)
     #site-banner          -> home announcement banner
     #site-teacher-photo   -> about.html photo slot
     #site-contact-map     -> contact.html map slot
     #site-hero            -> index.html hero background photo
     .logo                 -> optional image brand mark

   Pages without the store, or without the slots, are untouched —
   the site simply looks like the original design.
   ============================================================ */

function siteStore() {
    try {
        return JSON.parse(localStorage.getItem("academySpaceDB"));
    } catch {
        return null;
    }
}

/* FALLBACK SETTINGS — used on the VERY FIRST visit, before the demo
   store exists in this browser (nothing seeds it on public pages).
   The moment a store exists, admin console edits override these.
   Keep in sync with the seed in js/space-data.js. */
const SITE_FALLBACK_SETTINGS = {
    siteName: "The English Academy",
    tagline: "Learn English with live teachers and small classes.",
    contactEmail: "hello@example-academy.com",
    contactPhone: "+1 (555) 010-3456",
    whatsapp: "+1 (555) 010-3456",
    address: "123 Grammar Lane, Englishville, EV 45000",
    homeBanner: ""
};

document.addEventListener("DOMContentLoaded", () => {
    /* ---- accessibility: make the skip link work ----
       Pages don't hand-write id="main-content" on their first
       section, so we add it here — one line instead of 20 edits. */
    const firstSection = document.querySelector("section");
    if (firstSection && !firstSection.id) {
        firstSection.id = "main-content";
    }

    /* ---- cookie notice (once per browser, demo-level) ---- */
    try {
        if (!localStorage.getItem("academyCookiesOk")) {
            const bar = document.createElement("div");
            bar.className = "cookie-bar";
            bar.innerHTML = `
                <p>This demo keeps everything in your own browser —
                   no tracking, no cookies from us.
                   <a href="privacy.html">Read the privacy page</a>.</p>
                <button type="button" class="btn btn-ghost btn-small">Got it</button>`;
            bar.querySelector("button").addEventListener("click", () => {
                localStorage.setItem("academyCookiesOk", "1");
                bar.remove();
            });
            document.body.appendChild(bar);
        }
    } catch { /* storage blocked: skip the notice */ }

    /* ---- newsletter signup (footer form on every page) ----
       Structural demo: emails land in their own localStorage list
       (academyNewsletter) that the admin console can read.
       This runs even before/without the demo store. */
    document.querySelectorAll(".newsletter-form").forEach(formEl => {
        formEl.addEventListener("submit", (event) => {
            event.preventDefault();
            const input = formEl.querySelector("input[type=email]");
            const email = input ? input.value.trim() : "";
            if (!email || !email.includes("@")) {
                if (typeof spaceToast === "function") {
                    spaceToast("That email doesn't look right", "bad");
                }
                return;
            }
            let list = [];
            try {
                list = JSON.parse(localStorage.getItem("academyNewsletter")) || [];
            } catch { /* fresh list */ }
            if (!list.some(x => x.email.toLowerCase() === email.toLowerCase())) {
                list.unshift({ email, minutesAgo: 0 });
                try {
                    localStorage.setItem("academyNewsletter", JSON.stringify(list));
                } catch { /* storage blocked */ }
            }
            if (input) input.value = "";
            const btn = formEl.querySelector("button");
            if (btn) {
                btn.textContent = "Subscribed ✓";
                setTimeout(() => { btn.textContent = "Subscribe"; }, 2200);
            }
        });
    });

    const db = siteStore();

    /* settings + media work with or without a store: fallbacks
       first, stored admin edits on top */
    const settings = Object.assign({}, SITE_FALLBACK_SETTINGS,
        (db && db.settings) || {});
    const media = (db && db.media) || {};

    /* ---- floating WhatsApp button (public pages only) ----
       The standard academy furniture: one tap to chat. Skipped on
       the account spaces and class rooms — it's a visitor thing. */
    const isAppPage = document.body.classList.contains("role-student") ||
        document.body.classList.contains("role-teacher") ||
        document.body.classList.contains("role-admin") ||
        document.body.classList.contains("popup-mode");
    if (!isAppPage && settings.whatsapp) {
        const digits = String(settings.whatsapp).replace(/\D/g, "");
        if (digits) {
            const wa = document.createElement("a");
            wa.className = "wa-float";
            wa.href = "https://wa.me/" + digits;
            wa.target = "_blank";
            wa.rel = "noopener noreferrer";
            wa.title = "Chat with us on WhatsApp";
            wa.setAttribute("aria-label", "Chat on WhatsApp");
            wa.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`;
            document.body.appendChild(wa);
        }
    }

    /* text slots: <p class="info-value" data-site="contactEmail"> */
    document.querySelectorAll("[data-site]").forEach(el => {
        const value = settings[el.dataset.site];
        if (value) el.textContent = value;
    });

    /* home announcement banner (hidden until the admin writes one) */
    const banner = document.getElementById("site-banner");
    if (banner && settings.homeBanner) {
        banner.hidden = false;
        const text = document.getElementById("site-banner-text");
        if (text) text.textContent = settings.homeBanner;
    }

    /* photo slots */
    const photo = document.getElementById("site-teacher-photo");
    if (photo && media.teacherPhoto) {
        photo.innerHTML =
            `<img class="site-photo" src="${media.teacherPhoto}" alt="Teacher photo">`;
    }

    const map = document.getElementById("site-contact-map");
    if (map && media.contactMap) {
        map.innerHTML =
            `<img class="site-map-photo" src="${media.contactMap}" alt="Map">`;
    }

    const hero = document.getElementById("site-hero");
    if (hero && media.heroImage) {
        /* darken the photo a little so the white hero text stays readable */
        hero.style.backgroundImage =
            `linear-gradient(rgba(15, 23, 42, 0.55), rgba(15, 23, 42, 0.55)),` +
            ` url("${media.heroImage}")`;
        hero.style.backgroundSize = "cover";
        hero.style.backgroundPosition = "center";
    }

    /* brand mark: an uploaded logo replaces the text logo everywhere */
    if (media.logoImage) {
        document.querySelectorAll(".logo").forEach(logo => {
            logo.innerHTML = `<img class="logo-img" src="${media.logoImage}" alt="Home">`;
        });
    }
});
