import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.114:8000";

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) return Alert.alert("Error", "Please fill all fields");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Register failed");
      await AsyncStorage.setItem("token", data.access_token);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#f953c6", "#7c3aed", "#60a5fa"]} style={styles.container}>
      <View style={styles.blobTop} />
      <View style={styles.content}>
        <Text style={styles.title}>Create{"\n"}Account ✨</Text>
        <Text style={styles.subtitle}>Start your English adventure</Text>
      </View>
      <View style={styles.card}>
        <TextInput
          style={styles.input} placeholder="Username" placeholderTextColor="rgba(255,255,255,0.6)"
          value={username} onChangeText={setUsername} autoCapitalize="none"
        />
        <TextInput
          style={styles.input} placeholder="Email" placeholderTextColor="rgba(255,255,255,0.6)"
          value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
        />
        <TextInput
          style={styles.input} placeholder="Password" placeholderTextColor="rgba(255,255,255,0.6)"
          value={password} onChangeText={setPassword} secureTextEntry
        />
        <TouchableOpacity style={styles.btnFilled} onPress={handleRegister} disabled={loading}>
          <Text style={styles.btnText}>{loading ? "Loading..." : "Register"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
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
    backgroundColor: "rgba(236,72,153,0.5)",
  },
  content: { flex: 1, justifyContent: "flex-end", paddingHorizontal: 30, paddingBottom: 30 },
  title: { fontSize: 36, fontWeight: "800", color: "white", lineHeight: 44 },
  subtitle: { fontSize: 16, color: "rgba(255,255,255,0.85)", marginTop: 8 },
  card: {
    margin: 20, padding: 24, borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  input: {
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.4)",
    color: "white", paddingVertical: 12, marginBottom: 16, fontSize: 16,
  },
  btnFilled: {
    backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 50,
    paddingVertical: 16, alignItems: "center", marginTop: 8, marginBottom: 16,
  },
  btnText: { color: "white", fontWeight: "700", fontSize: 16 },
  linkText: { color: "rgba(255,255,255,0.8)", textAlign: "center", fontSize: 14 },
});