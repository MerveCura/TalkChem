# Her kategori ve seviye için önceden hazırlanmış 3 statik kelime
# Bu kelimeler kategori açılınca anında gösterilir — OpenAI beklenmez
# Kullanıcı bu kelimeleri okurken arka planda DB'ye yeni kelimeler üretilir

STATIC_VOCABULARY: dict[str, dict[str, list]] = {

    "daily-life": {
        "A1": [
            {"id": "static-dl-a1-1", "word": "breakfast", "meaning": "the first meal of the day", "meaning_tr": "kahvaltı", "example_sentence": "I have breakfast at 7 every morning.", "pronunciation": "BREK-fuhst", "is_saved": False},
            {"id": "static-dl-a1-2", "word": "sleep", "meaning": "to rest with eyes closed", "meaning_tr": "uyumak", "example_sentence": "I sleep for eight hours every night.", "pronunciation": "sleep", "is_saved": False},
            {"id": "static-dl-a1-3", "word": "walk", "meaning": "to move on foot", "meaning_tr": "yürümek", "example_sentence": "She walks to school every day.", "pronunciation": "wawk", "is_saved": False},
        ],
        "A2": [
            {"id": "static-dl-a2-1", "word": "routine", "meaning": "a regular set of activities", "meaning_tr": "rutin", "example_sentence": "My morning routine takes about an hour.", "pronunciation": "roo-TEEN", "is_saved": False},
            {"id": "static-dl-a2-2", "word": "grocery", "meaning": "food and household items bought from a shop", "meaning_tr": "market alışverişi", "example_sentence": "I do my grocery shopping on Saturdays.", "pronunciation": "GROH-suh-ree", "is_saved": False},
            {"id": "static-dl-a2-3", "word": "chore", "meaning": "a regular household task", "meaning_tr": "ev işi", "example_sentence": "Washing dishes is my least favourite chore.", "pronunciation": "chor", "is_saved": False},
        ],
        "B1": [
            {"id": "static-dl-b1-1", "word": "commute", "meaning": "to travel regularly to and from work", "meaning_tr": "işe gidip gelmek", "example_sentence": "His daily commute takes about 45 minutes.", "pronunciation": "kuh-MYOOT", "is_saved": False},
            {"id": "static-dl-b1-2", "word": "budget", "meaning": "a plan for spending money", "meaning_tr": "bütçe", "example_sentence": "She tracks her monthly budget carefully.", "pronunciation": "BUH-jit", "is_saved": False},
            {"id": "static-dl-b1-3", "word": "appointment", "meaning": "a planned meeting at a specific time", "meaning_tr": "randevu", "example_sentence": "I have a doctor's appointment tomorrow.", "pronunciation": "uh-POINT-munt", "is_saved": False},
        ],
        "B2": [
            {"id": "static-dl-b2-1", "word": "multitask", "meaning": "to do several things at the same time", "meaning_tr": "çoklu görev yapmak", "example_sentence": "She can multitask efficiently at work.", "pronunciation": "MUL-tee-task", "is_saved": False},
            {"id": "static-dl-b2-2", "word": "procrastinate", "meaning": "to delay doing something", "meaning_tr": "ertelemek", "example_sentence": "He tends to procrastinate on important tasks.", "pronunciation": "proh-KRAS-tuh-nayt", "is_saved": False},
            {"id": "static-dl-b2-3", "word": "sustainable", "meaning": "able to be maintained over time without harm", "meaning_tr": "sürdürülebilir", "example_sentence": "They try to live a sustainable lifestyle.", "pronunciation": "suh-STAY-nuh-bul", "is_saved": False},
        ],
        "C1": [
            {"id": "static-dl-c1-1", "word": "meticulous", "meaning": "very careful and precise", "meaning_tr": "titiz, özenli", "example_sentence": "She is meticulous about her daily planning.", "pronunciation": "muh-TIK-yuh-lus", "is_saved": False},
            {"id": "static-dl-c1-2", "word": "pragmatic", "meaning": "dealing with things practically", "meaning_tr": "pragmatik, pratik düşünceli", "example_sentence": "He takes a pragmatic approach to daily challenges.", "pronunciation": "prag-MAT-ik", "is_saved": False},
            {"id": "static-dl-c1-3", "word": "frugal", "meaning": "careful with money and avoiding waste", "meaning_tr": "tutumlu", "example_sentence": "Living frugally helped her save significantly.", "pronunciation": "FROO-gul", "is_saved": False},
        ],
        "C2": [
            {"id": "static-dl-c2-1", "word": "quotidian", "meaning": "of or occurring every day; ordinary", "meaning_tr": "gündelik, sıradan", "example_sentence": "The quotidian tasks of life can feel monotonous.", "pronunciation": "kwoh-TID-ee-un", "is_saved": False},
            {"id": "static-dl-c2-2", "word": "mundane", "meaning": "lacking interest or excitement; ordinary", "meaning_tr": "sıradan, monoton", "example_sentence": "Even mundane tasks require attention to detail.", "pronunciation": "mun-DAYN", "is_saved": False},
            {"id": "static-dl-c2-3", "word": "alacrity", "meaning": "brisk and cheerful readiness", "meaning_tr": "isteklilik, çeviklik", "example_sentence": "She completed her morning routine with alacrity.", "pronunciation": "uh-LAK-ruh-tee", "is_saved": False},
        ],
    },

    "travel": {
        "A1": [
            {"id": "static-tr-a1-1", "word": "ticket", "meaning": "a document that allows entry or travel", "meaning_tr": "bilet", "example_sentence": "I bought a train ticket to Istanbul.", "pronunciation": "TIK-it", "is_saved": False},
            {"id": "static-tr-a1-2", "word": "hotel", "meaning": "a place where people pay to stay", "meaning_tr": "otel", "example_sentence": "We stayed in a nice hotel by the beach.", "pronunciation": "hoh-TEL", "is_saved": False},
            {"id": "static-tr-a1-3", "word": "passport", "meaning": "an official document for international travel", "meaning_tr": "pasaport", "example_sentence": "Don't forget your passport at the airport.", "pronunciation": "PAS-port", "is_saved": False},
        ],
        "A2": [
            {"id": "static-tr-a2-1", "word": "luggage", "meaning": "bags and suitcases for travel", "meaning_tr": "bagaj", "example_sentence": "Please put your luggage in the overhead compartment.", "pronunciation": "LUG-ij", "is_saved": False},
            {"id": "static-tr-a2-2", "word": "reservation", "meaning": "an arrangement to have something kept for you", "meaning_tr": "rezervasyon", "example_sentence": "I made a reservation at the restaurant.", "pronunciation": "rez-er-VAY-shun", "is_saved": False},
            {"id": "static-tr-a2-3", "word": "departure", "meaning": "the act of leaving a place", "meaning_tr": "kalkış", "example_sentence": "The departure time is at 6 AM.", "pronunciation": "dih-PAR-cher", "is_saved": False},
        ],
        "B1": [
            {"id": "static-tr-b1-1", "word": "itinerary", "meaning": "a planned route or journey", "meaning_tr": "seyahat planı", "example_sentence": "She prepared a detailed itinerary for the trip.", "pronunciation": "eye-TIN-uh-reh-ree", "is_saved": False},
            {"id": "static-tr-b1-2", "word": "customs", "meaning": "the official process of checking goods entering a country", "meaning_tr": "gümrük", "example_sentence": "We had to declare our items at customs.", "pronunciation": "KUS-tumz", "is_saved": False},
            {"id": "static-tr-b1-3", "word": "layover", "meaning": "a stop during a journey, especially a flight", "meaning_tr": "aktarma", "example_sentence": "We had a 3-hour layover in Dubai.", "pronunciation": "LAY-oh-ver", "is_saved": False},
        ],
        "B2": [
            {"id": "static-tr-b2-1", "word": "wanderlust", "meaning": "a strong desire to travel", "meaning_tr": "gezme arzusu", "example_sentence": "Her wanderlust took her to 30 countries.", "pronunciation": "WON-der-lust", "is_saved": False},
            {"id": "static-tr-b2-2", "word": "expedition", "meaning": "a journey for a specific purpose", "meaning_tr": "keşif gezisi", "example_sentence": "They went on an expedition to the Amazon.", "pronunciation": "ek-spuh-DISH-un", "is_saved": False},
            {"id": "static-tr-b2-3", "word": "immerse", "meaning": "to involve deeply in an experience", "meaning_tr": "dalmak, kendini kaptırmak", "example_sentence": "She immersed herself in the local culture.", "pronunciation": "ih-MURS", "is_saved": False},
        ],
        "C1": [
            {"id": "static-tr-c1-1", "word": "sojourn", "meaning": "a temporary stay", "meaning_tr": "geçici konaklama", "example_sentence": "His sojourn in Paris lasted three months.", "pronunciation": "SOH-jurn", "is_saved": False},
            {"id": "static-tr-c1-2", "word": "traverse", "meaning": "to travel across or through", "meaning_tr": "geçmek, kat etmek", "example_sentence": "They traversed the entire Silk Road.", "pronunciation": "TRAV-ers", "is_saved": False},
            {"id": "static-tr-c1-3", "word": "nomadic", "meaning": "moving from place to place", "meaning_tr": "göçebe", "example_sentence": "She led a nomadic lifestyle for years.", "pronunciation": "noh-MAD-ik", "is_saved": False},
        ],
        "C2": [
            {"id": "static-tr-c2-1", "word": "peregrination", "meaning": "a long journey, especially on foot", "meaning_tr": "uzun yolculuk", "example_sentence": "His peregrination across Asia took two years.", "pronunciation": "per-uh-gruh-NAY-shun", "is_saved": False},
            {"id": "static-tr-c2-2", "word": "peripatetic", "meaning": "travelling from place to place", "meaning_tr": "gezgin, bir yerde durmayan", "example_sentence": "Her peripatetic career took her across continents.", "pronunciation": "per-uh-puh-TET-ik", "is_saved": False},
            {"id": "static-tr-c2-3", "word": "itinerant", "meaning": "travelling from place to place for work", "meaning_tr": "gezici, seyyar", "example_sentence": "He worked as an itinerant musician.", "pronunciation": "eye-TIN-er-unt", "is_saved": False},
        ],
    },

    "technology": {
        "A1": [
            {"id": "static-tech-a1-1", "word": "phone", "meaning": "a device used to make calls", "meaning_tr": "telefon", "example_sentence": "I call my mom on the phone every day.", "pronunciation": "fohn", "is_saved": False},
            {"id": "static-tech-a1-2", "word": "computer", "meaning": "an electronic device for processing data", "meaning_tr": "bilgisayar", "example_sentence": "She uses a computer for her homework.", "pronunciation": "kum-PYOO-ter", "is_saved": False},
            {"id": "static-tech-a1-3", "word": "internet", "meaning": "a global network connecting computers", "meaning_tr": "internet", "example_sentence": "I use the internet to find information.", "pronunciation": "IN-ter-net", "is_saved": False},
        ],
        "A2": [
            {"id": "static-tech-a2-1", "word": "password", "meaning": "a secret word used to access something", "meaning_tr": "şifre", "example_sentence": "Always use a strong password for your accounts.", "pronunciation": "PAS-werd", "is_saved": False},
            {"id": "static-tech-a2-2", "word": "download", "meaning": "to copy data from the internet to a device", "meaning_tr": "indirmek", "example_sentence": "I downloaded the app on my phone.", "pronunciation": "DOWN-lohd", "is_saved": False},
            {"id": "static-tech-a2-3", "word": "update", "meaning": "to bring something to a more recent version", "meaning_tr": "güncellemek", "example_sentence": "Please update your software regularly.", "pronunciation": "UP-dayt", "is_saved": False},
        ],
        "B1": [
            {"id": "static-tech-b1-1", "word": "algorithm", "meaning": "a set of rules for solving a problem", "meaning_tr": "algoritma", "example_sentence": "The algorithm sorts the data automatically.", "pronunciation": "AL-go-rith-um", "is_saved": False},
            {"id": "static-tech-b1-2", "word": "encryption", "meaning": "converting data into a coded form", "meaning_tr": "şifreleme", "example_sentence": "Encryption keeps your messages private.", "pronunciation": "en-KRIP-shun", "is_saved": False},
            {"id": "static-tech-b1-3", "word": "bandwidth", "meaning": "the amount of data transferable in a given time", "meaning_tr": "bant genişliği", "example_sentence": "Streaming videos requires high bandwidth.", "pronunciation": "BAND-width", "is_saved": False},
        ],
        "B2": [
            {"id": "static-tech-b2-1", "word": "cybersecurity", "meaning": "protection of systems from digital attacks", "meaning_tr": "siber güvenlik", "example_sentence": "Cybersecurity is critical for businesses today.", "pronunciation": "SY-ber-suh-KYOOR-uh-tee", "is_saved": False},
            {"id": "static-tech-b2-2", "word": "artificial intelligence", "meaning": "machines simulating human thinking", "meaning_tr": "yapay zeka", "example_sentence": "Artificial intelligence is transforming industries.", "pronunciation": "ar-tuh-FISH-ul in-TEL-uh-juns", "is_saved": False},
            {"id": "static-tech-b2-3", "word": "infrastructure", "meaning": "basic systems and services of an organisation", "meaning_tr": "altyapı", "example_sentence": "The cloud infrastructure handles millions of users.", "pronunciation": "IN-fruh-struk-cher", "is_saved": False},
        ],
        "C1": [
            {"id": "static-tech-c1-1", "word": "latency", "meaning": "the delay before a transfer of data begins", "meaning_tr": "gecikme süresi", "example_sentence": "Low latency is essential for online gaming.", "pronunciation": "LAY-tun-see", "is_saved": False},
            {"id": "static-tech-c1-2", "word": "scalability", "meaning": "the ability to handle growth efficiently", "meaning_tr": "ölçeklenebilirlik", "example_sentence": "Scalability is a key design consideration.", "pronunciation": "skay-luh-BIL-uh-tee", "is_saved": False},
            {"id": "static-tech-c1-3", "word": "deprecate", "meaning": "to phase out a feature or technology", "meaning_tr": "kullanımdan kaldırmak", "example_sentence": "This API endpoint has been deprecated.", "pronunciation": "DEP-ruh-kayt", "is_saved": False},
        ],
        "C2": [
            {"id": "static-tech-c2-1", "word": "obfuscation", "meaning": "making something unclear or confusing", "meaning_tr": "karmaşıklaştırma, gizleme", "example_sentence": "Code obfuscation protects intellectual property.", "pronunciation": "ob-fus-KAY-shun", "is_saved": False},
            {"id": "static-tech-c2-2", "word": "interoperability", "meaning": "ability of systems to work together", "meaning_tr": "birlikte çalışabilirlik", "example_sentence": "Interoperability between platforms remains a challenge.", "pronunciation": "in-ter-op-er-uh-BIL-uh-tee", "is_saved": False},
            {"id": "static-tech-c2-3", "word": "deterministic", "meaning": "producing the same output for the same input", "meaning_tr": "deterministik, öngörülebilir", "example_sentence": "A deterministic algorithm always gives consistent results.", "pronunciation": "duh-TUR-muh-NIS-tik", "is_saved": False},
        ],
    },

    "food": {
        "A1": [
            {"id": "static-food-a1-1", "word": "bread", "meaning": "a baked food made from flour", "meaning_tr": "ekmek", "example_sentence": "I eat bread with butter every morning.", "pronunciation": "bred", "is_saved": False},
            {"id": "static-food-a1-2", "word": "water", "meaning": "a clear liquid we drink", "meaning_tr": "su", "example_sentence": "Drink plenty of water every day.", "pronunciation": "WAW-ter", "is_saved": False},
            {"id": "static-food-a1-3", "word": "cook", "meaning": "to prepare food using heat", "meaning_tr": "pişirmek", "example_sentence": "My mother cooks dinner every evening.", "pronunciation": "kook", "is_saved": False},
        ],
        "A2": [
            {"id": "static-food-a2-1", "word": "recipe", "meaning": "instructions for preparing a dish", "meaning_tr": "tarif", "example_sentence": "She followed a recipe from a cookbook.", "pronunciation": "RES-uh-pee", "is_saved": False},
            {"id": "static-food-a2-2", "word": "ingredient", "meaning": "a component used in cooking", "meaning_tr": "malzeme", "example_sentence": "Flour is an important ingredient in cake.", "pronunciation": "in-GREE-dee-unt", "is_saved": False},
            {"id": "static-food-a2-3", "word": "flavour", "meaning": "the taste of food or drink", "meaning_tr": "lezzet, tat", "example_sentence": "This soup has a rich flavour.", "pronunciation": "FLAY-ver", "is_saved": False},
        ],
        "B1": [
            {"id": "static-food-b1-1", "word": "cuisine", "meaning": "a style of cooking from a particular region", "meaning_tr": "mutfak (yemek kültürü)", "example_sentence": "Italian cuisine is popular worldwide.", "pronunciation": "kwi-ZEEN", "is_saved": False},
            {"id": "static-food-b1-2", "word": "marinate", "meaning": "to soak food in a seasoned liquid", "meaning_tr": "marine etmek", "example_sentence": "Marinate the chicken for at least two hours.", "pronunciation": "MAIR-uh-nayt", "is_saved": False},
            {"id": "static-food-b1-3", "word": "garnish", "meaning": "a decoration added to food", "meaning_tr": "süsleme, garnitür", "example_sentence": "She garnished the dish with fresh parsley.", "pronunciation": "GAR-nish", "is_saved": False},
        ],
        "B2": [
            {"id": "static-food-b2-1", "word": "fermentation", "meaning": "a process that converts sugars to acids or alcohol", "meaning_tr": "fermantasyon", "example_sentence": "Fermentation is essential in making bread and wine.", "pronunciation": "fur-men-TAY-shun", "is_saved": False},
            {"id": "static-food-b2-2", "word": "umami", "meaning": "a savoury taste sensation", "meaning_tr": "umami (beşinci tat)", "example_sentence": "Mushrooms have a strong umami flavour.", "pronunciation": "oo-MAH-mee", "is_saved": False},
            {"id": "static-food-b2-3", "word": "delicacy", "meaning": "a rare or expensive food", "meaning_tr": "lezzet, narin yemek", "example_sentence": "Caviar is considered a delicacy in many countries.", "pronunciation": "DEL-uh-kuh-see", "is_saved": False},
        ],
        "C1": [
            {"id": "static-food-c1-1", "word": "gastronomy", "meaning": "the art and science of good eating", "meaning_tr": "gastronomi", "example_sentence": "Paris is a world capital of gastronomy.", "pronunciation": "gas-TRON-uh-mee", "is_saved": False},
            {"id": "static-food-c1-2", "word": "piquant", "meaning": "having a pleasantly sharp or spicy taste", "meaning_tr": "acı, keskin lezzetli", "example_sentence": "The piquant sauce complemented the grilled fish.", "pronunciation": "PEE-kunt", "is_saved": False},
            {"id": "static-food-c1-3", "word": "delectable", "meaning": "extremely delicious", "meaning_tr": "son derece lezzetli", "example_sentence": "The chef prepared a delectable tasting menu.", "pronunciation": "dih-LEK-tuh-bul", "is_saved": False},
        ],
        "C2": [
            {"id": "static-food-c2-1", "word": "epicurean", "meaning": "relating to the enjoyment of fine food and drink", "meaning_tr": "yemek zevkine düşkün", "example_sentence": "She had epicurean tastes and dined at top restaurants.", "pronunciation": "ep-ih-KYOOR-ee-un", "is_saved": False},
            {"id": "static-food-c2-2", "word": "sapid", "meaning": "having a strong pleasant flavour", "meaning_tr": "lezzetli, tatı olan", "example_sentence": "The sapid broth warmed them on a cold evening.", "pronunciation": "SAP-id", "is_saved": False},
            {"id": "static-food-c2-3", "word": "comestible", "meaning": "fit to be eaten; edible", "meaning_tr": "yenilebilir", "example_sentence": "The market sold various comestibles.", "pronunciation": "kuh-MES-tuh-bul", "is_saved": False},
        ],
    },

    "business": {
        "A1": [
            {"id": "static-bus-a1-1", "word": "job", "meaning": "work done for payment", "meaning_tr": "iş", "example_sentence": "She has a job at a hospital.", "pronunciation": "job", "is_saved": False},
            {"id": "static-bus-a1-2", "word": "money", "meaning": "coins and notes used to buy things", "meaning_tr": "para", "example_sentence": "He earns good money at his new job.", "pronunciation": "MUN-ee", "is_saved": False},
            {"id": "static-bus-a1-3", "word": "office", "meaning": "a room where people work", "meaning_tr": "ofis", "example_sentence": "I work in a large office building.", "pronunciation": "AW-fis", "is_saved": False},
        ],
        "A2": [
            {"id": "static-bus-a2-1", "word": "meeting", "meaning": "a gathering of people for discussion", "meaning_tr": "toplantı", "example_sentence": "We have a meeting every Monday morning.", "pronunciation": "MEE-ting", "is_saved": False},
            {"id": "static-bus-a2-2", "word": "salary", "meaning": "regular payment for work", "meaning_tr": "maaş", "example_sentence": "His salary was increased this year.", "pronunciation": "SAL-uh-ree", "is_saved": False},
            {"id": "static-bus-a2-3", "word": "deadline", "meaning": "a time by which something must be done", "meaning_tr": "son teslim tarihi", "example_sentence": "The deadline for the report is Friday.", "pronunciation": "DED-lyne", "is_saved": False},
        ],
        "B1": [
            {"id": "static-bus-b1-1", "word": "negotiate", "meaning": "to discuss in order to reach an agreement", "meaning_tr": "müzakere etmek", "example_sentence": "They negotiated a better contract.", "pronunciation": "nih-GOH-shee-ayt", "is_saved": False},
            {"id": "static-bus-b1-2", "word": "revenue", "meaning": "income generated by a business", "meaning_tr": "gelir, hasılat", "example_sentence": "The company's revenue grew by 20% this year.", "pronunciation": "REV-uh-nyoo", "is_saved": False},
            {"id": "static-bus-b1-3", "word": "entrepreneur", "meaning": "a person who starts and runs a business", "meaning_tr": "girişimci", "example_sentence": "She became a successful entrepreneur at 25.", "pronunciation": "ahn-truh-pruh-NUR", "is_saved": False},
        ],
        "B2": [
            {"id": "static-bus-b2-1", "word": "acquisition", "meaning": "the act of buying another company", "meaning_tr": "satın alma, devralma", "example_sentence": "The acquisition doubled the company's market share.", "pronunciation": "ak-wuh-ZI-shun", "is_saved": False},
            {"id": "static-bus-b2-2", "word": "stakeholder", "meaning": "a person with an interest in a business", "meaning_tr": "paydaş", "example_sentence": "All stakeholders attended the annual meeting.", "pronunciation": "STAYK-hohl-der", "is_saved": False},
            {"id": "static-bus-b2-3", "word": "portfolio", "meaning": "a range of products or investments", "meaning_tr": "portföy", "example_sentence": "Their product portfolio covers five sectors.", "pronunciation": "port-FOH-lee-oh", "is_saved": False},
        ],
        "C1": [
            {"id": "static-bus-c1-1", "word": "leverage", "meaning": "to use something to its maximum advantage", "meaning_tr": "kaldıraç etkisi, avantaj sağlamak", "example_sentence": "They leveraged their network to secure the deal.", "pronunciation": "LEV-er-ij", "is_saved": False},
            {"id": "static-bus-c1-2", "word": "synergy", "meaning": "combined effort producing greater results", "meaning_tr": "sinerji", "example_sentence": "The merger created strong synergy between the teams.", "pronunciation": "SIN-er-jee", "is_saved": False},
            {"id": "static-bus-c1-3", "word": "due diligence", "meaning": "careful investigation before a decision", "meaning_tr": "durum tespiti, gerekli özen", "example_sentence": "Investors conduct due diligence before funding startups.", "pronunciation": "doo DIL-ih-juns", "is_saved": False},
        ],
        "C2": [
            {"id": "static-bus-c2-1", "word": "fiduciary", "meaning": "involving trust and responsibility for others' interests", "meaning_tr": "güvene dayalı, vekâlet", "example_sentence": "Directors have a fiduciary duty to shareholders.", "pronunciation": "fih-DOO-shee-ehr-ee", "is_saved": False},
            {"id": "static-bus-c2-2", "word": "arbitrage", "meaning": "profiting from price differences in markets", "meaning_tr": "arbitraj", "example_sentence": "Currency arbitrage requires split-second decisions.", "pronunciation": "AR-bih-trazh", "is_saved": False},
            {"id": "static-bus-c2-3", "word": "obsequious", "meaning": "excessively eager to please", "meaning_tr": "yaltakçı, aşırı uysal", "example_sentence": "His obsequious behaviour annoyed his colleagues.", "pronunciation": "ob-SEE-kwee-us", "is_saved": False},
        ],
    },

    "health": {
        "A1": [
            {"id": "static-hlth-a1-1", "word": "doctor", "meaning": "a person who treats sick people", "meaning_tr": "doktor", "example_sentence": "I visited the doctor yesterday.", "pronunciation": "DOK-ter", "is_saved": False},
            {"id": "static-hlth-a1-2", "word": "exercise", "meaning": "physical activity to stay healthy", "meaning_tr": "egzersiz", "example_sentence": "I do exercise every morning.", "pronunciation": "EK-ser-syz", "is_saved": False},
            {"id": "static-hlth-a1-3", "word": "medicine", "meaning": "a substance used to treat illness", "meaning_tr": "ilaç", "example_sentence": "Take this medicine twice a day.", "pronunciation": "MED-uh-sin", "is_saved": False},
        ],
        "A2": [
            {"id": "static-hlth-a2-1", "word": "symptom", "meaning": "a sign of an illness", "meaning_tr": "belirti, semptom", "example_sentence": "Fever is a common symptom of the flu.", "pronunciation": "SIMP-tum", "is_saved": False},
            {"id": "static-hlth-a2-2", "word": "vitamin", "meaning": "a nutrient needed for health", "meaning_tr": "vitamin", "example_sentence": "Oranges are rich in vitamin C.", "pronunciation": "VY-tuh-min", "is_saved": False},
            {"id": "static-hlth-a2-3", "word": "diet", "meaning": "the food a person regularly eats", "meaning_tr": "diyet, beslenme", "example_sentence": "A balanced diet is important for good health.", "pronunciation": "DY-ut", "is_saved": False},
        ],
        "B1": [
            {"id": "static-hlth-b1-1", "word": "diagnosis", "meaning": "identification of a disease or condition", "meaning_tr": "teşhis", "example_sentence": "The doctor gave her a diagnosis of anaemia.", "pronunciation": "dy-ug-NOH-sis", "is_saved": False},
            {"id": "static-hlth-b1-2", "word": "immunity", "meaning": "the body's ability to resist disease", "meaning_tr": "bağışıklık", "example_sentence": "Vaccines help build immunity against viruses.", "pronunciation": "ih-MYOO-nih-tee", "is_saved": False},
            {"id": "static-hlth-b1-3", "word": "chronic", "meaning": "lasting for a long time", "meaning_tr": "kronik", "example_sentence": "He suffers from chronic back pain.", "pronunciation": "KRON-ik", "is_saved": False},
        ],
        "B2": [
            {"id": "static-hlth-b2-1", "word": "cardiovascular", "meaning": "relating to the heart and blood vessels", "meaning_tr": "kardiyovasküler", "example_sentence": "Running improves cardiovascular health.", "pronunciation": "kar-dee-oh-VAS-kyuh-ler", "is_saved": False},
            {"id": "static-hlth-b2-2", "word": "metabolism", "meaning": "the chemical processes in the body", "meaning_tr": "metabolizma", "example_sentence": "A fast metabolism helps burn calories quickly.", "pronunciation": "muh-TAB-uh-liz-um", "is_saved": False},
            {"id": "static-hlth-b2-3", "word": "rehabilitation", "meaning": "recovery of health through therapy", "meaning_tr": "rehabilitasyon", "example_sentence": "Physical rehabilitation helped him walk again.", "pronunciation": "ree-huh-bil-uh-TAY-shun", "is_saved": False},
        ],
        "C1": [
            {"id": "static-hlth-c1-1", "word": "pathogen", "meaning": "a microorganism that causes disease", "meaning_tr": "patojen", "example_sentence": "The pathogen spread rapidly through the population.", "pronunciation": "PATH-uh-jen", "is_saved": False},
            {"id": "static-hlth-c1-2", "word": "prognosis", "meaning": "a forecast of the likely course of a disease", "meaning_tr": "prognoz, hastalık seyri tahmini", "example_sentence": "The prognosis for recovery is very good.", "pronunciation": "prog-NOH-sis", "is_saved": False},
            {"id": "static-hlth-c1-3", "word": "efficacy", "meaning": "the ability to produce the desired result", "meaning_tr": "etkinlik, etkililik", "example_sentence": "The efficacy of the vaccine was proven in trials.", "pronunciation": "EF-ih-kuh-see", "is_saved": False},
        ],
        "C2": [
            {"id": "static-hlth-c2-1", "word": "aetiology", "meaning": "the cause or origin of a disease", "meaning_tr": "etiyoloji, hastalık nedeni", "example_sentence": "The aetiology of this condition is still unknown.", "pronunciation": "ee-tee-OL-uh-jee", "is_saved": False},
            {"id": "static-hlth-c2-2", "word": "iatrogenic", "meaning": "caused unintentionally by medical treatment", "meaning_tr": "iyatrojenik (tedaviden kaynaklanan)", "example_sentence": "The infection was iatrogenic, caused by the procedure.", "pronunciation": "eye-at-roh-JEN-ik", "is_saved": False},
            {"id": "static-hlth-c2-3", "word": "salutary", "meaning": "producing a beneficial effect", "meaning_tr": "faydalı, sağlıklı", "example_sentence": "Exercise has a salutary effect on mental health.", "pronunciation": "SAL-yuh-teh-ree", "is_saved": False},
        ],
    },

    "education": {
        "A1": [
            {"id": "static-edu-a1-1", "word": "school", "meaning": "a place where children learn", "meaning_tr": "okul", "example_sentence": "She goes to school every day.", "pronunciation": "skool", "is_saved": False},
            {"id": "static-edu-a1-2", "word": "teacher", "meaning": "a person who teaches others", "meaning_tr": "öğretmen", "example_sentence": "My teacher is very kind.", "pronunciation": "TEE-cher", "is_saved": False},
            {"id": "static-edu-a1-3", "word": "learn", "meaning": "to gain knowledge or skill", "meaning_tr": "öğrenmek", "example_sentence": "I want to learn English.", "pronunciation": "lurn", "is_saved": False},
        ],
        "A2": [
            {"id": "static-edu-a2-1", "word": "homework", "meaning": "schoolwork done at home", "meaning_tr": "ödev", "example_sentence": "I do my homework after dinner.", "pronunciation": "HOHM-wurk", "is_saved": False},
            {"id": "static-edu-a2-2", "word": "exam", "meaning": "a formal test of knowledge", "meaning_tr": "sınav", "example_sentence": "He passed the exam with a high score.", "pronunciation": "ig-ZAM", "is_saved": False},
            {"id": "static-edu-a2-3", "word": "library", "meaning": "a place where books are kept", "meaning_tr": "kütüphane", "example_sentence": "I study at the library on weekends.", "pronunciation": "LY-brehr-ee", "is_saved": False},
        ],
        "B1": [
            {"id": "static-edu-b1-1", "word": "curriculum", "meaning": "the subjects studied in a school or course", "meaning_tr": "müfredat", "example_sentence": "The school updated its curriculum this year.", "pronunciation": "kuh-RIK-yuh-lum", "is_saved": False},
            {"id": "static-edu-b1-2", "word": "scholarship", "meaning": "financial support for a student", "meaning_tr": "burs", "example_sentence": "She won a scholarship to study abroad.", "pronunciation": "SKOL-er-ship", "is_saved": False},
            {"id": "static-edu-b1-3", "word": "tuition", "meaning": "teaching or instruction; also fees paid", "meaning_tr": "özel ders; okul ücreti", "example_sentence": "Private tuition helped him improve quickly.", "pronunciation": "too-ISH-un", "is_saved": False},
        ],
        "B2": [
            {"id": "static-edu-b2-1", "word": "pedagogy", "meaning": "the method and practice of teaching", "meaning_tr": "pedagoji", "example_sentence": "Good pedagogy makes learning enjoyable.", "pronunciation": "PED-uh-goh-jee", "is_saved": False},
            {"id": "static-edu-b2-2", "word": "accreditation", "meaning": "official recognition of quality", "meaning_tr": "akreditasyon", "example_sentence": "The university received full accreditation.", "pronunciation": "uh-kred-ih-TAY-shun", "is_saved": False},
            {"id": "static-edu-b2-3", "word": "dissertation", "meaning": "a long academic essay", "meaning_tr": "tez, dissertasyon", "example_sentence": "She spent two years writing her dissertation.", "pronunciation": "dis-er-TAY-shun", "is_saved": False},
        ],
        "C1": [
            {"id": "static-edu-c1-1", "word": "epistemology", "meaning": "the study of knowledge and belief", "meaning_tr": "epistemoloji, bilgi felsefesi", "example_sentence": "Epistemology questions how we know what we know.", "pronunciation": "ih-pis-tuh-MOL-uh-jee", "is_saved": False},
            {"id": "static-edu-c1-2", "word": "didactic", "meaning": "intended to teach", "meaning_tr": "didaktik, öğretici", "example_sentence": "His writing style was rather didactic.", "pronunciation": "dy-DAK-tik", "is_saved": False},
            {"id": "static-edu-c1-3", "word": "erudite", "meaning": "having great knowledge", "meaning_tr": "bilgili, âlim", "example_sentence": "She gave an erudite lecture on philosophy.", "pronunciation": "EHR-yoo-dyt", "is_saved": False},
        ],
        "C2": [
            {"id": "static-edu-c2-1", "word": "heuristic", "meaning": "a practical approach to problem-solving", "meaning_tr": "sezgisel yöntem, buluşsal", "example_sentence": "Teachers use heuristic methods to encourage discovery.", "pronunciation": "hyoo-RIS-tik", "is_saved": False},
            {"id": "static-edu-c2-2", "word": "autodidact", "meaning": "a self-taught person", "meaning_tr": "otodidakt, kendi kendine öğrenen", "example_sentence": "Many great inventors were autodidacts.", "pronunciation": "aw-toh-DY-dakt", "is_saved": False},
            {"id": "static-edu-c2-3", "word": "Socratic", "meaning": "relating to learning through questioning", "meaning_tr": "Sokratik, soru yoluyla öğretme", "example_sentence": "She used the Socratic method in her seminar.", "pronunciation": "suh-KRAT-ik", "is_saved": False},
        ],
    },

    "nature": {
        "A1": [
            {"id": "static-nat-a1-1", "word": "tree", "meaning": "a tall plant with a trunk and branches", "meaning_tr": "ağaç", "example_sentence": "There is a big tree in our garden.", "pronunciation": "tree", "is_saved": False},
            {"id": "static-nat-a1-2", "word": "water", "meaning": "a liquid found in rivers and oceans", "meaning_tr": "su", "example_sentence": "The river water is very clean.", "pronunciation": "WAW-ter", "is_saved": False},
            {"id": "static-nat-a1-3", "word": "flower", "meaning": "the colourful part of a plant", "meaning_tr": "çiçek", "example_sentence": "She picked a beautiful flower from the garden.", "pronunciation": "FLOW-er", "is_saved": False},
        ],
        "A2": [
            {"id": "static-nat-a2-1", "word": "forest", "meaning": "a large area covered with trees", "meaning_tr": "orman", "example_sentence": "We went hiking in the forest.", "pronunciation": "FOR-ist", "is_saved": False},
            {"id": "static-nat-a2-2", "word": "mountain", "meaning": "a high area of land", "meaning_tr": "dağ", "example_sentence": "The mountain is covered with snow.", "pronunciation": "MOWN-tin", "is_saved": False},
            {"id": "static-nat-a2-3", "word": "ocean", "meaning": "a very large body of salt water", "meaning_tr": "okyanus", "example_sentence": "The ocean is home to many creatures.", "pronunciation": "OH-shun", "is_saved": False},
        ],
        "B1": [
            {"id": "static-nat-b1-1", "word": "ecosystem", "meaning": "a community of living things in an environment", "meaning_tr": "ekosistem", "example_sentence": "The rainforest is a complex ecosystem.", "pronunciation": "EE-koh-sis-tum", "is_saved": False},
            {"id": "static-nat-b1-2", "word": "habitat", "meaning": "the natural home of a species", "meaning_tr": "habitat, doğal ortam", "example_sentence": "Polar bears live in Arctic habitats.", "pronunciation": "HAB-ih-tat", "is_saved": False},
            {"id": "static-nat-b1-3", "word": "erosion", "meaning": "the gradual wearing away of rock or soil", "meaning_tr": "erozyon", "example_sentence": "Coastal erosion threatens many beaches.", "pronunciation": "ih-ROH-zhun", "is_saved": False},
        ],
        "B2": [
            {"id": "static-nat-b2-1", "word": "biodiversity", "meaning": "the variety of life in an area", "meaning_tr": "biyoçeşitlilik", "example_sentence": "Protecting biodiversity is crucial for the planet.", "pronunciation": "by-oh-duh-VUR-suh-tee", "is_saved": False},
            {"id": "static-nat-b2-2", "word": "photosynthesis", "meaning": "process by which plants make food from sunlight", "meaning_tr": "fotosentez", "example_sentence": "Plants use photosynthesis to produce energy.", "pronunciation": "foh-toh-SIN-thuh-sis", "is_saved": False},
            {"id": "static-nat-b2-3", "word": "precipitation", "meaning": "water falling as rain or snow", "meaning_tr": "yağış", "example_sentence": "Annual precipitation in this region is very low.", "pronunciation": "pruh-sip-ih-TAY-shun", "is_saved": False},
        ],
        "C1": [
            {"id": "static-nat-c1-1", "word": "biome", "meaning": "a large natural community of plants and animals", "meaning_tr": "biyom", "example_sentence": "The desert is one of Earth's harshest biomes.", "pronunciation": "BY-ohm", "is_saved": False},
            {"id": "static-nat-c1-2", "word": "symbiosis", "meaning": "a mutually beneficial relationship between organisms", "meaning_tr": "simbiyoz, ortak yaşam", "example_sentence": "Clownfish and anemones live in symbiosis.", "pronunciation": "sim-by-OH-sis", "is_saved": False},
            {"id": "static-nat-c1-3", "word": "deforestation", "meaning": "clearing of forests on a large scale", "meaning_tr": "ormansızlaşma", "example_sentence": "Deforestation is a leading cause of climate change.", "pronunciation": "dee-for-uh-STAY-shun", "is_saved": False},
        ],
        "C2": [
            {"id": "static-nat-c2-1", "word": "anthropogenic", "meaning": "caused or influenced by humans", "meaning_tr": "antropojenik, insan kaynaklı", "example_sentence": "Climate change is largely anthropogenic.", "pronunciation": "an-thruh-puh-JEN-ik", "is_saved": False},
            {"id": "static-nat-c2-2", "word": "lithosphere", "meaning": "the rigid outer layer of the Earth", "meaning_tr": "litosfer, taş küre", "example_sentence": "Tectonic plates are part of the lithosphere.", "pronunciation": "LITH-uh-sfeer", "is_saved": False},
            {"id": "static-nat-c2-3", "word": "xenobiotic", "meaning": "a chemical foreign to an ecosystem", "meaning_tr": "ksenobiyotik, yabancı kimyasal", "example_sentence": "Pesticides are xenobiotic compounds.", "pronunciation": "zen-oh-by-OT-ik", "is_saved": False},
        ],
    },

    "sports": {
        "A1": [
            {"id": "static-spt-a1-1", "word": "run", "meaning": "to move quickly on foot", "meaning_tr": "koşmak", "example_sentence": "I run in the park every morning.", "pronunciation": "run", "is_saved": False},
            {"id": "static-spt-a1-2", "word": "ball", "meaning": "a round object used in sports", "meaning_tr": "top", "example_sentence": "Kick the ball into the goal.", "pronunciation": "bawl", "is_saved": False},
            {"id": "static-spt-a1-3", "word": "team", "meaning": "a group of people playing together", "meaning_tr": "takım", "example_sentence": "Our team won the match.", "pronunciation": "teem", "is_saved": False},
        ],
        "A2": [
            {"id": "static-spt-a2-1", "word": "competition", "meaning": "a contest between people or teams", "meaning_tr": "yarışma", "example_sentence": "She won the swimming competition.", "pronunciation": "kom-puh-TISH-un", "is_saved": False},
            {"id": "static-spt-a2-2", "word": "training", "meaning": "practice to improve skills", "meaning_tr": "antrenman", "example_sentence": "Daily training is essential for athletes.", "pronunciation": "TRAY-ning", "is_saved": False},
            {"id": "static-spt-a2-3", "word": "referee", "meaning": "a person who enforces rules in a game", "meaning_tr": "hakem", "example_sentence": "The referee blew the whistle.", "pronunciation": "ref-uh-REE", "is_saved": False},
        ],
        "B1": [
            {"id": "static-spt-b1-1", "word": "endurance", "meaning": "the ability to sustain effort over time", "meaning_tr": "dayanıklılık", "example_sentence": "Marathon running requires great endurance.", "pronunciation": "en-DYOOR-uns", "is_saved": False},
            {"id": "static-spt-b1-2", "word": "strategy", "meaning": "a plan designed to achieve a goal", "meaning_tr": "strateji", "example_sentence": "The coach explained his strategy before the match.", "pronunciation": "STRAT-uh-jee", "is_saved": False},
            {"id": "static-spt-b1-3", "word": "stamina", "meaning": "physical or mental strength to endure", "meaning_tr": "güç, dayanıklılık", "example_sentence": "Cyclists need exceptional stamina.", "pronunciation": "STAM-uh-nuh", "is_saved": False},
        ],
        "B2": [
            {"id": "static-spt-b2-1", "word": "doping", "meaning": "use of banned substances to enhance performance", "meaning_tr": "doping", "example_sentence": "Doping is strictly banned in professional sports.", "pronunciation": "DOH-ping", "is_saved": False},
            {"id": "static-spt-b2-2", "word": "agility", "meaning": "ability to move quickly and easily", "meaning_tr": "çeviklik", "example_sentence": "Basketball players need great agility.", "pronunciation": "uh-JIL-uh-tee", "is_saved": False},
            {"id": "static-spt-b2-3", "word": "sportsmanship", "meaning": "fair and generous behaviour in sport", "meaning_tr": "sportmenlik", "example_sentence": "He showed great sportsmanship after losing.", "pronunciation": "SPORTS-mun-ship", "is_saved": False},
        ],
        "C1": [
            {"id": "static-spt-c1-1", "word": "biomechanics", "meaning": "study of movement in living organisms", "meaning_tr": "biyomekanik", "example_sentence": "Biomechanics helps improve athletic technique.", "pronunciation": "by-oh-muh-KAN-iks", "is_saved": False},
            {"id": "static-spt-c1-2", "word": "proprioception", "meaning": "sense of body position and movement", "meaning_tr": "propriyosepsiyon, konum hissi", "example_sentence": "Gymnasts develop exceptional proprioception.", "pronunciation": "proh-pree-oh-SEP-shun", "is_saved": False},
            {"id": "static-spt-c1-3", "word": "periodisation", "meaning": "structured planning of training cycles", "meaning_tr": "periyodizasyon, dönemsel antrenman", "example_sentence": "Periodisation prevents burnout in athletes.", "pronunciation": "peer-ee-uh-dy-ZAY-shun", "is_saved": False},
        ],
        "C2": [
            {"id": "static-spt-c2-1", "word": "kinaesthesia", "meaning": "awareness of body movement through muscle sense", "meaning_tr": "kinestetik his, hareket duyusu", "example_sentence": "Elite athletes have highly developed kinaesthesia.", "pronunciation": "kin-es-THEE-zhuh", "is_saved": False},
            {"id": "static-spt-c2-2", "word": "agonist", "meaning": "a muscle that causes a specific movement", "meaning_tr": "agonist kas", "example_sentence": "The bicep is the agonist in a curl.", "pronunciation": "AG-uh-nist", "is_saved": False},
            {"id": "static-spt-c2-3", "word": "anaerobic", "meaning": "without oxygen; relating to intense bursts of effort", "meaning_tr": "anaerobik", "example_sentence": "Sprinting is an anaerobic exercise.", "pronunciation": "an-uh-ROH-bik", "is_saved": False},
        ],
    },

    "emotions": {
        "A1": [
            {"id": "static-emo-a1-1", "word": "happy", "meaning": "feeling pleasure and joy", "meaning_tr": "mutlu", "example_sentence": "She is very happy today.", "pronunciation": "HAP-ee", "is_saved": False},
            {"id": "static-emo-a1-2", "word": "sad", "meaning": "feeling unhappy or sorrowful", "meaning_tr": "üzgün", "example_sentence": "He felt sad when his dog died.", "pronunciation": "sad", "is_saved": False},
            {"id": "static-emo-a1-3", "word": "angry", "meaning": "feeling strong displeasure", "meaning_tr": "kızgın, sinirli", "example_sentence": "She was angry when she missed the bus.", "pronunciation": "ANG-gree", "is_saved": False},
        ],
        "A2": [
            {"id": "static-emo-a2-1", "word": "anxious", "meaning": "feeling worried or nervous", "meaning_tr": "endişeli, gergin", "example_sentence": "He felt anxious before the exam.", "pronunciation": "ANK-shus", "is_saved": False},
            {"id": "static-emo-a2-2", "word": "proud", "meaning": "feeling pleased about an achievement", "meaning_tr": "gururlu", "example_sentence": "She was proud of her son's success.", "pronunciation": "prowd", "is_saved": False},
            {"id": "static-emo-a2-3", "word": "lonely", "meaning": "feeling unhappy due to lack of company", "meaning_tr": "yalnız, yalnızlık hisseden", "example_sentence": "Moving to a new city made her feel lonely.", "pronunciation": "LOHN-lee", "is_saved": False},
        ],
        "B1": [
            {"id": "static-emo-b1-1", "word": "overwhelmed", "meaning": "feeling buried under too much", "meaning_tr": "bunalmış, altında ezilmiş", "example_sentence": "She felt overwhelmed by all the responsibilities.", "pronunciation": "oh-ver-WELMD", "is_saved": False},
            {"id": "static-emo-b1-2", "word": "nostalgic", "meaning": "feeling longing for the past", "meaning_tr": "nostaljik, geçmişe özlem duyan", "example_sentence": "Old photos made him feel nostalgic.", "pronunciation": "no-STAL-jik", "is_saved": False},
            {"id": "static-emo-b1-3", "word": "empathy", "meaning": "understanding another's feelings", "meaning_tr": "empati", "example_sentence": "She showed empathy towards her friend.", "pronunciation": "EM-puh-thee", "is_saved": False},
        ],
        "B2": [
            {"id": "static-emo-b2-1", "word": "ambivalent", "meaning": "having mixed feelings about something", "meaning_tr": "kararsız, ikircikli", "example_sentence": "He felt ambivalent about changing careers.", "pronunciation": "am-BIV-uh-lunt", "is_saved": False},
            {"id": "static-emo-b2-2", "word": "contentment", "meaning": "a state of peaceful happiness", "meaning_tr": "memnuniyet, huzur", "example_sentence": "She found contentment in simple pleasures.", "pronunciation": "kun-TENT-munt", "is_saved": False},
            {"id": "static-emo-b2-3", "word": "resentment", "meaning": "bitter indignation at being treated unfairly", "meaning_tr": "kırgınlık, içerleme", "example_sentence": "He harboured resentment towards his former employer.", "pronunciation": "rih-ZENT-munt", "is_saved": False},
        ],
        "C1": [
            {"id": "static-emo-c1-1", "word": "equanimity", "meaning": "mental calmness in difficult situations", "meaning_tr": "sükunet, ruh sağlamlığı", "example_sentence": "She faced the crisis with remarkable equanimity.", "pronunciation": "ee-kwuh-NIM-uh-tee", "is_saved": False},
            {"id": "static-emo-c1-2", "word": "disillusionment", "meaning": "disappointment from lost illusions", "meaning_tr": "hayal kırıklığı, düş kırıklığı", "example_sentence": "Disillusionment followed his first year at work.", "pronunciation": "dis-ih-LOO-zhun-munt", "is_saved": False},
            {"id": "static-emo-c1-3", "word": "elation", "meaning": "great happiness and exhilaration", "meaning_tr": "sevinç, coşku", "example_sentence": "Winning the award filled her with elation.", "pronunciation": "ih-LAY-shun", "is_saved": False},
        ],
        "C2": [
            {"id": "static-emo-c2-1", "word": "weltschmerz", "meaning": "world-weariness; sadness about the state of the world", "meaning_tr": "dünya yorgunluğu, keder", "example_sentence": "He was prone to fits of weltschmerz.", "pronunciation": "VELT-shmerts", "is_saved": False},
            {"id": "static-emo-c2-2", "word": "saudade", "meaning": "a deep longing for something absent", "meaning_tr": "saudade, derin özlem", "example_sentence": "Portuguese fado music captures the feeling of saudade.", "pronunciation": "sow-DAH-duh", "is_saved": False},
            {"id": "static-emo-c2-3", "word": "ineffable", "meaning": "too great to be expressed in words", "meaning_tr": "ifade edilemez, tarif edilemez", "example_sentence": "The beauty of the landscape was ineffable.", "pronunciation": "in-EF-uh-bul", "is_saved": False},
        ],
    },

    "shopping": {
        "A1": [
            {"id": "static-shp-a1-1", "word": "buy", "meaning": "to get something by paying money", "meaning_tr": "satın almak", "example_sentence": "I want to buy a new shirt.", "pronunciation": "by", "is_saved": False},
            {"id": "static-shp-a1-2", "word": "price", "meaning": "the amount of money something costs", "meaning_tr": "fiyat", "example_sentence": "What is the price of this jacket?", "pronunciation": "prys", "is_saved": False},
            {"id": "static-shp-a1-3", "word": "shop", "meaning": "a place where things are sold", "meaning_tr": "dükkan, mağaza", "example_sentence": "There is a bakery shop near my house.", "pronunciation": "shop", "is_saved": False},
        ],
        "A2": [
            {"id": "static-shp-a2-1", "word": "discount", "meaning": "a reduction in price", "meaning_tr": "indirim", "example_sentence": "I got a 20% discount on the shoes.", "pronunciation": "DIS-kownt", "is_saved": False},
            {"id": "static-shp-a2-2", "word": "receipt", "meaning": "a document confirming a purchase", "meaning_tr": "fiş, makbuz", "example_sentence": "Keep the receipt in case you need to return it.", "pronunciation": "ruh-SEET", "is_saved": False},
            {"id": "static-shp-a2-3", "word": "refund", "meaning": "money returned after returning a product", "meaning_tr": "iade, para iadesi", "example_sentence": "She asked for a refund on the broken item.", "pronunciation": "REE-fund", "is_saved": False},
        ],
        "B1": [
            {"id": "static-shp-b1-1", "word": "bargain", "meaning": "something bought at a low price", "meaning_tr": "fırsat, pazarlık", "example_sentence": "She found a real bargain at the market.", "pronunciation": "BAR-gun", "is_saved": False},
            {"id": "static-shp-b1-2", "word": "impulse buy", "meaning": "an unplanned purchase", "meaning_tr": "dürtüsel alışveriş", "example_sentence": "That jacket was an impulse buy.", "pronunciation": "IM-puls by", "is_saved": False},
            {"id": "static-shp-b1-3", "word": "warranty", "meaning": "a guarantee of repair or replacement", "meaning_tr": "garanti", "example_sentence": "The laptop comes with a two-year warranty.", "pronunciation": "WOR-un-tee", "is_saved": False},
        ],
        "B2": [
            {"id": "static-shp-b2-1", "word": "consumerism", "meaning": "the preoccupation with buying goods", "meaning_tr": "tüketicilik, tüketim kültürü", "example_sentence": "Consumerism drives much of the global economy.", "pronunciation": "kun-SOO-mer-iz-um", "is_saved": False},
            {"id": "static-shp-b2-2", "word": "counterfeit", "meaning": "a fake copy made to deceive", "meaning_tr": "sahte, taklit", "example_sentence": "She unknowingly bought a counterfeit handbag.", "pronunciation": "KOWN-ter-fit", "is_saved": False},
            {"id": "static-shp-b2-3", "word": "invoice", "meaning": "a bill listing goods or services", "meaning_tr": "fatura", "example_sentence": "Please send the invoice by email.", "pronunciation": "IN-voys", "is_saved": False},
        ],
        "C1": [
            {"id": "static-shp-c1-1", "word": "bespoke", "meaning": "made to individual order", "meaning_tr": "ısmarlama, özel yapım", "example_sentence": "He wore a bespoke suit to the event.", "pronunciation": "bih-SPOHK", "is_saved": False},
            {"id": "static-shp-c1-2", "word": "liquidation", "meaning": "selling assets to pay debts", "meaning_tr": "tasfiye, likidite", "example_sentence": "The store closed due to liquidation.", "pronunciation": "lik-wid-AY-shun", "is_saved": False},
            {"id": "static-shp-c1-3", "word": "procurement", "meaning": "the act of obtaining goods or services", "meaning_tr": "tedarik", "example_sentence": "Procurement costs were reduced by 15%.", "pronunciation": "pruh-KYOOR-munt", "is_saved": False},
        ],
        "C2": [
            {"id": "static-shp-c2-1", "word": "sartorial", "meaning": "relating to tailoring and clothing", "meaning_tr": "terzilikle ilgili, giyim", "example_sentence": "His sartorial choices always impressed.", "pronunciation": "sar-TOR-ee-ul", "is_saved": False},
            {"id": "static-shp-c2-2", "word": "pecuniary", "meaning": "relating to money", "meaning_tr": "parasal, mali", "example_sentence": "There were pecuniary advantages to the deal.", "pronunciation": "puh-KYOO-nee-ehr-ee", "is_saved": False},
            {"id": "static-shp-c2-3", "word": "emporium", "meaning": "a large shop selling many different things", "meaning_tr": "büyük mağaza, çarşı", "example_sentence": "The Victorian emporium sold goods from around the world.", "pronunciation": "em-POR-ee-um", "is_saved": False},
        ],
    },

    "family": {
        "A1": [
            {"id": "static-fam-a1-1", "word": "mother", "meaning": "a female parent", "meaning_tr": "anne", "example_sentence": "My mother cooks delicious food.", "pronunciation": "MUTH-er", "is_saved": False},
            {"id": "static-fam-a1-2", "word": "brother", "meaning": "a male sibling", "meaning_tr": "erkek kardeş", "example_sentence": "My brother is two years younger than me.", "pronunciation": "BRUTH-er", "is_saved": False},
            {"id": "static-fam-a1-3", "word": "child", "meaning": "a young person", "meaning_tr": "çocuk", "example_sentence": "Every child deserves love and care.", "pronunciation": "chyld", "is_saved": False},
        ],
        "A2": [
            {"id": "static-fam-a2-1", "word": "relative", "meaning": "a family member", "meaning_tr": "akraba", "example_sentence": "We visited relatives over the holiday.", "pronunciation": "REL-uh-tiv", "is_saved": False},
            {"id": "static-fam-a2-2", "word": "marriage", "meaning": "the legal union of two people", "meaning_tr": "evlilik", "example_sentence": "Their marriage has lasted forty years.", "pronunciation": "MAIR-ij", "is_saved": False},
            {"id": "static-fam-a2-3", "word": "twin", "meaning": "one of two children born at the same time", "meaning_tr": "ikiz", "example_sentence": "She has a twin sister who looks just like her.", "pronunciation": "twin", "is_saved": False},
        ],
        "B1": [
            {"id": "static-fam-b1-1", "word": "upbringing", "meaning": "the way a child is raised", "meaning_tr": "yetiştirilme tarzı", "example_sentence": "Her upbringing shaped her values greatly.", "pronunciation": "UP-bring-ing", "is_saved": False},
            {"id": "static-fam-b1-2", "word": "guardian", "meaning": "a person legally responsible for a child", "meaning_tr": "veli, vasi", "example_sentence": "His aunt became his legal guardian.", "pronunciation": "GAR-dee-un", "is_saved": False},
            {"id": "static-fam-b1-3", "word": "sibling", "meaning": "a brother or sister", "meaning_tr": "kardeş", "example_sentence": "She has three siblings.", "pronunciation": "SIB-ling", "is_saved": False},
        ],
        "B2": [
            {"id": "static-fam-b2-1", "word": "estranged", "meaning": "no longer close or friendly", "meaning_tr": "araları açık, uzaklaşmış", "example_sentence": "He has been estranged from his father for years.", "pronunciation": "ih-STRAYNZD", "is_saved": False},
            {"id": "static-fam-b2-2", "word": "nurture", "meaning": "to care for and encourage growth", "meaning_tr": "yetiştirmek, beslemek", "example_sentence": "Parents nurture their children's talents.", "pronunciation": "NUR-cher", "is_saved": False},
            {"id": "static-fam-b2-3", "word": "hereditary", "meaning": "passed down through families", "meaning_tr": "kalıtsal, irsi", "example_sentence": "Some diseases are hereditary.", "pronunciation": "huh-RED-ih-tehr-ee", "is_saved": False},
        ],
        "C1": [
            {"id": "static-fam-c1-1", "word": "matriarch", "meaning": "a female head of a family", "meaning_tr": "matriark, aile reisi kadın", "example_sentence": "The matriarch held the family together.", "pronunciation": "MAY-tree-ark", "is_saved": False},
            {"id": "static-fam-c1-2", "word": "filial", "meaning": "relating to a son or daughter", "meaning_tr": "evlat ile ilgili", "example_sentence": "She felt a strong sense of filial duty.", "pronunciation": "FIL-ee-ul", "is_saved": False},
            {"id": "static-fam-c1-3", "word": "consanguinity", "meaning": "blood relationship", "meaning_tr": "kan bağı, akrabalık", "example_sentence": "Marriage between close consanguinity is prohibited.", "pronunciation": "kon-san-GWIN-uh-tee", "is_saved": False},
        ],
        "C2": [
            {"id": "static-fam-c2-1", "word": "primogeniture", "meaning": "right of the firstborn to inherit", "meaning_tr": "ilk doğan miras hakkı", "example_sentence": "Primogeniture determined inheritance for centuries.", "pronunciation": "pry-moh-JEN-ih-cher", "is_saved": False},
            {"id": "static-fam-c2-2", "word": "cognate", "meaning": "related by birth or origin", "meaning_tr": "soydaş, aynı kökten", "example_sentence": "Cognate languages share a common ancestor.", "pronunciation": "KOG-nayt", "is_saved": False},
            {"id": "static-fam-c2-3", "word": "propinquity", "meaning": "nearness in relationship", "meaning_tr": "akrabalık, yakınlık", "example_sentence": "Their propinquity made the conflict inevitable.", "pronunciation": "pruh-PING-kwuh-tee", "is_saved": False},
        ],
    },

    "art": {
        "A1": [
            {"id": "static-art-a1-1", "word": "draw", "meaning": "to make a picture with a pencil or pen", "meaning_tr": "çizmek", "example_sentence": "She loves to draw animals.", "pronunciation": "draw", "is_saved": False},
            {"id": "static-art-a1-2", "word": "colour", "meaning": "the appearance of something in terms of hue", "meaning_tr": "renk", "example_sentence": "Red is my favourite colour.", "pronunciation": "KUL-er", "is_saved": False},
            {"id": "static-art-a1-3", "word": "music", "meaning": "sounds arranged to be pleasant or expressive", "meaning_tr": "müzik", "example_sentence": "I listen to music every day.", "pronunciation": "MYOO-zik", "is_saved": False},
        ],
        "A2": [
            {"id": "static-art-a2-1", "word": "painting", "meaning": "a picture made with paint", "meaning_tr": "resim, tablo", "example_sentence": "There is a beautiful painting on the wall.", "pronunciation": "PAYN-ting", "is_saved": False},
            {"id": "static-art-a2-2", "word": "sculpture", "meaning": "a three-dimensional work of art", "meaning_tr": "heykel", "example_sentence": "The museum has many ancient sculptures.", "pronunciation": "SKULP-cher", "is_saved": False},
            {"id": "static-art-a2-3", "word": "exhibition", "meaning": "a public display of art", "meaning_tr": "sergi", "example_sentence": "We visited an art exhibition downtown.", "pronunciation": "ek-suh-BISH-un", "is_saved": False},
        ],
        "B1": [
            {"id": "static-art-b1-1", "word": "composition", "meaning": "the arrangement of elements in art", "meaning_tr": "kompozisyon", "example_sentence": "The composition of the painting draws your eye.", "pronunciation": "kom-puh-ZI-shun", "is_saved": False},
            {"id": "static-art-b1-2", "word": "abstract", "meaning": "art that does not represent reality directly", "meaning_tr": "soyut", "example_sentence": "Abstract art can be open to interpretation.", "pronunciation": "AB-strakt", "is_saved": False},
            {"id": "static-art-b1-3", "word": "gallery", "meaning": "a room or building displaying art", "meaning_tr": "galeri", "example_sentence": "The gallery opened a new exhibition today.", "pronunciation": "GAL-er-ee", "is_saved": False},
        ],
        "B2": [
            {"id": "static-art-b2-1", "word": "renaissance", "meaning": "a cultural revival, especially 14–17th century Europe", "meaning_tr": "rönesans, yeniden doğuş", "example_sentence": "The Renaissance transformed European art.", "pronunciation": "REN-uh-sahns", "is_saved": False},
            {"id": "static-art-b2-2", "word": "aesthetic", "meaning": "relating to beauty and artistic taste", "meaning_tr": "estetik", "example_sentence": "She has a refined aesthetic sense.", "pronunciation": "es-THET-ik", "is_saved": False},
            {"id": "static-art-b2-3", "word": "motif", "meaning": "a recurring element in art or music", "meaning_tr": "motif", "example_sentence": "The floral motif appears throughout the design.", "pronunciation": "moh-TEEF", "is_saved": False},
        ],
        "C1": [
            {"id": "static-art-c1-1", "word": "chiaroscuro", "meaning": "the use of light and dark in art", "meaning_tr": "karoşkuro, ışık-gölge", "example_sentence": "Caravaggio mastered chiaroscuro techniques.", "pronunciation": "kyar-oh-SKYOOR-oh", "is_saved": False},
            {"id": "static-art-c1-2", "word": "iconography", "meaning": "the study of visual symbols in art", "meaning_tr": "ikonografi, simgeler bilimi", "example_sentence": "The iconography of Byzantine art is complex.", "pronunciation": "eye-kuh-NOG-ruh-fee", "is_saved": False},
            {"id": "static-art-c1-3", "word": "provenance", "meaning": "the origin and history of a work of art", "meaning_tr": "köken, provenans", "example_sentence": "The painting's provenance was carefully documented.", "pronunciation": "PROV-uh-nuns", "is_saved": False},
        ],
        "C2": [
            {"id": "static-art-c2-1", "word": "trompe l'oeil", "meaning": "art that creates illusion of three dimensions", "meaning_tr": "trompe l'oeil, göz yanılması", "example_sentence": "The ceiling featured a stunning trompe l'oeil.", "pronunciation": "tromp LOY", "is_saved": False},
            {"id": "static-art-c2-2", "word": "ekphrasis", "meaning": "a literary description of a work of art", "meaning_tr": "ekfrasis, sanat eserinin sözel tanımı", "example_sentence": "Keats wrote an ekphrasis of a Grecian urn.", "pronunciation": "EK-fruh-sis", "is_saved": False},
            {"id": "static-art-c2-3", "word": "pastiche", "meaning": "a work imitating another artist's style", "meaning_tr": "pastiş, taklit", "example_sentence": "The film was a loving pastiche of 1950s cinema.", "pronunciation": "pas-TEESH", "is_saved": False},
        ],
    },

    "science": {
        "A1": [
            {"id": "static-sci-a1-1", "word": "planet", "meaning": "a large object orbiting a star", "meaning_tr": "gezegen", "example_sentence": "Earth is the third planet from the Sun.", "pronunciation": "PLAN-it", "is_saved": False},
            {"id": "static-sci-a1-2", "word": "animal", "meaning": "a living creature that is not a plant", "meaning_tr": "hayvan", "example_sentence": "Dogs are friendly animals.", "pronunciation": "AN-ih-mul", "is_saved": False},
            {"id": "static-sci-a1-3", "word": "experiment", "meaning": "a test done to learn something", "meaning_tr": "deney", "example_sentence": "We did a science experiment in class.", "pronunciation": "ik-SPEHR-uh-munt", "is_saved": False},
        ],
        "A2": [
            {"id": "static-sci-a2-1", "word": "gravity", "meaning": "the force pulling objects toward Earth", "meaning_tr": "yerçekimi", "example_sentence": "Gravity keeps us on the ground.", "pronunciation": "GRAV-ih-tee", "is_saved": False},
            {"id": "static-sci-a2-2", "word": "energy", "meaning": "the power to do work", "meaning_tr": "enerji", "example_sentence": "Solar panels convert sunlight into energy.", "pronunciation": "EN-er-jee", "is_saved": False},
            {"id": "static-sci-a2-3", "word": "chemical", "meaning": "relating to chemistry or substances", "meaning_tr": "kimyasal", "example_sentence": "Water is a chemical compound.", "pronunciation": "KEM-ih-kul", "is_saved": False},
        ],
        "B1": [
            {"id": "static-sci-b1-1", "word": "hypothesis", "meaning": "a proposed explanation for observation", "meaning_tr": "hipotez", "example_sentence": "The scientist tested her hypothesis.", "pronunciation": "hy-POTH-uh-sis", "is_saved": False},
            {"id": "static-sci-b1-2", "word": "molecule", "meaning": "the smallest unit of a chemical compound", "meaning_tr": "molekül", "example_sentence": "Water is made of two hydrogen and one oxygen molecule.", "pronunciation": "MOL-uh-kyool", "is_saved": False},
            {"id": "static-sci-b1-3", "word": "evolution", "meaning": "gradual development of species over time", "meaning_tr": "evrim", "example_sentence": "Darwin's theory of evolution changed biology.", "pronunciation": "ev-uh-LOO-shun", "is_saved": False},
        ],
        "B2": [
            {"id": "static-sci-b2-1", "word": "quantum", "meaning": "the smallest discrete unit of energy", "meaning_tr": "kuantum", "example_sentence": "Quantum physics challenges classical mechanics.", "pronunciation": "KWON-tum", "is_saved": False},
            {"id": "static-sci-b2-2", "word": "catalyst", "meaning": "a substance that speeds up a reaction", "meaning_tr": "katalizör", "example_sentence": "Enzymes act as catalysts in the body.", "pronunciation": "KAT-uh-list", "is_saved": False},
            {"id": "static-sci-b2-3", "word": "genome", "meaning": "the complete genetic material of an organism", "meaning_tr": "genom", "example_sentence": "Scientists mapped the human genome.", "pronunciation": "JEE-nohm", "is_saved": False},
        ],
        "C1": [
            {"id": "static-sci-c1-1", "word": "entropy", "meaning": "the degree of disorder in a system", "meaning_tr": "entropi", "example_sentence": "Entropy increases in isolated systems.", "pronunciation": "EN-truh-pee", "is_saved": False},
            {"id": "static-sci-c1-2", "word": "isotope", "meaning": "a variant of an element with different neutrons", "meaning_tr": "izotop", "example_sentence": "Carbon-14 is a radioactive isotope.", "pronunciation": "EYE-suh-tohp", "is_saved": False},
            {"id": "static-sci-c1-3", "word": "paradigm", "meaning": "a typical example or scientific framework", "meaning_tr": "paradigma", "example_sentence": "Einstein shifted the scientific paradigm.", "pronunciation": "PAIR-uh-dym", "is_saved": False},
        ],
        "C2": [
            {"id": "static-sci-c2-1", "word": "reductionism", "meaning": "explaining complex things by simpler components", "meaning_tr": "indirgemeci yaklaşım", "example_sentence": "Reductionism underpins much of modern biology.", "pronunciation": "ruh-DUK-shun-iz-um", "is_saved": False},
            {"id": "static-sci-c2-2", "word": "stochastic", "meaning": "randomly determined; having a probability distribution", "meaning_tr": "stokastik, olasılıksal", "example_sentence": "Weather is a stochastic process.", "pronunciation": "stuh-KAS-tik", "is_saved": False},
            {"id": "static-sci-c2-3", "word": "epistemological", "meaning": "relating to the theory of knowledge", "meaning_tr": "epistemolojik, bilgi teorisiyle ilgili", "example_sentence": "The study raised epistemological questions.", "pronunciation": "ih-pis-tuh-muh-LOJ-ih-kul", "is_saved": False},
        ],
    },

    "social-media": {
        "A1": [
            {"id": "static-sm-a1-1", "word": "post", "meaning": "to share content online", "meaning_tr": "gönderi paylaşmak", "example_sentence": "She posts photos on Instagram every day.", "pronunciation": "pohst", "is_saved": False},
            {"id": "static-sm-a1-2", "word": "like", "meaning": "to show approval of online content", "meaning_tr": "beğenmek", "example_sentence": "I liked her photo on Instagram.", "pronunciation": "lyk", "is_saved": False},
            {"id": "static-sm-a1-3", "word": "comment", "meaning": "a written remark on online content", "meaning_tr": "yorum", "example_sentence": "He left a nice comment on my post.", "pronunciation": "KOM-ent", "is_saved": False},
        ],
        "A2": [
            {"id": "static-sm-a2-1", "word": "follower", "meaning": "someone who subscribes to your content", "meaning_tr": "takipçi", "example_sentence": "She has thousands of followers on Twitter.", "pronunciation": "FOL-oh-er", "is_saved": False},
            {"id": "static-sm-a2-2", "word": "hashtag", "meaning": "a keyword marked with # for searching", "meaning_tr": "hashtag, etiket", "example_sentence": "Use the hashtag to join the conversation.", "pronunciation": "HASH-tag", "is_saved": False},
            {"id": "static-sm-a2-3", "word": "share", "meaning": "to repost someone else's content", "meaning_tr": "paylaşmak", "example_sentence": "Please share this important message.", "pronunciation": "shair", "is_saved": False},
        ],
        "B1": [
            {"id": "static-sm-b1-1", "word": "viral", "meaning": "spreading rapidly across the internet", "meaning_tr": "viral, çok hızlı yayılan", "example_sentence": "The video went viral overnight.", "pronunciation": "VY-rul", "is_saved": False},
            {"id": "static-sm-b1-2", "word": "algorithm", "meaning": "rules that determine what content you see", "meaning_tr": "algoritma", "example_sentence": "The algorithm shows you content you engage with.", "pronunciation": "AL-go-rith-um", "is_saved": False},
            {"id": "static-sm-b1-3", "word": "influencer", "meaning": "someone with many followers who affects opinions", "meaning_tr": "influencer, fenomen", "example_sentence": "She became a fashion influencer on YouTube.", "pronunciation": "IN-floo-en-ser", "is_saved": False},
        ],
        "B2": [
            {"id": "static-sm-b2-1", "word": "misinformation", "meaning": "false information spread online", "meaning_tr": "dezenformasyon, yanlış bilgi", "example_sentence": "Misinformation spreads faster than truth online.", "pronunciation": "mis-in-for-MAY-shun", "is_saved": False},
            {"id": "static-sm-b2-2", "word": "monetise", "meaning": "to earn money from content", "meaning_tr": "para kazanmak, monetize etmek", "example_sentence": "He monetised his YouTube channel.", "pronunciation": "MON-uh-tyz", "is_saved": False},
            {"id": "static-sm-b2-3", "word": "engagement", "meaning": "interaction with online content", "meaning_tr": "etkileşim", "example_sentence": "High engagement improves a post's visibility.", "pronunciation": "en-GAYJ-munt", "is_saved": False},
        ],
        "C1": [
            {"id": "static-sm-c1-1", "word": "echo chamber", "meaning": "an environment where one's beliefs are reinforced", "meaning_tr": "yankı odası", "example_sentence": "Social media can create echo chambers.", "pronunciation": "EK-oh CHAYM-ber", "is_saved": False},
            {"id": "static-sm-c1-2", "word": "digital footprint", "meaning": "the trail of data left online", "meaning_tr": "dijital ayak izi", "example_sentence": "Everyone leaves a digital footprint online.", "pronunciation": "DIJ-ih-tul FOOT-print", "is_saved": False},
            {"id": "static-sm-c1-3", "word": "doxxing", "meaning": "publishing private information about someone online", "meaning_tr": "doxxing, kişisel bilgi ifşa etmek", "example_sentence": "Doxxing is illegal in many countries.", "pronunciation": "DOK-sing", "is_saved": False},
        ],
        "C2": [
            {"id": "static-sm-c2-1", "word": "panopticon", "meaning": "a system of constant surveillance", "meaning_tr": "panoptikon, sürekli gözetim sistemi", "example_sentence": "Some argue social media is a digital panopticon.", "pronunciation": "pan-OP-tih-kon", "is_saved": False},
            {"id": "static-sm-c2-2", "word": "simulacrum", "meaning": "a representation or imitation of reality", "meaning_tr": "simülakr, gerçekliğin taklidi", "example_sentence": "Online personas can become a simulacrum of identity.", "pronunciation": "sim-yuh-LAY-krum", "is_saved": False},
            {"id": "static-sm-c2-3", "word": "parasocial", "meaning": "a one-sided relationship with a media figure", "meaning_tr": "parasosyal ilişki", "example_sentence": "Parasocial bonds with celebrities can be intense.", "pronunciation": "pair-uh-SOH-shul", "is_saved": False},
        ],
    },

    "home": {
        "A1": [
            {"id": "static-hom-a1-1", "word": "room", "meaning": "a space inside a building", "meaning_tr": "oda", "example_sentence": "My room is on the second floor.", "pronunciation": "room", "is_saved": False},
            {"id": "static-hom-a1-2", "word": "kitchen", "meaning": "a room where food is prepared", "meaning_tr": "mutfak", "example_sentence": "We eat breakfast in the kitchen.", "pronunciation": "KICH-en", "is_saved": False},
            {"id": "static-hom-a1-3", "word": "door", "meaning": "an entrance to a room or building", "meaning_tr": "kapı", "example_sentence": "Please close the door when you leave.", "pronunciation": "dor", "is_saved": False},
        ],
        "A2": [
            {"id": "static-hom-a2-1", "word": "furniture", "meaning": "movable items in a room", "meaning_tr": "mobilya", "example_sentence": "They bought new furniture for the living room.", "pronunciation": "FUR-nuh-cher", "is_saved": False},
            {"id": "static-hom-a2-2", "word": "appliance", "meaning": "an electrical device for household tasks", "meaning_tr": "ev aleti", "example_sentence": "The washing machine is an essential appliance.", "pronunciation": "uh-PLY-uns", "is_saved": False},
            {"id": "static-hom-a2-3", "word": "rent", "meaning": "regular payment to live in a property", "meaning_tr": "kira", "example_sentence": "She pays rent every month.", "pronunciation": "rent", "is_saved": False},
        ],
        "B1": [
            {"id": "static-hom-b1-1", "word": "renovation", "meaning": "restoring a building to good condition", "meaning_tr": "tadilat, yenileme", "example_sentence": "The kitchen renovation took three weeks.", "pronunciation": "ren-uh-VAY-shun", "is_saved": False},
            {"id": "static-hom-b1-2", "word": "mortgage", "meaning": "a loan to buy property", "meaning_tr": "ipotek, konut kredisi", "example_sentence": "They took out a mortgage to buy the house.", "pronunciation": "MOR-gij", "is_saved": False},
            {"id": "static-hom-b1-3", "word": "landlord", "meaning": "a person who rents out property", "meaning_tr": "ev sahibi, kiraya veren", "example_sentence": "The landlord fixed the heating system.", "pronunciation": "LAND-lord", "is_saved": False},
        ],
        "B2": [
            {"id": "static-hom-b2-1", "word": "subsidence", "meaning": "sinking of the ground under a building", "meaning_tr": "çökme, zemin oturması", "example_sentence": "The old house suffered from subsidence.", "pronunciation": "sub-SY-duns", "is_saved": False},
            {"id": "static-hom-b2-2", "word": "insulation", "meaning": "material that prevents heat loss", "meaning_tr": "yalıtım", "example_sentence": "Good insulation reduces energy bills.", "pronunciation": "in-syuh-LAY-shun", "is_saved": False},
            {"id": "static-hom-b2-3", "word": "conveyancing", "meaning": "the legal process of transferring property", "meaning_tr": "tapu devri işlemleri", "example_sentence": "Conveyancing can take several weeks.", "pronunciation": "kun-VAY-un-sing", "is_saved": False},
        ],
        "C1": [
            {"id": "static-hom-c1-1", "word": "aesthetics", "meaning": "the visual appeal of a space", "meaning_tr": "estetik", "example_sentence": "She paid great attention to the home's aesthetics.", "pronunciation": "es-THET-iks", "is_saved": False},
            {"id": "static-hom-c1-2", "word": "inglenook", "meaning": "a recess beside a large open fireplace", "meaning_tr": "şömine köşesi", "example_sentence": "The cottage had a cosy inglenook.", "pronunciation": "ING-ul-nook", "is_saved": False},
            {"id": "static-hom-c1-3", "word": "bespoke", "meaning": "custom-made for a specific purpose", "meaning_tr": "ısmarlama", "example_sentence": "The bespoke shelving fitted perfectly.", "pronunciation": "bih-SPOHK", "is_saved": False},
        ],
        "C2": [
            {"id": "static-hom-c2-1", "word": "fenestration", "meaning": "the arrangement of windows in a building", "meaning_tr": "pencere düzeni", "example_sentence": "The fenestration maximised natural light.", "pronunciation": "fen-uh-STRAY-shun", "is_saved": False},
            {"id": "static-hom-c2-2", "word": "rustication", "meaning": "masonry with roughened surface for effect", "meaning_tr": "kaba taş işçiliği", "example_sentence": "Rustication gave the facade a bold look.", "pronunciation": "rus-tuh-KAY-shun", "is_saved": False},
            {"id": "static-hom-c2-3", "word": "quoin", "meaning": "a cornerstone of a building", "meaning_tr": "köşe taşı", "example_sentence": "The quoins were made of contrasting stone.", "pronunciation": "koyn", "is_saved": False},
        ],
    },

    "weather": {
        "A1": [
            {"id": "static-wth-a1-1", "word": "rain", "meaning": "water falling from clouds", "meaning_tr": "yağmur", "example_sentence": "It rains a lot in autumn.", "pronunciation": "rayn", "is_saved": False},
            {"id": "static-wth-a1-2", "word": "sun", "meaning": "the star that gives us light and heat", "meaning_tr": "güneş", "example_sentence": "The sun is shining today.", "pronunciation": "sun", "is_saved": False},
            {"id": "static-wth-a1-3", "word": "snow", "meaning": "frozen water that falls from the sky", "meaning_tr": "kar", "example_sentence": "Children love playing in the snow.", "pronunciation": "snoh", "is_saved": False},
        ],
        "A2": [
            {"id": "static-wth-a2-1", "word": "temperature", "meaning": "how hot or cold something is", "meaning_tr": "sıcaklık", "example_sentence": "The temperature dropped below zero.", "pronunciation": "TEM-per-uh-cher", "is_saved": False},
            {"id": "static-wth-a2-2", "word": "forecast", "meaning": "a prediction of future weather", "meaning_tr": "hava tahmini", "example_sentence": "The forecast says it will rain tomorrow.", "pronunciation": "FOR-kast", "is_saved": False},
            {"id": "static-wth-a2-3", "word": "thunder", "meaning": "the loud sound during a storm", "meaning_tr": "gök gürültüsü", "example_sentence": "The thunder scared the dog.", "pronunciation": "THUN-der", "is_saved": False},
        ],
        "B1": [
            {"id": "static-wth-b1-1", "word": "humidity", "meaning": "the amount of moisture in the air", "meaning_tr": "nem, rutubet", "example_sentence": "High humidity makes summer feel hotter.", "pronunciation": "hyoo-MID-uh-tee", "is_saved": False},
            {"id": "static-wth-b1-2", "word": "drought", "meaning": "a long period without rain", "meaning_tr": "kuraklık", "example_sentence": "The drought destroyed the crops.", "pronunciation": "drowt", "is_saved": False},
            {"id": "static-wth-b1-3", "word": "gale", "meaning": "a very strong wind", "meaning_tr": "fırtına, şiddetli rüzgar", "example_sentence": "Gale-force winds damaged the roof.", "pronunciation": "gayl", "is_saved": False},
        ],
        "B2": [
            {"id": "static-wth-b2-1", "word": "atmospheric pressure", "meaning": "the weight of air pressing on the earth", "meaning_tr": "atmosfer basıncı", "example_sentence": "Low atmospheric pressure often brings rain.", "pronunciation": "at-muh-SFEER-ik PRESH-er", "is_saved": False},
            {"id": "static-wth-b2-2", "word": "monsoon", "meaning": "a seasonal wind bringing heavy rain", "meaning_tr": "muson yağmurları", "example_sentence": "The monsoon season starts in June.", "pronunciation": "mon-SOON", "is_saved": False},
            {"id": "static-wth-b2-3", "word": "heatwave", "meaning": "a prolonged period of very hot weather", "meaning_tr": "sıcak hava dalgası", "example_sentence": "The heatwave broke all temperature records.", "pronunciation": "HEET-wayv", "is_saved": False},
        ],
        "C1": [
            {"id": "static-wth-c1-1", "word": "advection", "meaning": "horizontal movement of air or heat", "meaning_tr": "adeksiyon, yatay hava hareketi", "example_sentence": "Fog can form through advection of warm moist air.", "pronunciation": "ad-VEK-shun", "is_saved": False},
            {"id": "static-wth-c1-2", "word": "inversion", "meaning": "a reversal of normal temperature layers", "meaning_tr": "inversiyon, sıcaklık terselmesi", "example_sentence": "Temperature inversions trap pollution near the ground.", "pronunciation": "in-VUR-zhun", "is_saved": False},
            {"id": "static-wth-c1-3", "word": "frontogenesis", "meaning": "the formation of a weather front", "meaning_tr": "cephe oluşumu", "example_sentence": "Frontogenesis causes rapid changes in weather.", "pronunciation": "frun-toh-JEN-uh-sis", "is_saved": False},
        ],
        "C2": [
            {"id": "static-wth-c2-1", "word": "mesoscale", "meaning": "relating to medium-scale weather systems", "meaning_tr": "mezoskala, orta ölçekli hava sistemi", "example_sentence": "Thunderstorms are mesoscale convective systems.", "pronunciation": "MEZ-oh-skale", "is_saved": False},
            {"id": "static-wth-c2-2", "word": "orographic", "meaning": "relating to mountains' effect on weather", "meaning_tr": "orografik, dağ kaynaklı", "example_sentence": "Orographic lifting causes rain on mountain slopes.", "pronunciation": "or-uh-GRAF-ik", "is_saved": False},
            {"id": "static-wth-c2-3", "word": "crepuscular", "meaning": "relating to twilight", "meaning_tr": "alacakaranlıkla ilgili", "example_sentence": "Crepuscular rays shine through gaps in clouds at dusk.", "pronunciation": "kruh-PUS-kyuh-ler", "is_saved": False},
        ],
    },

    "transportation": {
        "A1": [
            {"id": "static-trans-a1-1", "word": "bus", "meaning": "a large vehicle for passengers", "meaning_tr": "otobüs", "example_sentence": "I take the bus to school every day.", "pronunciation": "bus", "is_saved": False},
            {"id": "static-trans-a1-2", "word": "car", "meaning": "a motor vehicle for passengers", "meaning_tr": "araba", "example_sentence": "My father drives a red car.", "pronunciation": "kar", "is_saved": False},
            {"id": "static-trans-a1-3", "word": "train", "meaning": "a vehicle running on rails", "meaning_tr": "tren", "example_sentence": "The train arrives at 9 AM.", "pronunciation": "trayn", "is_saved": False},
        ],
        "A2": [
            {"id": "static-trans-a2-1", "word": "traffic", "meaning": "vehicles moving on roads", "meaning_tr": "trafik", "example_sentence": "There was heavy traffic on the motorway.", "pronunciation": "TRAF-ik", "is_saved": False},
            {"id": "static-trans-a2-2", "word": "platform", "meaning": "the area beside tracks at a station", "meaning_tr": "peron", "example_sentence": "The train departs from platform 3.", "pronunciation": "PLAT-form", "is_saved": False},
            {"id": "static-trans-a2-3", "word": "journey", "meaning": "travel from one place to another", "meaning_tr": "yolculuk", "example_sentence": "The journey took three hours.", "pronunciation": "JUR-nee", "is_saved": False},
        ],
        "B1": [
            {"id": "static-trans-b1-1", "word": "infrastructure", "meaning": "basic physical systems of transport", "meaning_tr": "altyapı", "example_sentence": "The city invested in transport infrastructure.", "pronunciation": "IN-fruh-struk-cher", "is_saved": False},
            {"id": "static-trans-b1-2", "word": "congestion", "meaning": "overcrowding causing slow movement", "meaning_tr": "tıkanıklık", "example_sentence": "Congestion is a daily problem in the city.", "pronunciation": "kun-JES-chun", "is_saved": False},
            {"id": "static-trans-b1-3", "word": "emission", "meaning": "gases released by vehicles", "meaning_tr": "egzoz emisyonu, salım", "example_sentence": "Electric cars reduce carbon emissions.", "pronunciation": "ih-MISH-un", "is_saved": False},
        ],
        "B2": [
            {"id": "static-trans-b2-1", "word": "autonomous vehicle", "meaning": "a self-driving car", "meaning_tr": "otonom araç, sürücüsüz araç", "example_sentence": "Autonomous vehicles will change transport forever.", "pronunciation": "aw-TON-uh-mus VEE-ih-kul", "is_saved": False},
            {"id": "static-trans-b2-2", "word": "intermodal", "meaning": "using more than one type of transport", "meaning_tr": "çok modlu, intermodal", "example_sentence": "Intermodal freight combines rail and road.", "pronunciation": "in-ter-MOH-dul", "is_saved": False},
            {"id": "static-trans-b2-3", "word": "logistics", "meaning": "planning transport and supply chains", "meaning_tr": "lojistik", "example_sentence": "Good logistics keeps deliveries on time.", "pronunciation": "loh-JIS-tiks", "is_saved": False},
        ],
        "C1": [
            {"id": "static-trans-c1-1", "word": "aerodynamics", "meaning": "how air affects moving objects", "meaning_tr": "aerodinamik", "example_sentence": "Aerodynamics determine a car's fuel efficiency.", "pronunciation": "air-oh-dy-NAM-iks", "is_saved": False},
            {"id": "static-trans-c1-2", "word": "propulsion", "meaning": "the force that drives a vehicle forward", "meaning_tr": "tahrik, itme kuvveti", "example_sentence": "Jet engines provide thrust through propulsion.", "pronunciation": "pruh-PUL-shun", "is_saved": False},
            {"id": "static-trans-c1-3", "word": "hyperloop", "meaning": "a high-speed transport system in a tube", "meaning_tr": "hyperloop, tüp içi hızlı ulaşım", "example_sentence": "Hyperloop could connect cities in minutes.", "pronunciation": "HY-per-loop", "is_saved": False},
        ],
        "C2": [
            {"id": "static-trans-c2-1", "word": "peristaltic", "meaning": "wave-like movement to propel substances", "meaning_tr": "peristaltik, dalga hareketi", "example_sentence": "Some experimental transport uses peristaltic principles.", "pronunciation": "per-ih-STAL-tik", "is_saved": False},
            {"id": "static-trans-c2-2", "word": "telemetry", "meaning": "automated transmission of data from remote sources", "meaning_tr": "telemetri, uzaktan veri iletimi", "example_sentence": "Formula 1 cars use telemetry to optimise performance.", "pronunciation": "tuh-LEM-uh-tree", "is_saved": False},
            {"id": "static-trans-c2-3", "word": "multimodality", "meaning": "the use of multiple transport modes", "meaning_tr": "çok modluluk", "example_sentence": "Urban planners promote multimodality for sustainability.", "pronunciation": "mul-tee-moh-DAL-uh-tee", "is_saved": False},
        ],
    },

    "entertainment": {
        "A1": [
            {"id": "static-ent-a1-1", "word": "film", "meaning": "a movie shown at a cinema", "meaning_tr": "film", "example_sentence": "We watched a great film last night.", "pronunciation": "film", "is_saved": False},
            {"id": "static-ent-a1-2", "word": "game", "meaning": "an activity for fun with rules", "meaning_tr": "oyun", "example_sentence": "My brother loves playing video games.", "pronunciation": "gaym", "is_saved": False},
            {"id": "static-ent-a1-3", "word": "sing", "meaning": "to make music with your voice", "meaning_tr": "şarkı söylemek", "example_sentence": "She sings beautifully.", "pronunciation": "sing", "is_saved": False},
        ],
        "A2": [
            {"id": "static-ent-a2-1", "word": "concert", "meaning": "a live music performance", "meaning_tr": "konser", "example_sentence": "We went to a pop concert last Saturday.", "pronunciation": "KON-sert", "is_saved": False},
            {"id": "static-ent-a2-2", "word": "comedian", "meaning": "a performer who makes people laugh", "meaning_tr": "komedyen", "example_sentence": "The comedian told hilarious jokes.", "pronunciation": "kuh-MEE-dee-un", "is_saved": False},
            {"id": "static-ent-a2-3", "word": "audience", "meaning": "people watching a performance", "meaning_tr": "izleyici kitlesi", "example_sentence": "The audience clapped enthusiastically.", "pronunciation": "AW-dee-uns", "is_saved": False},
        ],
        "B1": [
            {"id": "static-ent-b1-1", "word": "streaming", "meaning": "watching content online in real time", "meaning_tr": "yayın akışı, streaming", "example_sentence": "Streaming services have replaced DVDs.", "pronunciation": "STREE-ming", "is_saved": False},
            {"id": "static-ent-b1-2", "word": "blockbuster", "meaning": "a very popular and successful film", "meaning_tr": "gişe rekorları kıran film", "example_sentence": "The blockbuster earned billions at the box office.", "pronunciation": "BLOK-bus-ter", "is_saved": False},
            {"id": "static-ent-b1-3", "word": "soundtrack", "meaning": "the music for a film or show", "meaning_tr": "film müziği, soundtrack", "example_sentence": "The film's soundtrack won an Oscar.", "pronunciation": "SOWND-trak", "is_saved": False},
        ],
        "B2": [
            {"id": "static-ent-b2-1", "word": "genre", "meaning": "a category of artistic work", "meaning_tr": "tür, cins", "example_sentence": "Horror is her favourite film genre.", "pronunciation": "ZHON-ruh", "is_saved": False},
            {"id": "static-ent-b2-2", "word": "cameo", "meaning": "a brief appearance by a famous person", "meaning_tr": "kısa rol, cameo", "example_sentence": "The director made a cameo in the film.", "pronunciation": "KAM-ee-oh", "is_saved": False},
            {"id": "static-ent-b2-3", "word": "accolade", "meaning": "an award or honour", "meaning_tr": "ödül, takdir", "example_sentence": "The actor received many accolades for his role.", "pronunciation": "AK-uh-layd", "is_saved": False},
        ],
        "C1": [
            {"id": "static-ent-c1-1", "word": "diegesis", "meaning": "the story world of a narrative", "meaning_tr": "diegesis, anlatı dünyası", "example_sentence": "The music exists within the diegesis of the film.", "pronunciation": "dy-uh-JEE-sis", "is_saved": False},
            {"id": "static-ent-c1-2", "word": "verisimilitude", "meaning": "the appearance of being true", "meaning_tr": "gerçekçilik, inanılırlık", "example_sentence": "The film's verisimilitude impressed critics.", "pronunciation": "ver-uh-suh-MIL-uh-tood", "is_saved": False},
            {"id": "static-ent-c1-3", "word": "auteur", "meaning": "a director with a distinctive personal style", "meaning_tr": "auteur, özgün sinemacı", "example_sentence": "Kubrick is considered a great auteur.", "pronunciation": "oh-TUR", "is_saved": False},
        ],
        "C2": [
            {"id": "static-ent-c2-1", "word": "catharsis", "meaning": "emotional release through art", "meaning_tr": "katarsis, duygusal arınma", "example_sentence": "Tragedy provides catharsis for the audience.", "pronunciation": "kuh-THAR-sis", "is_saved": False},
            {"id": "static-ent-c2-2", "word": "mise-en-scène", "meaning": "the arrangement of elements in a film frame", "meaning_tr": "mise-en-scène, sahne düzeni", "example_sentence": "The director's mise-en-scène was carefully constructed.", "pronunciation": "meez on SEN", "is_saved": False},
            {"id": "static-ent-c2-3", "word": "hagiography", "meaning": "an overly reverent biography", "meaning_tr": "hagiografi, aşırı yüceltici biyografi", "example_sentence": "The documentary felt like a hagiography.", "pronunciation": "hay-gee-OG-ruh-fee", "is_saved": False},
        ],
    },

    "law-politics": {
        "A1": [
            {"id": "static-law-a1-1", "word": "law", "meaning": "a rule made by the government", "meaning_tr": "yasa, kanun", "example_sentence": "Everyone must obey the law.", "pronunciation": "law", "is_saved": False},
            {"id": "static-law-a1-2", "word": "vote", "meaning": "to choose someone in an election", "meaning_tr": "oy vermek", "example_sentence": "People vote every four years.", "pronunciation": "voht", "is_saved": False},
            {"id": "static-law-a1-3", "word": "government", "meaning": "the group that rules a country", "meaning_tr": "hükümet", "example_sentence": "The government announced new policies.", "pronunciation": "GUV-ern-munt", "is_saved": False},
        ],
        "A2": [
            {"id": "static-law-a2-1", "word": "election", "meaning": "a process of choosing leaders by voting", "meaning_tr": "seçim", "example_sentence": "The election takes place next month.", "pronunciation": "ih-LEK-shun", "is_saved": False},
            {"id": "static-law-a2-2", "word": "crime", "meaning": "an act that breaks the law", "meaning_tr": "suç", "example_sentence": "Theft is a crime.", "pronunciation": "krym", "is_saved": False},
            {"id": "static-law-a2-3", "word": "rights", "meaning": "freedoms protected by law", "meaning_tr": "haklar", "example_sentence": "Everyone has the right to education.", "pronunciation": "ryts", "is_saved": False},
        ],
        "B1": [
            {"id": "static-law-b1-1", "word": "democracy", "meaning": "a system where people elect their leaders", "meaning_tr": "demokrasi", "example_sentence": "Democracy gives citizens a voice.", "pronunciation": "duh-MOK-ruh-see", "is_saved": False},
            {"id": "static-law-b1-2", "word": "legislation", "meaning": "laws passed by a government", "meaning_tr": "mevzuat, yasama", "example_sentence": "New legislation will protect the environment.", "pronunciation": "lej-ih-SLAY-shun", "is_saved": False},
            {"id": "static-law-b1-3", "word": "constitution", "meaning": "the basic laws of a country", "meaning_tr": "anayasa", "example_sentence": "The constitution guarantees freedom of speech.", "pronunciation": "kon-stuh-TOO-shun", "is_saved": False},
        ],
        "B2": [
            {"id": "static-law-b2-1", "word": "jurisdiction", "meaning": "the authority of a court or government", "meaning_tr": "yargı yetkisi", "example_sentence": "This case falls outside our jurisdiction.", "pronunciation": "joor-is-DIK-shun", "is_saved": False},
            {"id": "static-law-b2-2", "word": "referendum", "meaning": "a public vote on a single question", "meaning_tr": "referandum", "example_sentence": "The referendum decided the country's future.", "pronunciation": "ref-uh-REN-dum", "is_saved": False},
            {"id": "static-law-b2-3", "word": "impeachment", "meaning": "a formal charge against a public official", "meaning_tr": "görevden uzaklaştırma davası", "example_sentence": "The president faced impeachment proceedings.", "pronunciation": "im-PEECH-munt", "is_saved": False},
        ],
        "C1": [
            {"id": "static-law-c1-1", "word": "jurisprudence", "meaning": "the theory and philosophy of law", "meaning_tr": "hukuk felsefesi, içtihat", "example_sentence": "She studied jurisprudence at Oxford.", "pronunciation": "joor-is-PROO-duns", "is_saved": False},
            {"id": "static-law-c1-2", "word": "habeas corpus", "meaning": "a legal right requiring a person be brought before court", "meaning_tr": "habeas corpus, kişi özgürlüğü güvencesi", "example_sentence": "Habeas corpus protects against unlawful detention.", "pronunciation": "HAY-bee-us KOR-pus", "is_saved": False},
            {"id": "static-law-c1-3", "word": "gerrymander", "meaning": "to manipulate electoral boundaries unfairly", "meaning_tr": "seçim bölgelerini manipüle etmek", "example_sentence": "The party was accused of gerrymandering.", "pronunciation": "JER-ee-man-der", "is_saved": False},
        ],
        "C2": [
            {"id": "static-law-c2-1", "word": "ultra vires", "meaning": "acting beyond one's legal power", "meaning_tr": "yetki aşımı", "example_sentence": "The council's decision was declared ultra vires.", "pronunciation": "ul-truh VY-reez", "is_saved": False},
            {"id": "static-law-c2-2", "word": "deontological", "meaning": "relating to duty-based ethics", "meaning_tr": "deontolojik, görev etiğine ilişkin", "example_sentence": "Kant's deontological ethics focus on rules.", "pronunciation": "dee-on-tuh-LOJ-ih-kul", "is_saved": False},
            {"id": "static-law-c2-3", "word": "realpolitik", "meaning": "politics based on practical rather than moral aims", "meaning_tr": "realpolitik, pragmatik siyaset", "example_sentence": "His decisions were driven by realpolitik.", "pronunciation": "ray-AHL-poh-lee-teek", "is_saved": False},
        ],
    },
}


def get_static_vocab(category: str, level: str) -> list:
    # Verilen kategori ve seviye için statik kelimeleri döner
    # Kategori listede yoksa boş liste döner — backend OpenAI ile üretir
    category_words = STATIC_VOCABULARY.get(category, {})
    return category_words.get(level, [])