import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const topics = [
  {
    id: "articles",
    name: "Articles",
    formula: "a / an / the",
    example: "I saw a dog. The dog was friendly.",
    color: ["#f953c6", "#b91d73"] as [string, string],
    level: "A1",
  },
  {
    id: "prepositions",
    name: "Prepositions",
    formula: "in / on / at / by / for / with",
    example: "She lives in Istanbul, on the third floor.",
    color: ["#60a5fa", "#2563eb"] as [string, string],
    level: "A1",
  },
  {
    id: "modal-verbs",
    name: "Modal Verbs",
    formula: "can / must / should / might / would",
    example: "You should study more. She might be late.",
    color: ["#34d399", "#059669"] as [string, string],
    level: "A2",
  },
  {
    id: "conditionals",
    name: "Conditionals",
    formula: "If + condition, result",
    example: "If it rains, I will stay home.",
    color: ["#fbbf24", "#d97706"] as [string, string],
    level: "B1",
  },
  {
    id: "passive-voice",
    name: "Passive Voice",
    formula: "Subject + be + V3",
    example: "The cake was eaten by the children.",
    color: ["#fb923c", "#ea580c"] as [string, string],
    level: "B1",
  },
  {
    id: "reported-speech",
    name: "Reported Speech",
    formula: "Subject + said (that) + clause",
    example: "She said that she was tired.",
    color: ["#a855f7", "#7c3aed"] as [string, string],
    level: "B2",
  },
  {
    id: "comparatives",
    name: "Comparatives & Superlatives",
    formula: "adj + -er / more adj / the most adj",
    example: "She is taller than her brother.",
    color: ["#f87171", "#dc2626"] as [string, string],
    level: "A2",
  },
  {
    id: "phrasal-verbs",
    name: "Phrasal Verbs",
    formula: "Verb + Particle",
    example: "She gave up smoking last year.",
    color: ["#e879f9", "#a21caf"] as [string, string],
    level: "B2",
  },
];

export default function GrammarScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#f953c6", "#b91d73", "#7c3aed", "#60a5fa"]} style={styles.container}>
      <View style={styles.blobTop} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Grammar</Text>
        <Text style={styles.subtitle}>
          Master core English grammar topics with rules and practice!
        </Text>

        {topics.map((topic) => (
          <TouchableOpacity
            key={topic.id}
            onPress={() => router.push(`/modules/grammar/${topic.id}` as any)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={topic.color}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.topicCard}
            >
              <View style={styles.cardTop}>
                <Text style={styles.topicName}>{topic.name}</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>{topic.level}</Text>
                </View>
              </View>
              <Text style={styles.formula}>{topic.formula}</Text>
              <Text style={styles.example}>"{topic.example}"</Text>
              <View style={styles.learnBtn}>
                <Text style={styles.learnBtnText}>Learn More →</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blobTop: {
    position: "absolute", top: -80, left: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(236,72,153,0.5)",
  },
  content: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 120 },
  backBtn: { marginBottom: 16 },
  backText: { color: "rgba(255,255,255,0.8)", fontSize: 16, fontWeight: "600" },
  title: { fontSize: 36, fontWeight: "900", color: "white", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "rgba(255,255,255,0.8)", marginBottom: 28, lineHeight: 22 },
  topicCard: { borderRadius: 20, padding: 20, marginBottom: 16 },
  cardTop: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 10,
  },
  topicName: { fontSize: 20, fontWeight: "800", color: "white" },
  levelBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3,
  },
  levelBadgeText: { color: "white", fontWeight: "700", fontSize: 12 },
  formula: {
    fontSize: 14, color: "rgba(255,255,255,0.9)", fontWeight: "600",
    marginBottom: 8, backgroundColor: "rgba(0,0,0,0.15)",
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: "flex-start",
  },
  example: {
    fontSize: 13, color: "rgba(255,255,255,0.85)",
    fontStyle: "italic", marginBottom: 12, lineHeight: 20,
  },
  learnBtn: {
    alignSelf: "flex-end", backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 7,
  },
  learnBtnText: { color: "white", fontWeight: "700", fontSize: 13 },
});