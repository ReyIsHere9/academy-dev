/* ============================================================
   RECORDINGS ENGINE — fills recordings.html
   ------------------------------------------------------------
   Rows come from the demo store (db.recordings). The player is
   honest demo: pressing play opens the stage-style player and
   SAYS the video arrives with the backend phase. The list,
   metadata and sorting are all real.
   ============================================================ */

const recordingsRoot = document.getElementById("recordings-root");
const playerBox = document.getElementById("recording-player");

if (recordingsRoot) {
    const db = spaceLoad();
    const recordings = (db.recordings || []).slice()
        .sort((a, b) => a.daysAgo - b.daysAgo);

    function showPlayer(rec) {
        if (!playerBox) return;
        const teacher = spaceProfile(db, rec.teacher);
        playerBox.innerHTML = `
        <div class="card rec-player-card">
            <div class="lesson-player">
                <div class="lesson-screen">
                    <span class="lesson-play">&#9654;</span>
                    <p class="lesson-screen-note">Recording playback arrives with the backend phase</p>
                </div>
                <div class="lesson-player-bar">
                    <span class="lesson-time">00:00 / ${rec.minutes}:00</span>
                    <div class="lesson-progress-track"><div class="lesson-progress-fill"></div></div>
                </div>
            </div>
            <p class="space-next-course">${spaceEsc(rec.title)}</p>
            <p class="space-next-meta">${spaceEsc(rec.course)} &middot;
               ${spaceEsc(teacher.name)} &middot; ${spaceAgo(rec.daysAgo * 24 * 60)}</p>
        </div>`;
        if (typeof spaceToast === "function") {
            spaceToast("Demo player — the recording itself arrives with the backend", "bad");
        }
    }

    recordingsRoot.innerHTML = recordings.length ? recordings.map(rec => {
        const teacher = spaceProfile(db, rec.teacher);
        return `
        <div class="recording-row">
            <button type="button" class="recording-play" data-rec="${spaceEsc(rec.id)}"
                    title="Play recording">&#9654;</button>
            <div class="recording-main">
                <p class="space-next-course">${spaceEsc(rec.title)}</p>
                <p class="space-next-meta">${spaceEsc(rec.course)} &middot;
                   ${spaceEsc(teacher.name)} &middot; ${rec.minutes} min &middot;
                   ${rec.sizeMB} MB &middot; ${spaceAgo(rec.daysAgo * 24 * 60)}</p>
            </div>
            <button type="button" class="btn btn-ghost btn-small" data-rec="${spaceEsc(rec.id)}">
                Watch</button>
        </div>`;
    }).join("") : '<p class="space-empty-inline">No recordings yet — they appear after recorded classes.</p>';

    recordingsRoot.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-rec]");
        if (!btn) return;
        const rec = recordings.find(r => r.id === btn.dataset.rec);
        if (rec) showPlayer(rec);
    });
}
