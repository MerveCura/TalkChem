import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../../config";

export default function TenseQuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tenseId = params.tenseId as string;

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);

  useEffect(() => {
    if (tenseId) init();
  }, [tenseId]);

  const init = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Please login first");
        router.replace("/(auth)/login");
        return;
      }

      // Quiz başlat
      const startRes = await fetch(`${API_URL}/api/tense-quiz/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tense_id: tenseId }),
      });
      const startData = await startRes.json();
      setAttemptId(startData.attempt_id);

      // Soruları yükle
      const qRes = await fetch(`${API_URL}/api/tense-quiz/questions/${tenseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const qData = await qRes.json();
      setQuestions(qData.questions || []);
    } catch (e) {
      Alert.alert("Error", "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return Alert.alert("", "Please select an answer!");
    const current = questions[currentIndex];

    setChecking(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/tense-quiz/check-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question: current,
          user_answer: selectedAnswer,
          correct_answer: current.correct_answer,
          tense_id: tenseId,
          attempt_id: attemptId,
        }),
      });
      const data = await res.json();
      setResult(data);
      if (data.is_correct) setCorrectCount(prev => prev + 1);
    } catch (e) {
      Alert.alert("Error", "Failed to check answer");
    } finally {
      setChecking(false);
    }
  };

  const handleNext = async () => {
    const newCorrectCount = result?.is_correct ? correctCount : correctCount;

    if (currentIndex + 1 >= questions.length) {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/tense-quiz/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            attempt_id: attemptId,
            correct_count: newCorrectCount,
            total: questions.length,
          }),
        });
        const data = await res.json();
        setFinalResult(data);
        setFinished(true);
      } catch (e) {
        console.error(e);
      }
    } else {
      setCurrentIndex(currentIndex + 1);
      setResult(null);
      setSelectedAnswer("");
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#f953c6", "#b91d73", "#7c3aed"]} style={styles.centered}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Preparing your quiz... ✨</Text>
      </LinearGradient>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <LinearGradient colors={["#f953c6", "#b91d73", "#7c3aed"]} style={styles.centered}>
        <Text style={styles.loadingText}>No questions found 😔</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "white", marginTop: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  if (finished && finalResult) {
    const isPerfect = finalResult.perfect;
    return (
      <LinearGradient
        colors={isPerfect ? ["#34d399", "#059669"] : ["#f953c6", "#b91d73", "#7c3aed"]}
        style={styles.centered}
      >
        <Text style={styles.finishEmoji}>{isPerfect ? "🏆" : "🎯"}</Text>
        <Text style={styles.finishTitle}>{isPerfect ? "Perfect Score!" : "Quiz Complete!"}</Text>
        <Text style={styles.finishScore}>{finalResult.score}%</Text>
        <Text style={styles.finishDetail}>{finalResult.correct_count} / {finalResult.total} correct</Text>
        <Text style={styles.perfectMsg}>
          {isPerfect ? "Amazing! You've mastered this tense! 🌟" : "Keep practicing! You'll get there! 💪"}
        </Text>
        <TouchableOpacity style={styles.finishBtn} onPress={() => router.back()}>
          <Text style={styles.finishBtnText}>
            {isPerfect ? "Back to Tenses 🎉" : "Try Again 🔄"}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const current = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const tenseName = tenseId?.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());

  return (
    <LinearGradient colors={["#f953c6", "#b91d73", "#7c3aed"]} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{tenseName} Quiz</Text>
          <Text style={styles.counter}>{currentIndex + 1}/{questions.length}</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Soru kartı */}
          <View style={styles.questionCard}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {current.type === "multiple_choice" ? "Multiple Choice" : "Fill in the Blank"}
              </Text>
            </View>
            <Text style={styles.questionText}>{current.question}</Text>

            {/* Seçenekler */}
            {!result && (
              <View style={styles.optionsContainer}>
                {current.options?.map((option: string, i: number) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.optionBtn,
                      selectedAnswer === option && styles.optionSelected,
                    ]}
                    onPress={() => setSelectedAnswer(option)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedAnswer === option && styles.optionTextSelected,
                    ]}>
                      {String.fromCharCode(65 + i)}. {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Feedback */}
            {result && (
              <View style={[
                styles.feedbackCard,
                result.is_correct ? styles.feedbackCorrect : styles.feedbackWrong
              ]}>
                <Text style={styles.feedbackIcon}>{result.is_correct ? "✅" : "❌"}</Text>
                <Text style={styles.feedbackTitle}>{result.is_correct ? "Correct!" : "Incorrect!"}</Text>
                {!result.is_correct && (
                  <Text style={styles.correctAnswerText}>
                    Correct answer: <Text style={{ fontWeight: "800" }}>{result.correct_answer}</Text>
                  </Text>
                )}
                {result.ai_feedback && (
                  <Text style={styles.aiFeedbackText}>{result.ai_feedback}</Text>
                )}
                {result.is_correct && result.explanation && (
                  <Text style={styles.aiFeedbackText}>{result.explanation}</Text>
                )}
              </View>
            )}
          </View>

          {/* Butonlar */}
          {!result ? (
            <TouchableOpacity
              style={[styles.submitBtn, (checking || !selectedAnswer) && styles.btnDisabled]}
              onPress={handleSubmitAnswer}
              disabled={checking || !selectedAnswer}
            >
              {checking ? (
                <ActivityIndicator color="#7c3aed" />
              ) : (
                <Text style={styles.submitBtnText}>Check Answer ✓</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>
                {currentIndex + 1 >= questions.length ? "Finish Quiz 🏁" : "Next Question →"}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  loadingText: { color: "white", fontSize: 16, marginTop: 16, textAlign: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 12,
  },
  backText: { color: "white", fontSize: 20, fontWeight: "700" },
  headerTitle: { color: "white", fontSize: 16, fontWeight: "800" },
  counter: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "600" },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 24,
    borderRadius: 3,
    marginBottom: 20,
  },
  progressFill: { height: 6, backgroundColor: "white", borderRadius: 3 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  questionCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginBottom: 16,
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  typeBadgeText: { color: "white", fontSize: 11, fontWeight: "700" },
  questionText: { color: "white", fontSize: 18, fontWeight: "700", lineHeight: 26, marginBottom: 20 },
  optionsContainer: { gap: 10 },
  optionBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  optionSelected: { backgroundColor: "rgba(255,255,255,0.3)", borderColor: "white" },
  optionText: { color: "rgba(255,255,255,0.8)", fontSize: 15 },
  optionTextSelected: { color: "white", fontWeight: "700" },
  feedbackCard: { borderRadius: 16, padding: 16, marginTop: 8 },
  feedbackCorrect: { backgroundColor: "rgba(52,211,153,0.2)", borderWidth: 1, borderColor: "rgba(52,211,153,0.4)" },
  feedbackWrong: { backgroundColor: "rgba(248,113,113,0.2)", borderWidth: 1, borderColor: "rgba(248,113,113,0.4)" },
  feedbackIcon: { fontSize: 24, marginBottom: 6 },
  feedbackTitle: { color: "white", fontWeight: "800", fontSize: 18, marginBottom: 8 },
  correctAnswerText: { color: "rgba(255,255,255,0.9)", fontSize: 14, marginBottom: 8 },
  aiFeedbackText: { color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 20 },
  submitBtn: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  submitBtnText: { color: "#7c3aed", fontWeight: "800", fontSize: 16 },
  nextBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    marginBottom: 16,
  },
  nextBtnText: { color: "white", fontWeight: "800", fontSize: 16 },
  btnDisabled: { opacity: 0.5 },
  finishEmoji: { fontSize: 80, marginBottom: 16 },
  finishTitle: { fontSize: 32, fontWeight: "900", color: "white", marginBottom: 8 },
  finishScore: { fontSize: 64, fontWeight: "900", color: "white", marginBottom: 4 },
  finishDetail: { fontSize: 18, color: "rgba(255,255,255,0.8)", marginBottom: 16 },
  perfectMsg: { fontSize: 16, color: "rgba(255,255,255,0.9)", textAlign: "center", marginBottom: 32, lineHeight: 24 },
  finishBtn: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  finishBtnText: { color: "#7c3aed", fontWeight: "800", fontSize: 16 },
});