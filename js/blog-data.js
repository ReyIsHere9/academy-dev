/* ============================================================
   BLOG DATA — every article lives here
   ------------------------------------------------------------
   Same data-driven pattern as every other module: blog.html and
   post.html know NOTHING about these words — they just render
   whatever this file contains.

   POST SHAPE:
     slug       -> the URL name: post.html?slug=the-3-second-fix
     daysAgo    -> relative date (like class-data.js) so the blog
                   NEVER looks stale: "2 days ago" recomputes live
     grad       -> which .grad-* banner color the cover uses
     blocks[]   -> the article body, one block per idea:
                   { h }    heading
                   { p }    paragraph
                   { list } bullet points
                   { quote } { text, by }   pull-quote
                   { tip }  highlighted tip box

   AUTHORS are plain names + avatar colors (the blog is editorial
   content, not a user account).
   ============================================================ */

const BLOG_POSTS = [

    {
        slug: "speaking-club-opens-monday",
        title: "New: speaking club opens every Monday",
        category: "Academy news",
        author: { name: "Site Admin", role: "Academy", color: "#2563eb" },
        daysAgo: 1, readMinutes: 2, grad: "grad-c1",
        excerpt: "Free for every student, no booking, no level limit. Just show up and talk.",
        tags: ["club", "speaking", "announcement"],
        blocks: [
            { p: "Starting next Monday, the academy runs a free speaking club for every enrolled student. No booking, no level requirement — join the room, get paired, talk for twenty minutes." },
            { h: "How it works" },
            { list: [
                "Open to every student, every level",
                "Mondays at 18:00, in the live classroom",
                "Twenty minutes of guided pairs, then a group wrap-up",
                "A teacher is always in the room"
            ] },
            { quote: { text: "Speaking is a sport. You don't get fit by reading about it.", by: "Ms. Demo Teacher" } },
            { tip: "Can't make Mondays? Tell us in the contact form — if enough people ask, we'll open a second slot." }
        ]
    },

    {
        slug: "why-english-freezes-in-conversations",
        title: "Why your English freezes in real conversations (and the 3-second fix)",
        category: "Learning tips",
        author: { name: "Ms. Demo Teacher", role: "Teacher", color: "#7c3aed" },
        daysAgo: 2, readMinutes: 5, grad: "grad-b1",
        excerpt: "You know the words. Then someone actually talks to you and everything vanishes. There's a reason — and a tiny fix.",
        tags: ["speaking", "confidence", "habits"],
        blocks: [
            { p: "It has a name: the freeze. Your knowledge is fine. What collapses is your retrieval speed — the milliseconds between hearing something and producing an answer. Under pressure, the brain protects you by giving up." },
            { h: "Why drilling doesn't fix it" },
            { p: "Textbook exercises happen at reading speed. Conversations happen at conversation speed. Everything you learned slowly disappears quickly. The fix isn't more words — it's more speed." },
            { h: "The 3-second rule" },
            { p: "In every practice conversation, force yourself to answer within three seconds — even badly. Even with three words. Speed first, polish later. Fluent speakers are not people who make fewer mistakes; they are people who don't wait for perfect sentences." },
            { list: [
                "Set a mental timer: three seconds, then speak",
                "Answer with what you have, not what you wish you had",
                "Repair afterwards ('sorry — I mean…'), never before"
            ] },
            { quote: { text: "Mistakes you can fix. Silence you can't.", by: "Ms. Demo Teacher" } },
            { tip: "Try it in the speaking club this Monday. Twenty minutes of three-second answers will do more than a week of vocabulary lists." }
        ]
    },

    {
        slug: "present-perfect-explained-with-coffee",
        title: "Present perfect vs past simple, explained with coffee",
        category: "Grammar bites",
        author: { name: "Ms. Demo Teacher", role: "Teacher", color: "#7c3aed" },
        daysAgo: 5, readMinutes: 4, grad: "grad-a2",
        excerpt: "One finished cup, one cup that's still on the table. If you can see the difference, you can feel the grammar.",
        tags: ["grammar", "present perfect", "past simple"],
        blocks: [
            { p: "Forget the rules for a minute. Picture two cups of coffee." },
            { h: "Cup one: finished" },
            { p: "\"I drank three coffees this morning.\" The morning is over. The coffees are history. Past simple is for closed stories — we say when it happened." },
            { h: "Cup two: still on the table" },
            { p: "\"I have drunk three coffees today.\" The day is still running. The effect is still with you (we can see it — you're vibrating). Present perfect is for open stories: it happened, and it still matters now." },
            { list: [
                "Finished time word (yesterday, in 2019, this morning… if morning is over) → past simple",
                "Open time word (today, this week, ever, since, for) → present perfect",
                "No time word + still relevant → present perfect"
            ] },
            { quote: { text: "Past simple = photo. Present perfect = live stream.", by: "Ms. Demo Teacher" } },
            { tip: "Homework in the dashboard uses this exact distinction — worksheet 4 is all about it. Graded feedback on the last one averaged 92. Nice." }
        ]
    },

    {
        slug: "zero-to-job-interview",
        title: "From zero to a job interview in 9 months",
        category: "Student stories",
        author: { name: "Negar", role: "Student", color: "#db2777" },
        daysAgo: 9, readMinutes: 6, grad: "grad-b2",
        excerpt: "I couldn't introduce myself in March. In December I answered interview questions in English — and got the job.",
        tags: ["story", "motivation", "speaking"],
        blocks: [
            { p: "March: I knew 'hello' and could count to twelve. I remember being proud that I understood 'What is your name?' on the phone." },
            { h: "What actually worked" },
            { list: [
                "Two live classes every week — you can't skip a person who expects you",
                "The speaking club: twenty minutes of not being allowed to stay silent",
                "Homework that got graded with real comments, not just points",
                "Watching one English episode with subtitles — then again without"
            ] },
            { h: "The month everything clicked" },
            { p: "Somewhere in month six, I stopped translating in my head. It wasn't a moment — it was a habit. Three-second answers, every class, badly at first." },
            { quote: { text: "I did not become fluent. I became able to start — and that was the whole difference.", by: "Negar" } },
            { tip: "My interviewer later said the best answer I gave was the imperfect one — because I kept talking. Fluent enough is a real level, and it's achievable this year." }
        ]
    },

    {
        slug: "five-tiny-habits-double-vocabulary",
        title: "Five tiny habits that double your vocabulary",
        category: "Learning tips",
        author: { name: "Mr. Sample Tutor", role: "Teacher", color: "#0891b2" },
        daysAgo: 14, readMinutes: 4, grad: "grad-a1",
        excerpt: "No apps, no flashcards marathons. Five habits under five minutes each — that's the whole system.",
        tags: ["vocabulary", "habits"],
        blocks: [
            { p: "Vocabulary is not a talent. It's a collection — and collectors win by collecting a little, often." },
            { list: [
                "The three-word walk: on any walk, name three things you can't say in English yet. That's tonight's collection.",
                "The receipt rule: read your shopping receipt in English. Milk, bread, batteries — all free vocabulary.",
                "The rename game: change your phone language to English for one hour a day.",
                "The last-message review: re-read your last three English messages before bed. You'll remember what mattered.",
                "The one-sentence journal: one sentence a day about today. Nine months = 270 sentences = your life in English."
            ] },
            { h: "Why tiny wins" },
            { p: "A 40-minute study session once a week loses to five minutes daily. Memory is built by frequency, not by intensity. Your brain files what it sees often." },
            { tip: "Pick exactly two from this list. Two is a habit; five is a wish." }
        ]
    },

    {
        slug: "how-to-read-a-menu-like-a-local",
        title: "How to read a menu like a local",
        category: "Grammar bites",
        author: { name: "Ms. Demo Teacher", role: "Teacher", color: "#7c3aed" },
        daysAgo: 21, readMinutes: 3, grad: "grad-c2",
        excerpt: "Menus are the cheapest English reading practice in the world — and the only homework that ends with dinner.",
        tags: ["reading", "real life"],
        blocks: [
            { p: "A menu is a masterclass in real English: adjectives stack up ('slow-roasted, free-range chicken'), and the grammar is always doing something." },
            { h: "Three patterns to spot" },
            { list: [
                "'Grilled / roasted / smoked' — -ed adjectives: the food received the action (passive voice's friendly cousin)",
                "'Served with…' — who serves? Nobody says. Passive again, and completely natural at a restaurant.",
                "'Chef's special' — possessives mark ownership, even of a whole evening"
            ] },
            { quote: { text: "Read the menu before you're hungry. Hungry readers skip adjectives.", by: "Ms. Demo Teacher" } },
            { tip: "Next time you order: read the description out loud, then order in English. Worst case, you get exactly what you pointed at." }
        ]
    }
];

/* newest first — everything renders in this order */
BLOG_POSTS.sort((a, b) => a.daysAgo - b.daysAgo);

const BLOG_CATEGORIES = ["All", ...new Set(BLOG_POSTS.map(p => p.category))];
