import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";

const { width } = Dimensions.get("window");

const levelColors: Record<string, string[]> = {
  A1: ["#60a5fa", "#3b82f6"],
  A2: ["#34d399", "#10b981"],
  B1: ["#fbbf24", "#f59e0b"],
  B2: ["#f97316", "#ea580c"],
  C1: ["#f953c6", "#b91d73"],
  C2: ["#7c3aed", "#4a0080"],
};

const levelDescriptions: Record<string, string> = {
  A1: "Beginner — You're just starting out. Great job taking the first step!",
  A2: "Elementary — You know the basics and can handle simple conversations.",
  B1: "Intermediate — You can manage everyday situations with confidence.",
  B2: "Upper Intermediate — You communicate fluently on a wide range of topics.",
  C1: "Advanced — You express yourself clearly and spontaneously.",
  C2: "Mastery — You understand virtually everything and speak effortlessly.",
};

export default function LevelResultScreen() {
  const router = useRouter();
  const { level, score, feedback } = useLocalSearchParams<{
    level: string;
    score: string;
    feedback: string;
  }>();

  const colors = levelColors[level] || ["#7c3aed", "#b91d73"];

  return (
    <LinearGradient colors={["#f953c6", "#b91d73", "#7c3aed", "#60a5fa"]} style={styles.container}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Test Complete!</Text>
        <Text style={styles.subtitle}>Your English level is</Text>

        {/* Seviye rozeti */}
        <LinearGradient colors={colors as any} style={styles.levelBadge}>
          <Text style={styles.levelText}>{level}</Text>
        </LinearGradient>

        <Text style={styles.levelDesc}>{levelDescriptions[level]}</Text>

        {/* Skor */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Your Score</Text>
          <Text style={styles.scoreValue}>{score}%</Text>
        </View>

        {/* Feedback */}
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>AI Feedback</Text>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.replace("/(tabs)/home")}
        >
          <Text style={styles.btnText}>Start Learning 🚀</Text>
        </TouchableOpacity>
      </View>
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
  blobBottom: {
    position: "absolute", bottom: -100, right: -80,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: "rgba(96,165,250,0.4)",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  emoji: { fontSize: 60, marginBottom: 12 },
  title: { fontSize: 32, fontWeight: "900", color: "white", marginBottom: 6 },
  subtitle: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 20 },
  levelBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  levelText: { fontSize: 42, fontWeight: "900", color: "white" },
  levelDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  scoreCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  scoreLabel: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 4 },
  scoreValue: { color: "white", fontSize: 36, fontWeight: "900" },
  feedbackCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    width: "100%",
  },
  feedbackTitle: { color: "white", fontWeight: "700", fontSize: 14, marginBottom: 8 },
  feedbackText: { color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 20 },
  btn: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: "100%",
    alignItems: "center",
  },
  btnText: { color: "#7c3aed", fontWeight: "800", fontSize: 16 },
});