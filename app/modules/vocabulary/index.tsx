import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated, ActivityIndicator
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 48 - 12) / 2;
const CAROUSEL_CARD_WIDTH = width - 80;

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

// Uzun meaning_tr açıklamalarından sadece ilk kelimeyi/kısa ifadeyi çıkarır
// "hastalıkları önlemek için temizlik" → "hijyen" gibi
// Eski DB kayıtlarındaki uzun açıklamaları kısa göstermek için
function getShortTranslation(meaningTr: string, meaning: string): string {
  if (!meaningTr) return meaning;
  // Virgül, noktalı virgül veya parantezden önce kes
  const firstPart = meaningTr.split(/[,;.(]/)[0].trim();
  // 20 karakterden uzunsa büyük ihtimal açıklama — sadece ilk 2 kelimeyi al
  if (firstPart.length > 20) {
    const words = firstPart.split(" ");
    return words.slice(0, 2).join(" ");
  }
  return firstPart;
}

function FlipCard({ word }: { word: any }) {
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const flip = () => {
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const shortTr = getShortTranslation(word.meaning_tr, word.meaning);

  return (
    <TouchableOpacity onPress={flip} activeOpacity={0.9} style={carouselStyles.cardWrapper}>
      {/* Ön yüz — İngilizce kelime */}
      <Animated.View
        style={[
          carouselStyles.card,
          { transform: [{ rotateY: frontInterpolate }] },
          flipped && { position: "absolute" },
        ]}
      >
        <LinearGradient colors={["#7c3aed", "#4c1d95"]} style={carouselStyles.cardGradient}>
          <Text style={carouselStyles.cardLevel}>
            {word.level} · {word.category?.replace(/-/g, " ")}
          </Text>
          <Text style={carouselStyles.cardWord}>{word.word}</Text>
          <Text style={carouselStyles.cardHint}>Tap to see meaning</Text>
        </LinearGradient>
      </Animated.View>

      {/* Arka yüz — sadece Türkçe çeviri */}
      <Animated.View
        style={[
          carouselStyles.card,
          { transform: [{ rotateY: backInterpolate }] },
          !flipped && { position: "absolute" },
        ]}
      >
        <LinearGradient colors={["#059669", "#065f46"]} style={carouselStyles.cardGradient}>
          <Text style={carouselStyles.cardBackWord}>{word.word}</Text>
          <Text style={carouselStyles.cardMeaningTr}>{shortTr}</Text>
          <Text style={carouselStyles.cardHint}>Tap to flip back</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const carouselStyles = StyleSheet.create({
  cardWrapper: {
    width: CAROUSEL_CARD_WIDTH,
    height: 180,
    marginHorizontal: 8,
  },
  card: {
    width: CAROUSEL_CARD_WIDTH,
    height: 180,
    borderRadius: 20,
    backfaceVisibility: "hidden",
  },
  cardGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  cardLevel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  cardWord: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },
  cardBackWord: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  cardMeaningTr: {
    color: "white",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
  },
  cardHint: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    marginTop: 4,
  },
});

export default function VocabularyScreen() {
  const router = useRouter();
  const [savedWords, setSavedWords] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const carouselRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      loadSavedWords();
    }, [])
  );

  const loadSavedWords = async () => {
    setLoadingSaved(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/vocabulary/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSavedWords(data.words || []);
    } catch (e) {
      console.log("Saved words error:", e);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleCarouselScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / (CAROUSEL_CARD_WIDTH + 16));
    setCurrentCardIndex(index);
  };

  return (
    <LinearGradient colors={["#f953c6", "#b91d73", "#7c3aed", "#60a5fa"]} style={styles.container}>
      <View style={styles.blobTop} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>📖 Vocabulary</Text>
        <Text style={styles.subtitle}>Choose a category to start learning new words!</Text>

        {/* Saved Words Carousel */}
        {loadingSaved ? (
          <View style={styles.carouselLoading}>
            <ActivityIndicator color="white" />
          </View>
        ) : savedWords.length > 0 ? (
          <View style={styles.carouselSection}>
            <Text style={styles.carouselTitle}>🔖 Saved Words</Text>
            <Text style={styles.carouselSubtitle}>Tap a card to see Turkish meaning</Text>
            <ScrollView
              ref={carouselRef}
              horizontal
              pagingEnabled={false}
              showsHorizontalScrollIndicator={false}
              snapToInterval={CAROUSEL_CARD_WIDTH + 16}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              onMomentumScrollEnd={handleCarouselScroll}
            >
              {savedWords.map((word) => (
                <FlipCard key={word.id} word={word} />
              ))}
            </ScrollView>
            {savedWords.length > 1 && (
              <View style={styles.dots}>
                {savedWords.slice(0, Math.min(savedWords.length, 10)).map((_, i) => (
                  <View key={i} style={[styles.dot, i === currentCardIndex && styles.dotActive]} />
                ))}
              </View>
            )}
          </View>
        ) : null}

        {/* Kategoriler */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.grid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
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
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },
  backBtn: {
    marginBottom: 16,
  },
  backText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 20,
    lineHeight: 22,
  },
  carouselLoading: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  carouselSection: {
    marginBottom: 28,
  },
  carouselTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "white",
    marginBottom: 4,
  },
  carouselSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 16,
  },
  carouselContent: {
    paddingHorizontal: 8,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotActive: {
    backgroundColor: "white",
    width: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "white",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  cardEmoji: {
    fontSize: 36,
  },
  cardName: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});