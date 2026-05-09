import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

export default function DuelScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const duelId = params.id as string;

  const [questions, setQuestions] = useState<any[]>([]);
  const [topicName, setTopicName] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/duels/${duelId}/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        Alert.alert("Error", data.detail || "Failed to load duel");
        router.back();
        return;
      }
      const data = await res.json();
      setQuestions(data.questions || []);
      setTopicName(data.topic_name || "");
    } catch (e) {
      Alert.alert("Error", "Failed to load duel questions");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = () => {
    if (!selected) return;
    setChecked(true);
    if (selected === questions[currentIndex]?.correct_answer) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = async () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= questions.length) {
      // Son soru — submit et
      const finalCorrect = checked && selected === questions[currentIndex]?.correct_answer
        ? correctCount
        : correctCount;

      setSubmitting(true);
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/duels/${duelId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            correct_count: finalCorrect,
            total: questions.length,
          }),
        });
        const data = await res.json();
        setResult(data);
        setFinished(true);
      } catch (e) {
        Alert.alert("Error", "Failed to submit results");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setCurrentIndex(nextIndex);
    setSelected(null);
    setChecked(false);
  };

  if (loading) {
    return (
      <LinearGradient colors={["#7c3aed", "#e879f9"]} style={styles.centered}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading duel... ⚔️</Text>
      </LinearGradient>
    );
  }

  if (finished && result) {
    const myScore = result.score;
    const status = result.status;
    const isCompleted = status === "completed";
    const iWon = result.winner_id !== null && result.challenger_score !== undefined;

    return (
      <LinearGradient colors={["#7c3aed", "#e879f9"]} style={styles.centered}>
        <Text style={styles.finishEmoji}>⚔️</Text>
        <Text style={styles.finishTitle}>Duel Complete!</Text>
        <Text style={styles.finishScore}>{myScore}%</Text>
        <Text style={styles.finishDetail}>{correctCount} / {questions.length} correct</Text>

        {isCompleted ? (
          <>
            <View style={styles.scoresBox}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>You</Text>
                <Text style={styles.scoreNum}>{result.challenger_score ?? result.opponent_score}%</Text>
              </View>
              <Text style={styles.vsText}>VS</Text>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Opponent</Text>
                <Text style={styles.scoreNum}>{result.opponent_score ?? result.challenger_score}%</Text>
              </View>
            </View>
            <Text style={styles.resultMsg}>
              {result.winner_id === null
                ? "🤝 It's a draw!"
                : iWon
                  ? "🏆 You won!"
                  : "💀 You lost!"}
            </Text>
          </>
        ) : (
          <Text style={styles.waitingMsg}>
            ⏳ Waiting for your opponent to finish...{"\n"}Check back later!
          </Text>
        )}

        <TouchableOpacity style={styles.finishBtn} onPress={() => router.replace("/(tabs)/modules" as any)}>
          <Text style={styles.finishBtnText}>Back to Social</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const current = questions[currentIndex];
  if (!current) return null;

  const isCorrect = selected === current.correct_answer;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <LinearGradient colors={["#7c3aed", "#a21caf", "#e879f9"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚔️ {topicName}</Text>
        <Text style={styles.counter}>{currentIndex + 1}/{questions.length}</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <View style={styles.duelBadge}>
            <Text style={styles.duelBadgeText}>⚔️ Duel Question</Text>
          </View>
          <Text style={styles.questionText}>{current.question}</Text>

          <View style={styles.options}>
            {current.options?.map((opt: string, i: number) => {
              let bg = "rgba(255,255,255,0.08)";
              let border = "rgba(255,255,255,0.15)";
              let textColor = "rgba(255,255,255,0.85)";
              let icon = "";

              if (!checked && selected === opt) { bg = "rgba(255,255,255,0.2)"; border = "white"; textColor = "white"; }
              if (checked && opt === current.correct_answer) { bg = "rgba(52,211,153,0.2)"; border = "#34d399"; textColor = "#34d399"; icon = "✓"; }
              else if (checked && opt === selected && !isCorrect) { bg = "rgba(248,113,113,0.2)"; border = "#f87171"; textColor = "#f87171"; icon = "✗"; }

              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}
                  onPress={() => { if (!checked) setSelected(opt); }}
                  activeOpacity={checked ? 1 : 0.7}
                >
                  <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                  {icon !== "" && <Text style={[styles.checkIcon, { color: textColor }]}>{icon}</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {checked && (
            <View style={[styles.feedbackBox, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
              <Text style={styles.feedbackTitle}>{isCorrect ? "✅ Correct!" : "💡 Not quite!"}</Text>
              {current.explanation && <Text style={styles.feedbackExp}>{current.explanation}</Text>}
            </View>
          )}
        </View>

        {!checked ? (
          <TouchableOpacity
            style={[styles.checkBtn, !selected && styles.btnDisabled]}
            onPress={handleCheck}
            disabled={!selected}
          >
            <Text style={styles.checkBtnText}>Check Answer ✓</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={handleNext}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color="white" />
              : <Text style={styles.nextBtnText}>
                  {currentIndex + 1 >= questions.length ? "Finish Duel ⚔️" : "Next →"}
                </Text>
            }
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  loadingText: { color: "white", fontSize: 16, marginTop: 16 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 24, paddingTop: 60, paddingBottom: 12,
  },
  backText: { color: "white", fontSize: 20, fontWeight: "700" },
  headerTitle: { color: "white", fontSize: 15, fontWeight: "800", flex: 1, textAlign: "center", marginHorizontal: 8 },
  counter: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "600" },
  progressBar: { height: 6, backgroundColor: "rgba(255,255,255,0.2)", marginHorizontal: 24, borderRadius: 3, marginBottom: 20 },
  progressFill: { height: 6, backgroundColor: "white", borderRadius: 3 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  questionCard: {
    backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 24,
    padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", marginBottom: 16,
  },
  duelBadge: {
    alignSelf: "flex-start", backgroundColor: "rgba(232,121,249,0.3)", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12,
    borderWidth: 1, borderColor: "rgba(232,121,249,0.5)",
  },
  duelBadgeText: { color: "#f0abfc", fontSize: 11, fontWeight: "700" },
  questionText: { color: "white", fontSize: 18, fontWeight: "700", lineHeight: 26, marginBottom: 20 },
  options: { gap: 10 },
  optionBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 12, padding: 14, borderWidth: 1,
  },
  optionText: { fontSize: 14, fontWeight: "600", flex: 1 },
  checkIcon: { fontSize: 16, fontWeight: "900" },
  feedbackBox: { borderRadius: 14, padding: 14, marginTop: 14 },
  feedbackCorrect: { backgroundColor: "rgba(52,211,153,0.15)", borderWidth: 1, borderColor: "rgba(52,211,153,0.3)" },
  feedbackWrong: { backgroundColor: "rgba(251,191,36,0.12)", borderWidth: 1, borderColor: "rgba(251,191,36,0.3)" },
  feedbackTitle: { color: "white", fontWeight: "900", fontSize: 15, marginBottom: 4 },
  feedbackExp: { color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: 20 },
  checkBtn: { backgroundColor: "white", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginBottom: 16 },
  checkBtnText: { color: "#7c3aed", fontWeight: "800", fontSize: 16 },
  btnDisabled: { opacity: 0.4 },
  nextBtn: {
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 16, paddingVertical: 16,
    alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.35)", marginBottom: 16,
  },
  nextBtnText: { color: "white", fontWeight: "800", fontSize: 16 },
  finishEmoji: { fontSize: 70, marginBottom: 16 },
  finishTitle: { fontSize: 28, fontWeight: "900", color: "white", marginBottom: 8 },
  finishScore: { fontSize: 60, fontWeight: "900", color: "white", marginBottom: 4 },
  finishDetail: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 20 },
  scoresBox: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 16, marginBottom: 16,
  },
  scoreItem: { flex: 1, alignItems: "center" },
  scoreLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 4 },
  scoreNum: { color: "white", fontSize: 28, fontWeight: "900" },
  vsText: { color: "rgba(255,255,255,0.5)", fontWeight: "800", fontSize: 16 },
  resultMsg: { color: "white", fontSize: 20, fontWeight: "900", marginBottom: 24, textAlign: "center" },
  waitingMsg: { color: "rgba(255,255,255,0.8)", fontSize: 15, textAlign: "center", lineHeight: 24, marginBottom: 24 },
  finishBtn: { backgroundColor: "white", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 40 },
  finishBtnText: { color: "#7c3aed", fontWeight: "800", fontSize: 16 },
});