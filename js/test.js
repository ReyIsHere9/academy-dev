/* ============================================================
   PLACEMENT TEST ENGINE — drives test.html
   ------------------------------------------------------------
   HOW THE TEST WORKS (and why it's designed this way):
   - 12 questions, TWO per CEFR band, rising in difficulty.
   - Each question is tagged with its band (A1 -> C2).
   - Scoring: find the HIGHEST band where the learner got at
     least one of its two questions right — that's the level
     they can already operate at. Zero correct = start at A1.
     (Real placement testing is adaptive; this is the honest
     front-end approximation of the same idea.)

   RESULTS: shown on screen, and saved to the demo store when a
   student is logged in (db.placements), so their level sticks.
   ============================================================ */

const TEST_QUESTIONS = [
    { band: "A1", q: "___ your name?",
      options: ["What's", "How's", "Who's"], answer: 0 },
    { band: "A1", q: "She ___ to work by bus every day.",
      options: ["go", "goes", "going"], answer: 1 },
    { band: "A2", q: "I ___ TV when you called.",
      options: ["watched", "was watching", "watch"], answer: 1 },
    { band: "A2", q: "Have you ever ___ to London?",
      options: ["been", "gone", "went"], answer: 0 },
    { band: "B1", q: "If I ___ more time, I would travel more.",
      options: ["have", "had", "will have"], answer: 1 },
    { band: "B1", q: "The novel ___ by a famous author.",
      options: ["wrote", "was written", "writes"], answer: 1 },
    { band: "B2", q: "She said she ___ finish the report by Friday.",
      options: ["will", "would", "can"], answer: 1 },
    { band: "B2", q: "Hardly ___ the meeting started when the power went out.",
      options: ["had", "has", "did"], answer: 0 },
    { band: "C1", q: "___ his efforts, the project failed.",
      options: ["Despite", "Although", "However"], answer: 0 },
    { band: "C1", q: "The proposal is likely ___ next week.",
      options: ["to approve", "to be approved", "approving"], answer: 1 },
    { band: "C2", q: "No sooner ___ than it started raining.",
      options: ["we left", "had we left", "we had left"], answer: 1 },
    { band: "C2", q: "Scarcely ___ a word when he was interrupted.",
      options: ["had he spoken", "he had spoken", "he spoke"], answer: 0 }
];

const BANDS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const BAND_DESCRIPTIONS = {
    A1: "You're at the very start — greetings, simple sentences, everyday words.",
    A2: "You handle routine situations: shopping, travel, short messages.",
    B1: "You can hold real conversations and explain your opinions.",
    B2: "You're comfortable with complex texts and abstract discussion.",
    C1: "You operate fluently and precisely in professional settings.",
    C2: "Near-native command — you're ready for academic-level English."
};

const BAND_PLAN = {
    A1: { plan: "explorer", label: "Explorer" },
    A2: { plan: "explorer", label: "Explorer" },
    B1: { plan: "speaker",  label: "Speaker" },
    B2: { plan: "pro",      label: "Pro" },
    C1: { plan: "pro",      label: "Pro" },
    C2: { plan: "master",   label: "Master" }
};

const testRoot = document.getElementById("test-root");

if (testRoot) {
    let index = 0;
    let picked = null;               // selected option for the current question
    const answers = new Array(TEST_QUESTIONS.length).fill(null);

    const me = typeof sessionRead === "function" ? sessionRead() : null;
    const db = spaceLoad();

    function renderQuestion() {
        const q = TEST_QUESTIONS[index];
        const progress = Math.round(index / TEST_QUESTIONS.length * 100);
        testRoot.innerHTML = `
        <div class="card">
            <p class="test-count">Question ${index + 1} of ${TEST_QUESTIONS.length}
               &middot; ${q.band} level</p>
            <div class="test-progress-track">
                <div class="test-progress-fill" style="--progress:${progress}%"></div>
            </div>
            <h2 class="test-question">${q.q}</h2>
            <div class="quiz-options">
                ${q.options.map((opt, i) => `
                    <label class="quiz-option">
                        <input type="radio" name="t" value="${i}">
                        <span>${opt}</span>
                    </label>`).join("")}
            </div>
            <div class="space-submit-row">
                ${index > 0 ? `<button type="button" class="btn btn-ghost" id="test-back">Back</button>` : ""}
                <button type="button" class="btn btn-primary" id="test-next">
                    ${index === TEST_QUESTIONS.length - 1 ? "See my level" : "Next question"}</button>
            </div>
            <p class="space-error" id="test-error" hidden></p>
        </div>`;

        /* restore a previous answer when coming back */
        if (answers[index] !== null) {
            const previous = testRoot.querySelector(`input[value="${answers[index]}"]`);
            if (previous) previous.checked = true;
        }

        const nextBtn = document.getElementById("test-next");
        nextBtn.addEventListener("click", () => {
            const selected = testRoot.querySelector('input[name="t"]:checked');
            const error = document.getElementById("test-error");
            if (!selected) {
                error.textContent = "Pick an answer to continue.";
                error.hidden = false;
                return;
            }
            answers[index] = Number(selected.value);
            if (index === TEST_QUESTIONS.length - 1) {
                renderResult();
            } else {
                index++;
                renderQuestion();
            }
        });

        const backBtn = document.getElementById("test-back");
        if (backBtn) {
            backBtn.addEventListener("click", () => {
                const selected = testRoot.querySelector('input[name="t"]:checked');
                if (selected) answers[index] = Number(selected.value);
                index--;
                renderQuestion();
            });
        }
    }

    function renderResult() {
        /* score per band + overall */
        const perBand = {};
        BANDS.forEach(b => { perBand[b] = { correct: 0, total: 0 }; });
        let correctTotal = 0;
        TEST_QUESTIONS.forEach((q, i) => {
            perBand[q.band].total++;
            if (answers[i] === q.answer) {
                perBand[q.band].correct++;
                correctTotal++;
            }
        });

        /* recommended level: the highest band with at least one
           correct answer (never above a band they failed entirely) */
        let recommended = "A1";
        BANDS.forEach(b => {
            if (perBand[b].correct > 0) recommended = b;
        });

        /* save it: student accounts keep their level */
        if (me && me.role === "student") {
            if (!db.placements) db.placements = {};
            db.placements[me.id] = {
                level: recommended,
                correct: correctTotal,
                total: TEST_QUESTIONS.length,
                minutesAgo: 0
            };
            spaceSave(db);
        }

        const plan = BAND_PLAN[recommended];
        testRoot.innerHTML = `
        <div class="card test-result">
            <p class="certificate-kicker">Your placement</p>
            <p class="test-result-level">${recommended}</p>
            <p class="muted">${BAND_DESCRIPTIONS[recommended]}</p>
            <p class="space-hint">You answered <strong>${correctTotal} / ${TEST_QUESTIONS.length}</strong>
               correctly.
               ${me && me.role === "student"
                   ? "Saved to your account — find it on your dashboard."
                   : `<a href="register.html">Create an account</a> to keep this result.`}</p>

            <div class="test-band-bars">
                ${BANDS.map(b => {
                    const row = perBand[b];
                    const pct = row.total ? Math.round(row.correct / row.total * 100) : 0;
                    return `
                    <div class="band-row">
                        <strong>${b}</strong>
                        <div class="pay-bar-track">
                            <div class="pay-bar-fill" style="--w:${pct}%"></div>
                        </div>
                        <span class="muted small">${row.correct}/${row.total}</span>
                    </div>`;
                }).join("")}
            </div>

            <div class="not-found-links">
                <a class="btn btn-primary" href="courses.html">Browse ${recommended} courses</a>
                <a class="btn btn-ghost" href="pricing.html">See plans (${plan.label} fits ${recommended})</a>
                <a class="btn btn-ghost" href="test.html">Take it again</a>
            </div>
        </div>`;

        if (typeof spaceToast === "function" && me && me.role === "student") {
            spaceToast("Placement saved: " + recommended, "good");
        }
    }

    renderQuestion();
}
