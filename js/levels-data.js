/* ============================================================
   COURSE DATA â€” the A1 to C2 levels of the academy
   ------------------------------------------------------------
   LESSON â€” SEPARATING DATA FROM DISPLAY:
   All information about the courses lives HERE, in one file.
   The pages know NOTHING about this content â€” they only
   display whatever this file contains.

   LESSON â€” ARRAYS & OBJECTS:
   [ ... ] = an ARRAY  = an ordered list of things
   { ... } = an OBJECT = one thing, with named properties

   LEVELS = an array of 6 objects. Each object has:
   id       -> short code (used in links + banner CSS class:
               id "A1" gets gradient class .grad-a1 in styles.css)
   label    -> display name
   tagline  -> one-line promise under the title
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
        label: "A1 Â· Beginner",
        tagline: "From zero to your first real sentences.",
        summary: "The perfect starting point. You'll learn the most useful everyday words, understand simple phrases, and build your very first sentences with confidence.",
        grammar: [
            "Present simple â€” to be & have",
            "Articles: a / an / the",
            "Plurals & basic countable nouns",
            "Question words: what / who / where / when",
            "Present continuous â€” happening now",
            "Prepositions: in / on / at (basics)"
        ],
        skills: [
            {
                name: "Speaking",
                blurb: "Introduce yourself, greet people and say what you need â€” slowly but surely.",
                lessons: "10 lessons",
                points: ["Greetings and introductions", "Introducing yourself", "Simple daily needs"],
                units: [
                    "Hello & goodbye â€” greetings that open doors",
                    "Who am I? â€” name, age, country, job",
                    "Numbers & prices â€” shopping out loud",
                    "Asking for things â€” polite questions"
                ]
            },
            {
                name: "Writing",
                blurb: "Write short, clear sentences about yourself and your day.",
                lessons: "8 lessons",
                points: ["The alphabet and spelling", "Short notes and messages", "Filling in simple forms"],
                units: [
                    "Letters & sounds â€” spelling your world",
                    "My name & my day â€” first sentences",
                    "Short messages â€” texts that communicate",
                    "Simple forms â€” writing your details"
                ]
            },
            {
                name: "Reading",
                blurb: "Read your first real texts: signs, menus, short messages.",
                lessons: "8 lessons",
                points: ["Recognising common words", "Signs and labels", "Very short stories"],
                units: [
                    "Word spotting â€” the 100 most useful words",
                    "Signs & labels â€” reading the street",
                    "Menus & price lists â€” reading to choose",
                    "Mini-stories â€” your first full texts"
                ]
            },
            {
                name: "Listening",
                blurb: "Train your ear for slow, clear spoken English.",
                lessons: "10 lessons",
                points: ["Numbers and prices", "Slow dialogues", "Understanding simple questions"],
                units: [
                    "Ear training â€” sounds of English",
                    "Numbers in the wild â€” prices, times, dates",
                    "Slow conversations â€” catching questions",
                    "Simple stories â€” following the plot"
                ]
            }
        ]
    },

    {
        id: "A2",
        label: "A2 Â· Elementary",
        tagline: "Everyday situations, handled with confidence.",
        summary: "Step beyond survival English: describe your life, make plans, shop, travel and handle routine situations without panic.",
        grammar: [
            "Past simple â€” regular & irregular verbs",
            "Present perfect â€” experiences",
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
                    "Daily life â€” routines & habits out loud",
                    "People & places â€” describing what you know",
                    "Plans & invitations â€” making them happen",
                    "Orders & requests â€” shops, cafÃ©s, travel"
                ]
            },
            {
                name: "Writing",
                blurb: "Write short paragraphs and simple messages that make sense.",
                lessons: "8 lessons",
                points: ["Short paragraphs", "Simple emails", "Describing people and places"],
                units: [
                    "Paragraphs â€” one idea, five sentences",
                    "Emails â€” friendly and clear",
                    "Describing people â€” look, character, style",
                    "Describing places â€” your town on paper"
                ]
            },
            {
                name: "Reading",
                blurb: "Read short texts about familiar topics and catch the key ideas.",
                lessons: "8 lessons",
                points: ["Short articles", "Personal messages", "Simple instructions"],
                units: [
                    "Short articles â€” news you can use",
                    "Messages & postcards â€” reading between lines",
                    "Instructions â€” following directions safely",
                    "Mini-stories â€” past tense in action"
                ]
            },
            {
                name: "Listening",
                blurb: "Follow the main points of clear speech on everyday topics.",
                lessons: "10 lessons",
                points: ["Announcements", "Everyday conversations", "Directions and instructions"],
                units: [
                    "Announcements â€” stations, airports, shops",
                    "Directions â€” finding your way by ear",
                    "Everyday dialogues â€” two people, one story",
                    "Phone talk â€” understanding without seeing"
                ]
            }
        ]
    },

    {
        id: "B1",
        label: "B1 Â· Intermediate",
        tagline: "Express opinions, plans and experiences.",
        summary: "The breakthrough level. You can handle most travel situations, describe experiences and events, and give reasons and explanations for your opinions.",
        grammar: [
            "Present perfect vs past simple",
            "First & second conditionals",
            "Reported speech â€” basics",
            "Passive voice â€” present & past",
            "Relative clauses â€” who / which / that",
            "Modals of advice: should / must / might"
        ],
        skills: [
            {
                name: "Speaking",
                blurb: "Talk about experiences, opinions and future plans without rehearsing.",
                lessons: "10 lessons",
                points: ["Opinions and reasons", "Describing experiences", "Handling surprises"],
                units: [
                    "Opinions â€” agree, disagree, explain why",
                    "Storytelling â€” past experiences with life",
                    "Advice & suggestions â€” helping others speak",
                    "Handling surprises â€” problems without panic"
                ]
            },
            {
                name: "Writing",
                blurb: "Write connected texts about familiar topics: stories, letters, messages.",
                lessons: "8 lessons",
                points: ["Structured paragraphs", "Informal letters", "Describing a story"],
                units: [
                    "Structuring texts â€” intro, body, ending",
                    "Informal letters â€” writing to friends",
                    "Describing a story â€” sequence & suspense",
                    "Reviews â€” opinions on paper that persuade"
                ]
            },
            {
                name: "Reading",
                blurb: "Understand everyday texts and find the information you need.",
                lessons: "8 lessons",
                points: ["Magazine articles", "Stories and chapters", "Finding key details"],
                units: [
                    "Magazine articles â€” interest & information",
                    "Stories & chapters â€” characters and plots",
                    "Scanning â€” finding details fast",
                    "Understanding tone â€” serious, funny, critical"
                ]
            },
            {
                name: "Listening",
                blurb: "Follow the main ideas of clear, standard speech on familiar topics.",
                lessons: "10 lessons",
                points: ["Radio shows", "Conversations about travel", "Explanations and talks"],
                units: [
                    "Radio & podcasts â€” ideas without pictures",
                    "Travel talk â€” plans, bookings, problems",
                    "Explanations â€” teachers, guides, how-tos",
                    "Group conversations â€” three voices and more"
                ]
            }
        ]
    },

    {
        id: "B2",
        label: "B2 Â· Upper-Intermediate",
        tagline: "Fluency on familiar AND abstract topics.",
        summary: "Here is where English stops being work and starts being natural: complex texts, abstract ideas, and confident interaction with native speakers.",
        grammar: [
            "Third conditional & mixed conditionals",
            "Narrative tenses â€” past in motion",
            "Advanced passive & causative (have something done)",
            "Reported speech â€” advanced shifts",
            "Modals of deduction â€” must have / can't have",
            "Linkers: despite / whereas / as long as"
        ],
        skills: [
            {
                name: "Speaking",
                blurb: "Discuss abstract topics and argue a point clearly and naturally.",
                lessons: "10 lessons",
                points: ["Debating ideas", "Explaining complex things", "Natural small talk"],
                units: [
                    "Debating â€” structure, evidence, rebuttal",
                    "Abstract topics â€” ideas without fear",
                    "Explaining complex things â€” simple again",
                    "Small talk mastery â€” effortless connection"
                ]
            },
            {
                name: "Writing",
                blurb: "Write clear, detailed texts on many subjects, with structure and style.",
                lessons: "8 lessons",
                points: ["Structured essays", "Formal letters", "Clear arguments"],
                units: [
                    "Essays â€” thesis, argument, conclusion",
                    "Formal letters & emails â€” professional voice",
                    "Arguing on paper â€” persuasion with logic",
                    "Editing â€” clarity, flow, word economy"
                ]
            },
            {
                name: "Reading",
                blurb: "Read longer texts and understand implicit meaning and tone.",
                lessons: "8 lessons",
                points: ["News articles", "Contemporary fiction", "Reading between the lines"],
                units: [
                    "News analysis â€” facts, bias, stance",
                    "Contemporary fiction â€” style & subtext",
                    "Opinion pieces â€” spotting persuasion",
                    "Reading between the lines â€” implication"
                ]
            },
            {
                name: "Listening",
                blurb: "Follow extended speech and most media without much effort.",
                lessons: "10 lessons",
                points: ["News broadcasts", "Documentaries", "Natural-speed dialogues"],
                units: [
                    "News broadcasts â€” fast, dense, factual",
                    "Documentaries â€” narrative & technical talk",
                    "Interviews â€” questions and evasions",
                    "Natural-speed dialogue â€” idioms included"
                ]
            }
        ]
    },

    {
        id: "C1",
        label: "C1 Â· Advanced",
        tagline: "Precision, nuance and natural flow.",
        summary: "Advanced mastery: complex texts on any topic, flexible and effective use of language for study, work and social life â€” with style and subtlety.",
        grammar: [
            "Inversion for emphasis â€” rarely, no sooner, never",
            "Cleft sentences â€” what matters is...",
            "Advanced conditionals â€” unless, otherwise, had I known",
            "Hedging & nuance â€” tends to, arguably, somewhat",
            "Collocations & fixed phrases",
            "Register shifting â€” formal to informal fluidly"
        ],
        skills: [
            {
                name: "Speaking",
                blurb: "Express ideas with nuance, idiom and effortless fluency.",
                lessons: "10 lessons",
                points: ["Idioms and nuance", "Persuasion and tone", "Abstract discussion"],
                units: [
                    "Idioms & nuance â€” saying it exactly",
                    "Persuasion â€” rhetoric with a light touch",
                    "Debate at C1 â€” complex, calm, precise",
                    "Fluency â€” hesitation-free expression"
                ]
            },
            {
                name: "Writing",
                blurb: "Produce well-structured, persuasive and stylish texts.",
                lessons: "8 lessons",
                points: ["Persuasive essays", "Reports and reviews", "Stylistic variety"],
                units: [
                    "Persuasive essays â€” arguments that land",
                    "Reports â€” analysis in formal prose",
                    "Stylistic variety â€” sentences with rhythm",
                    "Polishing â€” advanced editing craft"
                ]
            },
            {
                name: "Reading",
                blurb: "Understand demanding texts, including specialised content.",
                lessons: "8 lessons",
                points: ["Literary texts", "Specialised articles", "Implied meaning"],
                units: [
                    "Literary texts â€” language as art",
                    "Specialised articles â€” science, law, opinion",
                    "Satire & irony â€” reading the unsaid",
                    "Critical reading â€” evaluating sources"
                ]
            },
            {
                name: "Listening",
                blurb: "Understand fast speech, accents and implied messages.",
                lessons: "10 lessons",
                points: ["Fast speech and accents", "Interviews and debates", "Listening for tone"],
                units: [
                    "Accents of the world â€” ear expansion",
                    "Debates & interviews â€” layered argument",
                    "Humour & tone â€” catching the joke",
                    "Academic listening â€” lectures that teach"
                ]
            }
        ]
    },

    {
        id: "C2",
        label: "C2 Â· Proficiency",
        tagline: "Near-native mastery of expression and style.",
        summary: "The summit. Understand everything heard or read with ease, and express yourself spontaneously, precisely and elegantly on the most complex subjects.",
        grammar: [
            "Ellipsis & substitution â€” leaving words out naturally",
            "Fronting & thematic structure",
            "Idiomatic & phrasal mastery",
            "Pragmatics â€” implicature & understatement",
            "Style â€” rhythm, variation, cohesion",
            "Register command â€” academic to creative"
        ],
        skills: [
            {
                name: "Speaking",
                blurb: "Speak with near-native precision, wit and style on anything.",
                lessons: "10 lessons",
                points: ["Precision vocabulary", "Humor and wordplay", "Command of style"],
                units: [
                    "Precision â€” the exactly-right word",
                    "Wordplay & wit â€” language as play",
                    "Impromptu speaking â€” mastery unscripted",
                    "Command of style â€” from boardroom to stage"
                ]
            },
            {
                name: "Writing",
                blurb: "Write with elegance: anything from essays to creative prose.",
                lessons: "8 lessons",
                points: ["Creative and formal prose", "Complex arguments", "Personal style"],
                units: [
                    "Creative prose â€” voice, imagery, flow",
                    "Academic writing â€” precision at scale",
                    "Complex arguments â€” layers of reasoning",
                    "Personal style â€” finding your signature"
                ]
            },
            {
                name: "Reading",
                blurb: "Read anything â€” including subtle, literary and academic texts.",
                lessons: "8 lessons",
                points: ["Academic texts", "Classic literature", "Subtext and nuance"],
                units: [
                    "Classic literature â€” old English made new",
                    "Academic papers â€” density decoded",
                    "Subtext â€” everything unsaid matters",
                    "Style analysis â€” deconstructing great prose"
                ]
            },
            {
                name: "Listening",
                blurb: "Effortlessly understand any speech, in any accent, at any speed.",
                lessons: "10 lessons",
                points: ["All accents and speeds", "Abstract lectures", "Implicit meaning"],
                units: [
                    "Every accent, every speed â€” total access",
                    "Abstract lectures â€” ideas at full speed",
                    "Implicit meaning â€” hearing what's implied",
                    "Performance â€” comedy, drama, poetry by ear"
                ]
            }
        ]
    }
];
