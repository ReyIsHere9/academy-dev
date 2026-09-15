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

    const db = siteStore();
    if (!db) return;

    const settings = db.settings || {};
    const media = db.media || {};

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
