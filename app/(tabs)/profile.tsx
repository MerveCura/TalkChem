import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Image
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "../config";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showSavedWords, setShowSavedWords] = useState(false);
  const [showQuizHistory, setShowQuizHistory] = useState(false);
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data);
    } catch (e) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow access to your photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as any);
      try {
        const token = await AsyncStorage.getItem("token");
        await fetch(`${API_URL}/api/users/upload-photo`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        fetchProfile();
      } catch (e) {
        Alert.alert("Error", "Failed to upload photo");
      }
    }
  };

  const removeSavedWord = async (wordId: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await fetch(`${API_URL}/api/vocabulary/save/${wordId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProfile();
    } catch (e) {
      Alert.alert("Error", "Failed to remove word");
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#f953c6", "#7c3aed", "#60a5fa"]} style={styles.centered}>
        <ActivityIndicator size="large" color="white" />
      </LinearGradient>
    );
  }

  const levelTest = user?.level_test;
  const attempt = levelTest?.attempt;
  const answers = levelTest?.answers || [];
  const wrongAnswers = answers.filter((a: any) => a.correct_answer && !a.is_correct);
  const quizStats = user?.quiz_stats;
  const savedWords = user?.saved_words;

  return (
    <LinearGradient colors={["#f953c6", "#7c3aed", "#60a5fa"]} style={styles.container}>
      <View style={styles.blobTop} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handlePickImage}>
            {user?.profile_image ? (
              <Image source={{ uri: `${API_URL}/${user.profile_image}` }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.username?.[0]?.toUpperCase() || "?"}
                </Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.username}>@{user?.username}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>
              {user?.english_level ? `Level: ${user.english_level}` : "Level: Not determined"}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{quizStats?.total_quizzes || 0}</Text>
            <Text style={styles.statLabel}>Quizzes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{savedWords?.total || 0}</Text>
            <Text style={styles.statLabel}>Saved Words</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{quizStats?.perfect_quizzes || 0}</Text>
            <Text style={styles.statLabel}>Perfect</Text>
          </View>
        </View>

        {/* Saved Words Kartı */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setShowSavedWords(!showSavedWords)}
          >
            <Text style={styles.cardTitle}>🔖 Saved Words ({savedWords?.total || 0})</Text>
            <Text style={styles.chevron}>{showSavedWords ? "▲" : "▼"}</Text>
          </TouchableOpacity>

          {showSavedWords && (
            <View style={styles.savedWordsContainer}>
              {savedWords?.words?.length === 0 ? (
                <Text style={styles.emptyText}>No saved words yet. Start bookmarking!</Text>
              ) : (
                savedWords?.words?.map((word: any) => (
                  <View key={word.id} style={styles.savedWordItem}>
                    <View style={styles.savedWordInfo}>
                      <Text style={styles.savedWordText}>{word.word}</Text>
                      <Text style={styles.savedWordMeaning}>{word.meaning_tr || word.meaning}</Text>
                      <Text style={styles.savedWordCategory}>{word.category} • {word.level}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removeSavedWord(word.id)}
                    >
                      <Text style={styles.removeBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        {/* Quiz History Kartı */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setShowQuizHistory(!showQuizHistory)}
          >
            <Text style={styles.cardTitle}>🎯 Quiz History ({quizStats?.total_quizzes || 0})</Text>
            <Text style={styles.chevron}>{showQuizHistory ? "▲" : "▼"}</Text>
          </TouchableOpacity>

          {showQuizHistory && (
            <View>
              {quizStats?.total_quizzes === 0 ? (
                <Text style={styles.emptyText}>No quizzes yet. Start learning!</Text>
              ) : (
                <>
                  {/* Genel istatistik */}
                  <View style={styles.scoreRow}>
                    <View style={styles.scoreItem}>
                      <Text style={styles.scoreNumber}>{quizStats?.average_score || 0}%</Text>
                      <Text style={styles.scoreLabel}>Avg Score</Text>
                    </View>
                    <View style={styles.scoreItem}>
                      <Text style={styles.scoreNumber}>{quizStats?.perfect_quizzes || 0}</Text>
                      <Text style={styles.scoreLabel}>Perfect</Text>
                    </View>
                    <View style={styles.scoreItem}>
                      <Text style={styles.scoreNumber}>{quizStats?.total_quizzes || 0}</Text>
                      <Text style={styles.scoreLabel}>Total</Text>
                    </View>
                  </View>

                  {/* Tense bazlı ilerleme */}
                  {Object.entries(quizStats?.tense_stats || {}).map(([tense, stats]: any) => (
                    <View key={tense} style={styles.tenseProgressItem}>
                      <View style={styles.tenseProgressHeader}>
                        <Text style={styles.tenseProgressName}>
                          {tense.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </Text>
                        <Text style={styles.tenseProgressScore}>{stats.average_score}%</Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${stats.average_score}%` }]} />
                      </View>
                      <Text style={styles.tenseAttempts}>{stats.attempt_count} attempts</Text>
                    </View>
                  ))}

                  {/* Quiz listesi */}
                  {quizStats?.history?.map((quiz: any) => (
                    <View key={quiz.id} style={styles.quizHistoryItem}>
                      <TouchableOpacity
                        style={styles.quizHistoryHeader}
                        onPress={() => setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id)}
                      >
                        <View>
                          <Text style={styles.quizHistoryTense}>
                            {quiz.tense_id.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </Text>
                          <Text style={styles.quizHistoryDate}>
                            {new Date(quiz.created_at).toLocaleDateString("tr-TR")}
                          </Text>
                        </View>
                        <View style={styles.quizHistoryRight}>
                          <Text style={[
                            styles.quizHistoryScore,
                            { color: quiz.score >= 70 ? "#34d399" : quiz.score >= 50 ? "#fbbf24" : "#f87171" }
                          ]}>
                            {quiz.score}%
                          </Text>
                          {quiz.perfect && <Text style={styles.perfectBadge}>🏆</Text>}
                        </View>
                      </TouchableOpacity>

                      {expandedQuiz === quiz.id && quiz.wrong_answers.length > 0 && (
                        <View style={styles.wrongAnswersList}>
                          <Text style={styles.wrongAnswersTitle}>❌ Wrong Answers:</Text>
                          {quiz.wrong_answers.map((wa: any, i: number) => (
                            <View key={i} style={styles.wrongAnswerItem}>
                              <Text style={styles.wrongQuestion}>{wa.question_text}</Text>
                              <Text style={styles.wrongYours}>Your answer: {wa.user_answer}</Text>
                              <Text style={styles.wrongCorrect}>Correct: {wa.correct_answer}</Text>
                              {wa.ai_feedback && (
                                <Text style={styles.wrongFeedback}>{wa.ai_feedback}</Text>
                              )}
                            </View>
                          ))}
                        </View>
                      )}

                      {expandedQuiz === quiz.id && quiz.wrong_answers.length === 0 && (
                        <Text style={styles.perfectMsg}>🌟 Perfect score! All answers correct!</Text>
                      )}
                    </View>
                  ))}
                </>
              )}
            </View>
          )}
        </View>

        {/* Level Test Kartı */}
        {attempt && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>📊 Level Test Results</Text>
              <View style={styles.levelPill}>
                <Text style={styles.levelPillText}>{attempt.level}</Text>
              </View>
            </View>

            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreNumber}>{attempt.score}%</Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreNumber}>{wrongAnswers.length}</Text>
                <Text style={styles.scoreLabel}>Wrong</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreNumber}>
                  {answers.filter((a: any) => a.correct_answer && a.is_correct).length}
                </Text>
                <Text style={styles.scoreLabel}>Correct</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => setShowAnswers(!showAnswers)}
            >
              <Text style={styles.toggleBtnText}>
                {showAnswers ? "Hide Answers ▲" : "View My Answers ▼"}
              </Text>
            </TouchableOpacity>

            {showAnswers && (
              <View style={styles.answersContainer}>
                {answers.map((answer: any, i: number) => (
                  answer.correct_answer && answer.question_type !== "open_ended" && (
                    <View key={i} style={[
                      styles.answerItem,
                      answer.is_correct ? styles.answerCorrect : styles.answerWrong
                    ]}>
                      <Text style={styles.answerQuestion}>Q{i + 1}: {answer.question_text}</Text>
                      <Text style={styles.answerYours}>Your answer: {answer.user_answer}</Text>
                      {!answer.is_correct && (
                        <Text style={styles.answerCorrectText}>Correct: {answer.correct_answer}</Text>
                      )}
                    </View>
                  )
                ))}
              </View>
            )}

            {levelTest.can_retake ? (
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={() => router.push("/(auth)/level-test")}
              >
                <Text style={styles.retakeBtnText}>🔄 Retake Level Test</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.retakeDisabled}>
                <Text style={styles.retakeDisabledText}>
                  ⏳ Next test available in {levelTest.days_until_retake} days
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  blobTop: {
    position: "absolute", top: -80, left: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(236,72,153,0.5)",
  },
  content: { paddingHorizontal: 24, paddingTop: 80, paddingBottom: 100 },
  title: { fontSize: 40, fontWeight: "800", color: "white", marginBottom: 24 },
  avatarContainer: { alignItems: "center", marginBottom: 32 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  avatarText: { fontSize: 36, fontWeight: "800", color: "white" },
  editBadge: {
    position: "absolute", bottom: 0, right: 0,
    backgroundColor: "white", borderRadius: 12,
    width: 28, height: 28, alignItems: "center", justifyContent: "center",
  },
  editBadgeText: { fontSize: 14 },
  username: { fontSize: 18, color: "white", fontWeight: "600", marginTop: 10, marginBottom: 8 },
  levelBadge: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  levelText: { color: "white", fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, padding: 16, borderRadius: 16, alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  statNumber: { fontSize: 28, fontWeight: "800", color: "white" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  card: {
    padding: 20, borderRadius: 20, marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "white" },
  chevron: { color: "white", fontSize: 14 },
  savedWordsContainer: { gap: 10 },
  savedWordItem: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12, padding: 12, gap: 10,
  },
  savedWordInfo: { flex: 1 },
  savedWordText: { color: "white", fontWeight: "800", fontSize: 16, marginBottom: 2 },
  savedWordMeaning: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginBottom: 2 },
  savedWordCategory: { color: "rgba(255,255,255,0.5)", fontSize: 11 },
  removeBtn: {
    backgroundColor: "rgba(248,113,113,0.3)",
    borderRadius: 8, padding: 6,
  },
  removeBtnText: { color: "white", fontSize: 12, fontWeight: "700" },
  emptyText: { color: "rgba(255,255,255,0.6)", fontSize: 14, textAlign: "center", paddingVertical: 12 },
  scoreRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  scoreItem: {
    flex: 1, alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12, padding: 12,
  },
  scoreNumber: { fontSize: 24, fontWeight: "800", color: "white" },
  scoreLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  tenseProgressItem: { marginBottom: 14 },
  tenseProgressHeader: {
    flexDirection: "row", justifyContent: "space-between", marginBottom: 6,
  },
  tenseProgressName: { color: "white", fontWeight: "600", fontSize: 13 },
  tenseProgressScore: { color: "white", fontWeight: "800", fontSize: 13 },
  progressBarBg: {
    height: 8, backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4, marginBottom: 4,
  },
  progressBarFill: {
    height: 8, backgroundColor: "white", borderRadius: 4,
  },
  tenseAttempts: { color: "rgba(255,255,255,0.5)", fontSize: 11 },
  quizHistoryItem: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12, padding: 12, marginBottom: 8,
  },
  quizHistoryHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  quizHistoryTense: { color: "white", fontWeight: "700", fontSize: 14 },
  quizHistoryDate: { color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 2 },
  quizHistoryRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  quizHistoryScore: { fontSize: 18, fontWeight: "800" },
  perfectBadge: { fontSize: 16 },
  wrongAnswersList: { marginTop: 10, gap: 8 },
  wrongAnswersTitle: { color: "rgba(255,255,255,0.8)", fontWeight: "700", fontSize: 13, marginBottom: 4 },
  wrongAnswerItem: {
    backgroundColor: "rgba(248,113,113,0.15)",
    borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: "rgba(248,113,113,0.3)",
  },
  wrongQuestion: { color: "white", fontWeight: "600", fontSize: 12, marginBottom: 4 },
  wrongYours: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 2 },
  wrongCorrect: { color: "#34d399", fontSize: 12, fontWeight: "600", marginBottom: 2 },
  wrongFeedback: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontStyle: "italic" },
  perfectMsg: { color: "#34d399", fontWeight: "600", fontSize: 13, textAlign: "center", paddingVertical: 8 },
  levelPill: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4,
  },
  levelPillText: { color: "white", fontWeight: "800", fontSize: 16 },
  toggleBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10, padding: 12, alignItems: "center", marginBottom: 12,
  },
  toggleBtnText: { color: "white", fontWeight: "600", fontSize: 14 },
  answersContainer: { gap: 10, marginBottom: 12 },
  answerItem: { borderRadius: 12, padding: 12, borderWidth: 1 },
  answerCorrect: {
    backgroundColor: "rgba(52,211,153,0.15)",
    borderColor: "rgba(52,211,153,0.4)",
  },
  answerWrong: {
    backgroundColor: "rgba(248,113,113,0.15)",
    borderColor: "rgba(248,113,113,0.4)",
  },
  answerQuestion: { color: "white", fontWeight: "600", fontSize: 13, marginBottom: 4 },
  answerYours: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginBottom: 2 },
  answerCorrectText: { color: "#34d399", fontSize: 12, fontWeight: "600" },
  retakeBtn: {
    backgroundColor: "white", borderRadius: 12,
    padding: 14, alignItems: "center", marginTop: 4,
  },
  retakeBtnText: { color: "#7c3aed", fontWeight: "800", fontSize: 14 },
  retakeDisabled: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12, padding: 14, alignItems: "center", marginTop: 4,
  },
  retakeDisabledText: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
});