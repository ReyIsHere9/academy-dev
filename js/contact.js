/* ============================================================
   CONTACT SCRIPT — three jobs for contact.html
   ------------------------------------------------------------
   1. OPEN/CLOSED STATUS  -> is the academy open right now?
      Highlights today's row in the hours list.
   2. COURSE PREFILL      -> if visitor arrived from a course
      page (?course=B2 Listening), prefill the message.
   3. FORM HANDLING       -> validate, then open the visitor's
      email app with the message pre-filled (mailto:).
      (A real server-side send replaces this after hosting —
      the HTML form stays identical. This is the front-end
      half of any contact form, and the honest no-server one.)
   ============================================================ */


/* ============ 1. OPEN / CLOSED STATUS ============
   LESSON — WORKING WITH TIME:
   new Date() = the current moment, with methods like
   .getDay()   -> weekday as a NUMBER: 0 = Sunday, 1 = Monday...
   .getHours() -> hour 0-23
   .getMinutes()

   We define the weekly schedule indexed the same way
   (0 = Sunday). Each entry: [openHour, closeHour], or
   null for closed days. */

const WEEK = [
    null,                      // 0 Sunday  -> closed
    [9, 18], [9, 18], [9, 18], // 1-3 Mon-Wed 09:00-18:00
    [9, 18], [9, 18],          // 4-5 Thu-Fri 09:00-18:00
    [10, 14]                   // 6 Saturday 10:00-14:00
];

function academyStatus() {
    const now = new Date();
    const dayIndex = now.getDay();
    const todaysHours = WEEK[dayIndex];

    if (!todaysHours) {
        return { open: false, dayName: "Sunday" };
    }
    const [openH, closeH] = todaysHours;
    const hour = now.getHours() + now.getMinutes() / 60;
    /* compare as decimals: 14.5 = 14:30 */
    return {
        open: hour >= openH && hour < closeH,
        dayName: now.toLocaleDateString("en-US", { weekday: "long" })
        /* toLocaleDateString with weekday: "long" gives
           "Monday" instead of a number — human-friendly! */
    };
}

/* Find today's row (data-day="Monday" etc) and style it.
   document.querySelector("[data-day='Monday']") = attribute
   selector — matches the ELEMENT WHOSE data-day equals... */
function highlightToday(dayName) {
    const row = document.querySelector(`[data-day="${dayName}"]`);
    if (row) row.classList.add("today");
}

/* Put the verdict in the badge next to "Opening Hours". */
function updateOpenBadge() {
    const badge = document.getElementById("open-status");
    const { open, dayName } = academyStatus();
    badge.textContent = open ? "Open now" : "Closed now";
    badge.classList.add(open ? "badge-open" : "badge-closed");
    highlightToday(dayName);
}


/* ============ 2. COURSE PREFILL ============
   Remember course.html's URL pattern? Contact links carry
   ?course=B2 Listening (space encoded as %20). If present,
   we set the subject and warm up the message. */

const courseParam = new URLSearchParams(location.search).get("course");
if (courseParam) {
    const subjectSelect = document.getElementById("f-subject");
    const messageField  = document.getElementById("f-message");
    subjectSelect.value = "Course enquiry";
    messageField.placeholder = `Hi! I'm interested in ${courseParam} — can you tell me more?`;
    /* placeholder only — visitor still writes their own words */
}


/* ============ 3. FORM HANDLING ============
   LESSON — event.preventDefault():
   Normally a <form> submit reloads the page and sends data
   to a server (action=""). We don't have a server, so we
   STOP the default behaviour (preventDefault) and take over.

   LESSON — THE mailto: TRICK:
   location.href = "mailto:email@site.com?subject=X&body=Y"
   asks the OPERATING SYSTEM to open the visitor's email app
   with everything pre-filled. Zero servers, works forever.
   & and spaces in the text must be URL-encoded (%0A = newline,
   %20 = space) or they'd break the link. */

const form = document.getElementById("contact-form");
const successBox = document.getElementById("form-success");

form.addEventListener("submit", (event) => {
    event.preventDefault();          // stop the page reload

    /* ----- validation -----
       required fields marked .is-invalid get a red outline
       + visible error text; we stop if any fail. */
    let valid = true;
    const requiredFields = form.querySelectorAll("[required]");
    requiredFields.forEach(field => {
        const error = field.parentElement.querySelector(".field-error");
        const bad = field.value.trim() === "" ||
                    (field.type === "email" && !field.value.includes("@"));
        field.classList.toggle("is-invalid", bad);
        if (error) {
            error.hidden = !bad;
            error.textContent = bad ? "Please fill this in correctly." : "";
        }
        if (bad) valid = false;
    });
    if (!valid) return;

    /* ----- read the fields (FormData = form in one object) ----- */
    const data = new FormData(form);
    const name    = data.get("name").trim();
    const email   = data.get("email").trim();
    const subject = data.get("subject");
    const message = data.get("message").trim();

    /* ----- build the pre-filled email -----
       encodeURIComponent = makes ANY text URL-safe.
       %0A%0A = two newlines (blank line between parts). */
    const recipient = "hello@example-academy.com";
    const subjectLine = `[${subject}] ${name}`;
    const body =
        `Hi, my name is ${name} (${email}).\n\n${message}\n\n` +
        `--- sent from the website contact form ---`;

    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;

    /* ----- reveal the thank-you box, then launch -----
       window.location.href = the OS-level jump to the email app. */
    successBox.hidden = false;
    form.classList.add("form-sent");   // fades the form a little
    window.location.href = mailto;
});
