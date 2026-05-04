import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

const categoryNames: Record<string, string> = {
  "daily-life": "Daily Life",
  "travel": "Travel",
  "business": "Business & Work",
  "food": "Food & Cooking",
  "technology": "Technology",
  "health": "Health & Body",
  "education": "Education",
  "nature": "Nature & Environment",
  "sports": "Sports & Fitness",
  "emotions": "Emotions & Feelings",
  "shopping": "Shopping & Money",
  "family": "Family & Relationships",
  "art": "Art & Culture",
  "science": "Science",
  "social-media": "Social Media & Internet",
  "home": "Home & Living",
  "weather": "Weather",
  "transportation": "Transportation",
  "entertainment": "Entertainment",
  "law-politics": "Law & Politics",
};

export default function VocabCategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryId = params.categoryId as string;
  const categoryName = categoryNames[categoryId] || categoryId;

  const [selectedLevel, setSelectedLevel] = useState("B1");

  // Her seviye için kelimeler ayrı tutulur — seviye değişince kaybolmaz
  const [wordsByLevel, setWordsByLevel] = useState<Record<string, any[]>>({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingLevel, setLoadingLevel] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  // Her seviye için kaçıncı sayfada olduğumuzu takip eder
  const pageByLevel = useRef<Record<string, number>>({});

  // ScrollView referansı — aşağı kaydırma butonu için
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (categoryId) {
      const currentWords = wordsByLevel[selectedLevel];
      if (!currentWords || currentWords.length === 0) {
        loadLevelWords(selectedLevel);
      }
    }
  }, [selectedLevel, categoryId]);

  const loadLevelWords = async (level: string) => {
    // Önce daha önce görülen kelimeleri çek — kullanıcı geri döndüğünde kaybolmaz
    // Görülen kelime varsa onları göster ve Load More'u hazırla
    // Yoksa statik kelimeleri göster
    setLoadingLevel(level);
    try {
      const token = await AsyncStorage.getItem("token");

      // Önce seen kelimelerini kontrol et
      const seenRes = await fetch(
        `${API_URL}/api/vocabulary/words/${categoryId}/${level}/seen`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const seenData = await seenRes.json();

      if (seenData.count > 0) {
        // Daha önce bu seviyede kelimeler görülmüş — onları göster
        setWordsByLevel(prev => ({ ...prev, [level]: seenData.words }));
        // Sayfa numarasını seen kelime sayısına göre ayarla
        pageByLevel.current[level] = Math.ceil(seenData.count / 3);
      } else {
        // Hiç görülmemiş — statik kelimeleri getir
        await fetchStaticWords(level);
      }
    } catch (e) {
      await fetchStaticWords(level);
    } finally {
      setLoadingLevel(null);
    }
  };

  const fetchStaticWords = async (level: string) => {
    // Statik kelimeleri çeker — 0ms bekleme, anında gösterilir
    // Arka planda backend page 1'i hazırlamaya başlar
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/vocabulary/words/${categoryId}/${level}/static`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to load words");
      setWordsByLevel(prev => ({ ...prev, [level]: data.words || [] }));
    } catch (e) {
      Alert.alert("Error", "Failed to load words");
    }
  };

  const loadMoreWords = async () => {
    if (loadingMore) return;
    setLoadingMore(true);

    try {
      const nextPage = (pageByLevel.current[selectedLevel] || 0) + 1;
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/vocabulary/words/${categoryId}/${selectedLevel}/more/${nextPage}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to load words");

      setWordsByLevel(prev => ({
        ...prev,
        [selectedLevel]: [...(prev[selectedLevel] || []), ...data.words],
      }));
      pageByLevel.current[selectedLevel] = nextPage;
    } catch (e) {
      Alert.alert("Error", "Failed to load more words");
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleSave = async (wordId: number | string) => {
    if (String(wordId).startsWith("static-")) {
      Alert.alert("Info", "Load more words to save them!");
      return;
    }
    setSavingId(wordId as number);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/vocabulary/save/${wordId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setWordsByLevel(prev => ({
        ...prev,
        [selectedLevel]: (prev[selectedLevel] || []).map(w =>
          w.id === wordId ? { ...w, is_saved: data.saved } : w
        ),
      }));
    } catch (e) {
      Alert.alert("Error", "Failed to save word");
    } finally {
      setSavingId(null);
    }
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const currentWords = wordsByLevel[selectedLevel] || [];
  const isLoadingCurrentLevel = loadingLevel === selectedLevel;

  return (
    <LinearGradient colors={["#f953c6", "#b91d73", "#7c3aed", "#60a5fa"]} style={styles.container}>
      <View style={styles.blobTop} />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{categoryName}</Text>
        <Text style={styles.subtitle}>Select your level and start learning!</Text>

        {/* Level seçimi */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.levelScroll}
          contentContainerStyle={styles.levelContainer}
        >
          {levels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.levelBtn, selectedLevel === level && styles.levelBtnActive]}
              onPress={() => setSelectedLevel(level)}
            >
              <Text style={[styles.levelBtnText, selectedLevel === level && styles.levelBtnTextActive]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoadingCurrentLevel ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading words... ✨</Text>
          </View>
        ) : (
          <>
            {/* Kelime sayısı ve aşağı kaydırma butonu */}
            <View style={styles.wordCountRow}>
              <Text style={styles.wordCount}>
                {currentWords.length} words • {selectedLevel} level
              </Text>
              {currentWords.length > 3 && (
                <TouchableOpacity style={styles.scrollDownBtn} onPress={scrollToBottom}>
                  <Text style={styles.scrollDownText}>↓</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Kelime kartları */}
            {currentWords.map((word, i) => (
              <View key={word.id} style={styles.wordCard}>
                <View style={styles.wordHeader}>
                  <View style={styles.wordNumberBadge}>
                    <Text style={styles.wordNumber}>{i + 1}</Text>
                  </View>
                  <Text style={styles.wordText}>{word.word}</Text>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={() => toggleSave(word.id)}
                    disabled={savingId === word.id}
                  >
                    <Text style={styles.saveBtnText}>
                      {savingId === word.id ? "..." : word.is_saved ? "🔖" : "🏷️"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.meaningText}>📌 {word.meaning}</Text>
                {word.meaning_tr && (
                  <Text style={styles.meaningTrText}>🇹🇷 {word.meaning_tr}</Text>
                )}
                <Text style={styles.exampleText}>💬 "{word.example_sentence}"</Text>
                {word.pronunciation && (
                  <Text style={styles.pronunciationText}>🔊 /{word.pronunciation}/</Text>
                )}
              </View>
            ))}

            {/* Load More butonu */}
            <TouchableOpacity
              style={[styles.loadMoreBtn, loadingMore && styles.btnDisabled]}
              onPress={loadMoreWords}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loadMoreBtnText}>Load More Words →</Text>
              )}
            </TouchableOpacity>
          </>
        )}
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
  content: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 120 },
  backBtn: { marginBottom: 16 },
  backText: { color: "rgba(255,255,255,0.8)", fontSize: 16, fontWeight: "600" },
  title: { fontSize: 32, fontWeight: "900", color: "white", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 20 },
  levelScroll: { marginBottom: 20 },
  levelContainer: { gap: 8, paddingRight: 16 },
  levelBtn: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  levelBtnActive: { backgroundColor: "white", borderColor: "white" },
  levelBtnText: { color: "rgba(255,255,255,0.8)", fontWeight: "700", fontSize: 14 },
  levelBtnTextActive: { color: "#7c3aed" },
  loadingContainer: { alignItems: "center", paddingVertical: 60, gap: 16 },
  loadingText: { color: "white", fontSize: 15, textAlign: "center" },
  wordCountRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 16,
  },
  wordCount: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600" },
  scrollDownBtn: {
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20,
    width: 36, height: 36, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.3)",
  },
  scrollDownText: { color: "white", fontSize: 18, fontWeight: "700" },
  wordCard: {
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16,
    padding: 16, marginBottom: 12, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  wordHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 10 },
  wordNumberBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  wordNumber: { color: "white", fontSize: 12, fontWeight: "700" },
  wordText: { fontSize: 20, fontWeight: "900", color: "white", flex: 1 },
  saveBtn: { padding: 4 },
  saveBtnText: { fontSize: 22 },
  meaningText: { color: "rgba(255,255,255,0.95)", fontSize: 14, marginBottom: 4, lineHeight: 20 },
  meaningTrText: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginBottom: 6, lineHeight: 20 },
  exampleText: {
    color: "rgba(255,255,255,0.8)", fontSize: 13,
    fontStyle: "italic", marginBottom: 6, lineHeight: 20,
  },
  pronunciationText: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  loadMoreBtn: {
    backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 16,
    paddingVertical: 14, alignItems: "center", marginTop: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.4)",
  },
  loadMoreBtnText: { color: "white", fontWeight: "700", fontSize: 15 },
  btnDisabled: { opacity: 0.5 },
});