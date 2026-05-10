import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useRef, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { API_URL } from "../config";

type Message = {
  role: "user" | "assistant";
  content: string;
  feedback?: string | null;
  has_error?: boolean;
  pronunciation_score?: number | null;
};

const SCENARIO_INFO: Record<string, { name: string; emoji: string }> = {
  free: { name: "Free Conversation", emoji: "💬" },
  cafe: { name: "At the Café", emoji: "☕" },
  "job-interview": { name: "Job Interview", emoji: "💼" },
  travel: { name: "At the Airport", emoji: "✈️" },
  doctor: { name: "Doctor's Appointment", emoji: "🏥" },
  shopping: { name: "Shopping", emoji: "🛍️" },
};

export default function SpeakingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scenarioId = params.scenario as string;
  const info = SCENARIO_INFO[scenarioId] || { name: "Conversation", emoji: "💬" };

  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [started, setStarted] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setupAudio();
    startConversation();
    return () => {
      sound?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const setupAudio = async () => {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
  };

  const startConversation = async () => {
    setIsProcessing(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/speaking/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          scenario_id: scenarioId,
          history: [],
          user_message: "__START__",
          whisper_raw: "",
        }),
      });
      const data = await res.json();
      const aiMessage: Message = {
        role: "assistant",
        content: data.reply,
        feedback: null,
      };
      setMessages([aiMessage]);
      setStarted(true);
      await playTTS(data.reply, token!);
    } catch (e) {
      console.error("startConversation error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
    } catch (e) {
      Alert.alert("Error", "Could not start recording. Check microphone permission.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    setIsProcessing(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (!uri) throw new Error("No recording URI");

      const token = await AsyncStorage.getItem("token");

      // 1. Transcribe
      const formData = new FormData();
      formData.append("audio", {
        uri,
        type: "audio/m4a",
        name: "audio.m4a",
      } as any);

      const transcribeRes = await fetch(`${API_URL}/api/speaking/transcribe`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const transcribeData = await transcribeRes.json();
      const userText = transcribeData.text?.trim();
      const pronunciationScore = transcribeData.pronunciation_score ?? null;

      if (!userText) {
        setIsProcessing(false);
        Alert.alert("Couldn't hear you", "Please try speaking again.");
        return;
      }

      const userMsg: Message = {
        role: "user",
        content: userText,
        pronunciation_score: pronunciationScore,
      };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);

      // 2. AI cevabı
      const history = updatedMessages.map(m => ({ role: m.role, content: m.content }));
      const respondRes = await fetch(`${API_URL}/api/speaking/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          scenario_id: scenarioId,
          history: history.slice(0, -1),
          user_message: userText,
        }),
      });
      const respondData = await respondRes.json();

      const aiMsg: Message = {
        role: "assistant",
        content: respondData.reply,
        feedback: respondData.feedback,
        has_error: respondData.has_error,
      };
      setMessages(prev => [...prev, aiMsg]);

      // 3. TTS
      await playTTS(respondData.reply, token!);
    } catch (e) {
      console.error("stopRecording error:", e);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const playTTS = async (text: string, token: string) => {
    try {
      setIsPlaying(true);
      await sound?.unloadAsync();

      const res = await fetch(`${API_URL}/api/speaking/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text, voice: "nova" }),
      });
      const data = await res.json();

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${data.audio_base64}` },
        { shouldPlay: true }
      );
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          newSound.unloadAsync();
        }
      });
    } catch (e) {
      console.error("TTS error:", e);
      setIsPlaying(false);
    }
  };

  const handleFinish = async () => {
    if (messages.length < 3) {
      Alert.alert("Too short", "Have at least a couple exchanges before finishing!");
      return;
    }
    setFinishing(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch(`${API_URL}/api/speaking/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          scenario_id: scenarioId,
          history,
          messages_with_feedback: messages,
        }),
      });
      const data = await res.json();
      router.replace({
        pathname: "/speaking/result",
        params: { analysis: JSON.stringify(data.analysis), scenario: scenarioId },
      } as any);
    } catch (e) {
      Alert.alert("Error", "Failed to finish session");
    } finally {
      setFinishing(false);
    }
  };

  return (
    <LinearGradient colors={["#0ea5e9", "#6366f1", "#a21caf"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{info.emoji} {info.name}</Text>
        <TouchableOpacity
          style={styles.finishBtn}
          onPress={handleFinish}
          disabled={finishing}
        >
          {finishing
            ? <ActivityIndicator size="small" color="white" />
            : <Text style={styles.finishBtnText}>Finish</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, i) => (
          <View key={i}>
            <View style={msg.role === "user" ? styles.userMsgWrap : styles.aiMsgWrap}>
              {msg.role === "assistant" && (
                <View style={styles.aiAvatar}>
                  <Text style={styles.aiAvatarText}>AI</Text>
                </View>
              )}
              <View style={[styles.bubble, msg.role === "user" ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.bubbleText, msg.role === "user" ? styles.userBubbleText : styles.aiBubbleText]}>
                  {msg.content}
                </Text>
              </View>
              {msg.role === "user" && (
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>You</Text>
                </View>
              )}
            </View>

            {msg.role === "assistant" && msg.feedback && (
              <View style={styles.feedbackBubble}>
                <Text style={styles.feedbackText}>{msg.feedback}</Text>
              </View>
            )}
          </View>
        ))}

        {isProcessing && (
          <View style={styles.aiMsgWrap}>
            <View style={styles.aiAvatar}>
              <Text style={styles.aiAvatarText}>AI</Text>
            </View>
            <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
              <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
              <Text style={styles.typingText}>thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.recordArea}>
        {isPlaying && (
          <View style={styles.playingIndicator}>
            <Text style={styles.playingText}>🔊 AI is speaking...</Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.micBtn,
            isRecording && styles.micBtnRecording,
            (isProcessing || isPlaying) && styles.micBtnDisabled,
          ]}
          onPressIn={startRecording}
          onPressOut={stopRecording}
          disabled={isProcessing || isPlaying || !started}
          activeOpacity={0.8}
        >
          <Text style={styles.micIcon}>{isRecording ? "🔴" : "🎙️"}</Text>
          <Text style={styles.micLabel}>
            {isRecording ? "Recording..." : isProcessing ? "Processing..." : "Hold to speak"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.micHint}>Hold the button and speak, release when done</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 12,
  },
  backText: { color: "white", fontSize: 20, fontWeight: "700" },
  headerTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  finishBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  finishBtnText: { color: "white", fontWeight: "700", fontSize: 13 },
  messagesContainer: { flex: 1 },
  messagesContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  userMsgWrap: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    gap: 8,
  },
  aiMsgWrap: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    gap: 8,
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  aiAvatarText: { color: "white", fontSize: 10, fontWeight: "800" },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: { color: "white", fontSize: 9, fontWeight: "800" },
  bubble: { maxWidth: "75%", borderRadius: 18, padding: 14 },
  aiBubble: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  aiBubbleText: { color: "white" },
  userBubbleText: { color: "#1e1b4b", fontWeight: "500" },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  typingText: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontStyle: "italic" },
  feedbackBubble: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(251,191,36,0.15)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.3)",
    marginHorizontal: 40,
    marginTop: 4,
  },
  feedbackText: {
    flex: 1,
    color: "#fde68a",
    fontSize: 13,
    lineHeight: 20,
  },
  recordArea: {
    paddingBottom: 40,
    paddingTop: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  playingIndicator: { marginBottom: 10 },
  playingText: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "600" },
  micBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    gap: 4,
  },
  micBtnRecording: {
    backgroundColor: "rgba(248,113,113,0.4)",
    borderColor: "#f87171",
    transform: [{ scale: 1.1 }],
  },
  micBtnDisabled: { opacity: 0.4 },
  micIcon: { fontSize: 28 },
  micLabel: { color: "white", fontSize: 9, fontWeight: "700", textAlign: "center" },
  micHint: { color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 10, textAlign: "center" },
});