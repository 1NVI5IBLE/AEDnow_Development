import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,

        tabBarActiveTintColor: "#e5383b",
        tabBarInactiveTintColor: "#9ca3af",

        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
          height: Platform.OS === "ios" ? 85 : 68,
          paddingBottom: Platform.OS === "ios" ? 24 : 10,
          paddingTop: 10,
          paddingHorizontal: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 10,
        },

        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: "600",
          letterSpacing: 0.4,
          marginTop: 3,
        },

        tabBarIconStyle: {
          marginTop: 2,
        },

        tabBarItemStyle: {
          borderRadius: 14,
          marginHorizontal: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Map",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[styles.iconWrapper, focused && styles.iconWrapperActive]}
            >
              <IconSymbol
                size={22}
                name="location.fill"
                color={focused ? "#e5383b" : color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "CPR Guide",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[styles.iconWrapper, focused && styles.iconWrapperActive]}
            >
              <IconSymbol
                size={22}
                name="heart.text.square.fill"
                color={focused ? "#e5383b" : color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="training"
        options={{
          title: "Training",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[styles.iconWrapper, focused && styles.iconWrapperActive]}
            >
              <IconSymbol
                size={22}
                name="waveform.path.ecg"
                color={focused ? "#e5383b" : color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 44,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconWrapperActive: {
    backgroundColor: "rgba(229, 56, 59, 0.08)",
  },
});
