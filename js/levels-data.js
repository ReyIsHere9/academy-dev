/* ============================================================
   COURSE DATA — the A1 to C2 levels of the academy
   ------------------------------------------------------------
   LESSON — SEPARATING DATA FROM DISPLAY:
   All information about the courses lives HERE, in one file.
   The pages know NOTHING about this content — they only
   display whatever this file contains.

   LESSON — ARRAYS & OBJECTS:
   [ ... ] = an ARRAY  = an ordered list of things
   { ... } = an OBJECT = one thing, with named properties

   LEVELS = an array of 6 objects. Each object has:
   id       -> short code (used in links)
   label    -> display name
   tagline  -> one-line promise under the title
   gradient -> banner background colors
   summary  -> paragraph for the details section
   grammar  -> the level's grammar focus (real A1->C2 progression)
   skills   -> 4 objects = the 4 language skills. Each skill has:
               name, blurb, lessons, points (catalog snippets)
               and units[] (its full unit outline for the
               course detail page).

   THE 4 SKILLS: Speaking, Writing, Reading, Listening.
   ============================================================ */

const LEVELS = [

    {
        id: "A1",
        label: "A1 · Beginner",
        tagline: "From zero to your first real sentences.",
        gradient: "linear-gradient(135deg, #38bdf8, #2563eb)",
        summary: "The perfect starting point. You'll learn the most useful everyday words, understand simple phrases, and build your very first sentences with confidence.",
        grammar: [
            "Present simple — to be & have",
            "Articles: a / an / the",
            "Plurals & basic countable nouns",
            "Question words: what / who / where / when",
            "Present continuous — happening now",
            "Prepositions: in / on / at (basics)"
        ],
        skills: [
            {
                name: "Speaking",
                blurb: "Introduce yourself, greet people and say what you need — slowly but surely.",
                lessons: "10 lessons",
                points: ["Greetings and introductions", "Introducing yourself", "Simple daily needs"],
                units: [
                    "Hello & goodbye — greetings that open doors",
                    "Who am I? — name, age, country, job",
                    "Numbers & prices — shopping out loud",
                    "Asking for things — polite questions"
                ]
            },
            {
                name: "Writing",
                blurb: "Write short, clear sentences about yourself and your day.",
                lessons: "8 lessons",
                points: ["The alphabet and spelling", "Short notes and messages", "Filling in simple forms"],
                units: [
                    "Letters & sounds — spelling your world",
                    "My name & my day — first sentences",
                    "Short messages — texts that communicate",
                    "Simple forms — writing your details"
                ]
            },
            {
                name: "Reading",
                blurb: "Read your first real texts: signs, menus, short messages.",
                lessons: "8 lessons",
                points: ["Recognising common words", "Signs and labels", "Very short stories"],
                units: [
                    "Word spotting — the 100 most useful words",
                    "Signs & labels — reading the street",
                    "Menus & price lists — reading to choose",
                    "Mini-stories — your first full texts"
                ]
            },
            {
                name: "Listening",
                blurb: "Train your ear for slow, clear spoken English.",
                lessons: "10 lessons",
                points: ["Numbers and prices", "Slow dialogues", "Understanding simple questions"],
                units: [
                    "Ear training — sounds of English",
                    "Numbers in the wild — prices, times, dates",
                    "Slow conversations — catching questions",
                    "Simple stories — following the plot"
                ]
            }
        ]
    },

    {
        id: "A2",
        label: "A2 · Elementary",
        tagline: "Everyday situations, handled with confidence.",
        gradient: "linear-gradient(135deg, #22c55e, #059669)",
        summary: "Step beyond survival English: describe your life, make plans, shop, travel and handle routine situations without panic.",
        grammar: [
            "Past simple — regular & irregular verbs",
            "Present perfect — experiences",
            "Countable vs uncountable: some / any / much / many",
            "Comparatives & superlatives",
            "Future plans: going to vs will",
            "Modals: can / must / have to"
        ],
        skills: [
            {
                name: "Speaking",
                blurb: "Describe your family, routine and plans in simple but useful sentences.",
                lessons: "10 lessons",
                points: ["Talking about routines", "Making plans", "Shopping and ordering"],
                units: [
                    "Daily life — routines & habits out loud",
                    "People & places — describing what you know",
                    "Plans & invitations — making them happen",
                    "Orders & requests — shops, cafés, travel"
                ]
            },
            {
                name: "Writing",
                blurb: "Write short paragraphs and simple messages that make sense.",
                lessons: "8 lessons",
                points: ["Short paragraphs", "Simple emails", "Describing people and places"],
                units: [
                    "Paragraphs — one idea, five sentences",
                    "Emails — friendly and clear",
                    "Describing people — look, character, style",
                    "Describing places — your town on paper"
                ]
            },
            {
                name: "Reading",
                blurb: "Read short texts about familiar topics and catch the key ideas.",
                lessons: "8 lessons",
                points: ["Short articles", "Personal messages", "Simple instructions"],
                units: [
                    "Short articles — news you can use",
                    "Messages & postcards — reading between lines",
                    "Instructions — following directions safely",
                    "Mini-stories — past tense in action"
                ]
            },
            {
                name: "Listening",
                blurb: "Follow the main points of clear speech on everyday topics.",
                lessons: "10 lessons",
                points: ["Announcements", "Everyday conversations", "Directions and instructions"],
                units: [
                    "Announcements — stations, airports, shops",
                    "Directions — finding your way by ear",
                    "Everyday dialogues — two people, one story",
                    "Phone talk — understanding without seeing"
                ]
            }
        ]
    },

    {
        id: "B1",
        label: "B1 · Intermediate",
        tagline: "Express opinions, plans and experiences.",
        gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
        summary: "The breakthrough level. You can handle most travel situations, describe experiences and events, and give reasons and explanations for your opinions.",
        grammar: [
            "Present perfect vs past simple",
            "First & second conditionals",
            "Reported speech — basics",
            "Passive voice — present & past",
            "Relative clauses — who / which / that",
            "Modals of advice: should / must / might"
        ],
        skills: [
            {
                name: "Speaking",
                blurb: "Talk about experiences, opinions and future plans without rehearsing.",
                lessons: "10 lessons",
                points: ["Opinions and reasons", "Describing experiences", "Handling surprises"],
                units: [
                    "Opinions — agree, disagree, explain why",
                    "Storytelling — past experiences with life",
                    "Advice & suggestions — helping others speak",
                    "Handling surprises — problems without panic"
                ]
            },
            {
                name: "Writing",
                blurb: "Write connected texts about familiar topics: stories, letters, messages.",
                lessons: "8 lessons",
                points: ["Structured paragraphs", "Informal letters", "Describing a story"],
                units: [
                    "Structuring texts — intro, body, ending",
                    "Informal letters — writing to friends",
                    "Describing a story — sequence & suspense",
                    "Reviews — opinions on paper that persuade"
                ]
            },
            {
                name: "Reading",
                blurb: "Understand everyday texts and find the information you need.",
                lessons: "8 lessons",
                points: ["Magazine articles", "Stories and chapters", "Finding key details"],
                units: [
                    "Magazine articles — interest & information",
                    "Stories & chapters — characters and plots",
                    "Scanning — finding details fast",
                    "Understanding tone — serious, funny, critical"
                ]
            },
            {
                name: "Listening",
                blurb: "Follow the main ideas of clear, standard speech on familiar topics.",
                lessons: "10 lessons",
                points: ["Radio shows", "Conversations about travel", "Explanations and talks"],
                units: [
                    "Radio & podcasts — ideas without pictures",
                    "Travel talk — plans, bookings, problems",
                    "Explanations — teachers, guides, how-tos",
                    "Group conversations — three voices and more"
                ]
            }
        ]
    },

    {
        id: "B2",
        label: "B2 · Upper-Intermediate",
        tagline: "Fluency on familiar AND abstract topics.",
        gradient: "linear-gradient(135deg, #6366f1, #4338ca)",
        summary: "Here is where English stops being work and starts being natural: complex texts, abstract ideas, and confident interaction with native speakers.",
        grammar: [
            "Third conditional & mixed conditionals",
            "Narrative tenses — past in motion",
            "Advanced passive & causative (have something done)",
            "Reported speech — advanced shifts",
            "Modals of deduction — must have / can't have",
            "Linkers: despite / whereas / as long as"
        ],
        skills: [
            {
                name: "Speaking",
                blurb: "Discuss abstract topics and argue a point clearly and naturally.",
                lessons: "10 lessons",
                points: ["Debating ideas", "Explaining complex things", "Natural small talk"],
                units: [
                    "Debating — structure, evidence, rebuttal",
                    "Abstract topics — ideas without fear",
                    "Explaining complex things — simple again",
                    "Small talk mastery — effortless connection"
                ]
            },
            {
                name: "Writing",
                blurb: "Write clear, detailed texts on many subjects, with structure and style.",
                lessons: "8 lessons",
                points: ["Structured essays", "Formal letters", "Clear arguments"],
                units: [
                    "Essays — thesis, argument, conclusion",
                    "Formal letters & emails — professional voice",
                    "Arguing on paper — persuasion with logic",
                    "Editing — clarity, flow, word economy"
                ]
            },
            {
                name: "Reading",
                blurb: "Read longer texts and understand implicit meaning and tone.",
                lessons: "8 lessons",
                points: ["News articles", "Contemporary fiction", "Reading between the lines"],
                units: [
                    "News analysis — facts, bias, stance",
                    "Contemporary fiction — style & subtext",
                    "Opinion pieces — spotting persuasion",
                    "Reading between the lines — implication"
                ]
            },
            {
                name: "Listening",
                blurb: "Follow extended speech and most media without much effort.",
                lessons: "10 lessons",
                points: ["News broadcasts", "Documentaries", "Natural-speed dialogues"],
                units: [
                    "News broadcasts — fast, dense, factual",
                    "Documentaries — narrative & technical talk",
                    "Interviews — questions and evasions",
                    "Natural-speed dialogue — idioms included"
                ]
            }
        ]
    },

    {
        id: "C1",
        label: "C1 · Advanced",
        tagline: "Precision, nuance and natural flow.",
        gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
        summary: "Advanced mastery: complex texts on any topic, flexible and effective use of language for study, work and social life — with style and subtlety.",
        grammar: [
            "Inversion for emphasis — rarely, no sooner, never",
            "Cleft sentences — what matters is...",
            "Advanced conditionals — unless, otherwise, had I known",
            "Hedging & nuance — tends to, arguably, somewhat",
            "Collocations & fixed phrases",
            "Register shifting — formal to informal fluidly"
        ],
        skills: [
            {
                name: "Speaking",
                blurb: "Express ideas with nuance, idiom and effortless fluency.",
                lessons: "10 lessons",
                points: ["Idioms and nuance", "Persuasion and tone", "Abstract discussion"],
                units: [
                    "Idioms & nuance — saying it exactly",
                    "Persuasion — rhetoric with a light touch",
                    "Debate at C1 — complex, calm, precise",
                    "Fluency — hesitation-free expression"
                ]
            },
            {
                name: "Writing",
                blurb: "Produce well-structured, persuasive and stylish texts.",
                lessons: "8 lessons",
                points: ["Persuasive essays", "Reports and reviews", "Stylistic variety"],
                units: [
                    "Persuasive essays — arguments that land",
                    "Reports — analysis in formal prose",
                    "Stylistic variety — sentences with rhythm",
                    "Polishing — advanced editing craft"
                ]
            },
            {
                name: "Reading",
                blurb: "Understand demanding texts, including specialised content.",
                lessons: "8 lessons",
                points: ["Literary texts", "Specialised articles", "Implied meaning"],
                units: [
                    "Literary texts — language as art",
                    "Specialised articles — science, law, opinion",
                    "Satire & irony — reading the unsaid",
                    "Critical reading — evaluating sources"
                ]
            },
            {
                name: "Listening",
                blurb: "Understand fast speech, accents and implied messages.",
                lessons: "10 lessons",
                points: ["Fast speech and accents", "Interviews and debates", "Listening for tone"],
                units: [
                    "Accents of the world — ear expansion",
                    "Debates & interviews — layered argument",
                    "Humour & tone — catching the joke",
                    "Academic listening — lectures that teach"
                ]
            }
        ]
    },

    {
        id: "C2",
        label: "C2 · Proficiency",
        tagline: "Near-native mastery of expression and style.",
        gradient: "linear-gradient(135deg, #475569, #1e1b4b)",
        summary: "The summit. Understand everything heard or read with ease, and express yourself spontaneously, precisely and elegantly on the most complex subjects.",
        grammar: [
            "Ellipsis & substitution — leaving words out naturally",
            "Fronting & thematic structure",
            "Idiomatic & phrasal mastery",
            "Pragmatics — implicature & understatement",
            "Style — rhythm, variation, cohesion",
            "Register command — academic to creative"
        ],
        skills: [
            {
                name: "Speaking",
                blurb: "Speak with near-native precision, wit and style on anything.",
                lessons: "10 lessons",
                points: ["Precision vocabulary", "Humor and wordplay", "Command of style"],
                units: [
                    "Precision — the exactly-right word",
                    "Wordplay & wit — language as play",
                    "Impromptu speaking — mastery unscripted",
                    "Command of style — from boardroom to stage"
                ]
            },
            {
                name: "Writing",
                blurb: "Write with elegance: anything from essays to creative prose.",
                lessons: "8 lessons",
                points: ["Creative and formal prose", "Complex arguments", "Personal style"],
                units: [
                    "Creative prose — voice, imagery, flow",
                    "Academic writing — precision at scale",
                    "Complex arguments — layers of reasoning",
                    "Personal style — finding your signature"
                ]
            },
            {
                name: "Reading",
                blurb: "Read anything — including subtle, literary and academic texts.",
                lessons: "8 lessons",
                points: ["Academic texts", "Classic literature", "Subtext and nuance"],
                units: [
                    "Classic literature — old English made new",
                    "Academic papers — density decoded",
                    "Subtext — everything unsaid matters",
                    "Style analysis — deconstructing great prose"
                ]
            },
            {
                name: "Listening",
                blurb: "Effortlessly understand any speech, in any accent, at any speed.",
                lessons: "10 lessons",
                points: ["All accents and speeds", "Abstract lectures", "Implicit meaning"],
                units: [
                    "Every accent, every speed — total access",
                    "Abstract lectures — ideas at full speed",
                    "Implicit meaning — hearing what's implied",
                    "Performance — comedy, drama, poetry by ear"
                ]
            }
        ]
    }
];
