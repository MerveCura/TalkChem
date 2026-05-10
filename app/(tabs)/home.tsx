import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [hwLoading, setHwLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHomeworks();
    }, [])
  );

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchHomeworks = async () => {
    setHwLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/homework/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      const data = JSON.parse(text);
      setHomeworks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setHwLoading(false);
    }
  };

  const pendingHomeworks = homeworks.filter(hw => hw.status === "pending");
  const doneHomeworks = homeworks.filter(hw => hw.status === "done");

  const modules = [
    {
      id: "tenses",
      title: "Tenses",
      description: "Master all English tenses and speak with confidence!",
      color: ["#f953c6", "#b91d73"] as [string, string],
    },
    {
      id: "vocabulary",
      title: "Vocabulary",
      description: "Expand your word power every day!",
      color: ["#7c3aed", "#4a0080"] as [string, string],
    },
    {
      id: "grammar",
      title: "Grammar",
      description: "Build a solid foundation in English grammar!",
      color: ["#60a5fa", "#2563eb"] as [string, string],
    },
  ];

  const getQuizTypeEmoji = (quizType: string) => {
    return quizType === "tense" ? "⏱️" : "📖";
  };

  return (
    <LinearGradient colors={["#f953c6", "#7c3aed", "#60a5fa"]} style={styles.container}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Karşılama */}
        <View style={styles.welcomeArea}>
          {loading ? (
            <ActivityIndicator color="white" style={{ alignSelf: "flex-start", marginBottom: 8 }} />
          ) : (
            <Text style={styles.welcomeText}>
              Welcome back <Text style={styles.usernameText}>{user?.username}</Text>
            </Text>
          )}
          {user?.english_level && (
            <View style={styles.levelPill}>
              <Text style={styles.levelPillText}>Level: {user.english_level}</Text>
            </View>
          )}
        </View>

        {/* Ödevler Section */}
        <View style={styles.homeworkSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📚 Homeworks</Text>
            {pendingHomeworks.length > 0 && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>{pendingHomeworks.length} pending</Text>
              </View>
            )}
          </View>

          {hwLoading ? (
            <ActivityIndicator color="white" style={{ marginVertical: 16 }} />
          ) : homeworks.length === 0 ? (
            <View style={styles.emptyHomework}>
              <Text style={styles.emptyHomeworkEmoji}>🎉</Text>
              <Text style={styles.emptyHomeworkText}>No homeworks yet!</Text>
              <Text style={styles.emptyHomeworkSub}>Complete a quiz to get personalized homework.</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.hwScrollView}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
            >
              {pendingHomeworks.map(hw => (
                <TouchableOpacity
                  key={hw.id}
                  style={styles.hwCard}
                  onPress={() => router.push(`/homework/${hw.id}` as any)}
                  activeOpacity={0.85}
                >
                  <View style={styles.hwCardLeft}>
                    <Text style={styles.hwEmoji}>{getQuizTypeEmoji(hw.quiz_type)}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.hwTopic}>{hw.topic_name}</Text>
                      <Text style={styles.hwMeta}>{hw.question_count} questions • {hw.quiz_type}</Text>
                    </View>
                  </View>
                  <View style={styles.hwPendingBadge}>
                    <Text style={styles.hwPendingText}>Start →</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {doneHomeworks.length > 0 && (
                <>
                  <Text style={styles.doneLabel}>Completed</Text>
                  {doneHomeworks.map(hw => (
                    <View key={hw.id} style={[styles.hwCard, styles.hwCardDone]}>
                      <View style={styles.hwCardLeft}>
                        <Text style={styles.hwEmoji}>{getQuizTypeEmoji(hw.quiz_type)}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.hwTopic, { opacity: 0.7 }]}>{hw.topic_name}</Text>
                          <Text style={styles.hwMeta}>{hw.quiz_type}</Text>
                        </View>
                      </View>
                      <View style={styles.hwScoreBadge}>
                        <Text style={styles.hwScoreText}>{hw.score}%</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </ScrollView>
          )}
        </View>

        {/* Modüller */}
        <Text style={styles.modulesSectionTitle}>Modules</Text>

        {modules.map((mod) => (
          <TouchableOpacity
            key={mod.id}
            onPress={() => router.push(`/modules/${mod.id}` as any)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={mod.color}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.moduleCard}
            >
              <View style={styles.moduleCardContent}>
                <View style={styles.moduleLeft}>
                  <View>
                    <Text style={styles.moduleTitle}>{mod.title}</Text>
                    <Text style={styles.moduleDesc}>{mod.description}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() => router.push(`/modules/${mod.id}` as any)}
                >
                  <Text style={styles.startBtnText}>Let's Start</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blobTop: {
    position: "absolute",
    top: -80,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(236,72,153,0.5)",
  },
  blobBottom: {
    position: "absolute",
    bottom: 60,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(96,165,250,0.4)",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 100,
  },
  welcomeArea: {
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 30,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  usernameText: {
    fontSize: 30,
    fontWeight: "500",
    color: "white",
    marginBottom: 8,
  },
  levelPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 8,
  },
  levelPillText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
  },
  homeworkSection: {
    marginBottom: 12,
    maxHeight: 280,
  },
  hwScrollView: {
    flexGrow: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
  },
  pendingBadge: {
    backgroundColor: "#fbbf24",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pendingBadgeText: {
    color: "#78350f",
    fontWeight: "800",
    fontSize: 12,
  },
  emptyHomework: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  emptyHomeworkEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyHomeworkText: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 4,
  },
  emptyHomeworkSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  hwCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  hwCardDone: {
    opacity: 0.7,
  },
  hwCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  hwEmoji: {
    fontSize: 24,
  },
  hwTopic: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 2,
  },
  hwMeta: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    textTransform: "capitalize",
  },
  hwPendingBadge: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  hwPendingText: {
    color: "#7c3aed",
    fontWeight: "800",
    fontSize: 13,
  },
  hwScoreBadge: {
    backgroundColor: "rgba(52,211,153,0.3)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.5)",
  },
  hwScoreText: {
    color: "#34d399",
    fontWeight: "800",
    fontSize: 13,
  },
  doneLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modulesSectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
    marginBottom: 16,
  },
  moduleCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  moduleCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  moduleLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
    marginBottom: 4,
  },
  moduleDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 18,
    maxWidth: 180,
  },
  startBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  startBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
  },
});