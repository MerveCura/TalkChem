import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

const TABS = ["Friends", "Duels"];

const TOPICS = [
  { id: "mixed", name: "🎲 Mixed (All Topics)", isMixed: true },
  { id: "present-simple", name: "Present Simple" },
  { id: "present-continuous", name: "Present Continuous" },
  { id: "past-simple", name: "Past Simple" },
  { id: "present-perfect", name: "Present Perfect" },
  { id: "future-tenses", name: "Future Tenses" },
  { id: "articles", name: "Articles" },
  { id: "prepositions", name: "Prepositions" },
  { id: "modal-verbs", name: "Modal Verbs" },
  { id: "conditionals", name: "Conditionals" },
  { id: "passive-voice", name: "Passive Voice" },
  { id: "reported-speech", name: "Reported Speech" },
  { id: "comparatives", name: "Comparatives" },
  { id: "phrasal-verbs", name: "Phrasal Verbs" },
];

export default function SocialScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [pendingDuels, setPendingDuels] = useState<any[]>([]);
  const [activeDuels, setActiveDuels] = useState<any[]>([]);
  const [duelHistory, setDuelHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showTopicPicker, setShowTopicPicker] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [])
  );

  const fetchAll = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [friendsRes, requestsRes, pendingRes, activeRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/api/friends/list`, { headers }),
        fetch(`${API_URL}/api/friends/requests`, { headers }),
        fetch(`${API_URL}/api/duels/pending`, { headers }),
        fetch(`${API_URL}/api/duels/active`, { headers }),
        fetch(`${API_URL}/api/duels/list`, { headers }),
      ]);

      const [f, r, p, a, h] = await Promise.all([
        friendsRes.json(), requestsRes.json(),
        pendingRes.json(), activeRes.json(), historyRes.json(),
      ]);

      setFriends(Array.isArray(f) ? f : []);
      setFriendRequests(Array.isArray(r) ? r : []);
      setPendingDuels(Array.isArray(p) ? p : []);
      setActiveDuels(Array.isArray(a) ? a : []);
      setDuelHistory(Array.isArray(h) ? h : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/friends/search?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (userId: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await fetch(`${API_URL}/api/friends/request/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      searchUsers(searchQuery);
    } catch (e) {
      Alert.alert("Error", "Failed to send request");
    }
  };

  const handleFriendRequest = async (friendshipId: number, action: "accept" | "reject") => {
    try {
      const token = await AsyncStorage.getItem("token");
      await fetch(`${API_URL}/api/friends/${action}/${friendshipId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAll();
    } catch (e) {
      Alert.alert("Error", "Failed to update request");
    }
  };

  const sendDuelChallenge = async (opponentId: number, topic: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/duels/challenge/${opponentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ topic }),
      });
      if (!res.ok) {
        const data = await res.json();
        Alert.alert("Error", data.detail || "Failed to send challenge");
        return;
      }
      Alert.alert("⚔️ Challenge Sent!", "Your friend will be notified.");
      setShowTopicPicker(null);
      fetchAll();
    } catch (e) {
      Alert.alert("Error", "Failed to send challenge");
    }
  };

  const handleDuelResponse = async (duelId: number, action: "accept" | "reject") => {
    try {
      const token = await AsyncStorage.getItem("token");
      await fetch(`${API_URL}/api/duels/${duelId}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAll();
    } catch (e) {
      Alert.alert("Error", "Failed to update duel");
    }
  };

  const getAvatarText = (username: string) => username?.[0]?.toUpperCase() || "?";

  const renderAvatar = (user: any, size = 44) => (
    user?.profile_image ? (
      <Image
        source={{ uri: `${API_URL}/${user.profile_image}` }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    ) : (
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>{getAvatarText(user?.username)}</Text>
      </View>
    )
  );

  const notifCount = friendRequests.length + pendingDuels.length;
  const sentDuels = duelHistory.filter((d: any) => ["generating", "pending"].includes(d.status) && d.is_challenger);
  const completedDuels = duelHistory.filter((d: any) => d.status === "completed");

  if (loading) {
    return (
      <LinearGradient colors={["#f953c6", "#7c3aed", "#60a5fa"]} style={styles.centered}>
        <ActivityIndicator size="large" color="white" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#f953c6", "#7c3aed", "#60a5fa"]} style={styles.container}>
      <View style={styles.blobTop} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Social</Text>
          {notifCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{notifCount}</Text>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map(tab => {
            const badge = tab === "Friends" ? friendRequests.length
              : tab === "Duels" ? (pendingDuels.length + activeDuels.filter((d: any) => d.your_turn).length)
              : 0;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                {badge > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── FRIENDS TAB ── */}
        {activeTab === "Friends" && (
          <>
            {/* Arama */}
            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by username..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={searchQuery}
                onChangeText={searchUsers}
              />
              {searching && <ActivityIndicator size="small" color="white" style={{ marginLeft: 8 }} />}
            </View>

            {/* Arama sonuçları */}
            {searchResults.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Search Results</Text>
                {searchResults.map(u => (
                  <View key={u.id} style={styles.userCard}>
                    {renderAvatar(u)}
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.username}>@{u.username}</Text>
                      {u.english_level && <Text style={styles.userLevel}>{u.english_level}</Text>}
                    </View>
                    {u.friendship_status === null && (
                      <TouchableOpacity style={styles.actionBtn} onPress={() => sendFriendRequest(u.id)}>
                        <Text style={styles.actionBtnText}>Add +</Text>
                      </TouchableOpacity>
                    )}
                    {u.friendship_status === "pending" && u.is_requester && (
                      <View style={styles.pendingTag}>
                        <Text style={styles.pendingTagText}>Pending</Text>
                      </View>
                    )}
                    {u.friendship_status === "accepted" && (
                      <View style={styles.friendTag}>
                        <Text style={styles.friendTagText}>✓ Friends</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Gelen istekler */}
            {friendRequests.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Friend Requests ({friendRequests.length})</Text>
                {friendRequests.map(req => (
                  <View key={req.friendship_id} style={styles.userCard}>
                    {renderAvatar(req)}
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.username}>@{req.username}</Text>
                      {req.english_level && <Text style={styles.userLevel}>{req.english_level}</Text>}
                    </View>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleFriendRequest(req.friendship_id, "accept")}
                    >
                      <Text style={styles.actionBtnText}>✓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => handleFriendRequest(req.friendship_id, "reject")}
                    >
                      <Text style={styles.actionBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Arkadaş listesi */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Friends ({friends.length})</Text>
              {friends.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyEmoji}>👥</Text>
                  <Text style={styles.emptyText}>No friends yet. Search and add someone!</Text>
                </View>
              ) : (
                friends.map(f => (
                  <View key={f.id}>
                    <View style={styles.userCard}>
                      {renderAvatar(f)}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.username}>@{f.username}</Text>
                        {f.english_level && <Text style={styles.userLevel}>{f.english_level}</Text>}
                      </View>
                      <TouchableOpacity
                        style={styles.duelBtn}
                        onPress={() => setShowTopicPicker(showTopicPicker === f.id ? null : f.id)}
                      >
                        <Text style={styles.duelBtnText}>⚔️ Duel</Text>
                      </TouchableOpacity>
                    </View>

                    {showTopicPicker === f.id && (
                      <View style={styles.topicPicker}>
                        <Text style={styles.topicPickerTitle}>Choose a topic for the duel:</Text>
                        {TOPICS.map(t => (
                          <TouchableOpacity
                            key={t.id}
                            style={[styles.topicOption, t.isMixed && styles.topicOptionMixed]}
                            onPress={() => sendDuelChallenge(f.id, t.id)}
                          >
                            <Text style={styles.topicOptionText}>{t.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {/* ── DUELS TAB ── */}
        {activeTab === "Duels" && (
          <>
            {/* Gelen duel istekleri */}
            {pendingDuels.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚔️ Incoming Challenges ({pendingDuels.length})</Text>
                {pendingDuels.map(d => (
                  <View key={d.id} style={styles.duelCard}>
                    <View style={styles.duelCardTop}>
                      {renderAvatar(d.challenger, 40)}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.duelOpponent}>@{d.challenger.username}</Text>
                        <Text style={styles.duelTopic}>{d.topic_name}</Text>
                      </View>
                    </View>
                    <View style={styles.duelActions}>
                      <TouchableOpacity
                        style={styles.acceptDuelBtn}
                        onPress={() => handleDuelResponse(d.id, "accept")}
                      >
                        <Text style={styles.acceptDuelText}>Accept ⚔️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectDuelBtn}
                        onPress={() => handleDuelResponse(d.id, "reject")}
                      >
                        <Text style={styles.rejectDuelText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Gönderilen / hazırlanıyor dueller */}
            {sentDuels.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📤 Sent Challenges</Text>
                {sentDuels.map(d => (
                  <View key={d.id} style={styles.duelCard}>
                    <View style={styles.duelCardTop}>
                      {renderAvatar(d.opponent, 40)}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.duelOpponent}>@{d.opponent.username}</Text>
                        <Text style={styles.duelTopic}>{d.topic_name}</Text>
                      </View>
                      <View style={styles.waitingTag}>
                        <Text style={styles.waitingTagText}>
                          {d.status === "generating" ? "⏳ Preparing..." : "⏳ Waiting"}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Aktif dueller */}
            {activeDuels.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔥 Active Duels</Text>
                {activeDuels.map(d => (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.duelCard, d.your_turn && styles.duelCardHighlight]}
                    onPress={() => !d.already_played && router.push(`/duel/${d.id}` as any)}
                    activeOpacity={d.already_played ? 1 : 0.85}
                  >
                    <View style={styles.duelCardTop}>
                      {renderAvatar(d.opponent, 40)}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.duelOpponent}>@{d.opponent.username}</Text>
                        <Text style={styles.duelTopic}>{d.topic_name}</Text>
                        {d.your_turn && (
                          <Text style={styles.yourTurnText}>Your turn!</Text>
                        )}
                      </View>
                      {d.already_played ? (
                        <View style={styles.waitingTag}>
                          <Text style={styles.waitingTagText}>⏳ Waiting</Text>
                        </View>
                      ) : (
                        <View style={styles.playBtn}>
                          <Text style={styles.playBtnText}>Play →</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Duel geçmişi */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Duel History</Text>
              {completedDuels.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyEmoji}>⚔️</Text>
                  <Text style={styles.emptyText}>No completed duels yet. Challenge a friend!</Text>
                </View>
              ) : (
                completedDuels.map(d => (
                  <View key={d.id} style={styles.duelCard}>
                    <View style={styles.duelCardTop}>
                      {renderAvatar(d.opponent, 40)}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.duelOpponent}>@{d.opponent.username}</Text>
                        <Text style={styles.duelTopic}>{d.topic_name}</Text>
                      </View>
                      <View style={[
                        styles.resultBadge,
                        d.i_won === true ? styles.wonBadge :
                        d.i_won === false ? styles.lostBadge : styles.drawBadge,
                      ]}>
                        <Text style={styles.resultBadgeText}>
                          {d.i_won === true ? "🏆 Won" : d.i_won === false ? "💀 Lost" : "🤝 Draw"}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreText}>You: {d.my_score ?? "—"}%</Text>
                      <Text style={styles.scoreText}>Them: {d.their_score ?? "—"}%</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    paddingTop: 70,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "800",
    color: "white",
  },
  notifBadge: {
    backgroundColor: "#f87171",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  notifBadgeText: {
    color: "white",
    fontWeight: "800",
    fontSize: 13,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    position: "relative",
  },
  tabActive: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  tabText: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: "700",
    fontSize: 14,
  },
  tabTextActive: {
    color: "white",
  },
  tabBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#f87171",
    borderRadius: 8,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "800",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 10,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  avatar: {
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontWeight: "800",
  },
  username: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
  userLevel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 2,
  },
  actionBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 6,
  },
  rejectBtn: {
    backgroundColor: "rgba(248,113,113,0.3)",
  },
  actionBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
  },
  pendingTag: {
    backgroundColor: "rgba(251,191,36,0.25)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pendingTagText: {
    color: "#fbbf24",
    fontWeight: "700",
    fontSize: 12,
  },
  friendTag: {
    backgroundColor: "rgba(52,211,153,0.25)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  friendTagText: {
    color: "#34d399",
    fontWeight: "700",
    fontSize: 12,
  },
  duelBtn: {
    backgroundColor: "rgba(232,121,249,0.3)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(232,121,249,0.5)",
  },
  duelBtnText: {
    color: "#f0abfc",
    fontWeight: "700",
    fontSize: 13,
  },
  topicPicker: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  topicPickerTitle: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 10,
  },
  topicOption: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
  },
  topicOptionMixed: {
    backgroundColor: "rgba(232,121,249,0.2)",
    borderWidth: 1,
    borderColor: "rgba(232,121,249,0.4)",
    marginBottom: 8,
  },
  topicOptionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  duelCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  duelCardHighlight: {
    borderColor: "rgba(232,121,249,0.6)",
    borderWidth: 1.5,
  },
  duelCardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  duelOpponent: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
  duelTopic: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 2,
  },
  yourTurnText: {
    color: "#f0abfc",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  duelActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  acceptDuelBtn: {
    flex: 1,
    backgroundColor: "rgba(232,121,249,0.35)",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(232,121,249,0.5)",
  },
  acceptDuelText: {
    color: "white",
    fontWeight: "800",
    fontSize: 14,
  },
  rejectDuelBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  rejectDuelText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "700",
    fontSize: 14,
  },
  waitingTag: {
    backgroundColor: "rgba(251,191,36,0.2)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  waitingTagText: {
    color: "#fbbf24",
    fontWeight: "700",
    fontSize: 12,
  },
  playBtn: {
    backgroundColor: "rgba(232,121,249,0.3)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  playBtnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 13,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  scoreText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "600",
  },
  resultBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  wonBadge: {
    backgroundColor: "rgba(52,211,153,0.25)",
  },
  lostBadge: {
    backgroundColor: "rgba(248,113,113,0.25)",
  },
  drawBadge: {
    backgroundColor: "rgba(251,191,36,0.25)",
  },
  resultBadgeText: {
    color: "white",
    fontWeight: "800",
    fontSize: 12,
  },
  emptyBox: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
  },
});