import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";

const { width } = Dimensions.get("window");

const topicDetails: Record<string, any> = {
  "articles": {
    name: "Articles",
    emoji: "📖",
    color: ["#f953c6", "#b91d73"] as [string, string],
    level: "A1",
    intro: "Articles are small words that come before nouns. There are only 3 — but they change everything!",
    sections: [
      {
        type: "rule",
        icon: "🔤",
        title: "A vs AN",
        subtitle: "Indefinite Articles",
        rule: ["Use A before consonant sounds.", "Use AN before vowel sounds."],
        tip: "💡 It's about the SOUND, not the spelling!",
        examples: [
          { sentence: "I have ____ dog.", answer: "a", note: "consonant sound /d/" },
          { sentence: "She is ____ engineer.", answer: "an", note: "vowel sound /e/" },
          { sentence: "He waited for ____ hour.", answer: "an", note: "'h' is silent → vowel sound" },
          { sentence: "It is ____ university.", answer: "a", note: "'u' sounds like /juː/ → consonant" },
        ],
      },
      {
        type: "mini-quiz",
        question: "Choose the correct article: ___ honest man",
        options: ["a", "an", "the", "—"],
        answer: "an",
        explanation: "'Honest' starts with a silent 'h', so the sound is /ɒ/ — a vowel sound. Use AN.",
      },
      {
        type: "rule",
        icon: "☝️",
        title: "THE",
        subtitle: "Definite Article",
        rule: ["Use THE when both speaker and listener know which specific thing is meant.", "Also used with unique things (the sun, the moon)."],
        tip: "💡 Think of THE as pointing at something specific.",
        examples: [
          { sentence: "I saw a cat. ____ cat was black.", answer: "The", note: "second mention — now specific" },
          { sentence: "____ sun rises in the east.", answer: "The", note: "unique — only one sun" },
          { sentence: "Can you close ____ door?", answer: "the", note: "we both know which door" },
        ],
      },
      {
        type: "mini-quiz",
        question: "Complete: 'She is ___ best student in the class.'",
        options: ["a", "an", "the", "—"],
        answer: "the",
        explanation: "'Best student' is specific and unique — only one person can be the best.",
      },
      {
        type: "rule",
        icon: "🚫",
        title: "Zero Article",
        subtitle: "No Article Needed",
        rule: ["No article with general plural/uncountable nouns.", "No article with languages, meals, and most countries.", "No article with proper names."],
        tip: "💡 General = no article. Specific = the.",
        examples: [
          { sentence: "Dogs are loyal animals.", answer: "—", note: "dogs in general" },
          { sentence: "She speaks French.", answer: "—", note: "languages — no article" },
          { sentence: "I had breakfast at 7am.", answer: "—", note: "meals — no article" },
          { sentence: "She lives in Turkey.", answer: "—", note: "most countries — no article" },
        ],
      },
      {
        type: "mini-quiz",
        question: "'___ love is a beautiful thing.' Which is correct?",
        options: ["A", "An", "The", "—"],
        answer: "—",
        explanation: "Love in general (uncountable, abstract) takes no article.",
      },
    ],
  },

  "prepositions": {
    name: "Prepositions",
    emoji: "📍",
    color: ["#60a5fa", "#2563eb"] as [string, string],
    level: "A1",
    intro: "Prepositions show relationships between words — time, place, and direction. Master AT, ON, IN and you're halfway there!",
    sections: [
      {
        type: "rule",
        icon: "⏰",
        title: "AT / ON / IN — Time",
        subtitle: "Time Prepositions",
        rule: [
          "AT  →  specific times & holidays",
          "ON  →  days & dates",
          "IN   →  months, years, seasons, periods",
        ],
        tip: "💡 Think: AT is a point, ON is a surface, IN is inside a container — same idea for time!",
        examples: [
          { sentence: "The meeting is ____ 3 o'clock.", answer: "at", note: "specific time" },
          { sentence: "I was born ____ Monday.", answer: "on", note: "day of week" },
          { sentence: "She started work ____ January.", answer: "in", note: "month" },
          { sentence: "He was born ____ 1995.", answer: "in", note: "year" },
        ],
      },
      {
        type: "mini-quiz",
        question: "The party is ___ Friday evening.",
        options: ["at", "on", "in", "by"],
        answer: "on",
        explanation: "Days of the week always use ON. 'Friday evening' together uses ON.",
      },
      {
        type: "rule",
        icon: "📍",
        title: "AT / ON / IN — Place",
        subtitle: "Place Prepositions",
        rule: [
          "AT  →  specific point or location",
          "ON  →  surface",
          "IN   →  enclosed space",
        ],
        tip: "💡 IN = inside. ON = touching a surface. AT = at a general location.",
        examples: [
          { sentence: "She is ____ home.", answer: "at", note: "location/point" },
          { sentence: "The book is ____ the table.", answer: "on", note: "surface" },
          { sentence: "He lives ____ Istanbul.", answer: "in", note: "city = enclosed space" },
          { sentence: "I'll meet you ____ the airport.", answer: "at", note: "specific point" },
        ],
      },
      {
        type: "mini-quiz",
        question: "The keys are ___ my bag.",
        options: ["at", "on", "in", "by"],
        answer: "in",
        explanation: "A bag is an enclosed space — use IN for things inside containers.",
      },
      {
        type: "rule",
        icon: "🔗",
        title: "BY / FOR / WITH",
        subtitle: "Other Key Prepositions",
        rule: [
          "BY   →  means, agent, or deadline",
          "FOR  →  purpose, duration, or recipient",
          "WITH →  accompaniment or instrument",
        ],
        tip: "💡 FOR answers 'why?' or 'how long?'. BY answers 'how?' or 'by when?'.",
        examples: [
          { sentence: "She travels ____ train.", answer: "by", note: "means of transport" },
          { sentence: "I've been waiting ____ two hours.", answer: "for", note: "duration" },
          { sentence: "He wrote it ____ a pencil.", answer: "with", note: "instrument" },
          { sentence: "Finish it ____ Friday.", answer: "by", note: "deadline" },
        ],
      },
      {
        type: "mini-quiz",
        question: "I bought this gift ___ my mother.",
        options: ["by", "for", "with", "at"],
        answer: "for",
        explanation: "FOR shows purpose or recipient — this gift is intended for my mother.",
      },
    ],
  },

  "modal-verbs": {
    name: "Modal Verbs",
    emoji: "⚙️",
    color: ["#34d399", "#059669"] as [string, string],
    level: "A2",
    intro: "Modal verbs change the meaning of the main verb — ability, permission, obligation, possibility. They never change form!",
    sections: [
      {
        type: "rule",
        icon: "💪",
        title: "CAN / COULD",
        subtitle: "Ability & Permission",
        rule: [
          "CAN   →  present ability or permission",
          "COULD →  past ability or polite request",
        ],
        tip: "💡 COULD is softer and more polite than CAN.",
        examples: [
          { sentence: "She ____ swim very fast.", answer: "can", note: "present ability" },
          { sentence: "He ____ speak French as a child.", answer: "could", note: "past ability" },
          { sentence: "____ you help me, please?", answer: "Could", note: "polite request" },
          { sentence: "You ____ leave early today.", answer: "can", note: "permission" },
        ],
      },
      {
        type: "mini-quiz",
        question: "Which is more polite?",
        options: ["Can you open the door?", "Could you open the door?", "Open the door!", "You open the door."],
        answer: "Could you open the door?",
        explanation: "COULD makes requests softer and more polite. It adds distance and courtesy.",
      },
      {
        type: "rule",
        icon: "⚠️",
        title: "MUST / SHOULD / OUGHT TO",
        subtitle: "Obligation & Advice",
        rule: [
          "MUST         →  strong obligation (no choice)",
          "SHOULD       →  advice or recommendation",
          "MUST NOT     →  forbidden",
          "DON'T HAVE TO →  not necessary (very different from must not!)",
        ],
        tip: "💡 MUST NOT = forbidden. DON'T HAVE TO = not necessary. These are opposites!",
        examples: [
          { sentence: "You ____ wear a seatbelt. (law)", answer: "must", note: "strong obligation" },
          { sentence: "You ____ study more.", answer: "should", note: "advice" },
          { sentence: "You ____ smoke here. (forbidden)", answer: "mustn't", note: "prohibition" },
          { sentence: "You ____ come if you're busy.", answer: "don't have to", note: "not necessary" },
        ],
      },
      {
        type: "mini-quiz",
        question: "You ___ pay — it's free! (not necessary)",
        options: ["must not", "should not", "don't have to", "cannot"],
        answer: "don't have to",
        explanation: "DON'T HAVE TO = not necessary. MUST NOT = forbidden/prohibited. These are opposites!",
      },
      {
        type: "rule",
        icon: "🎲",
        title: "MIGHT / MAY / WOULD",
        subtitle: "Possibility & Politeness",
        rule: [
          "MIGHT / MAY →  possibility (maybe true)",
          "WOULD       →  conditional, past habits, polite requests",
        ],
        tip: "💡 MIGHT is slightly less certain than MAY.",
        examples: [
          { sentence: "It ____ rain tomorrow.", answer: "might", note: "possibility ~50%" },
          { sentence: "She ____ be at the office.", answer: "may", note: "possibility" },
          { sentence: "I ____ love a coffee!", answer: "would", note: "polite request" },
          { sentence: "He ____ walk to school as a child.", answer: "would", note: "past habit" },
        ],
      },
      {
        type: "mini-quiz",
        question: "She's not answering — she ___ be busy.",
        options: ["will", "must", "might", "shall"],
        answer: "might",
        explanation: "MIGHT expresses possibility when we're not certain. We don't know for sure she's busy.",
      },
    ],
  },

  "conditionals": {
    name: "Conditionals",
    emoji: "🔀",
    color: ["#fbbf24", "#d97706"] as [string, string],
    level: "B1",
    intro: "Conditionals talk about results that depend on conditions. There are 4 types — each for a different situation!",
    sections: [
      {
        type: "rule",
        icon: "0️⃣",
        title: "Zero Conditional",
        subtitle: "Always True",
        rule: ["If + Present Simple,  Present Simple"],
        tip: "💡 Used for scientific facts and universal truths. You can swap IF for WHEN.",
        examples: [
          { sentence: "If you heat water to 100°C, it ____.", answer: "boils", note: "always true — science" },
          { sentence: "If it rains, the ground ____ wet.", answer: "gets", note: "always happens" },
          { sentence: "Plants die if they ____ water.", answer: "don't get", note: "fact" },
        ],
      },
      {
        type: "mini-quiz",
        question: "If you ___ water, it becomes ice. (Zero Conditional)",
        options: ["froze", "freeze", "will freeze", "would freeze"],
        answer: "freeze",
        explanation: "Zero conditional = If + Present Simple. It's always true — a scientific fact.",
      },
      {
        type: "rule",
        icon: "1️⃣",
        title: "First Conditional",
        subtitle: "Real Future",
        rule: ["If + Present Simple,  will + base verb"],
        tip: "💡 The situation is realistic and likely to happen. Never use 'will' in the if-clause!",
        examples: [
          { sentence: "If it rains tomorrow, I ____ stay home.", answer: "will", note: "likely future" },
          { sentence: "She ____ pass if she studies hard.", answer: "will", note: "realistic" },
          { sentence: "If you ____ late, call me.", answer: "are", note: "If + present (NOT will)" },
        ],
      },
      {
        type: "mini-quiz",
        question: "If I ___ time, I will call you. (First Conditional)",
        options: ["had", "have", "will have", "would have"],
        answer: "have",
        explanation: "First conditional: If + Present Simple (never 'will' in the if-clause!), will + base verb.",
      },
      {
        type: "rule",
        icon: "2️⃣",
        title: "Second Conditional",
        subtitle: "Unreal Present / Future",
        rule: ["If + Past Simple,  would + base verb"],
        tip: "💡 The situation is imaginary or unlikely. Use 'were' for all subjects (not 'was').",
        examples: [
          { sentence: "If I ____ rich, I would travel the world.", answer: "were", note: "imaginary — I'm not rich" },
          { sentence: "She would drive to work if she ____ a car.", answer: "had", note: "unreal — she doesn't" },
          { sentence: "What would you do if you ____ the lottery?", answer: "won", note: "hypothetical" },
        ],
      },
      {
        type: "mini-quiz",
        question: "If I ___ you, I would apologise.",
        options: ["am", "was", "were", "will be"],
        answer: "were",
        explanation: "Second conditional always uses 'were' for all subjects. This is a formal grammar rule.",
      },
      {
        type: "rule",
        icon: "3️⃣",
        title: "Third Conditional",
        subtitle: "Unreal Past",
        rule: ["If + Past Perfect,  would have + past participle"],
        tip: "💡 Imagining a different past. Often used for regrets.",
        examples: [
          { sentence: "If I ____ harder, I would have passed.", answer: "had studied", note: "regret — I didn't study" },
          { sentence: "She wouldn't have missed the train if she ____ earlier.", answer: "had left", note: "unreal past" },
        ],
      },
      {
        type: "mini-quiz",
        question: "If they ___ the map, they wouldn't have got lost.",
        options: ["checked", "had checked", "would check", "have checked"],
        answer: "had checked",
        explanation: "Third conditional: If + Past Perfect (had + V3). It's about an unreal situation in the past.",
      },
    ],
  },

  "passive-voice": {
    name: "Passive Voice",
    emoji: "🔄",
    color: ["#fb923c", "#ea580c"] as [string, string],
    level: "B1",
    intro: "Passive voice shifts the focus from WHO does the action to WHAT happens. The agent (doer) becomes optional!",
    sections: [
      {
        type: "rule",
        icon: "🔄",
        title: "How to Form Passive",
        subtitle: "The Core Formula",
        rule: ["Subject  +  BE (correct tense)  +  past participle (V3)"],
        tip: "💡 Active: 'Someone does something.' Passive: 'Something is done (by someone).'",
        examples: [
          { sentence: "People speak English worldwide.", answer: "English is spoken worldwide.", note: "present simple passive" },
          { sentence: "They built this bridge in 1990.", answer: "This bridge was built in 1990.", note: "past simple passive" },
          { sentence: "They will finish the project.", answer: "The project will be finished.", note: "future passive" },
        ],
        activePassive: true,
      },
      {
        type: "mini-quiz",
        question: "The Eiffel Tower ___ in 1889. (past simple passive)",
        options: ["built", "was built", "has built", "is built"],
        answer: "was built",
        explanation: "Past simple passive = was/were + past participle. The Eiffel Tower is the subject — it didn't build itself!",
      },
      {
        type: "rule",
        icon: "📋",
        title: "Passive in Different Tenses",
        subtitle: "BE Changes, V3 Stays",
        rule: ["Only the verb BE changes according to the tense.", "The past participle (V3) always stays the same."],
        tip: "💡 The BY phrase is optional — only add it when the agent is important or surprising.",
        examples: [
          { sentence: "Present Simple:", answer: "The windows are cleaned every week.", note: "are + V3" },
          { sentence: "Past Simple:", answer: "The cake was eaten by the children.", note: "was/were + V3" },
          { sentence: "Present Continuous:", answer: "The road is being repaired.", note: "is being + V3" },
          { sentence: "Present Perfect:", answer: "The report has been completed.", note: "has/have been + V3" },
          { sentence: "Future:", answer: "The project will be finished.", note: "will be + V3" },
        ],
        tenseTable: true,
      },
      {
        type: "mini-quiz",
        question: "The new iPhone ___ tomorrow. (future passive)",
        options: ["announces", "is announced", "will be announced", "has been announced"],
        answer: "will be announced",
        explanation: "Future passive = will be + past participle. Focus is on the announcement, not who announces it.",
      },
      {
        type: "rule",
        icon: "💡",
        title: "When to Use Passive",
        subtitle: "Context Matters",
        rule: [
          "Use passive when the agent is unknown.",
          "Use passive when the agent is obvious or unimportant.",
          "Passive is common in formal and academic writing.",
        ],
        tip: "💡 'My wallet was stolen' — we don't know who stole it. Passive is perfect here.",
        examples: [
          { sentence: "My phone was stolen.", answer: "—", note: "unknown agent" },
          { sentence: "The results will be published next week.", answer: "—", note: "who publishes = unimportant" },
          { sentence: "Mistakes were made.", answer: "—", note: "formal — agent not mentioned" },
        ],
        noAnswer: true,
      },
      {
        type: "mini-quiz",
        question: "The experiment ___ three times before the results were confirmed.",
        options: ["repeated", "was repeating", "was repeated", "has repeated"],
        answer: "was repeated",
        explanation: "Past simple passive = was/were + V3. The focus is on the experiment, not who repeated it.",
      },
    ],
  },

  "reported-speech": {
    name: "Reported Speech",
    emoji: "💬",
    color: ["#a855f7", "#7c3aed"] as [string, string],
    level: "B2",
    intro: "Reported speech tells us what someone said — without quoting them directly. Tenses shift back, pronouns change!",
    sections: [
      {
        type: "rule",
        icon: "⏪",
        title: "Tense Backshift",
        subtitle: "Tenses Move Back in Time",
        rule: [
          "Present Simple   →  Past Simple",
          "Past Simple       →  Past Perfect",
          "Will               →  Would",
          "Can               →  Could",
        ],
        tip: "💡 Imagine the tense 'falling back' one step into the past.",
        examples: [
          { sentence: "'I am tired.' → She said she ____ tired.", answer: "was", note: "am → was" },
          { sentence: "'I will help.' → He said he ____ help.", answer: "would", note: "will → would" },
          { sentence: "'I can swim.' → She said she ____ swim.", answer: "could", note: "can → could" },
          { sentence: "'I have finished.' → He said he ____ finished.", answer: "had", note: "have → had" },
        ],
      },
      {
        type: "mini-quiz",
        question: "Direct: 'I am leaving.' → She said she ___ leaving.",
        options: ["is", "was", "were", "has been"],
        answer: "was",
        explanation: "Tense backshift: present continuous (am leaving) → past continuous (was leaving).",
      },
      {
        type: "rule",
        icon: "❓",
        title: "Reporting Questions",
        subtitle: "Word Order Changes!",
        rule: [
          "Yes/No questions → use if / whether",
          "Wh-questions → use the question word",
          "NO inversion in reported questions!",
        ],
        tip: "💡 Reported questions use statement word order: She asked where I LIVED (not 'where did I live').",
        examples: [
          { sentence: "'Are you coming?' → He asked ____ I was coming.", answer: "if", note: "yes/no → if/whether" },
          { sentence: "'Where do you live?' → She asked where I ____.", answer: "lived", note: "no inversion!" },
          { sentence: "'What time is it?' → He asked what time ____.", answer: "it was", note: "statement order" },
        ],
      },
      {
        type: "mini-quiz",
        question: "'Do you like coffee?' → She asked me ___ I liked coffee.",
        options: ["that", "if", "what", "which"],
        answer: "if",
        explanation: "Yes/No questions in reported speech use IF or WHETHER, not question marks or inversions.",
      },
      {
        type: "rule",
        icon: "📢",
        title: "Reporting Commands",
        subtitle: "Tell / Ask + to-infinitive",
        rule: [
          "Commands → tell/ask + object + to-infinitive",
          "Negative commands → tell/ask + object + NOT to-infinitive",
        ],
        tip: "💡 The direct speech verb becomes TO + base verb.",
        examples: [
          { sentence: "'Close the door!' → She told him ____ the door.", answer: "to close", note: "tell + obj + to-inf" },
          { sentence: "'Please help me.' → He asked her ____ him.", answer: "to help", note: "polite request" },
          { sentence: "'Don't be late!' → She told us ____ late.", answer: "not to be", note: "negative command" },
        ],
      },
      {
        type: "mini-quiz",
        question: "'Sit down!' → The teacher told the students ___ down.",
        options: ["sit", "to sit", "that sit", "sitting"],
        answer: "to sit",
        explanation: "Commands in reported speech: tell/ask + object + TO + base verb.",
      },
    ],
  },

  "comparatives": {
    name: "Comparatives & Superlatives",
    emoji: "📊",
    color: ["#f87171", "#dc2626"] as [string, string],
    level: "A2",
    intro: "Compare things, people, and places using comparatives (better than) and superlatives (the best). Easy patterns, a few irregulars!",
    sections: [
      {
        type: "rule",
        icon: "⚖️",
        title: "Comparative Adjectives",
        subtitle: "Comparing Two Things",
        rule: [
          "Short adjectives (1-2 syllables)  →  adjective + ER + THAN",
          "Long adjectives (3+ syllables)    →  MORE + adjective + THAN",
          "Irregular: good → better,  bad → worse,  far → farther",
        ],
        tip: "💡 Spelling rules: big → bigger,  happy → happier,  large → larger.",
        examples: [
          { sentence: "She is ____ than her brother. (tall)", answer: "taller", note: "short adj: +er" },
          { sentence: "This film is ____ than that one. (interesting)", answer: "more interesting", note: "long adj: more" },
          { sentence: "He is ____ at maths than me. (good)", answer: "better", note: "irregular!" },
          { sentence: "Today is ____ than yesterday. (bad)", answer: "worse", note: "irregular!" },
        ],
      },
      {
        type: "mini-quiz",
        question: "My new phone is ___ than my old one. (expensive)",
        options: ["more expensive", "expensiver", "most expensive", "expensivest"],
        answer: "more expensive",
        explanation: "'Expensive' has 3 syllables — always use MORE for long adjectives. Never add -er to long words.",
      },
      {
        type: "rule",
        icon: "🥇",
        title: "Superlative Adjectives",
        subtitle: "The Best of All",
        rule: [
          "Short adjectives  →  THE + adjective + EST",
          "Long adjectives   →  THE MOST + adjective",
          "Irregular: good → the best,  bad → the worst",
        ],
        tip: "💡 Always use THE before superlatives.",
        examples: [
          { sentence: "She is ____ in the class. (tall)", answer: "the tallest", note: "short: the + -est" },
          { sentence: "This is ____ hotel in the city. (expensive)", answer: "the most expensive", note: "long: the most" },
          { sentence: "He is ____ player on the team. (good)", answer: "the best", note: "irregular!" },
        ],
      },
      {
        type: "mini-quiz",
        question: "Mount Everest is ___ mountain in the world. (high)",
        options: ["higher", "the higher", "the highest", "most high"],
        answer: "the highest",
        explanation: "Superlative of short adjective 'high' = THE highest. Always use THE with superlatives.",
      },
      {
        type: "rule",
        icon: "🟰",
        title: "AS...AS Comparisons",
        subtitle: "Equal or Unequal",
        rule: [
          "AS + adjective + AS  =  equal (same level)",
          "NOT AS + adjective + AS  =  unequal (less than)",
        ],
        tip: "💡 AS...AS means the same level. NOT AS...AS means less.",
        examples: [
          { sentence: "She is ____ her sister. (tall, equal)", answer: "as tall as", note: "same height" },
          { sentence: "This book is ____ that one. (interesting, less)", answer: "not as interesting as", note: "less interesting" },
          { sentence: "He runs ____ a cheetah. (fast, equal)", answer: "as fast as", note: "same speed" },
        ],
      },
      {
        type: "mini-quiz",
        question: "The red car is ___ the blue car. (same price)",
        options: ["more expensive than", "as expensive as", "the most expensive", "not as expensive as"],
        answer: "as expensive as",
        explanation: "Same price = equal → AS expensive AS. If one cost more, use 'more expensive than'.",
      },
    ],
  },

  "phrasal-verbs": {
    name: "Phrasal Verbs",
    emoji: "🔗",
    color: ["#e879f9", "#a21caf"] as [string, string],
    level: "B2",
    intro: "Phrasal verbs = verb + particle. The meaning is often completely different from the individual words. They're everywhere in natural English!",
    sections: [
      {
        type: "rule",
        icon: "🤔",
        title: "What Are Phrasal Verbs?",
        subtitle: "Verb + Particle = New Meaning",
        rule: [
          "A phrasal verb = verb + preposition or adverb.",
          "The new meaning is often idiomatic — different from the individual words.",
          "They must be memorised in context.",
        ],
        tip: "💡 'Give up' ≠ give + up. It means QUIT. Context and memorisation are key!",
        examples: [
          { sentence: "She ____ smoking last year. (quit)", answer: "gave up", note: "give up = quit" },
          { sentence: "I ____ an old friend at the market. (met by chance)", answer: "ran into", note: "run into = meet accidentally" },
          { sentence: "Can you ____ my sister? (take care of)", answer: "look after", note: "look after = take care of" },
          { sentence: "Please ____ the lights when you leave. (switch off)", answer: "turn off", note: "turn off = switch off" },
        ],
      },
      {
        type: "mini-quiz",
        question: "She ___ a great opportunity. (refused/rejected)",
        options: ["turned up", "turned off", "turned down", "turned on"],
        answer: "turned down",
        explanation: "TURN DOWN = reject or refuse an offer. Don't confuse with turn off (switch off) or turn up (arrive/increase).",
      },
      {
        type: "rule",
        icon: "✂️",
        title: "Separable Phrasal Verbs",
        subtitle: "Can Split the Object",
        rule: [
          "Object can go BETWEEN verb and particle, OR after particle.",
          "BUT: if the object is a pronoun (it/them/him/her), it MUST go in the middle.",
        ],
        tip: "💡 If you can move the object → separable. Pronouns MUST be in the middle.",
        examples: [
          { sentence: "Turn off the lights. ✓", answer: "Turn the lights off. ✓", note: "both positions work" },
          { sentence: "Turn them off. ✓", answer: "NOT: Turn off them. ✗", note: "pronoun MUST be in middle" },
          { sentence: "Pick up the bag. ✓", answer: "Pick it up. ✓  NOT: Pick up it. ✗", note: "separable" },
        ],
        activePassive: true,
      },
      {
        type: "mini-quiz",
        question: "The music is too loud — can you ___ ? (use a pronoun)",
        options: ["turn down it", "turn it down", "turn down them", "down turn it"],
        answer: "turn it down",
        explanation: "When using a pronoun (it), it MUST go between the verb and particle. NEVER after the particle.",
      },
      {
        type: "rule",
        icon: "🔒",
        title: "Inseparable Phrasal Verbs",
        subtitle: "Object Always Comes After",
        rule: [
          "The object MUST come after the particle.",
          "The verb and particle cannot be separated — ever.",
        ],
        tip: "💡 These are usually intransitive or have prepositions that don't separate.",
        examples: [
          { sentence: "Look after your brother. ✓", answer: "NOT: Look your brother after. ✗", note: "inseparable" },
          { sentence: "She ran into her teacher. ✓", answer: "NOT: She ran her teacher into. ✗", note: "inseparable" },
          { sentence: "I came across an old photo. ✓", answer: "NOT: I came an old photo across. ✗", note: "inseparable" },
        ],
        activePassive: true,
      },
      {
        type: "mini-quiz",
        question: "Which sentence is correct? (look after = inseparable)",
        options: [
          "She looks her children after.",
          "She looks after her children.",
          "She looks them after.",
          "After her children she looks.",
        ],
        answer: "She looks after her children.",
        explanation: "LOOK AFTER is inseparable — the object always comes after the complete phrasal verb.",
      },
    ],
  },
};

// ── Mini Quiz ─────────────────────────────────────────────────────────────────

function MiniQuiz({ section, color }: { section: any; color: [string, string] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (opt: string) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
  };

  const isCorrect = selected === section.answer;

  return (
    <View style={quizStyles.container}>
      <Text style={quizStyles.badge}>⚡ Quick Check</Text>
      <Text style={quizStyles.question}>{section.question}</Text>
      <View style={quizStyles.options}>
        {section.options.map((opt: string, i: number) => {
          let bg = "rgba(255,255,255,0.1)";
          let border = "rgba(255,255,255,0.2)";
          let textColor = "rgba(255,255,255,0.85)";
          if (answered && opt === section.answer) {
            bg = "rgba(52,211,153,0.25)"; border = "#34d399"; textColor = "#34d399";
          } else if (answered && opt === selected && !isCorrect) {
            bg = "rgba(248,113,113,0.25)"; border = "#f87171"; textColor = "#f87171";
          }
          return (
            <TouchableOpacity
              key={i}
              style={[quizStyles.optionBtn, { backgroundColor: bg, borderColor: border }]}
              onPress={() => handleSelect(opt)}
            >
              <Text style={[quizStyles.optionText, { color: textColor }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {answered && (
        <View style={[quizStyles.feedback, isCorrect ? quizStyles.feedbackCorrect : quizStyles.feedbackWrong]}>
          <Text style={quizStyles.feedbackIcon}>{isCorrect ? "✅" : "💡"}</Text>
          <Text style={quizStyles.feedbackText}>{section.explanation}</Text>
        </View>
      )}
    </View>
  );
}

const quizStyles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  badge: {
    color: "#fbbf24",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 10,
  },
  question: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
    marginBottom: 14,
  },
  options: { gap: 8 },
  optionBtn: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  feedback: {
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    gap: 8,
  },
  feedbackCorrect: { backgroundColor: "rgba(52,211,153,0.15)" },
  feedbackWrong: { backgroundColor: "rgba(251,191,36,0.15)" },
  feedbackIcon: { fontSize: 16 },
  feedbackText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
});

// ── Rule Card ─────────────────────────────────────────────────────────────────

function RuleCard({ section }: { section: any }) {
  // rule her zaman string[] — her eleman ayrı satırda gösterilir
  const ruleLines: string[] = Array.isArray(section.rule) ? section.rule : [section.rule];

  return (
    <View style={ruleStyles.container}>
      <View style={ruleStyles.header}>
        <Text style={ruleStyles.icon}>{section.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={ruleStyles.title}>{section.title}</Text>
          <Text style={ruleStyles.subtitle}>{section.subtitle}</Text>
        </View>
      </View>

      {/* Kural kutusu — her satır ayrı */}
      <View style={ruleStyles.ruleBox}>
        {ruleLines.map((line, i) => (
          <Text key={i} style={[ruleStyles.ruleText, i > 0 && { marginTop: 6 }]}>
            {line}
          </Text>
        ))}
      </View>

      {section.tip && (
        <Text style={ruleStyles.tip}>{section.tip}</Text>
      )}

      {/* Örnekler */}
      <View style={ruleStyles.examples}>
        {section.examples.map((ex: any, i: number) => {
          // Passive voice / phrasal verbs için aktif→pasif layout
          if (section.activePassive || section.tenseTable) {
            return (
              <View key={i} style={ruleStyles.exampleBlock}>
                {section.tenseTable ? (
                  // Tense tablosu: sol = zaman adı, sağ = cümle
                  <View>
                    <Text style={ruleStyles.exampleLabel}>{ex.sentence}</Text>
                    <Text style={ruleStyles.exampleMain}>{ex.answer}</Text>
                    <Text style={ruleStyles.exampleNote}>→ {ex.note}</Text>
                  </View>
                ) : (
                  // Aktif → Pasif karşılaştırma
                  <View>
                    <Text style={ruleStyles.exampleActive}>{ex.sentence}</Text>
                    <Text style={ruleStyles.examplePassive}>{ex.answer}</Text>
                    <Text style={ruleStyles.exampleNote}>→ {ex.note}</Text>
                  </View>
                )}
              </View>
            );
          }

          // noAnswer: sadece cümle ve not
          if (section.noAnswer) {
            return (
              <View key={i} style={ruleStyles.exampleRow}>
                <View style={ruleStyles.exampleLeft}>
                  <Text style={ruleStyles.exampleSentence}>{ex.sentence}</Text>
                  {ex.note && <Text style={ruleStyles.exampleNote}>→ {ex.note}</Text>}
                </View>
              </View>
            );
          }

          // Normal: cümle + cevap badge
          return (
            <View key={i} style={ruleStyles.exampleRow}>
              <View style={ruleStyles.exampleLeft}>
                <Text style={ruleStyles.exampleSentence}>{ex.sentence}</Text>
                {ex.note && <Text style={ruleStyles.exampleNote}>→ {ex.note}</Text>}
              </View>
              <View style={ruleStyles.answerBadge}>
                <Text style={ruleStyles.answerText}>{ex.answer}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const ruleStyles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  icon: { fontSize: 28 },
  title: {
    color: "white",
    fontSize: 17,
    fontWeight: "900",
  },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600",
  },
  ruleBox: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "rgba(255,255,255,0.5)",
  },
  ruleText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 22,
  },
  tip: {
    color: "#fbbf24",
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 20,
  },
  examples: { gap: 10 },
  exampleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: 10,
  },
  exampleLeft: { flex: 1 },
  exampleSentence: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    lineHeight: 20,
  },
  exampleBlock: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: 10,
  },
  exampleLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  exampleActive: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 4,
  },
  exampleMain: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 20,
    marginBottom: 2,
  },
  examplePassive: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 20,
    marginBottom: 2,
  },
  exampleNote: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    marginTop: 2,
    fontStyle: "italic",
  },
  answerBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  answerText: {
    color: "white",
    fontSize: 12,
    fontWeight: "800",
  },
});

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function GrammarTopicScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const topicId = params.topicId as string;
  const topic = topicDetails[topicId];

  if (!topic) return null;

  return (
    <LinearGradient colors={["#f953c6", "#b91d73", "#7c3aed", "#60a5fa"]} style={styles.container}>
      <View style={styles.blobTop} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <Text style={styles.topicEmoji}>{topic.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{topic.name}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{topic.level}</Text>
              </View>
            </View>
            <Text style={styles.intro}>{topic.intro}</Text>
          </View>
        </View>

        {topic.sections.map((section: any, i: number) => {
          if (section.type === "mini-quiz") {
            return <MiniQuiz key={i} section={section} color={topic.color} />;
          }
          return <RuleCard key={i} section={section} />;
        })}

        <TouchableOpacity
          style={styles.quizBtn}
          onPress={() => router.push(`/modules/grammar/quiz/${topicId}` as any)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={topic.color}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quizBtnGradient}
          >
            <Text style={styles.quizBtnText}>Start Full Quiz 🚀</Text>
            <Text style={styles.quizBtnSub}>15 questions • AI-powered</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blobTop: {
    position: "absolute",
    top: -80,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(236,72,153,0.5)",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },
  backBtn: { marginBottom: 20 },
  backText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    fontWeight: "600",
  },
  headerRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 28,
    alignItems: "flex-start",
  },
  topicEmoji: {
    fontSize: 44,
    marginTop: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "white",
  },
  levelBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  levelBadgeText: {
    color: "white",
    fontWeight: "700",
    fontSize: 12,
  },
  intro: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 22,
  },
  quizBtn: {
    marginTop: 8,
    borderRadius: 20,
    overflow: "hidden",
  },
  quizBtnGradient: {
    padding: 20,
    alignItems: "center",
    borderRadius: 20,
  },
  quizBtnText: {
    fontSize: 20,
    fontWeight: "900",
    color: "white",
    marginBottom: 4,
  },
  quizBtnSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
});