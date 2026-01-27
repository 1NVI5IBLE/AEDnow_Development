// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = { anchor: "Home" };

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* ✅ set a friendly title for the previous screen */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Home" }} />

        {/* ✅ add profile screen title + hide back title if you want */}
        <Stack.Screen
          name="profile"
          options={{
            title: "Profile",
            headerBackTitleVisible: false, // hides "Home"/"(tabs)" text on iOS
          }}
        />

        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}