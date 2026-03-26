import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Please fill all fields");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
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
      <View style={styles.blobBottom} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome{"\n"}Back!</Text>
            <Text style={styles.subtitle}>Login to continue your journey</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.btnFilled}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.btnText}>{loading ? "Loading..." : "Login"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.linkText}>Don't have an account? Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    position: "absolute", bottom: -100, right: -80,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: "rgba(96,165,250,0.4)",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: { fontSize: 36, fontWeight: "800", color: "white", lineHeight: 44 },
  subtitle: { fontSize: 16, color: "rgba(255,255,255,0.85)", marginTop: 8 },
  card: {
    padding: 24, borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.4)",
    color: "white",
    paddingVertical: 10,
    fontSize: 16,
  },
  btnFilled: {
    backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 50,
    paddingVertical: 16, alignItems: "center", marginTop: 8, marginBottom: 16,
  },
  btnText: { color: "white", fontWeight: "700", fontSize: 16 },
  linkText: { color: "rgba(255,255,255,0.8)", textAlign: "center", fontSize: 14 },
});