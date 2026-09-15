/* ============================================================
   CATALOG SOURCE — one question: "which course data do I use?"
   ------------------------------------------------------------
   The original catalog lives in js/levels-data.js (static file).
   The ADMIN CONSOLE can edit the catalog; those edits are saved
   in the demo store (js/space-data.js -> localStorage).

   academyCatalog() answers with the EDITED copy when it exists,
   otherwise the original file — so:
     - before any admin edit: the site reads levels-data.js
     - after an edit: the site reads the store (overrides win)
     - "Reset to original" in the admin console just deletes the
       override, and the static file is the truth again.

   courses.html and course.html call this instead of touching
   LEVELS directly.
   ============================================================ */

function academyCatalog() {
    try {
        const db = JSON.parse(localStorage.getItem("academySpaceDB"));
        if (db && Array.isArray(db.catalog) && db.catalog.length) {
            return db.catalog;
        }
    } catch { /* no store or bad JSON — fall through to LEVELS */ }
    return typeof LEVELS !== "undefined" ? LEVELS : [];
}
