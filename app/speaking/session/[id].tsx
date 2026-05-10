import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";

const getScoreColor = (score: number) => {
  if (score >= 80) return "#34d399";
  if (score >= 60) return "#fbbf24";
  return "#f87171";
};

export default function SessionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/speaking/history/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSession(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#0ea5e9", "#6366f1"]} style={styles.centered}>
        <ActivityIndicator size="large" color="white" />
      </LinearGradient>
    );
  }

  if (!session) {
    return (
      <LinearGradient colors={["#0ea5e9", "#6366f1"]} style={styles.centered}>
        <Text style={styles.errorText}>Session not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Go Back</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const analysis = session.analysis;

  return (
    <LinearGradient colors={["#0ea5e9", "#6366f1", "#a21caf"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{session.scenario_name}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Skorlar */}
        {analysis && (
          <>
            <View style={styles.overallCard}>
              <Text style={styles.overallLabel}>Overall Score</Text>
              <Text style={[styles.overallScore, { color: getScoreColor(analysis.overall_score) }]}>
                {analysis.overall_score}
              </Text>
              <View style={styles.subScoresRow}>
                {[
                  { label: "Grammar", score: analysis.grammar_score },
                  { label: "Vocabulary", score: analysis.vocabulary_score },
                  { label: "Fluency", score: analysis.fluency_score },
                ].map(item => (
                  <View key={item.label} style={styles.subScoreItem}>
                    <Text style={[styles.subScore, { color: getScoreColor(item.score) }]}>{item.score}</Text>
                    <Text style={styles.subScoreLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Encouragement */}
            {analysis.encouragement && (
              <View style={styles.encouragementBox}>
                <Text style={styles.encouragementEmoji}>🌟</Text>
                <Text style={styles.encouragementText}>{analysis.encouragement}</Text>
              </View>
            )}
          </>
        )}

        {/* Konuşma geçmişi */}
        <Text style={styles.sectionTitle}>💬 Conversation</Text>
        {session.messages?.map((msg: any, i: number) => (
          <View key={i}>
            <View style={msg.role === "user" ? styles.userMsgWrap : styles.aiMsgWrap}>
              {msg.role === "assistant" && (
                <View style={styles.aiAvatar}>
                  <Text style={styles.aiAvatarText}>AI</Text>
                </View>
              )}
              <View style={[styles.bubble, msg.role === "user" ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.bubbleText, msg.role === "user" ? styles.userBubbleText : styles.aiBubbleText]}>
                  {msg.content}
                </Text>
              </View>
              {msg.role === "user" && (
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>You</Text>
                </View>
              )}
            </View>
            {msg.role === "assistant" && msg.feedback && (
              <View style={styles.feedbackBubble}>
                <Text style={styles.feedbackIcon}>💡</Text>
                <Text style={styles.feedbackText}>{msg.feedback}</Text>
              </View>
            )}
          </View>
        ))}

        {/* Corrections */}
        {analysis?.examples?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔍 Corrections</Text>
            {analysis.examples.map((ex: any, i: number) => (
              <View key={i} style={styles.exampleCard}>
                <Text style={styles.exampleLabel}>You said:</Text>
                <Text style={styles.exampleOriginal}>"{ex.original}"</Text>
                <Text style={styles.exampleLabel}>Better:</Text>
                <Text style={styles.exampleCorrected}>"{ex.corrected}"</Text>
                {ex.note && <Text style={styles.exampleNote}>{ex.note}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Strengths */}
        {analysis?.strengths?.length > 0 && (
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
        {analysis?.improvements?.length > 0 && (
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 12,
  },
  backText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  headerTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  overallCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  overallLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  overallScore: {
    fontSize: 60,
    fontWeight: "900",
    marginBottom: 12,
  },
  subScoresRow: {
    flexDirection: "row",
    gap: 20,
  },
  subScoreItem: {
    alignItems: "center",
  },
  subScore: {
    fontSize: 22,
    fontWeight: "900",
  },
  subScoreLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    marginTop: 2,
  },
  encouragementBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(251,191,36,0.15)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.3)",
    alignItems: "flex-start",
  },
  encouragementEmoji: {
    fontSize: 20,
  },
  encouragementText: {
    flex: 1,
    color: "#fde68a",
    fontSize: 13,
    lineHeight: 20,
  },
  sectionTitle: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  userMsgWrap: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 4,
  },
  aiMsgWrap: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 4,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  aiAvatarText: {
    color: "white",
    fontSize: 9,
    fontWeight: "800",
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    color: "white",
    fontSize: 8,
    fontWeight: "800",
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 16,
    padding: 12,
  },
  aiBubble: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiBubbleText: {
    color: "white",
  },
  userBubbleText: {
    color: "#1e1b4b",
    fontWeight: "500",
  },
  feedbackBubble: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "rgba(251,191,36,0.12)",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.25)",
    marginHorizontal: 36,
    marginBottom: 8,
  },
  feedbackIcon: {
    fontSize: 14,
  },
  feedbackText: {
    flex: 1,
    color: "#fde68a",
    fontSize: 12,
    lineHeight: 18,
  },
  section: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  listItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  listDot: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
  listText: {
    flex: 1,
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    lineHeight: 20,
  },
  exampleCard: {
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  exampleLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  exampleOriginal: {
    color: "#fca5a5",
    fontSize: 13,
    marginBottom: 6,
  },
  exampleCorrected: {
    color: "#86efac",
    fontSize: 13,
    marginBottom: 4,
  },
  exampleNote: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontStyle: "italic",
  },
});