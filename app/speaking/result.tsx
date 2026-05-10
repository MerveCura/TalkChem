import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function SpeakingResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const analysis = params.analysis ? JSON.parse(params.analysis as string) : null;

  if (!analysis) {
    return (
      <LinearGradient colors={["#0ea5e9", "#6366f1"]} style={styles.centered}>
        <Text style={styles.errorText}>No analysis available</Text>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/speaking" as any)}>
          <Text style={styles.backLink}>← Back to Speaking</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#34d399";
    if (score >= 60) return "#fbbf24";
    return "#f87171";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent! 🌟";
    if (score >= 80) return "Great! 🎉";
    if (score >= 70) return "Good! 👍";
    if (score >= 60) return "Not bad! 💪";
    return "Keep practicing! 📚";
  };

  const subScores = [
    { label: "Grammar", score: analysis.grammar_score },
    { label: "Vocabulary", score: analysis.vocabulary_score },
    { label: "Fluency", score: analysis.fluency_score },
    ...(analysis.pronunciation_score != null
      ? [{ label: "Pronunciation", score: Math.round(analysis.pronunciation_score) }]
      : []),
  ];

  return (
    <LinearGradient colors={["#0ea5e9", "#6366f1", "#a21caf"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Session Analysis</Text>

        {/* Overall score */}
        <View style={styles.overallCard}>
          <Text style={styles.overallLabel}>Overall Score</Text>
          <Text style={[styles.overallScore, { color: getScoreColor(analysis.overall_score) }]}>
            {analysis.overall_score}
          </Text>
          <Text style={styles.overallLabel}>{getScoreLabel(analysis.overall_score)}</Text>
        </View>

        {/* Sub scores */}
        <View style={styles.subScoresRow}>
          {subScores.map(item => (
            <View key={item.label} style={styles.subScoreCard}>
              <Text style={[styles.subScore, { color: getScoreColor(item.score) }]}>{item.score}</Text>
              <Text style={styles.subScoreLabel}>{item.label}</Text>
              <View style={styles.subScoreBar}>
                <View style={[styles.subScoreFill, {
                  width: `${item.score}%` as any,
                  backgroundColor: getScoreColor(item.score),
                }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Strengths */}
        {analysis.strengths?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Strengths</Text>
            {analysis.strengths.map((s: string, i: number) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.listDot}>•</Text>
                <Text style={styles.listText}>{s}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Improvements */}
        {analysis.improvements?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Areas to Improve</Text>
            {analysis.improvements.map((s: string, i: number) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.listDot}>•</Text>
                <Text style={styles.listText}>{s}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Examples */}
        {analysis.examples?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔍 Corrections</Text>
            {analysis.examples.map((ex: any, i: number) => (
              <View key={i} style={styles.exampleCard}>
                <View style={styles.exampleRow}>
                  <Text style={styles.exampleLabel}>You said:</Text>
                  <Text style={styles.exampleOriginal}>"{ex.original}"</Text>
                </View>
                <View style={styles.exampleRow}>
                  <Text style={styles.exampleLabel}>Better:</Text>
                  <Text style={styles.exampleCorrected}>"{ex.corrected}"</Text>
                </View>
                {ex.note && <Text style={styles.exampleNote}>{ex.note}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Encouragement */}
        {analysis.encouragement && (
          <View style={styles.encouragementCard}>
            <Text style={styles.encouragementEmoji}>🌟</Text>
            <Text style={styles.encouragementText}>{analysis.encouragement}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.practiceAgainBtn}
          onPress={() => router.replace("/(tabs)/speaking" as any)}
        >
          <Text style={styles.practiceAgainText}>Practice Again 🎙️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace("/(tabs)/home" as any)}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: "white",
    fontSize: 16,
    marginBottom: 16,
  },
  backLink: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "white",
    marginBottom: 24,
    textAlign: "center",
  },
  overallCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  overallLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  overallScore: {
    fontSize: 72,
    fontWeight: "900",
    marginVertical: 4,
  },
  subScoresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  subScoreCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  subScore: {
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 2,
  },
  subScoreLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
  },
  subScoreBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 2,
  },
  subScoreFill: {
    height: 4,
    borderRadius: 2,
  },
  section: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  sectionTitle: {
    color: "white",
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  listDot: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    marginTop: 1,
  },
  listText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  exampleCard: {
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  exampleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  exampleLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "700",
    minWidth: 60,
  },
  exampleOriginal: {
    color: "#fca5a5",
    fontSize: 13,
    flex: 1,
  },
  exampleCorrected: {
    color: "#86efac",
    fontSize: 13,
    flex: 1,
  },
  exampleNote: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
  },
  encouragementCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(251,191,36,0.15)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.3)",
    alignItems: "flex-start",
  },
  encouragementEmoji: {
    fontSize: 24,
  },
  encouragementText: {
    flex: 1,
    color: "#fde68a",
    fontSize: 14,
    lineHeight: 22,
  },
  practiceAgainBtn: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  practiceAgainText: {
    color: "#6366f1",
    fontWeight: "800",
    fontSize: 16,
  },
  homeBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  homeBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
});