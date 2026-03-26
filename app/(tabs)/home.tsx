import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

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

  if (loading) {
    return (
      <LinearGradient colors={["#f953c6", "#7c3aed", "#60a5fa"]} style={styles.centered}>
        <ActivityIndicator size="large" color="white" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#f953c6", "#7c3aed", "#60a5fa"]} style={styles.container}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Karşılama */}
        <View style={styles.welcomeArea}>
          <Text style={styles.welcomeText}>Welcome back <Text style={styles.usernameText}>{user?.username}</Text> </Text>
         
          {user?.english_level && (
            <View style={styles.levelPill}>
              <Text style={styles.levelPillText}>Level: {user.english_level}</Text>
            </View>
          )}
        </View>

        {/* Devam et kartı */}
        <View style={styles.continueCard}>
          <Text style={styles.continueTitle}>Continue Learning</Text>
          <Text style={styles.continueText}>
            Keep going! Consistency is the key to mastering English.
          </Text>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => router.push("/(tabs)/modules")}
          >
            <Text style={styles.continueBtnText}>Continue →</Text>
          </TouchableOpacity>
        </View>

        {/* Modüller */}
        <Text style={styles.sectionTitle}>Modules</Text>

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
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  blobTop: {
    position: "absolute", top: -80, left: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(236,72,153,0.5)",
  },
  blobBottom: {
    position: "absolute", bottom: 60, right: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(96,165,250,0.4)",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 100,
  },
  welcomeArea: {
    marginBottom: 24,
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
  },
  levelPillText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
  },
  continueCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginBottom: 28,
  },
  continueTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "white",
    marginBottom: 6,
  },
  continueText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 20,
    marginBottom: 14,
  },
  continueBtn: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  continueBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  sectionTitle: {
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
  moduleEmoji: {
    fontSize: 32,
    marginTop: 2,
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