import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../../config";

const BATCH_SIZE = 5;
const TOTAL_BATCHES = 3;
const TOTAL_QUESTIONS = BATCH_SIZE * TOTAL_BATCHES;

const TOPIC_NAMES: Record<string, string> = {
  "articles": "Articles",
  "prepositions": "Prepositions",
  "modal-verbs": "Modal Verbs",
  "conditionals": "Conditionals",
  "passive-voice": "Passive Voice",
  "reported-speech": "Reported Speech",
  "comparatives": "Comparatives & Superlatives",
  "phrasal-verbs": "Phrasal Verbs",
};

export default function GrammarQuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const topicId = params.id as string;

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);

  const loadedBatches = useRef<Set<number>>(new Set());
  const prefetchingBatch = useRef<number | null>(null);

  useEffect(() => {
    if (topicId) init();
  }, [topicId]);

  useEffect(() => {
    const currentBatch = Math.floor(currentIndex / BATCH_SIZE) + 1;
    const nextBatch = currentBatch + 1;
    const positionInBatch = currentIndex % BATCH_SIZE;

    const shouldPrefetch =
      positionInBatch >= Math.floor(BATCH_SIZE / 2) &&
      nextBatch <= TOTAL_BATCHES &&
      !loadedBatches.current.has(nextBatch) &&
      prefetchingBatch.current !== nextBatch;

    if (shouldPrefetch) {
      fetchBatch(nextBatch, true);
    }
  }, [currentIndex]);

  const init = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Please login first");
        router.replace("/(auth)/login");
        return;
      }
      const startRes = await fetch(`${API_URL}/api/grammar-quiz/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ topic_id: topicId }),
      });
      const startData = await startRes.json();
      setAttemptId(startData.attempt_id);
      await fetchBatch(1);
    } catch (e) {
      Alert.alert("Error", "Failed to load quiz");
    }
  };

  const fetchBatch = async (batchNo: number, isPrefetch = false) => {
    if (loadedBatches.current.has(batchNo)) return;
    if (prefetchingBatch.current === batchNo) return;
    prefetchingBatch.current = batchNo;
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/grammar-quiz/questions/${topicId}/batch/${batchNo}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to load questions");
      setQuestions(prev => [...prev, ...data.questions]);
      loadedBatches.current.add(batchNo);
    } catch (e) {
      if (!isPrefetch) Alert.alert("Error", "Failed to load questions");
    } finally {
      prefetchingBatch.current = null;
      if (batchNo === 1) setInitialLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return Alert.alert("", "Please select an answer!");
    const current = questions[currentIndex];
    setChecking(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/grammar-quiz/check-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question: current,
          user_answer: selectedAnswer,
          correct_answer: current.correct_answer,
          topic_id: topicId,
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
    const nextIndex = currentIndex + 1;

    if (nextIndex >= TOTAL_QUESTIONS) {
      try {
        const token = await AsyncStorage.getItem("token");
        const finalCorrect = result?.is_correct ? correctCount + 1 : correctCount;
        const res = await fetch(`${API_URL}/api/grammar-quiz/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            attempt_id: attemptId,
            correct_count: finalCorrect,
            total: TOTAL_QUESTIONS,
            topic_id: topicId,
          }),
        });
        const data = await res.json();
        setFinalResult(data);
        setFinished(true);
      } catch (e) {
        console.error(e);
      }
      return;
    }

    const nextBatch = Math.floor(nextIndex / BATCH_SIZE) + 1;
    if (!loadedBatches.current.has(nextBatch)) {
      await fetchBatch(nextBatch);
    }
    setCurrentIndex(nextIndex);
    setResult(null);
    setSelectedAnswer("");
  };

  if (initialLoading) {
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
          {isPerfect ? "Amazing! You've mastered this topic! 🌟" : "Keep practising! You'll get there! 💪"}
        </Text>
        <TouchableOpacity style={styles.finishBtn} onPress={() => router.back()}>
          <Text style={styles.finishBtnText}>
            {isPerfect ? "Back to Grammar 🎉" : "Try Again 🔄"}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const current = questions[currentIndex];
  if (!current) return null;

  const progress = ((currentIndex + 1) / TOTAL_QUESTIONS) * 100;
  const topicName = TOPIC_NAMES[topicId] || topicId.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());

  return (
    <LinearGradient colors={["#f953c6", "#b91d73", "#7c3aed"]} style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{topicName} Quiz</Text>
          <Text style={styles.counter}>{currentIndex + 1}/{TOTAL_QUESTIONS}</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.questionCard}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>Multiple Choice</Text>
            </View>
            <Text style={styles.questionText}>{current.question}</Text>

            {!result && (
              <View style={styles.optionsContainer}>
                {current.options?.map((option: string, i: number) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.optionBtn, selectedAnswer === option && styles.optionSelected]}
                    onPress={() => setSelectedAnswer(option)}
                  >
                    <Text style={[styles.optionText, selectedAnswer === option && styles.optionTextSelected]}>
                      {String.fromCharCode(65 + i)}. {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {result && (
              <View style={[styles.feedbackCard, result.is_correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
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

          {!result ? (
            <TouchableOpacity
              style={[styles.submitBtn, (checking || !selectedAnswer) && styles.btnDisabled]}
              onPress={handleSubmitAnswer}
              disabled={checking || !selectedAnswer}
            >
              {checking
                ? <ActivityIndicator color="#7c3aed" />
                : <Text style={styles.submitBtnText}>Check Answer ✓</Text>
              }
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>
                {currentIndex + 1 >= TOTAL_QUESTIONS ? "Finish Quiz 🏁" : "Next Question →"}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  loadingText: {
    color: "white",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
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
    fontSize: 20,
    fontWeight: "700",
  },
  headerTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  counter: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 24,
    borderRadius: 3,
    marginBottom: 20,
  },
  progressFill: {
    height: 6,
    backgroundColor: "white",
    borderRadius: 3,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
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
  typeBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },
  questionText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 26,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 10,
  },
  optionBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  optionSelected: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderColor: "white",
  },
  optionText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
  },
  optionTextSelected: {
    color: "white",
    fontWeight: "700",
  },
  feedbackCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  feedbackCorrect: {
    backgroundColor: "rgba(52,211,153,0.2)",
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.4)",
  },
  feedbackWrong: {
    backgroundColor: "rgba(248,113,113,0.2)",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.4)",
  },
  feedbackIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  feedbackTitle: {
    color: "white",
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 8,
  },
  correctAnswerText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginBottom: 8,
  },
  aiFeedbackText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    lineHeight: 20,
  },
  submitBtn: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  submitBtnText: {
    color: "#7c3aed",
    fontWeight: "800",
    fontSize: 16,
  },
  nextBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    marginBottom: 16,
  },
  nextBtnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  finishEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  finishTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "white",
    marginBottom: 8,
  },
  finishScore: {
    fontSize: 64,
    fontWeight: "900",
    color: "white",
    marginBottom: 4,
  },
  finishDetail: {
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 16,
  },
  perfectMsg: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  finishBtn: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  finishBtnText: {
    color: "#7c3aed",
    fontWeight: "800",
    fontSize: 16,
  },
});