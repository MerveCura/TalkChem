import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#f953c6", "#b91d73", "#7c3aed", "#60a5fa"]} style={styles.container}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />
      <View style={styles.content}>
        <Text style={styles.title}>Hi Learner!{"\n"}Welcome to TalkChem.</Text>
        <Text style={styles.subtitle}>Lets learn English together!</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Start your adventure in English.</Text>
        <TouchableOpacity style={styles.btnFilled} onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.btnFilledText}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnOutline} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.btnOutlineText}>Login</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blobTop: {
    position: "absolute", top: -80, left: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(236, 72, 153, 0.5)",
  },
  blobBottom: {
    position: "absolute", bottom: -100, right: -80,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: "rgba(96, 165, 250, 0.4)",
  },
  content: { flex: 1, justifyContent: "flex-end", paddingHorizontal: 30, paddingBottom: 30 },
  title: { fontSize: 36, fontWeight: "800", color: "white", lineHeight: 44 },
  subtitle: { fontSize: 16, color: "rgba(255,255,255,0.85)", marginTop: 8 },
  card: {
    margin: 20, padding: 24, borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "white", textAlign: "center", marginBottom: 16 },
  btnFilled: {
    backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 50,
    paddingVertical: 16, alignItems: "center", marginBottom: 10,
  },
  btnFilledText: { color: "white", fontWeight: "700", fontSize: 16 },
  btnOutline: {
    borderRadius: 50, borderWidth: 1.5, borderColor: "white",
    paddingVertical: 16, alignItems: "center",
  },
  btnOutlineText: { color: "white", fontWeight: "700", fontSize: 16 },
});