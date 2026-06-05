import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView,
  KeyboardAvoidingView, Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password || !passwordConfirm)
      return Alert.alert("Error", "Please fill all fields");
    if (password !== passwordConfirm)
      return Alert.alert("Error", "Passwords do not match");

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
      router.replace("/(auth)/level-test");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#f953c6", "#b91d73", "#7c3aed", "#60a5fa"]} style={styles.container}>
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your English adventure</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Choose a username"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

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

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.btnFilled}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.btnText}>{loading ? "Loading..." : "Register"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.linkText}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    bottom: -100,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(96,165,250,0.4)",
  },
  scrollContent: {
    paddingTop: 100,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "white",
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    marginTop: 8,
  },
  card: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  inputWrapper: {
    marginBottom: 20,
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
    fontSize: 15,
  },
  btnFilled: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  btnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  linkText: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    fontSize: 14,
  },
});