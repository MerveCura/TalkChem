import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const tenses = [
  {
    id: "present-simple",
    name: "Present Simple",
    formula: "Subject + V1",
    example: "She walks to school every day.",
    color: ["#f953c6", "#b91d73"] as [string, string],
    level: "A1",
  },
  {
    id: "present-continuous",
    name: "Present Continuous",
    formula: "Subject + am/is/are + V-ing",
    example: "She is walking to school now.",
    color: ["#ec4899", "#be185d"] as [string, string],
    level: "A1",
  },
  {
    id: "present-perfect",
    name: "Present Perfect",
    formula: "Subject + have/has + V3",
    example: "She has walked to school many times.",
    color: ["#a855f7", "#7c3aed"] as [string, string],
    level: "A2",
  },
  {
    id: "present-perfect-continuous",
    name: "Present Perfect Continuous",
    formula: "Subject + have/has been + V-ing",
    example: "She has been walking for an hour.",
    color: ["#8b5cf6", "#6d28d9"] as [string, string],
    level: "B1",
  },
  {
    id: "past-simple",
    name: "Past Simple",
    formula: "Subject + V2",
    example: "She walked to school yesterday.",
    color: ["#60a5fa", "#2563eb"] as [string, string],
    level: "A1",
  },
  {
    id: "past-continuous",
    name: "Past Continuous",
    formula: "Subject + was/were + V-ing",
    example: "She was walking when it started raining.",
    color: ["#38bdf8", "#0284c7"] as [string, string],
    level: "A2",
  },
  {
    id: "past-perfect",
    name: "Past Perfect",
    formula: "Subject + had + V3",
    example: "She had walked before the rain started.",
    color: ["#34d399", "#059669"] as [string, string],
    level: "B1",
  },
  {
    id: "past-perfect-continuous",
    name: "Past Perfect Continuous",
    formula: "Subject + had been + V-ing",
    example: "She had been walking for an hour before it rained.",
    color: ["#4ade80", "#16a34a"] as [string, string],
    level: "B2",
  },
  {
    id: "future-simple",
    name: "Future Simple",
    formula: "Subject + will + V1",
    example: "She will walk to school tomorrow.",
    color: ["#fbbf24", "#d97706"] as [string, string],
    level: "A2",
  },
  {
    id: "future-continuous",
    name: "Future Continuous",
    formula: "Subject + will be + V-ing",
    example: "She will be walking at this time tomorrow.",
    color: ["#fb923c", "#ea580c"] as [string, string],
    level: "B1",
  },
  {
    id: "future-perfect",
    name: "Future Perfect",
    formula: "Subject + will have + V3",
    example: "She will have walked 5km by noon.",
    color: ["#f87171", "#dc2626"] as [string, string],
    level: "B2",
  },
  {
    id: "future-perfect-continuous",
    name: "Future Perfect Continuous",
    formula: "Subject + will have been + V-ing",
    example: "She will have been walking for 2 hours by noon.",
    color: ["#e879f9", "#a21caf"] as [string, string],
    level: "C1",
  },
];

export default function TensesScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#f953c6", "#b91d73", "#7c3aed", "#60a5fa"]} style={styles.container}>
      <View style={styles.blobTop} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Tenses</Text>
        <Text style={styles.subtitle}>
          Learn all 12 English tenses with formulas and examples!
        </Text>

        {/* Tense kartları */}
        {tenses.map((tense) => (
          <TouchableOpacity
            key={tense.id}
            onPress={() => router.push(`/modules/tense/${tense.id}` as any)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={tense.color}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tenseCard}
            >
              <View style={styles.cardTop}>
                <Text style={styles.tenseName}>{tense.name}</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>{tense.level}</Text>
                </View>
              </View>
              <Text style={styles.formula}>{tense.formula}</Text>
              <Text style={styles.example}>"{tense.example}"</Text>
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
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },
  backBtn: {
    marginBottom: 16,
  },
  backText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 28,
    lineHeight: 22,
  },
  tenseCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tenseName: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
  },
  levelBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  levelBadgeText: {
    color: "white",
    fontWeight: "700",
    fontSize: 12,
  },
  formula: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
    marginBottom: 8,
    backgroundColor: "rgba(0,0,0,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  example: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontStyle: "italic",
    marginBottom: 12,
    lineHeight: 20,
  },
  learnBtn: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  learnBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
  },
});