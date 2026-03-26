import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { API_URL } from "../config";


export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);

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

  const handleRetakeTest = () => {
    router.push("/(auth)/level-test");
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

  return (
    <LinearGradient colors={["#f953c6", "#7c3aed", "#60a5fa"]} style={styles.container}>
      <View style={styles.blobTop} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username?.[0]?.toUpperCase() || "?"}
            </Text>
          </View>
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
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Quizzes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Homeworks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Duels</Text>
          </View>
        </View>

        {/* Level Test Kartı */}
        {attempt ? (
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

            {/* Cevapları Göster/Gizle */}
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
                  answer.correct_answer && (
                    <View key={i} style={[
                      styles.answerItem,
                      answer.is_correct ? styles.answerCorrect : styles.answerWrong
                    ]}>
                      <Text style={styles.answerQuestion}>Q{i + 1}: {answer.question_text}</Text>
                      <Text style={styles.answerYours}>
                        Your answer: {answer.user_answer}
                      </Text>
                      {!answer.is_correct && (
                        <>
                          <Text style={styles.answerCorrectText}>
                            Correct: {answer.correct_answer}
                          </Text>
                          <Text style={styles.answerTip}>
                            💡 Study: {answer.question_level} level {answer.question_type === "multiple_choice" ? "grammar" : "vocabulary"}
                          </Text>
                        </>
                      )}
                    </View>
                  )
                ))}
              </View>
            )}

            {/* Yeniden sınav hakkı */}
            {levelTest.can_retake ? (
              <TouchableOpacity style={styles.retakeBtn} onPress={handleRetakeTest}>
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
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Level Test</Text>
            <Text style={styles.emptyText}>You haven't taken the level test yet.</Text>
            <TouchableOpacity style={styles.retakeBtn} onPress={handleRetakeTest}>
              <Text style={styles.retakeBtnText}>Take Level Test 🚀</Text>
            </TouchableOpacity>
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
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  avatarText: { fontSize: 32, fontWeight: "800", color: "white" },
  username: { fontSize: 18, color: "white", fontWeight: "600", marginBottom: 8 },
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
  statLabel: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  card: {
    padding: 20, borderRadius: 20, marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "white" },
  levelPill: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4,
  },
  levelPillText: { color: "white", fontWeight: "800", fontSize: 16 },
  scoreRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  scoreItem: {
    flex: 1, alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12, padding: 12,
  },
  scoreNumber: { fontSize: 24, fontWeight: "800", color: "white" },
  scoreLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  toggleBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10, padding: 12, alignItems: "center", marginBottom: 12,
  },
  toggleBtnText: { color: "white", fontWeight: "600", fontSize: 14 },
  answersContainer: { gap: 10, marginBottom: 12 },
  answerItem: {
    borderRadius: 12, padding: 12,
    borderWidth: 1,
  },
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
  answerCorrectText: { color: "#34d399", fontSize: 12, fontWeight: "600", marginBottom: 2 },
  answerTip: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontStyle: "italic" },
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
  emptyText: { color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 16 },
});