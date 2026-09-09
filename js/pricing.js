/* ============================================================
   PRICING ENGINE — renders pricing everywhere it appears
   ------------------------------------------------------------
   This one file powers BOTH pieces of pricing UI:
   1. THE HEADER DROPDOWN (every page): four mini tier columns
      + "compare" link, plus open/close behavior.
   2. THE COMPARISON MATRIX (pricing.html only): full feature
      table + billing toggle + it re-prices everything live.

   LESSON — GUARDED CODE / ONE SCRIPT, TWO JOBS:
   A script can check "does this element exist on THIS page?"
   and only run the matching job. That's why every page can
   load the same two pricing scripts safely — each page uses
   whichever pieces it has markup for.
   ============================================================ */

/* ============ PRICE MATH ============
   period() = the real amount for an interval, e.g.
   monthly 21 -> quarterly: 21 x 3 x 0.90 = 56.7 -> 57
   The "regular" (old) price scales the same way so the
   crossed-out number is always the honest comparison. */
function periodPrice(monthly, interval) {
    return Math.round(monthly * interval.mult * (1 - interval.discount));
}

function periodRegular(regular, interval) {
    if (!regular) return null;
    return Math.round(regular * interval.mult * (1 - interval.discount));
}

/* A small price line for the dropdown / matrix header:
   big number + a short period label. */
function priceHtml(tier, interval) {
    const price = periodPrice(tier.monthly, interval);
    const old = periodRegular(tier.regular, interval);

    /* short human labels per interval (the full note like
       "billed every 3 months" lives under the billing toggle) */
    const unit = { monthly: "/mo", quarterly: "/3 mo", yearly: "/yr" }[interval.id];

    return `
        <div class="plan-price">
            <span class="price-now">$${price}</span><span class="price-unit">${unit}</span>
            ${old ? `
                <span class="price-old">$${old}
                    <svg class="scribble" viewBox="0 0 24 24"
                         preserveAspectRatio="none" aria-hidden="true">
                        <path d="M3 3 L21 21" />
                        <path d="M21 3 L3 21" />
                    </svg>
                </span>
                <span class="discount-chip">-${Math.round(tier.discount * 100)}%</span>
            ` : ""}
        </div>`;
    /* LESSON — TEMPLATE CONDITIONALS: ${old ? `...` : ""}
       = "if there is an old price, output the strike block,
       otherwise output nothing." The X is two diagonal SVG
       strokes with vector-effect: non-scaling-stroke, so it
       stretches over ANY width without getting blurry. */
}


/* ============ PART 1 — THE HEADER DROPDOWN ============
   Runs on EVERY page that has #dd-tiers in its header. */

const ddTiersSlot = document.getElementById("dd-tiers");

if (ddTiersSlot) {

    /* --- render the four mini tier columns --- */
    ddTiersSlot.innerHTML = PRICING.tiers.map(tier => `
        <a class="dd-tier ${tier.popular ? "is-popular" : ""}"
           href="pricing.html#compare">
            <span class="dd-tier-name">${tier.name}
                ${tier.popular ? `<span class="popular-chip">Most popular</span>` : ""}
            </span>
            ${priceHtml(tier, PRICING.intervals[0])}
            <span class="dd-tier-note">${tier.tagline}</span>
            <span class="dd-tier-cta">Choose ${tier.name}</span>
        </a>
    `).join("");

    /* --- open / close logic --- */
    const ddWrap   = document.getElementById("dd");
    const ddBtn    = document.getElementById("dd-trigger");
    const ddPanel  = document.getElementById("dd-panel");

    function setDropdown(open) {
        ddWrap.classList.toggle("is-open", open);
        ddPanel.classList.toggle("is-open", open);
        ddBtn.setAttribute("aria-expanded", String(open));
    }

    ddBtn.addEventListener("click", () => {
        setDropdown(!ddWrap.classList.contains("is-open"));
    });

    /* click anywhere OUTSIDE the dropdown closes it */
    document.addEventListener("click", (event) => {
        if (ddWrap && !ddWrap.contains(event.target)) setDropdown(false);
    });

    /* Escape key also closes it (keyboard users) */
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setDropdown(false);
    });
}


/* ============ PART 2 — THE COMPARISON MATRIX ============
   Runs ONLY on pricing.html (it has the #compare root).
   Renders the matrix, wires the billing toggle, and re-prices
   everything when the interval changes. */

const matrixRoot = document.getElementById("compare-root");
const billingBar = document.getElementById("billing-toggle");

if (matrixRoot && billingBar) {
    let intervalId = "monthly";   // the currently chosen interval

    const intervalFor = id =>
        PRICING.intervals.find(i => i.id === id);

    /* --- helpers to render cell codes ("yes"/"no"/text) --- */
    const tick = `<span class="tick">&#10003;</span>`;    // ✓
    const dash = `<span class="dash">&#8212;</span>`;     // —

    function cellHtml(cell) {
        if (cell === "yes") return tick;
        if (cell === "no")  return dash;
        return `<span class="cell-text">${cell}</span>`;
    }

    /* --- build the whole table as one string --- */
    function renderMatrix() {
        const interval = intervalFor(intervalId);

        /* header row: one column per tier (name + live price) */
        const headCells = PRICING.tiers.map(tier => `
            <th scope="col" class="${tier.popular ? "col-popular" : ""}">
                <span class="tier-name">${tier.name}</span>
                ${priceHtml(tier, interval)}
                <span class="tier-note">${tier.tagline}</span>
            </th>
        `).join("");

    /* ============================================================
       [BUGFIX LOG #3] — READ ME (lesson learned, keep forever)
       WHAT BROKE:    the matrix showed every cell mashed into one
                      continuous text strip above/around the header,
                      and the tier columns "climbed" diagonally.
       WHY:           each feature cell was injected as bare <span>
                      content with NO <td> wrapper. Browsers rip
                      non-table tags out of <tr> surroundings and
                      fall back to inline-block + baseline alignment —
                      tall content sits HIGH, short content LOW,
                      hence the climbing columns.
       THE FIX:       wrap every cell:  <td>${cellHtml(cell)}</td>
       SYMPTOM:       cellText / check marks laid out like prose,
                      not like columns.
       ============================================================ */
        /* body: group headings + feature rows */
        const bodyRows = PRICING.groups.map(group => `
            <tr class="group-row">
                <th colspan="5" scope="colgroup">${group.group}</th>
            </tr>
            ${group.rows.map(row => `
                <tr>
                    <th scope="row" class="feature-name">${row.name}</th>
                    ${row.cells.map(cell => `<td>${cellHtml(cell)}</td>`).join("")}
                </tr>
            `).join("")}
        `).join("");

        /* footer: one CTA button per tier */
        const footCells = PRICING.tiers.map(tier => `
            <td>
                <a class="btn btn-primary btn-block"
                   href="contact.html?course=${tier.name}%20plan">
                   Choose ${tier.name}</a>
            </td>
        `).join("");

        matrixRoot.innerHTML = `
            <div class="cmp-wrap">
                <table class="cmp-table">
                    <thead>
                        <tr>
                            <th scope="col" class="corner-cell">Feature</th>
                            ${headCells}
                        </tr>
                    </thead>
                    <tbody>
                        ${bodyRows}
                    </tbody>
                    <tfoot>
                        <tr><td></td>${footCells}</tr>
                    </tfoot>
                </table>
            </div>
        `;
    }

    /* --- billing toggle: rebuild with the new interval --- */
    billingBar.querySelectorAll("[data-interval]").forEach(btn => {
        btn.addEventListener("click", () => {
            intervalId = btn.dataset.interval;
            billingBar.querySelectorAll("[data-interval]")
                .forEach(b => b.classList.toggle("is-active",
                                                 b === btn));
            renderMatrix();
        });
    });

    renderMatrix();   // first paint (monthly)
}
