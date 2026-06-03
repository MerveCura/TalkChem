import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { API_URL } from "../config";

const CATEGORIES = [
  { id: "daily", name: "Daily Conversations", emoji: "💬", desc: "Everyday casual talk" },
  { id: "job-interview", name: "Job Interview", emoji: "💼", desc: "From greeting to goodbye" },
  { id: "cafe", name: "At the Café", emoji: "☕", desc: "Ordering, asking, chatting" },
  { id: "supermarket", name: "At the Supermarket", emoji: "🛒", desc: "Shopping & asking for help" },
  { id: "doctor", name: "Doctor's Appointment", emoji: "🏥", desc: "Symptoms, questions, follow-up" },
  { id: "airport", name: "At the Airport", emoji: "✈️", desc: "Check-in to boarding" },
];

type SentenceResult = {
  sentence: string;
  spoken_text: string;
  accuracy: number;
  is_correct: boolean;
  wrong_words: { expected: string; said: string }[];
  missing_words: string[];
  pronunciation_feedback: string;
  tip: string;
};

type WordTranslation = {
  word: string;
  translation: string;
  explanation: string;
};

function getFeedbackMessage(result: SentenceResult): string {
  const { accuracy, wrong_words, missing_words } = result;
  if (accuracy >= 80) return "Great job! Keep it up. 🎉";
  const problemWords = [...wrong_words.map(w => w.expected), ...missing_words].slice(0, 2);
  if (accuracy >= 50) {
    if (problemWords.length > 0) return `Almost there! Pay attention to: "${problemWords.join('", "')}"`;
    return "Almost there! Try to be more precise.";
  }
  if (problemWords.length > 0) return `Try again! Focus on: "${problemWords[0]}"`;
  return "Try again! Listen carefully and repeat.";
}

function tokenizeSentence(sentence: string, phrases: string[]): { text: string; isPhrase: boolean; phraseKey?: string }[] {
  if (!sentence) return [];
  const lowerSentence = sentence.toLowerCase();
  const usedRanges: { start: number; end: number }[] = [];
  const sortedPhrases = [...phrases].sort((a, b) => b.length - a.length);
  const phraseRanges: { start: number; end: number; phrase: string }[] = [];
  for (const phrase of sortedPhrases) {
    const idx = lowerSentence.indexOf(phrase.toLowerCase());
    if (idx !== -1) {
      const overlaps = usedRanges.some(r => idx < r.end && idx + phrase.length > r.start);
      if (!overlaps) {
        phraseRanges.push({ start: idx, end: idx + phrase.length, phrase });
        usedRanges.push({ start: idx, end: idx + phrase.length });
      }
    }
  }
  phraseRanges.sort((a, b) => a.start - b.start);
  const result: { text: string; isPhrase: boolean; phraseKey?: string }[] = [];
  let pos = 0;
  for (const pr of phraseRanges) {
    if (pos < pr.start) result.push({ text: sentence.slice(pos, pr.start), isPhrase: false });
    result.push({ text: sentence.slice(pr.start, pr.end), isPhrase: true, phraseKey: pr.phrase });
    pos = pr.end;
  }
  if (pos < sentence.length) result.push({ text: sentence.slice(pos), isPhrase: false });
  return result;
}

function ClickableSentence({
  sentence,
  phrases,
  onWordPress,
  onPhrasePress,
}: {
  sentence: string;
  phrases: string[];
  onWordPress: (word: string) => void;
  onPhrasePress: (phrase: string) => void;
}) {
  const words = sentence.split(/(\s+)/);
  const lowerSentence = sentence.toLowerCase();

  const isInPhrase = (wordIndex: number): string | null => {
    let charPos = 0;
    for (let i = 0; i < wordIndex; i++) charPos += words[i].length;
    for (const phrase of phrases) {
      const phraseIdx = lowerSentence.indexOf(phrase.toLowerCase());
      if (phraseIdx !== -1 && charPos >= phraseIdx && charPos < phraseIdx + phrase.length) {
        return phrase;
      }
    }
    return null;
  };

  return (
    <Text style={sentenceStyles.sentenceWrapper}>
      {words.map((word, i) => {
        if (/^\s+$/.test(word)) return <Text key={i}>{word}</Text>;
        const clean = word.replace(/[^a-zA-Z']/g, "");
        const punctuation = word.replace(/[a-zA-Z']/g, "");
        const phrase = isInPhrase(i);
        return (
          <Text key={i}>
            <Text
              onPress={() => {
                if (phrase) onPhrasePress(phrase);
                else if (clean.length >= 2) onWordPress(clean);
              }}
              style={sentenceStyles.word}
            >
              {clean}
            </Text>
            <Text style={sentenceStyles.plain}>{punctuation}</Text>
          </Text>
        );
      })}
    </Text>
  );
}

const sentenceStyles = StyleSheet.create({
  sentenceWrapper: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    lineHeight: 30,
  },
  word: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    textDecorationLine: "underline",
    textDecorationColor: "rgba(255,255,255,0.4)",
  },
  plain: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
});

export default function ShadowingScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [phase, setPhase] = useState<"select" | "practice" | "result">("select");

  const [currentSentence, setCurrentSentence] = useState("");
  const [currentTip, setCurrentTip] = useState("");
  const [currentPhrases, setCurrentPhrases] = useState<string[]>([]);
  const [isLoadingSentence, setIsLoadingSentence] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [lastResult, setLastResult] = useState<SentenceResult | null>(null);
  const [results, setResults] = useState<SentenceResult[]>([]);
  const [sentenceCount, setSentenceCount] = useState(0);
  const [userLevel, setUserLevel] = useState("B1");
  const [usedSentences, setUsedSentences] = useState<string[]>([]);

  const [translationModal, setTranslationModal] = useState(false);
  const [translationData, setTranslationData] = useState<WordTranslation | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadUserLevel();
    return () => {
      soundRef.current?.unloadAsync();
      recordingRef.current?.stopAndUnloadAsync();
      if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
    };
  }, []);

  const loadUserLevel = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUserLevel(data.english_level || "B1");
    } catch {
      setUserLevel("B1");
    }
  };

  const openTranslation = async (text: string) => {
    setTranslationData(null);
    setTranslationModal(true);
    setIsTranslating(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/shadowing/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ word: text, sentence: currentSentence }),
      });
      const data = await res.json();
      setTranslationData(data);
    } catch {
      setTranslationData({ word: text, translation: "Çeviri alınamadı", explanation: "" });
    } finally {
      setIsTranslating(false);
    }
  };

  const startPractice = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPhase("practice");
    setResults([]);
    setSentenceCount(0);
    setUsedSentences([]);
    setLastResult(null);
    await fetchNewSentence(categoryId, [], 1);
  };

  const fetchNewSentence = async (categoryId: string, excluded: string[], sentenceNo: number) => {
    setIsLoadingSentence(true);
    setLastResult(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/shadowing/sentence`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category: categoryId, sentence_no: sentenceNo, exclude_sentences: excluded }),
      });
      const data = await res.json();
      setCurrentSentence(data.sentence);
      setCurrentTip(data.tip || "");
      setCurrentPhrases(data.phrases || []);
      await playTTS(data.sentence, token!);
    } catch {
      Alert.alert("Error", "Could not load sentence");
    } finally {
      setIsLoadingSentence(false);
    }
  };

  const playTTS = async (text: string, token: string) => {
    try {
      setIsPlayingTTS(true);
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const res = await fetch(`${API_URL}/api/shadowing/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${data.audio_base64}` },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingTTS(false);
          sound.unloadAsync();
        }
      });
    } catch {
      setIsPlayingTTS(false);
    }
  };

  const replaySentence = async () => {
    const token = await AsyncStorage.getItem("token");
    await playTTS(currentSentence, token!);
  };

  const toggleRecording = async () => {
    if (isRecording) await stopRecording();
    else await startRecording();
  };

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return Alert.alert("Permission denied", "Microphone access is required.");
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setIsRecording(true);
      recordingTimeoutRef.current = setTimeout(() => stopRecording(), 60000);
    } catch {
      Alert.alert("Error", "Could not start recording");
    }
  };

  const stopRecording = async () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    if (!recordingRef.current) return;
    setIsRecording(false);
    setIsEvaluating(true);
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      if (!uri) throw new Error("No URI");

      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("audio", { uri, type: "audio/m4a", name: "audio.m4a" } as any);
      formData.append("sentence", currentSentence);

      const res = await fetch(`${API_URL}/api/shadowing/evaluate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      const result: SentenceResult = {
        sentence: currentSentence,
        spoken_text: data.spoken_text,
        accuracy: data.accuracy,
        is_correct: data.is_correct,
        wrong_words: data.wrong_words || [],
        missing_words: data.missing_words || [],
        pronunciation_feedback: data.pronunciation_feedback || "",
        tip: currentTip,
      };
      setLastResult(result);
      setResults(prev => [...prev, result]);
      setSentenceCount(prev => prev + 1);
    } catch {
      Alert.alert("Error", "Could not evaluate. Try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextSentence = async () => {
    const nextCount = sentenceCount + 1;
    if (nextCount > 9) {
      await finishSession();
      return;
    }
    const newUsed = [...usedSentences, currentSentence];
    setUsedSentences(newUsed);
    await fetchNewSentence(selectedCategory!, newUsed, nextCount + 1);
  };

  const finishSession = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await fetch(`${API_URL}/api/shadowing/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category: selectedCategory, level: userLevel, sentences: results }),
      });
    } catch (e) {
      console.log("Finish error:", e);
    }
    setPhase("result");
  };

  // ── Render: Category Select ───────────────────────────────────────────────

  if (phase === "select") {
    return (
      <LinearGradient colors={["#1e1b4b", "#312e81", "#4c1d95"]} style={styles.container}>
        <ScrollView contentContainerStyle={styles.selectContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Shadowing 🎧</Text>
          <Text style={styles.subtitle}>Listen → Repeat → Get ready for real life</Text>
          <Text style={styles.sectionTitle}>Choose a scenario</Text>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => startPractice(cat.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryDesc}>{cat.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── Render: Result ────────────────────────────────────────────────────────

  if (phase === "result") {
    const correct = results.filter(r => r.is_correct).length;
    const total = results.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    return (
      <LinearGradient colors={["#1e1b4b", "#312e81", "#4c1d95"]} style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultTitle}>Session Complete! 🎉</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{accuracy}%</Text>
            <Text style={styles.scoreLabel}>Accuracy</Text>
          </View>
          <Text style={styles.scoreDetail}>{correct} / {total} sentences correct</Text>
          {results.map((r, i) => (
            <View key={i} style={[styles.resultCard, r.is_correct ? styles.resultCardCorrect : styles.resultCardWrong]}>
              <View style={styles.resultCardHeader}>
                <Text style={styles.resultCardIcon}>{r.is_correct ? "✅" : "❌"}</Text>
                <Text style={styles.resultCardAccuracy}>{r.accuracy}%</Text>
              </View>
              <Text style={styles.resultOriginal}>{r.sentence}</Text>
              <Text style={styles.resultFeedback}>{getFeedbackMessage(r)}</Text>
              {r.pronunciation_feedback ? (
                <Text style={styles.resultPron}>{r.pronunciation_feedback}</Text>
              ) : null}
            </View>
          ))}
          <TouchableOpacity style={styles.doneBtn} onPress={() => setPhase("select")}>
            <Text style={styles.doneBtnText}>Practice Again</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── Render: Practice ─────────────────────────────────────────────────────

  const catInfo = CATEGORIES.find(c => c.id === selectedCategory);
  const counterText = lastResult ? `${sentenceCount}/10` : `${sentenceCount + 1}/10`;

  return (
    <LinearGradient colors={["#1e1b4b", "#312e81", "#4c1d95"]} style={styles.container}>

      <Modal visible={translationModal} transparent animationType="fade" onRequestClose={() => setTranslationModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setTranslationModal(false)} />
          <View style={styles.modalCard}>
            {isTranslating ? (
              <ActivityIndicator color="white" size="large" />
            ) : translationData ? (
              <>
                <Text style={styles.modalWord}>{translationData.word}</Text>
                <Text style={styles.modalTranslation}>{translationData.translation}</Text>
                {translationData.explanation ? (
                  <Text style={styles.modalExplanation}>{translationData.explanation}</Text>
                ) : null}
              </>
            ) : null}
            <TouchableOpacity onPress={() => setTranslationModal(false)}>
              <Text style={styles.modalClose}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => setPhase("select")}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{catInfo?.emoji} {catInfo?.name}</Text>
        <Text style={styles.counter}>{counterText}</Text>
      </View>

      <View style={styles.practiceContent}>
        <View style={styles.sentenceCard}>
          {isLoadingSentence ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <>
              <ClickableSentence
                sentence={currentSentence}
                phrases={currentPhrases}
                onWordPress={(w) => openTranslation(w)}
                onPhrasePress={(p) => openTranslation(p)}
              />
              <Text style={styles.tapHint}>Tap a word to see its meaning</Text>
              {currentTip ? <Text style={styles.tipText}>💡 {currentTip}</Text> : null}
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.replayBtn, isPlayingTTS && styles.replayBtnActive]}
          onPress={replaySentence}
          disabled={isPlayingTTS || isLoadingSentence}
        >
          <Ionicons name="volume-high-outline" size={20} color="white" />
          <Text style={styles.replayBtnText}>{isPlayingTTS ? "Playing..." : "Listen again"}</Text>
        </TouchableOpacity>

        {lastResult && (
          <View style={[styles.resultBubble, lastResult.is_correct ? styles.resultBubbleCorrect : styles.resultBubbleWrong]}>
            <Text style={styles.resultBubbleAccuracy}>
              {lastResult.is_correct ? "✅" : lastResult.accuracy >= 50 ? "⚠️" : "❌"} {lastResult.accuracy}%
            </Text>
            <Text style={styles.resultBubbleMessage}>{getFeedbackMessage(lastResult)}</Text>
            {lastResult.pronunciation_feedback ? (
              <Text style={styles.resultBubblePron}>{lastResult.pronunciation_feedback}</Text>
            ) : null}
          </View>
        )}

        <View style={styles.micArea}>
          {!lastResult ? (
            <>
              <Text style={styles.micInstruction}>
                {isPlayingTTS ? "🔊 Listen carefully..." : isRecording ? "🔴 Recording... tap to stop" : "Tap to speak"}
              </Text>
              {isEvaluating ? (
                <View style={styles.evaluatingContainer}>
                  <ActivityIndicator color="white" size="large" />
                  <Text style={styles.evaluatingText}>Evaluating...</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.micBtn, isRecording && styles.micBtnRecording]}
                  onPress={toggleRecording}
                  disabled={isPlayingTTS || isLoadingSentence || isEvaluating}
                  activeOpacity={0.8}
                >
                  <Ionicons name={isRecording ? "stop-circle" : "mic"} size={42} color="white" />
                  <Text style={styles.micBtnText}>
                    {isRecording ? "Tap to stop" : "Tap to speak"}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <TouchableOpacity style={styles.nextBtn} onPress={nextSentence}>
              <Text style={styles.nextBtnText}>
                {sentenceCount >= 9 ? "See Results 🎉" : "Next Sentence →"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: "#312e81",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.4)",
    gap: 8,
  },
  modalWord: {
    fontSize: 24,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
  },
  modalTranslation: {
    fontSize: 28,
    fontWeight: "700",
    color: "#c4b5fd",
    textAlign: "center",
  },
  modalExplanation: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 4,
  },
  modalClose: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },
  selectContent: {
    paddingHorizontal: 24,
    paddingTop: 64,
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
    color: "rgba(255,255,255,0.7)",
    marginBottom: 28,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 16,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    gap: 14,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: "700",
    color: "white",
    marginBottom: 3,
  },
  categoryDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
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
  },
  counter: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
  },
  practiceContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 100,
    justifyContent: "space-between",
  },
  sentenceCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  tapHint: {
    fontSize: 11,
    color: "rgba(167,139,250,0.7)",
    textAlign: "center",
  },
  tipText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 18,
  },
  replayBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "center",
  },
  replayBtnActive: {
    opacity: 0.6,
  },
  replayBtnText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  resultBubble: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 6,
  },
  resultBubbleCorrect: {
    backgroundColor: "rgba(52,211,153,0.15)",
    borderColor: "rgba(52,211,153,0.3)",
  },
  resultBubbleWrong: {
    backgroundColor: "rgba(248,113,113,0.15)",
    borderColor: "rgba(248,113,113,0.3)",
  },
  resultBubbleAccuracy: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
  resultBubbleMessage: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    lineHeight: 20,
  },
  resultBubblePron: {
    color: "#6ee7b7",
    fontSize: 13,
    marginTop: 2,
  },
  micArea: {
    alignItems: "center",
    gap: 12,
    paddingBottom: 8,
  },
  micInstruction: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "600",
  },
  evaluatingContainer: {
    alignItems: "center",
    gap: 12,
  },
  evaluatingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  micBtn: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(167,139,250,0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(167,139,250,0.6)",
    gap: 4,
  },
  micBtnRecording: {
    backgroundColor: "rgba(248,113,113,0.4)",
    borderColor: "#f87171",
  },
  micBtnText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
  nextBtn: {
    backgroundColor: "rgba(167,139,250,0.4)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.6)",
    width: "100%",
    alignItems: "center",
  },
  nextBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
  resultContent: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 120,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "white",
    marginBottom: 24,
    textAlign: "center",
  },
  scoreCircle: {
    alignSelf: "center",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(167,139,250,0.25)",
    borderWidth: 3,
    borderColor: "rgba(167,139,250,0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  scoreNumber: {
    fontSize: 40,
    fontWeight: "900",
    color: "white",
  },
  scoreLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
  },
  scoreDetail: {
    textAlign: "center",
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    marginBottom: 24,
  },
  resultCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    gap: 4,
  },
  resultCardCorrect: {
    backgroundColor: "rgba(52,211,153,0.1)",
    borderColor: "rgba(52,211,153,0.25)",
  },
  resultCardWrong: {
    backgroundColor: "rgba(248,113,113,0.1)",
    borderColor: "rgba(248,113,113,0.25)",
  },
  resultCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  resultCardIcon: {
    fontSize: 16,
  },
  resultCardAccuracy: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "600",
  },
  resultOriginal: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  resultFeedback: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    lineHeight: 18,
  },
  resultPron: {
    color: "#6ee7b7",
    fontSize: 13,
  },
  doneBtn: {
    backgroundColor: "rgba(167,139,250,0.3)",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.5)",
  },
  doneBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
});