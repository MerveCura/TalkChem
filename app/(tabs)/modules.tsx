import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const MODULES = [
  { id: 1, title: "Present Simple", level: "A1", icon: "📝" },
  { id: 2, title: "Present Continuous", level: "A1", icon: "⏳" },
  { id: 3, title: "Past Simple", level: "A2", icon: "📖" },
  { id: 4, title: "Future Tenses", level: "B1", icon: "🚀" },
  { id: 5, title: "Conditionals", level: "B2", icon: "🔀" },
];

export default function ModulesScreen() {
  return (
    <LinearGradient colors={["#f953c6", "#7c3aed", "#60a5fa"]} style={styles.container}>
      <View style={styles.blobTop} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Modules</Text>
        <Text style={styles.subtitle}>Choose a topic to study</Text>
        {MODULES.map((m) => (
          <TouchableOpacity key={m.id} style={styles.card}>
            <Text style={styles.icon}>{m.icon}</Text>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{m.title}</Text>
              <Text style={styles.cardLevel}>Level: {m.level}</Text>
            </View>
          </TouchableOpacity>
        ))}
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
  title: { fontSize: 40, fontWeight: "800", color: "white" },
  subtitle: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginTop: 4, marginBottom: 24 },
  card: {
    flexDirection: "row", alignItems: "center",
    padding: 20, borderRadius: 20, marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  icon: { fontSize: 32, marginRight: 16 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "white" },
  cardLevel: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 },
});