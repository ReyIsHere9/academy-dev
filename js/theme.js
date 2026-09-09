/* ============================================================
   THEME ENGINE — light/dark mode for the WHOLE site
   ------------------------------------------------------------
   WHAT IT DOES:
   1. Picks a starting theme BEFORE the page paints:
      - visitor's saved choice (localStorage), or
      - their operating system preference, or
      - light (default)
   2. Puts it on <html data-theme="light|dark"> — ALL styling
      reads that attribute via CSS variables in styles.css.
   3. Wires the sun/moon toggle button (one per page header).

   WHY EVERY FUTURE PAGE IS AUTOMATICALLY DARK-MODE READY:
   Because theme = ONE attribute on <html>, and all colors flow
   through CSS variables, ANY new page that (a) links styles.css
   and (b) includes this script in its <head> gets both themes
   for free. No per-page work ever again.

   LESSON — WHY THIS RUNS IN <head>:
   Scripts at the bottom of the body run AFTER the page painted,
   causing a flash of the wrong theme. Placing theme.js in the
   <head> sets data-theme before the browser draws anything.
   (It's tiny, so it costs almost nothing.)
   ============================================================ */

(function () {
    "use strict";

    /* ============ 1. CHOOSE THE STARTING THEME ============
       localStorage = the browser's tiny permanent storage
       (per website). Saving "theme" there makes the choice
       survive page reloads AND future visits. */

    function currentTheme() {
        const saved = localStorage.getItem("theme");
        if (saved === "light" || saved === "dark") {
            return saved;                       // visitor decided
        }
        /* matchMedia("(prefers-color-scheme: dark)") asks the
           operating system: "does this user like dark mode?"
           .matches = true/false */
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }

    const root = document.documentElement;   // the <html> element
    root.setAttribute("data-theme", currentTheme());

    /* ============ 2. LIVE-FOLLOW THE OS (only if the visitor
               never picked a theme themselves) ============ */
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    systemPrefersDark.addEventListener("change", (event) => {
        if (!localStorage.getItem("theme")) {
            root.setAttribute("data-theme", event.matches ? "dark" : "light");
        }
    });

    /* ============ 3. WIRE THE TOGGLE BUTTON ============
       DOMContentLoaded = fires when the page structure is
       ready — safe moment to grab the header button.
       (theme.js itself runs early, so the button may not
       exist yet at load time.) */

    document.addEventListener("DOMContentLoaded", () => {
        const toggle = document.getElementById("theme-toggle");
        if (!toggle) return;    // pages without a button: ignore

        function applyToButton() {
            const isDark = root.getAttribute("data-theme") === "dark";
            /* aria-pressed announces the state to screen readers;
               aria-label changes so the button always says what
               the NEXT click will do */
            toggle.setAttribute("aria-pressed", String(isDark));
            toggle.setAttribute("aria-label", isDark
                ? "Switch to light mode"
                : "Switch to dark mode");
        }

        toggle.addEventListener("click", () => {
            const isDark = root.getAttribute("data-theme") === "dark";
            const next = isDark ? "light" : "dark";
            root.setAttribute("data-theme", next);
            localStorage.setItem("theme", next);   // remember it
            applyToButton();
        });

        applyToButton();
    });
})();
