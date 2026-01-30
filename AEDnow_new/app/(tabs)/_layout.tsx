import React from "react";
import { Platform } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { HapticTab } from "@/components/haptic-tab";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: "#e5383b",
        tabBarInactiveTintColor: "#e5383b",
        tabBarLabelStyle: { fontWeight: "600", fontSize: 12 },
        tabBarStyle: {
          height: Platform.OS === "ios" ? 80 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Map",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "CPR Guide",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "play" : "play-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* BEST BUILT-IN TRIANGLE */}
      <Tabs.Screen
        name="training"
        options={{
          title: "training",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "caret-up" : "caret-up-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}