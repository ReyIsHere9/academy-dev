/* ============================================================
   CHECKOUT ENGINE — fills checkout.html
   ------------------------------------------------------------
   ONE page, THREE products (chosen by the URL):
     ?plan=explorer|speaker|pro|master   -> a subscription
     ?plan=lifetime                      -> one course, forever
     ?course=B1|Speaking                 -> a single course

   THE FLOW (all real front-end logic):
     1. resolve the product + price (pricing-data.js math)
     2. interval switching + coupon codes + method choice
     3. validate (shape-only card checks — demo)
     4. create an ORDER in the store, plus a PAYMENT record so the
        admin console's billing table updates immediately
     5. course purchases enroll a logged-in student automatically

   ⚠️ SECURITY NOTE (read me): card numbers must NEVER reach our
   own server in a real build. The payment provider (Stripe,
   PayPal…) collects them in their own iframe and hands us back a
   token. This demo validates shape, then throws the digits away —
   nothing is stored.
   ============================================================ */

/* demo coupon codes — real builds validate server-side */
const CHECKOUT_COUPONS = {
    WELCOME10: { pct: 10, label: "Welcome 10%" },
    STUDENT15: { pct: 15, label: "Student 15%" },
    ACADEMY5:  { pct: 5,  label: "Academy 5%" }
};

const params = new URLSearchParams(location.search);
const planId = params.get("plan");
const courseParam = params.get("course");
const checkoutRoot = document.getElementById("checkout-root");

const CATALOG = academyCatalog();
const tier = PRICING.tiers.find(t => t.id === planId) || null;
const isLifetime = planId === "lifetime";

/* split "B1|Speaking" into level + skill and validate against the
   catalog (admin edits included) */
let fixedCourse = null;
if (courseParam) {
    const [courseLevelId, courseSkillName] = courseParam.split("|");
    const courseLevel = CATALOG.find(l => l.id === courseLevelId);
    const courseSkill = courseLevel
        ? courseLevel.skills.find(s => s.name === courseSkillName)
        : undefined;
    if (courseLevel && courseSkill) {
        fixedCourse = { level: courseLevel, skill: courseSkill };
    }
}

/* state */
let intervalId = params.get("interval") || "monthly";
if (!PRICING.intervals.some(i => i.id === intervalId)) intervalId = "monthly";
let couponCode = "";
let method = "card";
let lifetimePick = CATALOG.length ? (CATALOG[0].id + "|" + CATALOG[0].skills[0].name) : "";

const me = typeof sessionRead === "function" ? sessionRead() : null;
const db = spaceLoad();

/* ---------- product math ---------- */
function currentInterval() {
    return PRICING.intervals.find(i => i.id === intervalId);
}

function product() {
    if (fixedCourse) {
        return {
            kind: "course",
            label: "Course — " + fixedCourse.level.label + " " + fixedCourse.skill.name,
            detail: fixedCourse.skill.lessons + " · self-paced · yours forever",
            base: typeof COURSE_PRICE_USD !== "undefined" ? COURSE_PRICE_USD : 120,
            regular: null
        };
    }
    if (isLifetime) {
        const [lvlId, skillName] = lifetimePick.split("|");
        const lvl = CATALOG.find(l => l.id === lvlId);
        const skl = lvl ? lvl.skills.find(s => s.name === skillName) : null;
        return {
            kind: "lifetime",
            label: "Lifetime access — " + (lvl ? lvl.label + " " + skl.name : "one course"),
            detail: "One course, one payment, yours for good",
            base: PRICING.lifetime.examplePrice,
            regular: null
        };
    }
    if (tier) {
        const interval = currentInterval();
        return {
            kind: "plan",
            label: tier.name + " plan — " + interval.label,
            detail: interval.note,
            base: periodPrice(tier.monthly, interval),
            regular: periodRegular(tier.regular, interval)
        };
    }
    return null;
}

function totals() {
    const p = product();
    if (!p) return null;
    const coupon = CHECKOUT_COUPONS[couponCode] || null;
    const discount = coupon ? Math.round(p.base * coupon.pct / 100) : 0;
    return {
        base: p.base,
        discount,
        total: p.base - discount,
        coupon
    };
}

/* ---------- the page ---------- */
if (!checkoutRoot) {
    /* nothing to do */
} else if (!product()) {
    checkoutRoot.innerHTML = `
        <section class="section">
            <div class="container">
                <div class="card not-found-card">
                    <h2>Nothing to check out</h2>
                    <p>That link doesn't point to a plan or a course.
                       Pick a plan from the pricing page, or enroll from
                       any course page.</p>
                    <a class="btn btn-primary" href="pricing.html">See the plans</a>
                </div>
            </div>
        </section>`;
} else {

    /* success panel (replaces the form after purchase) */
    function renderSuccess(order) {
        checkoutRoot.innerHTML = `
        <section class="section">
            <div class="container checkout-layout">
                <div class="card checkout-success">
                    <span class="success-check">&#10003;</span>
                    <h2>Order complete</h2>
                    <p class="muted">Reference <strong>${spaceEsc(order.ref)}</strong> &middot;
                       paid with ${spaceEsc(order.method)} (demo — no real money moved).</p>
                    <div class="checkout-summary-lines">
                        <div class="summary-line"><span>Product</span><strong>${spaceEsc(order.product)}</strong></div>
                        <div class="summary-line"><span>Total paid</span><strong>$${order.total}</strong></div>
                        <div class="summary-line"><span>Account</span>
                            <strong>${spaceEsc(me ? me.name + " (" + me.id + ")" : "Guest purchase")}</strong></div>
                    </div>
                    <p class="space-hint">The order is saved in the demo store — the admin
                       console's Payments panel shows it immediately.</p>
                    <div class="space-submit-row">
                        ${me ? `<a class="btn btn-primary" href="${dashboardFor(me.role)}">Go to my dashboard</a>` : ""}
                        <a class="btn btn-ghost" href="courses.html">Browse more courses</a>
                    </div>
                </div>
            </div>
        </section>`;
        if (typeof spaceToast === "function") {
            spaceToast("Payment complete — order " + order.ref, "good");
        }
    }

    function renderCheckout() {
        const p = product();
        const t = totals();

        /* account note: what happens to this purchase */
        let accountNote;
        if (!me) {
            accountNote = `<div class="checkout-note">
                You're not logged in — this becomes a guest purchase.
                <a href="login.html">Log in as a student</a> to enroll automatically.</div>`;
        } else if (me.role !== "student") {
            accountNote = `<div class="checkout-note">
                Logged in as <strong>${spaceEsc(me.name)}</strong> (${spaceEsc(me.role)}).
                The order will be linked to this account — admins and teachers
                buying courses is a demo, not a business model. 🙂</div>`;
        } else {
            accountNote = `<div class="checkout-note is-good">
                Purchasing as <strong>${spaceEsc(me.name)}</strong> (${spaceEsc(me.id)}) —
                a course or lifetime purchase enrolls you automatically.</div>`;
        }

        const lifetimePicker = isLifetime ? `
            <div class="checkout-block">
                <h2>Which course is yours forever?</h2>
                <select class="chat-input" id="lifetime-course">
                    ${CATALOG.map(lvl => lvl.skills.map(skl => {
                        const value = lvl.id + "|" + skl.name;
                        return `<option value="${spaceEsc(value)}" ${value === lifetimePick ? "selected" : ""}>${spaceEsc(lvl.label)} · ${spaceEsc(skl.name)}</option>`;
                    }).join("")).join("")}
                </select>
            </div>` : "";

        const intervalPicker = (!isLifetime && !fixedCourse) ? `
            <div class="checkout-block">
                <h2>Billing period</h2>
                <div class="checkout-seg" id="checkout-intervals">
                    ${PRICING.intervals.map(i => `
                        <button type="button" class="bill-btn ${i.id === intervalId ? "is-active" : ""}"
                                data-ci="${i.id}">${i.label}</button>`).join("")}
                </div>
                <p class="space-hint" id="interval-note">${currentInterval().note} ·
                   quarterly saves 10%, yearly saves 25%.</p>
            </div>` : "";

        checkoutRoot.innerHTML = `
        <section class="section">
            <div class="container checkout-layout">

                <div class="checkout-main">
                    ${accountNote}
                    ${lifetimePicker}
                    ${intervalPicker}

                    <div class="checkout-block">
                        <h2>Payment method</h2>
                        <div class="checkout-methods" id="checkout-methods">
                            ${[
                                { id: "card", label: "Card" },
                                { id: "paypal", label: "PayPal" },
                                { id: "bank", label: "Bank transfer" }
                            ].map(m => `
                                <label class="pick-row">
                                    <input type="radio" name="method" value="${m.id}"
                                           ${m.id === method ? "checked" : ""}>
                                    ${m.label}
                                </label>`).join("")}
                        </div>

                        <div id="card-fields" class="card-fields" ${method !== "card" ? "hidden" : ""}>
                            <div class="field">
                                <label class="space-label" for="cc-number">Card number</label>
                                <input type="text" class="chat-input" id="cc-number"
                                       placeholder="4242 4242 4242 4242" inputmode="numeric"
                                       autocomplete="off">
                            </div>
                            <div class="field">
                                <label class="space-label" for="cc-name">Name on card</label>
                                <input type="text" class="chat-input" id="cc-name" autocomplete="off">
                            </div>
                            <div class="form-grid-2">
                                <div class="field">
                                    <label class="space-label" for="cc-exp">Expiry (MM/YY)</label>
                                    <input type="text" class="chat-input" id="cc-exp"
                                           placeholder="12/28" autocomplete="off">
                                </div>
                                <div class="field">
                                    <label class="space-label" for="cc-cvc">CVC</label>
                                    <input type="text" class="chat-input" id="cc-cvc"
                                           placeholder="123" inputmode="numeric" autocomplete="off">
                                </div>
                            </div>
                            <p class="space-hint">Demo only — the digits are validated for
                               shape and never stored (a real build uses a payment provider).</p>
                        </div>
                    </div>

                    <div class="checkout-block">
                        <h2>Coupon</h2>
                        <div class="award-row">
                            <input type="text" class="chat-input" id="coupon-input"
                                   placeholder="e.g. WELCOME10" autocomplete="off">
                            <button type="button" class="btn btn-ghost btn-small"
                                    id="coupon-apply">Apply</button>
                        </div>
                        <p class="space-hint" id="coupon-note">Try
                            <code>WELCOME10</code>, <code>STUDENT15</code> or <code>ACADEMY5</code>.</p>
                    </div>
                </div>

                <!-- order summary -->
                <aside class="card checkout-summary">
                    <h3>Order summary</h3>
                    <div class="summary-line"><span>Product</span><strong>${spaceEsc(p.label)}</strong></div>
                    <p class="muted small">${spaceEsc(p.detail)}</p>
                    <div class="summary-line"><span>Price</span><strong>$${p.base}</strong></div>
                    ${p.regular ? `<div class="summary-line"><span>Regular price</span>
                        <strong class="price-old-inline">$${p.regular}</strong></div>` : ""}
                    <div class="summary-line" id="discount-line" ${t.discount ? "" : "hidden"}>
                        <span>Coupon ${t.coupon ? "(" + spaceEsc(t.coupon.label) + ")" : ""}</span>
                        <strong>&minus;$${t.discount}</strong>
                    </div>
                    <div class="summary-total"><span>Total</span><strong>$${t.total}</strong></div>
                    <p class="space-hint">Demo checkout: the order flow is real, the
                       payment isn't. Nothing is charged, ever.</p>
                    <button type="button" class="btn btn-primary btn-block" id="checkout-complete">
                        Complete purchase — $${t.total}</button>
                    <p class="checkout-error" id="checkout-error" hidden></p>
                </aside>

            </div>
        </section>`;

        wireCheckout();
    }

    function wireCheckout() {
        /* interval switches re-render every price live */
        const intervals = document.getElementById("checkout-intervals");
        if (intervals) {
            intervals.addEventListener("click", (event) => {
                const btn = event.target.closest("[data-ci]");
                if (!btn) return;
                intervalId = btn.dataset.ci;
                renderCheckout();
            });
        }

        /* lifetime course picker */
        const lifetimeCourse = document.getElementById("lifetime-course");
        if (lifetimeCourse) {
            lifetimeCourse.addEventListener("change", () => {
                lifetimePick = lifetimeCourse.value;
                renderCheckout();
            });
        }

        /* method choice toggles the card fields */
        const methods = document.getElementById("checkout-methods");
        if (methods) {
            methods.addEventListener("change", () => {
                const picked = methods.querySelector('input[name="method"]:checked');
                method = picked ? picked.value : "card";
                const fields = document.getElementById("card-fields");
                if (fields) fields.hidden = method !== "card";
            });
        }

        /* coupon */
        const couponBtn = document.getElementById("coupon-apply");
        if (couponBtn) {
            couponBtn.addEventListener("click", () => {
                const input = document.getElementById("coupon-input");
                const note = document.getElementById("coupon-note");
                const code = input ? input.value.trim().toUpperCase() : "";
                if (!code) {
                    note.textContent = "Type a coupon code first.";
                    note.classList.add("is-error");
                    return;
                }
                if (!CHECKOUT_COUPONS[code]) {
                    note.textContent = "That code isn't valid. Try WELCOME10, STUDENT15 or ACADEMY5.";
                    note.classList.add("is-error");
                    return;
                }
                couponCode = code;
                renderCheckout();
            });
        }

        /* complete the purchase */
        const completeBtn = document.getElementById("checkout-complete");
        if (completeBtn) {
            completeBtn.addEventListener("click", () => {
                const p = product();
                const t = totals();
                const error = document.getElementById("checkout-error");
                const fail = (msg) => {
                    if (error) { error.textContent = msg; error.hidden = false; }
                };
                if (error) error.hidden = true;

                /* shape-only validation for cards (demo) */
                if (method === "card") {
                    const num = (document.getElementById("cc-number") || {}).value || "";
                    const name = (document.getElementById("cc-name") || {}).value || "";
                    const exp = (document.getElementById("cc-exp") || {}).value || "";
                    const cvc = (document.getElementById("cc-cvc") || {}).value || "";
                    if (num.replace(/\D/g, "").length < 12) return fail("Card number looks too short (demo: any 12+ digits).");
                    if (!name.trim()) return fail("Add the name on the card.");
                    if (!/^\d{2}\s*\/\s*\d{2}$/.test(exp.trim())) return fail("Expiry should look like 12/28.");
                    if (!/^\d{3,4}$/.test(cvc.trim())) return fail("CVC is 3 or 4 digits.");
                }

                /* build the order */
                const order = {
                    id: "ord-" + Date.now(),
                    ref: "EA-" + String(Math.floor(1000 + Math.random() * 9000)),
                    product: p.label,
                    kind: p.kind,
                    plan: p.kind === "plan" ? planId : (p.kind === "lifetime" ? "lifetime" : "course"),
                    interval: p.kind === "plan" ? intervalId : null,
                    course: fixedCourse
                        ? { level: fixedCourse.level.id, skill: fixedCourse.skill.name }
                        : (p.kind === "lifetime"
                            ? { level: lifetimePick.split("|")[0], skill: lifetimePick.split("|")[1] }
                            : null),
                    student: me ? me.id : "guest",
                    subtotal: t.base,
                    discount: t.discount,
                    total: t.total,
                    method,
                    status: "paid",
                    minutesAgo: 0
                };
                if (!db.orders) db.orders = [];
                db.orders.push(order);

                /* billing record for the admin console */
                db.payments.push({
                    id: "pay-" + Date.now(),
                    student: order.student,
                    plan: order.plan,
                    amount: order.total,
                    status: "paid",
                    daysAgo: 0,
                    method
                });

                /* course / lifetime purchases enroll a logged-in student */
                let enrolled = false;
                if (me && me.role === "student" && order.course) {
                    const lvl = CATALOG.find(l => l.id === order.course.level);
                    const skl = lvl ? lvl.skills.find(s => s.name === order.course.skill) : null;
                    if (lvl && skl) {
                        const already = db.enrollments.some(e =>
                            e.student === me.id && e.level === lvl.id && e.skill === skl.name);
                        if (!already) {
                            const lead = Object.entries(db.profiles)
                                .find(([, pr]) => pr.role === "teacher");
                            db.enrollments.push({
                                id: "enr-" + Date.now(),
                                student: me.id,
                                level: lvl.id, skill: skl.name,
                                title: lvl.id + " · " + skl.name,
                                teacher: lead ? lead[0] : "Tch-1001",  // demo: unassigned → lead teacher
                                progress: 0, sessionsDone: 0,
                                sessionsTotal: skl.units.length,
                                nextLesson: skl.units[0]
                            });
                            enrolled = true;
                        }
                    }
                }

                /* the admin activity feed hears about it */
                db.activity.unshift({
                    id: "act-" + Date.now(),
                    kind: "pay",
                    text: "New purchase: " + p.label + " ($" + t.total + ") by " +
                          (me ? me.name : "a guest"),
                    minutesAgo: 0
                });

                spaceSave(db);
                renderSuccess(order);
                if (enrolled) {
                    spaceToast("You're enrolled — find the course on your dashboard", "good");
                }
            });
        }
    }

    renderCheckout();
}
