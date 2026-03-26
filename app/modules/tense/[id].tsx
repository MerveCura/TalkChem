import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";

const tenseDetails: Record<string, any> = {
  "present-simple": {
    name: "Present Simple",
    color: ["#f953c6", "#b91d73"] as [string, string],
    formula: "Subject + V1 (base form)",
    formulaNegative: "Subject + don't/doesn't + V1",
    formulaQuestion: "Do/Does + Subject + V1?",
    uses: [
      "Habits and routines: I wake up at 7am every day.",
      "General truths: The sun rises in the east.",
      "Permanent situations: She lives in London.",
      "Scheduled events: The train leaves at 9am.",
    ],
    examples: [
      { sentence: "She walks to school every day.", type: "positive" },
      { sentence: "She doesn't walk to school.", type: "negative" },
      { sentence: "Does she walk to school?", type: "question" },
    ],
    tips: "Use 's' or 'es' with he/she/it in positive sentences. Example: He plays, She watches.",
    timeExpressions: ["always", "usually", "often", "sometimes", "never", "every day", "on Mondays"],
  },
  "present-continuous": {
    name: "Present Continuous",
    color: ["#ec4899", "#be185d"] as [string, string],
    formula: "Subject + am/is/are + V-ing",
    formulaNegative: "Subject + am/is/are + not + V-ing",
    formulaQuestion: "Am/Is/Are + Subject + V-ing?",
    uses: [
      "Actions happening now: I am studying English right now.",
      "Temporary situations: She is staying with her parents this week.",
      "Future plans: We are meeting tomorrow.",
      "Changing situations: The weather is getting warmer.",
    ],
    examples: [
      { sentence: "She is walking to school now.", type: "positive" },
      { sentence: "She isn't walking to school.", type: "negative" },
      { sentence: "Is she walking to school?", type: "question" },
    ],
    tips: "Some verbs are not usually used in continuous form: know, want, love, hate, believe.",
    timeExpressions: ["now", "at the moment", "currently", "today", "this week", "right now"],
  },
  "present-perfect": {
    name: "Present Perfect",
    color: ["#a855f7", "#7c3aed"] as [string, string],
    formula: "Subject + have/has + V3 (past participle)",
    formulaNegative: "Subject + haven't/hasn't + V3",
    formulaQuestion: "Have/Has + Subject + V3?",
    uses: [
      "Experience: I have visited Paris twice.",
      "Recent actions: She has just finished her homework.",
      "Actions with present result: I have lost my keys (I can't find them now).",
      "Unfinished time periods: I haven't seen him this week.",
    ],
    examples: [
      { sentence: "She has walked 5km today.", type: "positive" },
      { sentence: "She hasn't walked today.", type: "negative" },
      { sentence: "Has she walked today?", type: "question" },
    ],
    tips: "Use 'have' with I/you/we/they and 'has' with he/she/it.",
    timeExpressions: ["just", "already", "yet", "ever", "never", "since", "for", "recently"],
  },
  "present-perfect-continuous": {
    name: "Present Perfect Continuous",
    color: ["#8b5cf6", "#6d28d9"] as [string, string],
    formula: "Subject + have/has been + V-ing",
    formulaNegative: "Subject + haven't/hasn't been + V-ing",
    formulaQuestion: "Have/Has + Subject + been + V-ing?",
    uses: [
      "Actions started in past and still continuing: I have been studying for 3 hours.",
      "Recent actions with present results: She looks tired. She has been working all day.",
      "Repeated actions: He has been calling me all morning.",
    ],
    examples: [
      { sentence: "She has been walking for an hour.", type: "positive" },
      { sentence: "She hasn't been walking.", type: "negative" },
      { sentence: "Has she been walking?", type: "question" },
    ],
    tips: "Focus is on the duration or continuity of the action, not the result.",
    timeExpressions: ["for", "since", "all day", "all morning", "lately", "recently"],
  },
  "past-simple": {
    name: "Past Simple",
    color: ["#60a5fa", "#2563eb"] as [string, string],
    formula: "Subject + V2 (past form)",
    formulaNegative: "Subject + didn't + V1",
    formulaQuestion: "Did + Subject + V1?",
    uses: [
      "Completed actions in the past: I visited Paris last year.",
      "Series of completed actions: She woke up, had breakfast and left.",
      "Past habits: When I was young, I played football every day.",
      "Past states: She lived in London for 5 years.",
    ],
    examples: [
      { sentence: "She walked to school yesterday.", type: "positive" },
      { sentence: "She didn't walk to school.", type: "negative" },
      { sentence: "Did she walk to school?", type: "question" },
    ],
    tips: "Regular verbs: add -ed (walk→walked). Irregular verbs must be memorized (go→went, see→saw).",
    timeExpressions: ["yesterday", "last week", "last year", "ago", "in 2020", "when I was young"],
  },
  "past-continuous": {
    name: "Past Continuous",
    color: ["#38bdf8", "#0284c7"] as [string, string],
    formula: "Subject + was/were + V-ing",
    formulaNegative: "Subject + wasn't/weren't + V-ing",
    formulaQuestion: "Was/Were + Subject + V-ing?",
    uses: [
      "Action in progress at a specific past time: At 8pm, I was watching TV.",
      "Interrupted past action: I was cooking when she called.",
      "Parallel past actions: She was reading while he was cooking.",
      "Background description in stories: The sun was shining and birds were singing.",
    ],
    examples: [
      { sentence: "She was walking when it started raining.", type: "positive" },
      { sentence: "She wasn't walking at that time.", type: "negative" },
      { sentence: "Was she walking at 8pm?", type: "question" },
    ],
    tips: "Often used with Past Simple: 'was/were + V-ing' (longer action) + 'when' + Past Simple (shorter action).",
    timeExpressions: ["while", "when", "at that moment", "at 8pm yesterday", "all morning"],
  },
  "past-perfect": {
    name: "Past Perfect",
    color: ["#34d399", "#059669"] as [string, string],
    formula: "Subject + had + V3 (past participle)",
    formulaNegative: "Subject + hadn't + V3",
    formulaQuestion: "Had + Subject + V3?",
    uses: [
      "Action completed before another past action: When I arrived, she had already left.",
      "Reported speech: She said she had finished her work.",
      "Third conditional: If I had studied, I would have passed.",
    ],
    examples: [
      { sentence: "She had walked before the rain started.", type: "positive" },
      { sentence: "She hadn't walked before the rain.", type: "negative" },
      { sentence: "Had she walked before it rained?", type: "question" },
    ],
    tips: "The 'earlier' past action uses Past Perfect, the 'later' past action uses Past Simple.",
    timeExpressions: ["before", "after", "already", "just", "by the time", "when", "never"],
  },
  "past-perfect-continuous": {
    name: "Past Perfect Continuous",
    color: ["#4ade80", "#16a34a"] as [string, string],
    formula: "Subject + had been + V-ing",
    formulaNegative: "Subject + hadn't been + V-ing",
    formulaQuestion: "Had + Subject + been + V-ing?",
    uses: [
      "Duration of action before another past event: She had been waiting for 2 hours when he arrived.",
      "Cause of a past situation: He was tired because he had been working all day.",
    ],
    examples: [
      { sentence: "She had been walking for an hour before it rained.", type: "positive" },
      { sentence: "She hadn't been walking long.", type: "negative" },
      { sentence: "Had she been walking long?", type: "question" },
    ],
    tips: "Emphasizes the duration of an activity that happened before another past event.",
    timeExpressions: ["for", "since", "all day", "before", "when", "by the time"],
  },
  "future-simple": {
    name: "Future Simple",
    color: ["#fbbf24", "#d97706"] as [string, string],
    formula: "Subject + will + V1",
    formulaNegative: "Subject + won't + V1",
    formulaQuestion: "Will + Subject + V1?",
    uses: [
      "Spontaneous decisions: I'll have the pizza, please.",
      "Predictions: I think it will rain tomorrow.",
      "Promises: I will call you tonight.",
      "Future facts: She will be 30 next year.",
    ],
    examples: [
      { sentence: "She will walk to school tomorrow.", type: "positive" },
      { sentence: "She won't walk to school.", type: "negative" },
      { sentence: "Will she walk to school?", type: "question" },
    ],
    tips: "Use 'will' for spontaneous decisions. Use 'going to' for planned decisions.",
    timeExpressions: ["tomorrow", "next week", "next year", "soon", "in the future", "tonight"],
  },
  "future-continuous": {
    name: "Future Continuous",
    color: ["#fb923c", "#ea580c"] as [string, string],
    formula: "Subject + will be + V-ing",
    formulaNegative: "Subject + won't be + V-ing",
    formulaQuestion: "Will + Subject + be + V-ing?",
    uses: [
      "Action in progress at a specific future time: At 8pm, I will be watching the game.",
      "Polite enquiries about plans: Will you be using the car tonight?",
      "Predicted ongoing actions: This time next year, I'll be living in Paris.",
    ],
    examples: [
      { sentence: "She will be walking at this time tomorrow.", type: "positive" },
      { sentence: "She won't be walking at 8pm.", type: "negative" },
      { sentence: "Will she be walking at 8pm?", type: "question" },
    ],
    tips: "Used for actions that will be in progress at a specific time in the future.",
    timeExpressions: ["at this time tomorrow", "at 8pm tonight", "this time next week"],
  },
  "future-perfect": {
    name: "Future Perfect",
    color: ["#f87171", "#dc2626"] as [string, string],
    formula: "Subject + will have + V3",
    formulaNegative: "Subject + won't have + V3",
    formulaQuestion: "Will + Subject + have + V3?",
    uses: [
      "Action completed before a specific future time: By 5pm, I will have finished work.",
      "Duration up to a future point: By next year, she will have lived here for 10 years.",
    ],
    examples: [
      { sentence: "She will have walked 5km by noon.", type: "positive" },
      { sentence: "She won't have walked by noon.", type: "negative" },
      { sentence: "Will she have walked by noon?", type: "question" },
    ],
    tips: "Key phrase: 'By the time...' or 'By + time expression'.",
    timeExpressions: ["by tomorrow", "by next week", "by the time", "before", "by 5pm"],
  },
  "future-perfect-continuous": {
    name: "Future Perfect Continuous",
    color: ["#e879f9", "#a21caf"] as [string, string],
    formula: "Subject + will have been + V-ing",
    formulaNegative: "Subject + won't have been + V-ing",
    formulaQuestion: "Will + Subject + have been + V-ing?",
    uses: [
      "Duration of an action up to a specific future time: By noon, she will have been walking for 3 hours.",
      "Cause of a future state: She will be tired because she will have been working all day.",
    ],
    examples: [
      { sentence: "She will have been walking for 2 hours by noon.", type: "positive" },
      { sentence: "She won't have been walking for long.", type: "negative" },
      { sentence: "Will she have been walking for 2 hours?", type: "question" },
    ],
    tips: "This is the most complex tense. Focus on the duration of an action up to a future point.",
    timeExpressions: ["by", "for", "since", "by the time", "by next year"],
  },
};

export default function TenseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tense = tenseDetails[id as string];

  if (!tense) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "white" }}>Tense not found</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={tense.color} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{tense.name}</Text>

        {/* Formüller */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Formula</Text>
          <View style={styles.formulaCard}>
            <Text style={styles.formulaLabel}>Positive</Text>
            <Text style={styles.formulaText}>{tense.formula}</Text>
          </View>
          <View style={styles.formulaCard}>
            <Text style={styles.formulaLabel}>Negative</Text>
            <Text style={styles.formulaText}>{tense.formulaNegative}</Text>
          </View>
          <View style={styles.formulaCard}>
            <Text style={styles.formulaLabel}>Question</Text>
            <Text style={styles.formulaText}>{tense.formulaQuestion}</Text>
          </View>
        </View>

        {/* Kullanımlar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When to use</Text>
          {tense.uses.map((use: string, i: number) => {
            const parts = use.split(": ");
            return (
              <View key={i} style={styles.useItem}>
                <Text style={styles.useBullet}>•</Text>
                <Text style={styles.useText}>
                  <Text style={{ fontWeight: "800", color: "white" }}>{parts[0]}: </Text>
                  {parts.slice(1).join(": ")}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Örnekler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Examples</Text>
          {tense.examples.map((ex: any, i: number) => (
            <View key={i} style={[
              styles.exampleCard,
              ex.type === "positive" && styles.exPositive,
              ex.type === "negative" && styles.exNegative,
              ex.type === "question" && styles.exQuestion,
            ]}>
              <Text style={styles.exText}>{ex.sentence}</Text>
            </View>
          ))}
        </View>

        {/* İpucu */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Tip</Text>
          <Text style={styles.tipText}>{tense.tips}</Text>
        </View>

        {/* Zaman ifadeleri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Expressions</Text>
          <View style={styles.tagsContainer}>
            {tense.timeExpressions.map((expr: string, i: number) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{expr}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quiz Butonu */}
        <TouchableOpacity 
        style={styles.quizBtn}
        onPress={() => router.push(`/modules/tense/quiz/${id}` as any)}
        >
            <LinearGradient 
            colors={["#ffffff", "#f0f0f0"]}
            style={styles.quizBtnGradient}
            >
                <Text style={styles.quizBtnText}>Start Quiz</Text>
            </LinearGradient>
        </TouchableOpacity>


      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },
  backBtn: { marginBottom: 16 },
  backText: { color: "rgba(255,255,255,0.8)", fontSize: 16, fontWeight: "600" },
  title: { fontSize: 32, fontWeight: "900", color: "white", marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "white", marginBottom: 12 },
  formulaCard: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  formulaLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 4 },
  formulaText: { color: "white", fontWeight: "700", fontSize: 15 },
  useItem: { flexDirection: "row", marginBottom: 8, gap: 8 },
  useBullet: { color: "white", fontSize: 16, fontWeight: "800" },
  useText: { color: "rgba(255,255,255,0.9)", fontSize: 14, lineHeight: 20, flex: 1 },
  exampleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  exPositive: { backgroundColor: "rgba(52,211,153,0.2)" },
  exNegative: { backgroundColor: "rgba(248,113,113,0.2)" },
  exQuestion: { backgroundColor: "rgba(96,165,250,0.2)" },
  exIcon: { fontSize: 16 },
  exText: { color: "white", fontSize: 14, flex: 1, lineHeight: 20 },
  tipCard: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  tipTitle: { color: "white", fontWeight: "800", fontSize: 16, marginBottom: 8 },
  tipText: { color: "rgba(255,255,255,0.9)", fontSize: 14, lineHeight: 22 },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: { color: "white", fontSize: 13, fontWeight: "600" },
  quizBtn: {
  borderRadius: 16,
  overflow: "hidden",
  marginTop: 8,
},
quizBtnGradient: {
  paddingVertical: 18,
  alignItems: "center",
},
quizBtnText: {
  color: "#7c3aed",
  fontWeight: "900",
  fontSize: 18,
},
});