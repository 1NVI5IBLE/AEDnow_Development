// app/profile.tsx  (Expo Router) — nicer UI + toggles (client-only)

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type PermissionState = {
  locationForeground: boolean;
  notifications: boolean;
  camera: boolean;
};

type PrivacyState = {
  shareAnonymousAnalytics: boolean;
  storeSearchHistory: boolean;
  allowDirections: boolean;
};

export default function ProfileScreen() {
  // Demo/local-only toggles (you can later persist using AsyncStorage / backend)
  const [perm, setPerm] = useState<PermissionState>({
    locationForeground: true,
    notifications: false,
    camera: false,
  });

  const [privacy, setPrivacy] = useState<PrivacyState>({
    shareAnonymousAnalytics: false,
    storeSearchHistory: false,
    allowDirections: true,
  });

  const [security, setSecurity] = useState({
    biometricLock: false,
    hideSensitiveUI: false,
  });

  const user = useMemo(
    () => ({
      name: "Guest",
      role: "Mobile User",
      version: "1.0.0",
      platform: Platform.OS,
    }),
    []
  );

  const onToggleLocation = (v: boolean) => {
    // In real app: link to OS settings / request permission
    setPerm((p) => ({ ...p, locationForeground: v }));
    if (!v) {
      Alert.alert(
        "Location disabled",
        "Map can still open, but 'Nearby AEDs' will be limited. You can re-enable later."
      );
    }
  };

  const onToggleDirections = (v: boolean) => {
    setPrivacy((p) => ({ ...p, allowDirections: v }));
    if (!v) {
      Alert.alert("Directions off", "You can still see AED markers without route guidance.");
    }
  };

  const resetAll = () => {
    Alert.alert("Reset settings?", "This will reset local settings for this screen only.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          setPerm({ locationForeground: true, notifications: false, camera: false });
          setPrivacy({ shareAnonymousAnalytics: false, storeSearchHistory: false, allowDirections: true });
          setSecurity({ biometricLock: false, hideSensitiveUI: false });
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color="#111" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.screenTitle}>Profile</Text>

        <TouchableOpacity style={styles.resetBtn} onPress={resetAll} activeOpacity={0.8}>
          <Ionicons name="refresh" size={18} color="#e5383b" />
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Header card */}
      <View style={styles.heroCard}>
        <View style={styles.avatarWrap}>
          <Ionicons name="person" size={32} color="#fff" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.heroName}>{user.name}</Text>
          <Text style={styles.heroMeta}>
            {user.role} • v{user.version} • {user.platform}
          </Text>
          <Text style={styles.heroHint}>
            Emergency app: keep settings simple and fast to access.
          </Text>
        </View>
      </View>

      {/* PERMISSIONS */}
      <Section title="Permissions" icon="key-outline">
        <SettingRow
          title="Location (Foreground)"
          subtitle="Required to show AEDs near you."
          value={perm.locationForeground}
          onValueChange={onToggleLocation}
        />
        <Divider />
        <SettingRow
          title="Notifications"
          subtitle="Optional reminders & safety tips."
          value={perm.notifications}
          onValueChange={(v) => setPerm((p) => ({ ...p, notifications: v }))}
        />
        <Divider />
        <SettingRow
          title="Camera"
          subtitle="Optional: scan QR / upload AED photos (future)."
          value={perm.camera}
          onValueChange={(v) => setPerm((p) => ({ ...p, camera: v }))}
        />
        <InfoBox text="Note: Real OS permissions must be enabled in iOS/Android Settings. These toggles are for app preferences." />
      </Section>

      {/* PRIVACY */}
      <Section title="Privacy" icon="shield-outline">
        <SettingRow
          title="Allow Directions"
          subtitle="Draw route line to the nearest AED."
          value={privacy.allowDirections}
          onValueChange={onToggleDirections}
        />
        <Divider />
        <SettingRow
          title="Anonymous Analytics"
          subtitle="Help improve the app without storing personal data."
          value={privacy.shareAnonymousAnalytics}
          onValueChange={(v) => setPrivacy((p) => ({ ...p, shareAnonymousAnalytics: v }))}
        />
        <Divider />
        <SettingRow
          title="Store Search History"
          subtitle="Save searched places on this device."
          value={privacy.storeSearchHistory}
          onValueChange={(v) => setPrivacy((p) => ({ ...p, storeSearchHistory: v }))}
        />
        <InfoBox text="Privacy principle: minimum data. Avoid storing live location; use HTTPS for all API calls." />
      </Section>

      {/* SECURITY */}
      <Section title="Security" icon="lock-closed-outline">
        <SettingRow
          title="Biometric Lock"
          subtitle="Lock app behind Face ID / Touch ID (optional)."
          value={security.biometricLock}
          onValueChange={(v) => {
            setSecurity((s) => ({ ...s, biometricLock: v }));
            if (v) Alert.alert("Biometric Lock", "Demo toggle enabled. Implement with expo-local-authentication later.");
          }}
        />
        <Divider />
        <SettingRow
          title="Hide sensitive UI"
          subtitle="Reduces exposure in public spaces."
          value={security.hideSensitiveUI}
          onValueChange={(v) => setSecurity((s) => ({ ...s, hideSensitiveUI: v }))}
        />
        <InfoBox text="For CA2 evidence: mention OWASP Mobile Top 10, secure key storage, and least-privilege permissions." />
      </Section>

      {/* ABOUT */}
      <Section title="About AEDNow" icon="information-circle-outline">
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>
            AEDNow helps locate nearby AED devices quickly. In an emergency, call local emergency services first.
          </Text>

          <View style={styles.aboutRow}>
            <Ionicons name="globe-outline" size={18} color="#333" />
            <Text style={styles.aboutRowText}>API: https://api.aednow.online</Text>
          </View>

          <View style={styles.aboutRow}>
            <Ionicons name="map-outline" size={18} color="#333" />
            <Text style={styles.aboutRowText}>Maps/Directions: Google Maps</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => Alert.alert("Emergency", "If this is a real emergency, call local emergency services immediately.")}
            activeOpacity={0.85}
          >
            <Ionicons name="call" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Emergency Info</Text>
          </TouchableOpacity>
        </View>
      </Section>

      <View style={{ height: 18 }} />
    </ScrollView>
  );
}

/* ---------------- Components ---------------- */

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={18} color="#111" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function SettingRow({
  title,
  subtitle,
  value,
  onValueChange,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function InfoBox({ text }: { text: string }) {
  return (
    <View style={styles.infoBox}>
      <Ionicons name="alert-circle-outline" size={16} color="#444" />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f4f5f7",
  },
  container: {
    padding: 16,
    paddingBottom: 24,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    justifyContent: "space-between",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  backText: {
    marginLeft: 2,
    fontWeight: "700",
    color: "#111",
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111",
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  resetText: {
    marginLeft: 6,
    fontWeight: "800",
    color: "#e5383b",
  },

  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#e5383b",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  heroName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111",
  },
  heroMeta: {
    marginTop: 2,
    opacity: 0.7,
    fontWeight: "700",
  },
  heroHint: {
    marginTop: 6,
    opacity: 0.7,
  },

  section: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "900",
    color: "#111",
  },
  sectionCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111",
  },
  rowSubtitle: {
    marginTop: 4,
    opacity: 0.7,
    lineHeight: 18,
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
  },

  infoBox: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 10,
  },
  infoText: {
    marginLeft: 8,
    opacity: 0.8,
    lineHeight: 18,
    flex: 1,
  },

  aboutCard: {
    paddingVertical: 6,
  },
  aboutText: {
    opacity: 0.85,
    lineHeight: 18,
    marginBottom: 10,
  },
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  aboutRowText: {
    marginLeft: 8,
    opacity: 0.85,
  },

  primaryBtn: {
    marginTop: 10,
    backgroundColor: "#e5383b",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "white",
    fontWeight: "900",
    marginLeft: 8,
  },
});