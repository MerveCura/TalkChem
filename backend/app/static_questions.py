# Her tense için önceden hazırlanmış 5 statik soru
# Bu sorular quiz açılınca anında gösterilir — OpenAI beklenmez
# Kullanıcı bu soruları çözerken arka planda GPT sonraki batch'i üretir

STATIC_QUESTIONS: dict[str, list] = {

    "present-simple": [
        {
            "id": "ps-1", "type": "multiple_choice",
            "question": "She ___ to work every day by bus.",
            "options": ["go", "goes", "going", "gone"],
            "correct_answer": "goes",
            "explanation": "Third person singular (she/he/it) takes 's' in Present Simple.",
            "difficulty": "easy"
        },
        {
            "id": "ps-2", "type": "multiple_choice",
            "question": "Which sentence is in the Present Simple tense?",
            "options": ["She is reading a book.", "She reads a book every night.", "She read a book yesterday.", "She will read a book."],
            "correct_answer": "She reads a book every night.",
            "explanation": "Present Simple expresses habits and routines.",
            "difficulty": "easy"
        },
        {
            "id": "ps-3", "type": "multiple_choice",
            "question": "They ___ not like spicy food.",
            "options": ["does", "do", "did", "are"],
            "correct_answer": "do",
            "explanation": "With 'they', we use 'do not' for negation in Present Simple.",
            "difficulty": "easy"
        },
        {
            "id": "ps-4", "type": "multiple_choice",
            "question": "___ he speak French fluently?",
            "options": ["Do", "Does", "Is", "Did"],
            "correct_answer": "Does",
            "explanation": "Questions with he/she/it use 'Does' in Present Simple.",
            "difficulty": "medium"
        },
        {
            "id": "ps-5", "type": "multiple_choice",
            "question": "Water ___ at 100 degrees Celsius.",
            "options": ["boil", "boils", "is boiling", "boiled"],
            "correct_answer": "boils",
            "explanation": "General truths and facts use Present Simple.",
            "difficulty": "medium"
        },
    ],

    "present-continuous": [
        {
            "id": "pc-1", "type": "multiple_choice",
            "question": "She ___ a book right now.",
            "options": ["reads", "read", "is reading", "has read"],
            "correct_answer": "is reading",
            "explanation": "Present Continuous uses 'is/am/are + V-ing' for actions happening now.",
            "difficulty": "easy"
        },
        {
            "id": "pc-2", "type": "multiple_choice",
            "question": "They ___ football at the moment.",
            "options": ["play", "played", "are playing", "have played"],
            "correct_answer": "are playing",
            "explanation": "Present Continuous with 'they' uses 'are + V-ing'.",
            "difficulty": "easy"
        },
        {
            "id": "pc-3", "type": "multiple_choice",
            "question": "Why ___ you wearing a coat? It's not cold.",
            "options": ["do", "did", "are", "have"],
            "correct_answer": "are",
            "explanation": "Questions in Present Continuous use 'am/is/are + subject + V-ing'.",
            "difficulty": "medium"
        },
        {
            "id": "pc-4", "type": "multiple_choice",
            "question": "I ___ to music while I study.",
            "options": ["am always listening", "always listen", "always listened", "have always listened"],
            "correct_answer": "always listen",
            "explanation": "Habits with frequency adverbs use Present Simple, not Continuous.",
            "difficulty": "medium"
        },
        {
            "id": "pc-5", "type": "multiple_choice",
            "question": "We ___ a new project this week.",
            "options": ["work on", "worked on", "are working on", "have worked on"],
            "correct_answer": "are working on",
            "explanation": "Temporary activities around the present time use Present Continuous.",
            "difficulty": "medium"
        },
    ],

    "present-perfect": [
        {
            "id": "pp-1", "type": "multiple_choice",
            "question": "She ___ never been to Japan.",
            "options": ["is", "was", "has", "had"],
            "correct_answer": "has",
            "explanation": "Present Perfect uses 'have/has + past participle'.",
            "difficulty": "easy"
        },
        {
            "id": "pp-2", "type": "multiple_choice",
            "question": "I ___ just finished my homework.",
            "options": ["have", "had", "am", "was"],
            "correct_answer": "have",
            "explanation": "'Just' with Present Perfect means a very recent action.",
            "difficulty": "easy"
        },
        {
            "id": "pp-3", "type": "multiple_choice",
            "question": "They ___ lived here since 2010.",
            "options": ["are", "were", "have", "had"],
            "correct_answer": "have",
            "explanation": "'Since' with Present Perfect shows duration from a point in time.",
            "difficulty": "medium"
        },
        {
            "id": "pp-4", "type": "multiple_choice",
            "question": "Have you ever ___ sushi?",
            "options": ["eat", "ate", "eaten", "eating"],
            "correct_answer": "eaten",
            "explanation": "Present Perfect uses the past participle form of the verb.",
            "difficulty": "medium"
        },
        {
            "id": "pp-5", "type": "multiple_choice",
            "question": "She ___ already seen that film twice.",
            "options": ["is", "was", "has", "had"],
            "correct_answer": "has",
            "explanation": "'Already' is commonly used with Present Perfect.",
            "difficulty": "medium"
        },
    ],

    "present-perfect-continuous": [
        {
            "id": "ppc-1", "type": "multiple_choice",
            "question": "I ___ waiting for you for an hour.",
            "options": ["am", "was", "have been", "had been"],
            "correct_answer": "have been",
            "explanation": "Present Perfect Continuous uses 'have/has been + V-ing'.",
            "difficulty": "easy"
        },
        {
            "id": "ppc-2", "type": "multiple_choice",
            "question": "She ___ studying all morning.",
            "options": ["is", "was", "has been", "had been"],
            "correct_answer": "has been",
            "explanation": "Present Perfect Continuous shows an ongoing activity that started in the past.",
            "difficulty": "easy"
        },
        {
            "id": "ppc-3", "type": "multiple_choice",
            "question": "How long ___ you been learning English?",
            "options": ["do", "did", "have", "had"],
            "correct_answer": "have",
            "explanation": "'How long' questions use Present Perfect Continuous.",
            "difficulty": "medium"
        },
        {
            "id": "ppc-4", "type": "multiple_choice",
            "question": "They ___ working on this project since January.",
            "options": ["are", "were", "have been", "had been"],
            "correct_answer": "have been",
            "explanation": "'Since' with Present Perfect Continuous shows the starting point.",
            "difficulty": "medium"
        },
        {
            "id": "ppc-5", "type": "multiple_choice",
            "question": "He looks tired. He ___ running.",
            "options": ["is", "was", "has been", "had been"],
            "correct_answer": "has been",
            "explanation": "Present Perfect Continuous explains a present result of a past activity.",
            "difficulty": "medium"
        },
    ],

    "past-simple": [
        {
            "id": "pasts-1", "type": "multiple_choice",
            "question": "She ___ her homework before dinner last night.",
            "options": ["finish", "finishes", "finished", "has finished"],
            "correct_answer": "finished",
            "explanation": "Past Simple uses the past form of the verb for completed actions.",
            "difficulty": "easy"
        },
        {
            "id": "pasts-2", "type": "multiple_choice",
            "question": "What is the past simple of 'go'?",
            "options": ["goed", "gone", "went", "going"],
            "correct_answer": "went",
            "explanation": "'Go' is an irregular verb. Its past simple form is 'went'.",
            "difficulty": "easy"
        },
        {
            "id": "pasts-3", "type": "multiple_choice",
            "question": "They ___ not arrive on time for the meeting.",
            "options": ["do", "does", "did", "have"],
            "correct_answer": "did",
            "explanation": "Past Simple negative uses 'did not + base form'.",
            "difficulty": "easy"
        },
        {
            "id": "pasts-4", "type": "multiple_choice",
            "question": "___ you see the game last night?",
            "options": ["Do", "Does", "Did", "Have"],
            "correct_answer": "Did",
            "explanation": "Past Simple questions use 'Did + subject + base form'.",
            "difficulty": "medium"
        },
        {
            "id": "pasts-5", "type": "multiple_choice",
            "question": "She ___ in London for three years before moving to Paris.",
            "options": ["lives", "is living", "lived", "has lived"],
            "correct_answer": "lived",
            "explanation": "Past Simple is used for completed actions in the past.",
            "difficulty": "medium"
        },
    ],

    "past-continuous": [
        {
            "id": "pastc-1", "type": "multiple_choice",
            "question": "I ___ TV when she called.",
            "options": ["watched", "watch", "was watching", "have watched"],
            "correct_answer": "was watching",
            "explanation": "Past Continuous uses 'was/were + V-ing' for actions in progress in the past.",
            "difficulty": "easy"
        },
        {
            "id": "pastc-2", "type": "multiple_choice",
            "question": "They ___ dinner at 8 o'clock last night.",
            "options": ["eat", "ate", "were eating", "have eaten"],
            "correct_answer": "were eating",
            "explanation": "Past Continuous describes an ongoing action at a specific time in the past.",
            "difficulty": "easy"
        },
        {
            "id": "pastc-3", "type": "multiple_choice",
            "question": "While she ___ a shower, the phone rang.",
            "options": ["takes", "took", "was taking", "has taken"],
            "correct_answer": "was taking",
            "explanation": "Past Continuous shows a background action interrupted by Past Simple.",
            "difficulty": "medium"
        },
        {
            "id": "pastc-4", "type": "multiple_choice",
            "question": "What ___ you doing at midnight?",
            "options": ["do", "did", "were", "are"],
            "correct_answer": "were",
            "explanation": "Past Continuous questions use 'was/were + subject + V-ing'.",
            "difficulty": "medium"
        },
        {
            "id": "pastc-5", "type": "multiple_choice",
            "question": "It ___ raining when I left the house.",
            "options": ["rained", "rains", "was raining", "has rained"],
            "correct_answer": "was raining",
            "explanation": "Past Continuous describes weather or background situations in the past.",
            "difficulty": "medium"
        },
    ],

    "past-perfect": [
        {
            "id": "pastp-1", "type": "multiple_choice",
            "question": "By the time I arrived, she ___ already left.",
            "options": ["has", "have", "had", "was"],
            "correct_answer": "had",
            "explanation": "Past Perfect uses 'had + past participle' for actions completed before another past action.",
            "difficulty": "medium"
        },
        {
            "id": "pastp-2", "type": "multiple_choice",
            "question": "She ___ never seen snow before she moved to Canada.",
            "options": ["has", "have", "had", "was"],
            "correct_answer": "had",
            "explanation": "Past Perfect shows an experience that had not happened before a past point.",
            "difficulty": "medium"
        },
        {
            "id": "pastp-3", "type": "multiple_choice",
            "question": "After they ___ eaten dinner, they watched a film.",
            "options": ["have", "had", "has", "were"],
            "correct_answer": "had",
            "explanation": "Past Perfect is used for the first of two past actions.",
            "difficulty": "medium"
        },
        {
            "id": "pastp-4", "type": "multiple_choice",
            "question": "He was upset because he ___ lost his wallet.",
            "options": ["has", "have", "had", "was"],
            "correct_answer": "had",
            "explanation": "Past Perfect explains the reason for a past feeling or situation.",
            "difficulty": "medium"
        },
        {
            "id": "pastp-5", "type": "multiple_choice",
            "question": "___ she finished the report before the deadline?",
            "options": ["Has", "Have", "Had", "Was"],
            "correct_answer": "Had",
            "explanation": "Past Perfect questions use 'Had + subject + past participle'.",
            "difficulty": "hard"
        },
    ],

    "past-perfect-continuous": [
        {
            "id": "pastpc-1", "type": "multiple_choice",
            "question": "She was tired because she ___ working all day.",
            "options": ["has been", "is", "had been", "was"],
            "correct_answer": "had been",
            "explanation": "Past Perfect Continuous uses 'had been + V-ing' for ongoing actions before a past point.",
            "difficulty": "medium"
        },
        {
            "id": "pastpc-2", "type": "multiple_choice",
            "question": "They ___ waiting for two hours when the bus finally arrived.",
            "options": ["have been", "are", "had been", "were"],
            "correct_answer": "had been",
            "explanation": "Past Perfect Continuous shows duration of an action before another past event.",
            "difficulty": "medium"
        },
        {
            "id": "pastpc-3", "type": "multiple_choice",
            "question": "How long ___ he been studying before he took the exam?",
            "options": ["has", "is", "had", "was"],
            "correct_answer": "had",
            "explanation": "'How long had + subject + been + V-ing' is the Past Perfect Continuous question form.",
            "difficulty": "hard"
        },
        {
            "id": "pastpc-4", "type": "multiple_choice",
            "question": "I could tell she ___ crying because her eyes were red.",
            "options": ["has been", "is", "had been", "was"],
            "correct_answer": "had been",
            "explanation": "Past Perfect Continuous explains a visible result of a past ongoing action.",
            "difficulty": "hard"
        },
        {
            "id": "pastpc-5", "type": "multiple_choice",
            "question": "Before the project was cancelled, they ___ working on it for months.",
            "options": ["have been", "are", "had been", "were"],
            "correct_answer": "had been",
            "explanation": "Past Perfect Continuous shows an ongoing action that was interrupted by another past event.",
            "difficulty": "hard"
        },
    ],

    "future-simple": [
        {
            "id": "fs-1", "type": "multiple_choice",
            "question": "I ___ help you with your homework.",
            "options": ["am", "was", "will", "have"],
            "correct_answer": "will",
            "explanation": "Future Simple uses 'will + base form' for predictions and promises.",
            "difficulty": "easy"
        },
        {
            "id": "fs-2", "type": "multiple_choice",
            "question": "She ___ not be at the party tonight.",
            "options": ["do", "does", "will", "is"],
            "correct_answer": "will",
            "explanation": "Future Simple negative uses 'will not (won't) + base form'.",
            "difficulty": "easy"
        },
        {
            "id": "fs-3", "type": "multiple_choice",
            "question": "___ you be at the meeting tomorrow?",
            "options": ["Do", "Are", "Will", "Have"],
            "correct_answer": "Will",
            "explanation": "Future Simple questions use 'Will + subject + base form'.",
            "difficulty": "easy"
        },
        {
            "id": "fs-4", "type": "multiple_choice",
            "question": "I think it ___ rain this afternoon.",
            "options": ["is", "was", "will", "has"],
            "correct_answer": "will",
            "explanation": "'Will' is used for predictions based on opinion or belief.",
            "difficulty": "medium"
        },
        {
            "id": "fs-5", "type": "multiple_choice",
            "question": "Don't worry, I ___ call you as soon as I arrive.",
            "options": ["am", "was", "will", "have"],
            "correct_answer": "will",
            "explanation": "'Will' is used for spontaneous decisions and promises.",
            "difficulty": "medium"
        },
    ],

    "future-continuous": [
        {
            "id": "fc-1", "type": "multiple_choice",
            "question": "At 8 pm tonight, I ___ watching the match.",
            "options": ["watch", "watched", "will be watching", "will watch"],
            "correct_answer": "will be watching",
            "explanation": "Future Continuous uses 'will be + V-ing' for actions in progress at a future time.",
            "difficulty": "medium"
        },
        {
            "id": "fc-2", "type": "multiple_choice",
            "question": "This time tomorrow, she ___ flying to New York.",
            "options": ["flies", "flew", "will be flying", "will fly"],
            "correct_answer": "will be flying",
            "explanation": "Future Continuous describes an ongoing action at a specific future moment.",
            "difficulty": "medium"
        },
        {
            "id": "fc-3", "type": "multiple_choice",
            "question": "___ you be using the car this evening?",
            "options": ["Do", "Are", "Will", "Have"],
            "correct_answer": "Will",
            "explanation": "Future Continuous questions use 'Will + subject + be + V-ing'.",
            "difficulty": "medium"
        },
        {
            "id": "fc-4", "type": "multiple_choice",
            "question": "By the time you get home, I ___ cooking dinner.",
            "options": ["will cook", "am cooking", "will be cooking", "cooked"],
            "correct_answer": "will be cooking",
            "explanation": "Future Continuous shows an action in progress at a future point.",
            "difficulty": "hard"
        },
        {
            "id": "fc-5", "type": "multiple_choice",
            "question": "Don't call me at noon. I ___ having lunch with clients.",
            "options": ["will have", "am having", "will be having", "have"],
            "correct_answer": "will be having",
            "explanation": "Future Continuous describes planned ongoing activities at a future time.",
            "difficulty": "hard"
        },
    ],

    "future-perfect": [
        {
            "id": "fp-1", "type": "multiple_choice",
            "question": "By next year, she ___ finished her degree.",
            "options": ["will finish", "will be finishing", "will have finished", "has finished"],
            "correct_answer": "will have finished",
            "explanation": "Future Perfect uses 'will have + past participle' for actions completed before a future point.",
            "difficulty": "hard"
        },
        {
            "id": "fp-2", "type": "multiple_choice",
            "question": "By the time you arrive, I ___ already cooked dinner.",
            "options": ["will cook", "am cooking", "will have cooked", "have cooked"],
            "correct_answer": "will have cooked",
            "explanation": "Future Perfect shows completion of an action before a future moment.",
            "difficulty": "hard"
        },
        {
            "id": "fp-3", "type": "multiple_choice",
            "question": "___ they have completed the project by Friday?",
            "options": ["Do", "Will", "Have", "Are"],
            "correct_answer": "Will",
            "explanation": "Future Perfect questions use 'Will + subject + have + past participle'.",
            "difficulty": "hard"
        },
        {
            "id": "fp-4", "type": "multiple_choice",
            "question": "He ___ worked here for 20 years by next month.",
            "options": ["will work", "is working", "will have worked", "has worked"],
            "correct_answer": "will have worked",
            "explanation": "Future Perfect with 'by' shows duration completed before a future time.",
            "difficulty": "hard"
        },
        {
            "id": "fp-5", "type": "multiple_choice",
            "question": "By 2030, scientists ___ found a cure for many diseases.",
            "options": ["find", "will find", "will have found", "have found"],
            "correct_answer": "will have found",
            "explanation": "Future Perfect describes expected achievements before a future deadline.",
            "difficulty": "hard"
        },
    ],

    "future-perfect-continuous": [
        {
            "id": "fpc-1", "type": "multiple_choice",
            "question": "By next month, I ___ been learning English for two years.",
            "options": ["will learn", "will be learning", "will have been learning", "have been learning"],
            "correct_answer": "will have been learning",
            "explanation": "Future Perfect Continuous uses 'will have been + V-ing' for duration up to a future point.",
            "difficulty": "hard"
        },
        {
            "id": "fpc-2", "type": "multiple_choice",
            "question": "By the time he retires, he ___ working for 40 years.",
            "options": ["will work", "will be working", "will have been working", "has worked"],
            "correct_answer": "will have been working",
            "explanation": "Future Perfect Continuous emphasises the duration of an ongoing activity.",
            "difficulty": "hard"
        },
        {
            "id": "fpc-3", "type": "multiple_choice",
            "question": "She ___ been running for three hours by the time she finishes the marathon.",
            "options": ["will have", "will be", "will have been", "has"],
            "correct_answer": "will have been",
            "explanation": "The auxiliary in Future Perfect Continuous is 'will have been + V-ing'.",
            "difficulty": "hard"
        },
        {
            "id": "fpc-4", "type": "multiple_choice",
            "question": "How long ___ you have been waiting by the time he arrives?",
            "options": ["do", "will", "have", "are"],
            "correct_answer": "will",
            "explanation": "Future Perfect Continuous questions use 'Will + subject + have been + V-ing'.",
            "difficulty": "hard"
        },
        {
            "id": "fpc-5", "type": "multiple_choice",
            "question": "By tomorrow morning, it ___ been raining for 24 hours.",
            "options": ["will rain", "will be raining", "will have been raining", "has rained"],
            "correct_answer": "will have been raining",
            "explanation": "Future Perfect Continuous shows continuous action completed before a future moment.",
            "difficulty": "hard"
        },
    ],
}


def get_static_questions(tense_id: str) -> list:
    # Verilen tense için statik soruları döner
    # Tense bulunamazsa boş liste döner — fallback tetiklenir
    return STATIC_QUESTIONS.get(tense_id, [])