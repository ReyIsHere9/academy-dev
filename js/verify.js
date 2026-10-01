/* ============================================================
   CERTIFICATE VERIFICATION ENGINE — fills verify.html
   ------------------------------------------------------------
   ?serial=EA-A2-WR-2003 (or type one in).
   Looks the serial up in the demo store's issued certificates:
     valid   -> student name, course, issue date, serial
     unknown -> honest "not found" (with the demo-vs-real note)
   ⚠️ structural demo: verification runs against THIS browser's
   store. The live build queries the server, so any device can
   verify any real certificate — that's the whole point of a
   verification page.
   ============================================================ */

const verifyRoot = document.getElementById("verify-root");

if (verifyRoot) {
    const params = new URLSearchParams(location.search);
    let serial = (params.get("serial") || "").trim().toUpperCase();
    const db = spaceLoad();

    function findCertificate(sn) {
        const entries = Object.entries(db.certificates || {});
        for (const [key, cert] of entries) {
            if (String(cert.serial || "").toUpperCase() === sn) {
                const [studentId, levelId, skillName] = key.split("|");
                return { cert, studentId, levelId, skillName };
            }
        }
        return null;
    }

    function renderResult() {
        const box = document.getElementById("verify-result");
        if (!box) return;
        if (!serial) { box.innerHTML = ""; return; }

        const found = findCertificate(serial);
        if (found) {
            const person = spaceProfile(db, found.studentId);
            const issued = new Date(Date.now() - found.cert.issuedMinutesAgo * 60000)
                .toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" });
            box.innerHTML = `
            <div class="verify-result is-valid">
                <span class="success-check">&#10003;</span>
                <div>
                    <p class="space-next-course">Valid certificate</p>
                    <p class="verify-line"><strong>${spaceEsc(person.name)}</strong>
                       completed all units of
                       <strong>${spaceEsc(found.levelId)} ${spaceEsc(found.skillName)}</strong></p>
                    <p class="verify-line muted">Issued ${issued} &middot;
                       Serial ${spaceEsc(found.cert.serial)} &middot;
                       The English Academy</p>
                </div>
            </div>`;
        } else {
            box.innerHTML = `
            <div class="verify-result is-invalid">
                <span class="verify-x">&times;</span>
                <div>
                    <p class="space-next-course">No certificate found</p>
                    <p class="verify-line muted">Serial “${spaceEsc(serial)}” isn't in this
                       demo store. In the live build, verification queries the
                       academy's server — any device could check any certificate.
                       Try the demo one: <code>EA-A2-WR-2003</code>.</p>
                </div>
            </div>`;
        }
    }

    verifyRoot.innerHTML = `
    <div class="card verify-card">
        <h2>Certificate lookup</h2>
        <p class="muted">Serials look like <code>EA-A2-WR-2003</code>.</p>
        <form class="join-row" id="verify-form">
            <input type="text" class="chat-input" id="verify-serial"
                   placeholder="EA-…" value="${spaceEsc(serial)}"
                   autocomplete="off">
            <button type="submit" class="btn btn-primary">Verify</button>
        </form>
        <div id="verify-result"></div>
    </div>`;

    const form = document.getElementById("verify-form");
    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const input = document.getElementById("verify-serial");
            serial = input ? input.value.trim().toUpperCase() : "";
            if (input) input.value = serial;
            renderResult();
        });
    }

    /* arriving via a certificate's "Verify" link: show the answer
       immediately */
    if (serial) renderResult();
}
