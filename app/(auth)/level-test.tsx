import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Alert, ActivityIndicator, Dimensions
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

const { width } = Dimensions.get("window");

// Toplam soru ve batch sabitleri — backend ile senkronize olmalı
const BATCH_SIZE = 5;
const TOTAL_BATCHES = 4;
const TOTAL_QUESTIONS = BATCH_SIZE * TOTAL_BATCHES; // 20

export default function LevelTestScreen() {
  const router = useRouter();

  // Tüm sorular tek dizide tutulur, batch'ler geldikçe eklenir
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<string[]>(new Array(TOTAL_QUESTIONS).fill(""));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openAnswer, setOpenAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Yükleme durumları: ilk batch için tam ekran, sonrakiler için arka plan
  const [initialLoading, setInitialLoading] = useState(true);
  const [prefetching, setPrefetching] = useState(false);

  // Hangi batch'lerin yüklendiğini takip eder — aynı batch iki kez çekilmesin
  const loadedBatches = useRef<Set<number>>(new Set());
  // Prefetch başlatıldı mı? — aynı batch için birden fazla istek gitmesin
  const prefetchingBatch = useRef<number | null>(null);

  useEffect(() => {
    // Ekran açılınca sadece ilk batch çekilir — kullanıcı hemen soruya girer
    fetchBatch(1);
  }, []);

  // Kullanıcı hangi sorudaysa bir sonraki batch'i önceden yükle
  // Örnek: kullanıcı 3. sorudaysa (index=2) → batch 2 arka planda yükle
  // Böylece 6. soruya geçildiğinde sorular anında hazır olur
  useEffect(() => {
    const currentBatch = Math.floor(currentIndex / BATCH_SIZE) + 1;
    const nextBatch = currentBatch + 1;

    // Batch ortasına gelince (BATCH_SIZE/2) bir sonraki batch'i yükle
    const positionInBatch = currentIndex % BATCH_SIZE;
    const shouldPrefetch =
      positionInBatch >= Math.floor(BATCH_SIZE / 2) && // batch'in ortasına gelince
      nextBatch <= TOTAL_BATCHES &&                     // son batch değilse
      !loadedBatches.current.has(nextBatch) &&          // henüz yüklenmediyse
      prefetchingBatch.current !== nextBatch;            // şu an yüklenmiyorsa

    if (shouldPrefetch) {
      fetchBatch(nextBatch, true);
    }
  }, [currentIndex]);

  const fetchBatch = async (batchNo: number, isPrefetch = false) => {
    // Zaten yüklendi veya yükleniyorsa tekrar istek atma
    if (loadedBatches.current.has(batchNo)) return;
    if (prefetchingBatch.current === batchNo) return;

    prefetchingBatch.current = batchNo;
    if (isPrefetch) setPrefetching(true);

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/level-test/questions/batch/${batchNo}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Failed to load questions");

      // Yeni sorular mevcut listeye eklenir — önceki sorular kaybolmaz
      setQuestions(prev => [...prev, ...data.questions]);
      loadedBatches.current.add(batchNo);
    } catch (e) {
      if (!isPrefetch) {
        Alert.alert("Error", "Failed to load questions");
      }
    } finally {
      prefetchingBatch.current = null;
      if (isPrefetch) setPrefetching(false);
      if (batchNo === 1) setInitialLoading(false);
    }
  };

  // Soru değişince açık uçlu cevabı güncelle
  useEffect(() => {
    if (questions[currentIndex]?.type === "open_ended") {
      setOpenAnswer(answers[currentIndex] || "");
    }
  }, [currentIndex, questions]);

  const saveCurrentAnswer = (newAnswers: string[]) => {
    // Açık uçlu sorunun cevabını answers dizisine kaydet
    if (questions[currentIndex]?.type === "open_ended") {
      newAnswers[currentIndex] = openAnswer;
    }
    return newAnswers;
  };

  const goNext = () => {
    const newAnswers = [...answers];
    saveCurrentAnswer(newAnswers);
    setAnswers(newAnswers);

    // Bir sonraki batch henüz yüklenmediyse bekle
    const nextIndex = currentIndex + 1;
    const nextBatch = Math.floor(nextIndex / BATCH_SIZE) + 1;

    if (!loadedBatches.current.has(nextBatch)) {
      // Batch henüz gelmedi — yükle ve bekle
      fetchBatch(nextBatch).then(() => {
        setCurrentIndex(nextIndex);
      });
      return;
    }

    setCurrentIndex(nextIndex);
  };

  const goBack = () => {
    const newAnswers = [...answers];
    saveCurrentAnswer(newAnswers);
    setAnswers(newAnswers);
    setCurrentIndex(currentIndex - 1);
  };

  const handleMultipleChoice = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    const finalAnswers = [...answers];
    if (questions[currentIndex]?.type === "open_ended") {
      finalAnswers[currentIndex] = openAnswer;
    }

    // Tüm sorular cevaplanmadan submit edilemez
    if (finalAnswers.slice(0, TOTAL_QUESTIONS).some(a => !a)) {
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
        body: JSON.stringify({ questions, answers: finalAnswers }),
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

  // İlk batch yüklenene kadar tam ekran loading göster
  if (initialLoading) {
    return (
      <LinearGradient colors={["#f953c6", "#b91d73", "#7c3aed", "#60a5fa"]} style={styles.centered}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Preparing your test...{"\n"}Just a moment ✨</Text>
      </LinearGradient>
    );
  }

  const current = questions[currentIndex];
  if (!current) return null;

  const progress = ((currentIndex + 1) / TOTAL_QUESTIONS) * 100;
  const isLastQuestion = currentIndex === TOTAL_QUESTIONS - 1;
  const currentAnswered = answers[currentIndex] || (current?.type === "open_ended" && openAnswer);

  return (
    <LinearGradient colors={["#f953c6", "#b91d73", "#7c3aed", "#60a5fa"]} style={styles.container}>
      <View style={styles.blobTop} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Level Test 📝</Text>
        <View style={styles.headerRight}>
          {/* Arka planda yükleme göstergesi — kullanıcıya şeffaf bilgi verir */}
          {prefetching && (
            <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.counter}>{currentIndex + 1} / {TOTAL_QUESTIONS}</Text>
        </View>
      </View>

      {/* İlerleme çubuğu */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Soru kartı */}
        <View style={styles.card}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{current.level}</Text>
          </View>
          <Text style={styles.questionText}>{current.question}</Text>

          {/* Çoktan seçmeli */}
          {current.type === "multiple_choice" && current.options?.length > 0 && (
            <View style={styles.optionsContainer}>
              {current.options.map((option: string, i: number) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.optionBtn,
                    answers[currentIndex] === option && styles.optionBtnSelected
                  ]}
                  onPress={() => handleMultipleChoice(option)}
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
            <TextInput
              style={styles.openInput}
              placeholder="Write your answer here..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              multiline
              numberOfLines={4}
              value={openAnswer}
              onChangeText={setOpenAnswer}
            />
          )}
        </View>

        {/* Navigasyon butonları */}
        <View style={styles.navRow}>
          {currentIndex > 0 && (
            <TouchableOpacity style={styles.navBtn} onPress={goBack}>
              <Text style={styles.navBtnText}>← Back</Text>
            </TouchableOpacity>
          )}

          {!isLastQuestion && (
            <TouchableOpacity
              style={[styles.nextBtn, !currentAnswered && styles.btnDisabled]}
              onPress={goNext}
              disabled={!currentAnswered}
            >
              <Text style={styles.nextBtnText}>Next →</Text>
            </TouchableOpacity>
          )}

          {isLastQuestion && (
            <TouchableOpacity
              style={[styles.submitBtn, (!currentAnswered || submitting) && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={!currentAnswered || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#7c3aed" />
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
  headerRight: { flexDirection: "row", alignItems: "center" },
  counter: { fontSize: 16, color: "rgba(255,255,255,0.8)", fontWeight: "600" },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 24,
    borderRadius: 3,
    marginBottom: 20,
  },
  progressFill: { height: 6, backgroundColor: "white", borderRadius: 3 },
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
  optionBtnSelected: { backgroundColor: "rgba(255,255,255,0.3)", borderColor: "white" },
  optionText: { color: "rgba(255,255,255,0.8)", fontSize: 15 },
  optionTextSelected: { color: "white", fontWeight: "700" },
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
  navRow: { flexDirection: "row", gap: 12 },
  navBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  navBtnText: { color: "white", fontWeight: "600" },
  nextBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  nextBtnText: { color: "white", fontWeight: "700", fontSize: 15 },
  submitBtn: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitBtnText: { color: "#7c3aed", fontWeight: "800", fontSize: 16 },
  btnDisabled: { opacity: 0.5 },
});