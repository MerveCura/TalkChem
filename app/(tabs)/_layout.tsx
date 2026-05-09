import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View, Text } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

function SocialTabIcon({ color }: { color: string }) {
  const [badge, setBadge] = useState(0);

  const fetchBadge = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const [reqRes, duelRes, turnRes] = await Promise.all([
        fetch(`${API_URL}/api/friends/requests`, { headers }),
        fetch(`${API_URL}/api/duels/pending`, { headers }),
        fetch(`${API_URL}/api/duels/my-turn`, { headers }),
      ]);
      const [reqs, duels, turn] = await Promise.all([
        reqRes.json(), duelRes.json(), turnRes.json(),
      ]);
      const total =
        (Array.isArray(reqs) ? reqs.length : 0) +
        (Array.isArray(duels) ? duels.length : 0) +
        (turn?.count ?? 0);
      setBadge(total);
    } catch (e) {
      // sessizce geç
    }
  };

  useEffect(() => {
    fetchBadge();
    const interval = setInterval(fetchBadge, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View>
      <Ionicons name="people-outline" size={22} color={color} />
      {badge > 0 && (
        <View style={badgeStyles.badge}>
          <Text style={badgeStyles.badgeText}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "#f87171",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "white",
    fontSize: 9,
    fontWeight: "800",
  },
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "rgba(255,255,255,0.4)",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="modules"
        options={{
          tabBarIcon: ({ color }) => <SocialTabIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "rgba(139, 92, 246, 0.6)",
    borderTopWidth: 0,
    height: 65,
    borderRadius: 20,
    marginHorizontal: -5,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});