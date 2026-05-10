import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

const SCENARIOS = [
  { id: "free", name: "Free Conversation", emoji: "💬", description: "Talk about anything you want" },
  { id: "cafe", name: "At the Café", emoji: "☕", description: "Order drinks and food, chat with the barista" },
  { id: "job-interview", name: "Job Interview", emoji: "💼", description: "Practice common job interview questions" },
  { id: "travel", name: "At the Airport", emoji: "✈️", description: "Check-in, customs, asking for directions" },
  { id: "doctor", name: "Doctor's Appointment", emoji: "🏥", description: "Describe symptoms, ask questions at the clinic" },
  { id: "shopping", name: "Shopping", emoji: "🛍️", description: "Shop for clothes, ask about sizes and prices" },
];

const getScoreColor = (score: number) => {
  if (score >= 80) return "#34d399";
  if (score >= 60) return "#fbbf24";
  return "#f87171";
};

export default function SpeakingTabScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/speaking/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0ea5e9", "#6366f1", "#a21caf"]} style={styles.container}>
      <View style={styles.blob} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>Speaking Practice</Text>
        <Text style={styles.subtitle}>
          Have a real conversation with AI and get instant feedback on your English
        </Text>

        <View style={styles.tipBox}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            Speak naturally — AI will respond and give you grammar & vocabulary tips after each message
          </Text>
        </View>

        {/* Senaryo Seçimi */}
        <Text style={styles.sectionTitle}>Choose a scenario</Text>
        {SCENARIOS.map(s => (
          <TouchableOpacity
            key={s.id}
            style={styles.scenarioCard}
            onPress={() => router.push(`/speaking/${s.id}` as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.scenarioEmoji}>{s.emoji}</Text>
            <View style={styles.scenarioInfo}>
              <Text style={styles.scenarioName}>{s.name}</Text>
              <Text style={styles.scenarioDesc}>{s.description}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}

        {/* Geçmiş Konuşmalar */}
        <TouchableOpacity
          style={styles.historyHeader}
          onPress={() => setShowHistory(!showHistory)}
        >
          <Text style={styles.sectionTitle}>📋 Past Sessions ({history.length})</Text>
          <Text style={styles.chevron}>{showHistory ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {showHistory && (
          <>
            {historyLoading ? (
              <ActivityIndicator color="white" style={{ marginVertical: 16 }} />
            ) : history.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyEmoji}>🎙️</Text>
                <Text style={styles.emptyText}>No sessions yet. Start practicing!</Text>
              </View>
            ) : (
              history.map(session => (
                <TouchableOpacity
                  key={session.id}
                  style={styles.sessionCard}
                  onPress={() => router.push(`/speaking/session/${session.id}` as any)}
                  activeOpacity={0.85}
                >
                  <View style={styles.sessionTop}>
                    <Text style={styles.sessionEmoji}>
                      {SCENARIOS.find(s => s.id === session.scenario_id)?.emoji || "💬"}
                    </Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.sessionName}>{session.scenario_name}</Text>
                      <Text style={styles.sessionDate}>
                        {new Date(session.created_at).toLocaleDateString("tr-TR")} •{" "}
                        {session.message_count} messages
                      </Text>
                    </View>
                    {session.overall_score && (
                      <Text style={[styles.sessionScore, { color: getScoreColor(session.overall_score) }]}>
                        {session.overall_score}%
                      </Text>
                    )}
                  </View>
                  {session.overall_score && (
                    <View style={styles.scoreBarRow}>
                      {[
                        { label: "Grammar", score: session.grammar_score },
                        { label: "Vocab", score: session.vocabulary_score },
                        { label: "Fluency", score: session.fluency_score },
                      ].map(item => (
                        <View key={item.label} style={styles.scoreBarItem}>
                          <Text style={styles.scoreBarLabel}>{item.label}</Text>
                          <View style={styles.scoreBarBg}>
                            <View style={[styles.scoreBarFill, {
                              width: `${item.score}%` as any,
                              backgroundColor: getScoreColor(item.score),
                            }]} />
                          </View>
                          <Text style={[styles.scoreBarValue, { color: getScoreColor(item.score) }]}>
                            {item.score}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blob: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(99,102,241,0.4)",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 120,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 22,
    marginBottom: 20,
  },
  tipBox: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  tipIcon: {
    fontSize: 20,
  },
  tipText: {
    flex: 1,
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "white",
    marginBottom: 14,
  },
  scenarioCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    gap: 14,
  },
  scenarioEmoji: {
    fontSize: 36,
  },
  scenarioInfo: {
    flex: 1,
  },
  scenarioName: {
    fontSize: 17,
    fontWeight: "800",
    color: "white",
    marginBottom: 4,
  },
  scenarioDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 18,
  },
  arrow: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 18,
    fontWeight: "700",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 14,
  },
  chevron: {
    color: "white",
    fontSize: 14,
  },
  emptyBox: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
  },
  sessionCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  sessionTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sessionEmoji: {
    fontSize: 28,
  },
  sessionName: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 2,
  },
  sessionDate: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
  sessionScore: {
    fontSize: 22,
    fontWeight: "900",
  },
  scoreBarRow: {
    gap: 8,
  },
  scoreBarItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scoreBarLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    width: 50,
  },
  scoreBarBg: {
    flex: 1,
    height: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 3,
  },
  scoreBarFill: {
    height: 5,
    borderRadius: 3,
  },
  scoreBarValue: {
    fontSize: 11,
    fontWeight: "700",
    width: 24,
    textAlign: "right",
  },
});