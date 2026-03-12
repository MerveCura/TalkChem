import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

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
      <Tabs.Screen name="home" options={{
        tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
      }} />
      <Tabs.Screen name="modules" options={{
        tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} />,
      }} />
      <Tabs.Screen name="profile" options={{
        tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
      }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#1a1a2e",
    borderTopWidth: 0,
    height: 65,
    borderRadius: 20,
    margin: 10,
    position: "absolute",
  },
});