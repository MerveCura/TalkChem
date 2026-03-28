import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const categories = [
  { id: "daily-life", name: "Daily Life", emoji: "🏠", color: ["#f953c6", "#b91d73"] as [string, string] },
  { id: "travel", name: "Travel", emoji: "✈️", color: ["#7c3aed", "#4a0080"] as [string, string] },
  { id: "business", name: "Business & Work", emoji: "💼", color: ["#60a5fa", "#2563eb"] as [string, string] },
  { id: "food", name: "Food & Cooking", emoji: "🍳", color: ["#fb923c", "#ea580c"] as [string, string] },
  { id: "technology", name: "Technology", emoji: "💻", color: ["#34d399", "#059669"] as [string, string] },
  { id: "health", name: "Health & Body", emoji: "💪", color: ["#f87171", "#dc2626"] as [string, string] },
  { id: "education", name: "Education", emoji: "📚", color: ["#a855f7", "#7c3aed"] as [string, string] },
  { id: "nature", name: "Nature & Environment", emoji: "🌿", color: ["#4ade80", "#16a34a"] as [string, string] },
  { id: "sports", name: "Sports & Fitness", emoji: "⚽", color: ["#fbbf24", "#d97706"] as [string, string] },
  { id: "emotions", name: "Emotions & Feelings", emoji: "❤️", color: ["#f472b6", "#db2777"] as [string, string] },
  { id: "shopping", name: "Shopping & Money", emoji: "🛍️", color: ["#38bdf8", "#0284c7"] as [string, string] },
  { id: "family", name: "Family & Relationships", emoji: "👨‍👩‍👧", color: ["#e879f9", "#a21caf"] as [string, string] },
  { id: "art", name: "Art & Culture", emoji: "🎨", color: ["#fb7185", "#e11d48"] as [string, string] },
  { id: "science", name: "Science", emoji: "🔬", color: ["#818cf8", "#4f46e5"] as [string, string] },
  { id: "social-media", name: "Social Media & Internet", emoji: "📱", color: ["#2dd4bf", "#0d9488"] as [string, string] },
  { id: "home", name: "Home & Living", emoji: "🛋️", color: ["#f59e0b", "#b45309"] as [string, string] },
  { id: "weather", name: "Weather", emoji: "🌤️", color: ["#60a5fa", "#1d4ed8"] as [string, string] },
  { id: "transportation", name: "Transportation", emoji: "🚗", color: ["#94a3b8", "#475569"] as [string, string] },
  { id: "entertainment", name: "Entertainment", emoji: "🎬", color: ["#c084fc", "#9333ea"] as [string, string] },
  { id: "law-politics", name: "Law & Politics", emoji: "⚖️", color: ["#6b7280", "#374151"] as [string, string] },
];

export default function VocabularyScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#f953c6", "#b91d73", "#7c3aed", "#60a5fa"]} style={styles.container}>
      <View style={styles.blobTop} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>📖 Vocabulary</Text>
        <Text style={styles.subtitle}>Choose a category to start learning new words!</Text>

        <View style={styles.grid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.cardWrapper}
              onPress={() => router.push(`/modules/vocabulary/${cat.id}` as any)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={cat.color}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <Text style={styles.cardEmoji}>{cat.emoji}</Text>
                <Text style={styles.cardName}>{cat.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
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
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },
  backBtn: { marginBottom: 16 },
  backText: { color: "rgba(255,255,255,0.8)", fontSize: 16, fontWeight: "600" },
  title: { fontSize: 36, fontWeight: "900", color: "white", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "rgba(255,255,255,0.8)", marginBottom: 28, lineHeight: 22 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  cardWrapper: {
    width: "47%",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    minHeight: 100,
    justifyContent: "center",
    gap: 8,
  },
  cardEmoji: { fontSize: 32 },
  cardName: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});