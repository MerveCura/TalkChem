import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  return (
    <LinearGradient colors={["#f953c6", "#7c3aed", "#60a5fa"]} style={styles.container}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>New modules will be here</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Coming soon ✨</Text>
          <Text style={styles.cardText}>
            Vocabulary, Grammar, Quiz, Speaking practice, Daily streak...
          </Text>
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
  blobBottom: {
    position: "absolute", bottom: 60, right: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(96,165,250,0.4)",
  },
  content: { paddingHorizontal: 24, paddingTop: 80, paddingBottom: 100 },
  title: { fontSize: 40, fontWeight: "800", color: "white" },
  subtitle: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginTop: 4, marginBottom: 24 },
  card: {
    padding: 24, borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "white", marginBottom: 8 },
  cardText: { fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 22 },
});