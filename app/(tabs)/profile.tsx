import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileScreen() {
  return (
    <LinearGradient colors={["#f953c6", "#7c3aed", "#60a5fa"]} style={styles.container}>
      <View style={styles.blobTop} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>M</Text>
          </View>
          <Text style={styles.username}>@username</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Level: A1</Text>
          </View>
        </View>
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
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Recent Activity</Text>
          <Text style={styles.emptyText}>No activity yet. Start learning!</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    padding: 20, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "white", marginBottom: 12 },
  emptyText: { color: "rgba(255,255,255,0.6)", fontSize: 14 },
});