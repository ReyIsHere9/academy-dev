/* ============================================================
   CERTIFICATE ENGINE — fills certificate.html
   ------------------------------------------------------------
   ?level=B1&skill=Speaking

   THE RULES (all real logic):
     1. You must be logged in as a student.
     2. Every unit of that course must be marked complete in the
        lesson player (db.completedLessons).
     3. The first view stores the issue date + serial in
        db.certificates, so the certificate never "reprints"
        with a new date.
   NOT complete? The page becomes a progress card with a link
   straight to the next unfinished unit.
   ============================================================ */

const certRoot = document.getElementById("certificate-root");

if (certRoot) {
    const params = new URLSearchParams(location.search);
    const levelId = params.get("level");
    const skillName = params.get("skill");

    const CATALOG = academyCatalog();
    const level = CATALOG.find(l => l.id === levelId);
    const skill = level ? level.skills.find(s => s.name === skillName) : undefined;

    const me = typeof sessionRead === "function" ? sessionRead() : null;

    function shell(html) {
        certRoot.innerHTML = `<div class="card not-found-card">${html}</div>`;
    }

    if (!level || !skill) {
        shell(`
            <h2>Certificate not found</h2>
            <p>That course link doesn't match the catalog.</p>
            <a class="btn btn-primary" href="courses.html">Browse courses</a>`);
    } else if (!me || me.role !== "student") {
        shell(`
            <h2>Log in to see your certificate</h2>
            <p>Certificates belong to the student who earned them.</p>
            <a class="btn btn-primary" href="login.html">Log in</a>`);
    } else {
        const db = spaceLoad();
        const done = (db.completedLessons && db.completedLessons[me.id]) || [];
        const keyOf = i => level.id + "|" + skill.name + "|" + i;
        const doneCount = skill.units.filter((u, i) => done.includes(keyOf(i))).length;
        const total = skill.units.length;

        if (doneCount < total) {
            const nextIndex = skill.units.findIndex((u, i) => !done.includes(keyOf(i)));
            shell(`
                <h2>Almost there — ${doneCount}/${total} units</h2>
                <p>The certificate unlocks when every unit of
                   <strong>${spaceEsc(level.label)} ${spaceEsc(skill.name)}</strong>
                   is marked complete in the lesson player.</p>
                <div class="progress-track">
                    <div class="progress-fill" style="--progress:${Math.round(doneCount / total * 100)}%"></div>
                </div>
                <div class="not-found-links">
                    <a class="btn btn-primary"
                       href="lesson.html?level=${encodeURIComponent(level.id)}&skill=${encodeURIComponent(skill.name)}&unit=${nextIndex}">
                       Continue with unit ${nextIndex + 1}</a>
                    <a class="btn btn-ghost" href="dashboard.html">Back to dashboard</a>
                </div>`);
        } else {
            /* issue once — stable date + serial */
            if (!db.certificates) db.certificates = {};
            const certKey = me.id + "|" + level.id + "|" + skill.name;
            if (!db.certificates[certKey]) {
                db.certificates[certKey] = {
                    issuedMinutesAgo: 0,
                    serial: "EA-" + level.id + "-" +
                            skill.name.slice(0, 2).toUpperCase() + "-" +
                            String(me.id).replace(/\D/g, "")
                };
                spaceSave(db);
                if (typeof spaceToast === "function") {
                    spaceToast("Certificate issued!", "good");
                }
            }
            const cert = db.certificates[certKey];
            const issued = new Date(Date.now() - cert.issuedMinutesAgo * 60000)
                .toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" });

            certRoot.innerHTML = `
            <div class="certificate-sheet" id="certificate-sheet">
                <div class="certificate-inner">
                    <span class="certificate-seal">EA</span>
                    <p class="certificate-kicker">The English Academy &middot; Certificate of Completion</p>
                    <h1 class="certificate-name">${spaceEsc(me.name)}</h1>
                    <p class="certificate-line">has completed all ${total} units of</p>
                    <p class="certificate-course">${spaceEsc(level.label)} ${spaceEsc(skill.name)}</p>
                    <p class="certificate-line">covering ${spaceEsc(level.grammar.slice(0, 3).join(" &middot; "))}</p>
                    <div class="certificate-foot">
                        <span>Issued ${issued}</span>
                        <span>Serial ${spaceEsc(cert.serial)}</span>
                        <span>The English Academy</span>
                    </div>
                </div>
            </div>
            <div class="not-found-links is-center no-print">
                <button type="button" class="btn btn-primary" id="cert-print">Print certificate</button>
                <a class="btn btn-ghost" href="dashboard.html">Back to dashboard</a>
            </div>`;

            const printBtn = document.getElementById("cert-print");
            if (printBtn) printBtn.addEventListener("click", () => window.print());
        }
    }
}
