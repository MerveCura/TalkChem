import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

export default function SpeakingIndexScreen() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/speaking/scenarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setScenarios(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#0ea5e9", "#6366f1"]} style={styles.centered}>
        <ActivityIndicator size="large" color="white" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0ea5e9", "#6366f1", "#a21caf"]} style={styles.container}>
      <View style={styles.blob} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Speaking Practice</Text>
        <Text style={styles.subtitle}>
          Have a real conversation with AI and get instant feedback on your English
        </Text>

        <View style={styles.tipBox}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            Speak naturally — AI will respond and give you grammar & vocabulary tips after each message
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Choose a scenario</Text>

        {scenarios.map(s => (
          <TouchableOpacity
            key={s.id}
            style={styles.scenarioCard}
            onPress={() => router.push(`/speaking/${s.id}` as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.scenarioEmoji}>{s.emoji}</Text>
            <View style={styles.scenarioInfo}>
              <Text style={styles.scenarioName}>{s.name}</Text>
              <Text style={styles.scenarioDesc}>{s.description}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  blob: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(99,102,241,0.4)",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  backBtn: {
    marginBottom: 20,
  },
  backText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 22,
    marginBottom: 20,
  },
  tipBox: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  tipIcon: {
    fontSize: 20,
  },
  tipText: {
    flex: 1,
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "white",
    marginBottom: 14,
  },
  scenarioCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    gap: 14,
  },
  scenarioEmoji: {
    fontSize: 36,
  },
  scenarioInfo: {
    flex: 1,
  },
  scenarioName: {
    fontSize: 17,
    fontWeight: "800",
    color: "white",
    marginBottom: 4,
  },
  scenarioDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 18,
  },
  arrow: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 18,
    fontWeight: "700",
  },
});