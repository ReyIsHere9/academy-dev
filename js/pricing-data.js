/* ============================================================
   PRICING DATA — tiers, billing intervals, feature matrix
   ------------------------------------------------------------
   Everything "pricing" in one file (same data-driven lesson as
   levels-data.js):
   - the HEADER dropdown (every page) renders its 4 mini columns
     from PRICING.tiers
   - pricing.html renders the FULL comparison matrix from
     PRICING.groups + PRICING.tiers
   Change a price / feature here → it updates everywhere.

   LESSON — CELL CODES:
   Every feature row has one "cell" per tier, aligned in order
   (explorer, speaker, pro, master):
     "yes"  -> renders a check mark
     "no"   -> renders a dash (—)
     text   -> renders as-is ("30 min", "1/wk", "Unlimited")
   That tiny convention keeps the data compact AND lets a single
   renderer draw every possible matrix.
   ============================================================ */

const PRICING = {

    /* ---------- BILLING INTERVALS ----------
       monthly   = the base price in each tier below
       quarterly = 3x monthly, minus 10%
       yearly    = 12x monthly, minus 25%
       All periods are derived from the SAME monthly number —
       change a monthly price and the other periods recalculate. */
    intervals: [
        { id: "monthly",   label: "Monthly",     mult: 1,  discount: 0,    note: "billed monthly" },
        { id: "quarterly", label: "3-Monthly",   mult: 3,  discount: 0.10, note: "billed every 3 months" },
        { id: "yearly",    label: "Yearly",      mult: 12, discount: 0.25, note: "billed yearly" }
    ],

    /* ---------- THE 4 TIERS ----------
       monthly  = current price per month
       regular  = the OLD price for discounted plans (null = none).
                  Plans with a "regular" price show it crossed out
                  in red pencil-scribble style + a discount chip.
       cells in PRICING.groups line up with this order:          */
    tiers: [
        { id: "explorer", name: "Explorer",
          monthly: 9,  regular: null,
          tagline: "Dip a toe in — one level, core lessons." },
        { id: "speaker", name: "Speaker",
          monthly: 21, regular: 30,
          discount: 0.30,
          tagline: "Most learners' sweet spot: three full levels." },
        { id: "pro", name: "Pro",
          monthly: 24, regular: 40,
          discount: 0.40, popular: true,
          tagline: "The whole academy, plus coaching every week." },
        { id: "master", name: "Master",
          monthly: 79, regular: null,
          tagline: "Everything — including private 1-on-1 time." }
    ],

    /* ---------- FEATURE MATRIX ----------
       groups -> rows -> cells[4] aligned to the tiers above.
       The rightmost tier collects the most check marks — that's
       the "richest" column by design. */
    groups: [
        {
            group: "Lessons & library",
            rows: [
                { name: "Lesson library access",
                  cells: ["1 level", "3 levels", "All levels", "All levels"] },
                { name: "Downloadable audio lessons",
                  cells: ["no", "yes", "yes", "yes"] },
                { name: "Interactive exercises per unit",
                  cells: ["yes", "yes", "yes", "yes"] }
            ]
        },
        {
            group: "Practice & feedback",
            rows: [
                { name: "Speaking practice minutes / month",
                  cells: ["30 min", "120 min", "300 min", "6 h / month"] },
                { name: "AI conversation partner",
                  cells: ["no", "yes", "yes", "yes"] },
                { name: "Written tasks with teacher feedback",
                  cells: ["1 / month", "4 / month", "12 / month", "20 / month"] },
                { name: "Live group classes",
                  cells: ["no", "1 / week", "2 / week", "3 / week"] },
                { name: "Private 1-on-1 coaching",
                  cells: ["no", "no", "1 / month", "4 / month"] }
            ]
        },
        {
            group: "Progress & support",
            rows: [
                { name: "Community study room",
                  cells: ["yes", "yes", "yes", "yes"] },
                { name: "Level assessment test",
                  cells: ["yes", "yes", "yes", "yes"] },
                { name: "Progress reports & analytics",
                  cells: ["no", "yes", "yes", "yes"] },
                { name: "Certificate of completion",
                  cells: ["no", "yes", "yes", "yes"] },
                { name: "Offline study mode",
                  cells: ["no", "no", "yes", "yes"] },
                { name: "Priority support",
                  cells: ["no", "no", "no", "yes"] }
            ]
        }
    ],

    /* ---------- LIFETIME OFFER (the sneaky hook) ---------- */
    lifetime: {
        hook: "Not here for another subscription? Maybe you just want one course, forever.",
        perks: [
            "Choose any single course (any level, any skill)",
            "Full price, one payment — no renewals, no expiry",
            "All current units included, yours to keep",
            "Perfect for self-paced learners on a budget"
        ],
        examplePrice: 249,
        note: "The \"pay more once\" option: a full year of Pro costs less — but if you only need one thing, own it instead of renting it."
    }
};
