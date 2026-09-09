/* ============================================================
   COURSE DATA — the A1 to C2 levels of the academy
   ------------------------------------------------------------
   LESSON — SEPARATING DATA FROM DISPLAY:
   All information about the courses lives HERE, in one file.
   The page (courses.html) knows NOTHING about this content.
   The script (carousel.js) only *displays* whatever this file
   contains. Want to add a course or change a tagline later?
   Edit THIS file only — no HTML, no CSS touched.

   LESSON — ARRAYS & OBJECTS:
   [ ... ] = an ARRAY  = an ordered list of things
   { ... } = an OBJECT = one thing, with named properties

   LEVELS = an array of 6 objects. Each object has:
   id       -> short code (used in links later)
   label    -> the fancy display name
   tagline  -> one-line promise under the title
   gradient -> the banner background colors
   summary  -> paragraph shown in the details section
   skills   -> an array of 4 objects (the course's skills)

   THE 4 SKILLS OF LANGUAGE LEARNING:
   Speaking, Writing, Reading, Listening.
   Every level trains all four.
   ============================================================ */

const LEVELS = [

    {
        id: "A1",
        label: "A1 · Beginner",
        tagline: "From zero to your first real sentences.",
        gradient: "linear-gradient(135deg, #38bdf8, #2563eb)",
        summary: "The perfect starting point. You'll learn the most useful everyday words, understand simple phrases, and build your very first sentences with confidence.",
        skills: [
            {
                name: "Speaking",
                blurb: "Introduce yourself, greet people and say what you need — slowly but surely.",
                lessons: "10 lessons",
                points: ["Greetings and introductions", "Introducing yourself", "Simple daily needs"]
            },
            {
                name: "Writing",
                blurb: "Write short, clear sentences about yourself and your day.",
                lessons: "8 lessons",
                points: ["The alphabet and spelling", "Short notes and messages", "Filling in simple forms"]
            },
            {
                name: "Reading",
                blurb: "Read your first real texts: signs, menus, short messages.",
                lessons: "8 lessons",
                points: ["Recognising common words", "Signs and labels", "Very short stories"]
            },
            {
                name: "Listening",
                blurb: "Train your ear for slow, clear spoken English.",
                lessons: "10 lessons",
                points: ["Numbers and prices", "Slow dialogues", "Understanding simple questions"]
            }
        ]
    },

    {
        id: "A2",
        label: "A2 · Elementary",
        tagline: "Everyday situations, handled with confidence.",
        gradient: "linear-gradient(135deg, #22c55e, #059669)",
        summary: "Step beyond survival English: describe your life, make plans, shop, travel and handle routine situations without panic.",
        skills: [
            {
                name: "Speaking",
                blurb: "Describe your family, routine and plans in simple but useful sentences.",
                lessons: "10 lessons",
                points: ["Talking about routines", "Making plans", "Shopping and ordering"]
            },
            {
                name: "Writing",
                blurb: "Write short paragraphs and simple messages that make sense.",
                lessons: "8 lessons",
                points: ["Short paragraphs", "Simple emails", "Describing people and places"]
            },
            {
                name: "Reading",
                blurb: "Read short texts about familiar topics and catch the key ideas.",
                lessons: "8 lessons",
                points: ["Short articles", "Personal messages", "Simple instructions"]
            },
            {
                name: "Listening",
                blurb: "Follow the main points of clear speech on everyday topics.",
                lessons: "10 lessons",
                points: ["Announcements", "Everyday conversations", "Directions and instructions"]
            }
        ]
    },

    {
        id: "B1",
        label: "B1 · Intermediate",
        tagline: "Express opinions, plans and experiences.",
        gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
        summary: "The breakthrough level. You can handle most travel situations, describe experiences and events, and give reasons and explanations for your opinions.",
        skills: [
            {
                name: "Speaking",
                blurb: "Talk about experiences, opinions and future plans without rehearsing.",
                lessons: "10 lessons",
                points: ["Opinions and reasons", "Describing experiences", "Handling surprises"]
            },
            {
                name: "Writing",
                blurb: "Write connected texts about familiar topics: stories, letters, messages.",
                lessons: "8 lessons",
                points: ["Structured paragraphs", "Informal letters", "Describing a story"]
            },
            {
                name: "Reading",
                blurb: "Understand everyday texts and find the information you need.",
                lessons: "8 lessons",
                points: ["Magazine articles", "Stories and chapters", "Finding key details"]
            },
            {
                name: "Listening",
                blurb: "Follow the main ideas of clear, standard speech on familiar topics.",
                lessons: "10 lessons",
                points: ["Radio shows", "Conversations about travel", "Explanations and talks"]
            }
        ]
    },

    {
        id: "B2",
        label: "B2 · Upper-Intermediate",
        tagline: "Fluency on familiar AND abstract topics.",
        gradient: "linear-gradient(135deg, #6366f1, #4338ca)",
        summary: "Here is where English stops being work and starts being natural: complex texts, abstract ideas, and confident interaction with native speakers.",
        skills: [
            {
                name: "Speaking",
                blurb: "Discuss abstract topics and argue a point clearly and naturally.",
                lessons: "10 lessons",
                points: ["Debating ideas", "Explaining complex things", "Natural small talk"]
            },
            {
                name: "Writing",
                blurb: "Write clear, detailed texts on many subjects, with structure and style.",
                lessons: "8 lessons",
                points: ["Structured essays", "Formal letters", "Clear arguments"]
            },
            {
                name: "Reading",
                blurb: "Read longer texts and understand implicit meaning and tone.",
                lessons: "8 lessons",
                points: ["News articles", "Contemporary fiction", "Reading between the lines"]
            },
            {
                name: "Listening",
                blurb: "Follow extended speech and most media without much effort.",
                lessons: "10 lessons",
                points: ["News broadcasts", "Documentaries", "Natural-speed dialogues"]
            }
        ]
    },

    {
        id: "C1",
        label: "C1 · Advanced",
        tagline: "Precision, nuance and natural flow.",
        gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
        summary: "Advanced mastery: complex texts on any topic, flexible and effective use of language for study, work and social life — with style and subtlety.",
        skills: [
            {
                name: "Speaking",
                blurb: "Express ideas with nuance, idiom and effortless fluency.",
                lessons: "10 lessons",
                points: ["Idioms and nuance", "Persuasion and tone", "Abstract discussion"]
            },
            {
                name: "Writing",
                blurb: "Produce well-structured, persuasive and stylish texts.",
                lessons: "8 lessons",
                points: ["Persuasive essays", "Reports and reviews", "Stylistic variety"]
            },
            {
                name: "Reading",
                blurb: "Understand demanding texts, including specialised content.",
                lessons: "8 lessons",
                points: ["Literary texts", "Specialised articles", "Implied meaning"]
            },
            {
                name: "Listening",
                blurb: "Understand fast speech, accents and implied messages.",
                lessons: "10 lessons",
                points: ["Fast speech and accents", "Interviews and debates", "Listening for tone"]
            }
        ]
    },

    {
        id: "C2",
        label: "C2 · Proficiency",
        tagline: "Near-native mastery of expression and style.",
        gradient: "linear-gradient(135deg, #475569, #1e1b4b)",
        summary: "The summit. Understand everything heard or read with ease, and express yourself spontaneously, precisely and elegantly on the most complex subjects.",
        skills: [
            {
                name: "Speaking",
                blurb: "Speak with near-native precision, wit and style on anything.",
                lessons: "10 lessons",
                points: ["Precision vocabulary", "Humor and wordplay", "Command of style"]
            },
            {
                name: "Writing",
                blurb: "Write with elegance: anything from essays to creative prose.",
                lessons: "8 lessons",
                points: ["Creative and formal prose", "Complex arguments", "Personal style"]
            },
            {
                name: "Reading",
                blurb: "Read anything — including subtle, literary and academic texts.",
                lessons: "8 lessons",
                points: ["Academic texts", "Classic literature", "Subtext and nuance"]
            },
            {
                name: "Listening",
                blurb: "Effortlessly understand any speech, in any accent, at any speed.",
                lessons: "10 lessons",
                points: ["All accents and speeds", "Abstract lectures", "Implicit meaning"]
            }
        ]
    }
];
