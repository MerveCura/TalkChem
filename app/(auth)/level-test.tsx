import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Alert, ActivityIndicator, Dimensions
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const API_URL = "http://192.168.1.114:8000";

export default function LevelTestScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openAnswer, setOpenAnswer] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/level-test/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(""));
    } catch (e) {
      Alert.alert("Error", "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = answer;
    setAnswers(newAnswers);
    setOpenAnswer("");
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    }
  };

  const handleSubmit = async () => {
    if (answers.some(a => !a)) {
      return Alert.alert("Warning", "Please answer all questions");
    }
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/level-test/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questions, answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Submit failed");
      router.replace({
        pathname: "/(auth)/level-result",
        params: {
          level: data.level,
          score: data.score,
          feedback: data.feedback,
        },
      });
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#f953c6", "#b91d73", "#7c3aed", "#60a5fa"]} style={styles.centered}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Preparing your test...{"\n"}This may take a few seconds ✨</Text>
      </LinearGradient>
    );
  }

  const current = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <LinearGradient colors={["#f953c6", "#b91d73", "#7c3aed", "#60a5fa"]} style={styles.container}>
      <View style={styles.blobTop} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Level Test 📝</Text>
        <Text style={styles.counter}>{currentIndex + 1} / {questions.length}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Soru kartı */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{current.level}</Text>
          </View>
          <Text style={styles.questionText}>{current.question}</Text>

          {/* Çoktan seçmeli */}
          {current.type === "multiple_choice" && (
            <View style={styles.optionsContainer}>
              {current.options.map((option: string, i: number) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.optionBtn,
                    answers[currentIndex] === option && styles.optionBtnSelected
                  ]}
                  onPress={() => handleAnswer(option)}
                >
                  <Text style={[
                    styles.optionText,
                    answers[currentIndex] === option && styles.optionTextSelected
                  ]}>
                    {String.fromCharCode(65 + i)}. {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Açık uçlu */}
          {current.type === "open_ended" && (
            <View style={styles.openEndedContainer}>
              <TextInput
                style={styles.openInput}
                placeholder="Write your answer here..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                multiline
                numberOfLines={4}
                value={openAnswer}
                onChangeText={setOpenAnswer}
              />
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={() => handleAnswer(openAnswer)}
              >
                <Text style={styles.nextBtnText}>
                  {currentIndex < questions.length - 1 ? "Next →" : "Finish"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Navigation */}
        <View style={styles.navRow}>
          {currentIndex > 0 && (
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => setCurrentIndex(currentIndex - 1)}
            >
              <Text style={styles.navBtnText}>← Back</Text>
            </TouchableOpacity>
          )}
          {currentIndex === questions.length - 1 && answers[currentIndex] && (
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Test 🚀</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  loadingText: { color: "white", fontSize: 16, textAlign: "center", lineHeight: 24 },
  blobTop: {
    position: "absolute", top: -80, left: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(236,72,153,0.5)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "white" },
  counter: { fontSize: 16, color: "rgba(255,255,255,0.8)", fontWeight: "600" },
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
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  card: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginBottom: 16,
  },
  levelBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  levelBadgeText: { color: "white", fontSize: 12, fontWeight: "700" },
  questionText: { fontSize: 18, fontWeight: "700", color: "white", lineHeight: 26, marginBottom: 20 },
  optionsContainer: { gap: 10 },
  optionBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  optionBtnSelected: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderColor: "white",
  },
  optionText: { color: "rgba(255,255,255,0.8)", fontSize: 15 },
  optionTextSelected: { color: "white", fontWeight: "700" },
  openEndedContainer: { gap: 12 },
  openInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 14,
    color: "white",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    minHeight: 100,
    textAlignVertical: "top",
  },
  nextBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  nextBtnText: { color: "white", fontWeight: "700", fontSize: 15 },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  navBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  navBtnText: { color: "white", fontWeight: "600" },
  submitBtn: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitBtnText: { color: "#7c3aed", fontWeight: "800", fontSize: 16 },
});