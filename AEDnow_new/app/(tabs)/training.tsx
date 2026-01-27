import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from "react-native";
import { Audio } from "expo-av";
import { Animated, Easing } from "react-native";

const BPM_INTERVAL = 600; // 110 BPM ≈ 545–600ms
const TIMING_WINDOW = 120; // ms allowed early/late

export default function TrainingScreen() {
  const beepSound = useRef<Audio.Sound | null>(null);
  const beatTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const [feedback, setFeedback] = useState("Tap with the beat");
  const [running, setRunning] = useState(false);


  /* ================= METRONOME ================= */

  const startMetronome = async () => {
    if (intervalRef.current !== null) return;

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
    });

    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/images/sounds/beep.mp3")
    );

    await sound.setVolumeAsync(1.0);
    beepSound.current = sound;

    intervalRef.current = setInterval(() => {
      beatTimeRef.current = Date.now();
      beepSound.current?.replayAsync().catch(() => {});
      Vibration.vibrate(40);
    }, BPM_INTERVAL);

    setRunning(true);
  };

  const stopMetronome = async () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (beepSound.current) {
      await beepSound.current.stopAsync();
      await beepSound.current.unloadAsync();
      beepSound.current = null;
    }

    beatTimeRef.current = null;
    setRunning(false);
    setFeedback("Tap with the beat");
  };

  /* ================= TAP HANDLER ================= */

  const handleTap = () => {
    if (!beatTimeRef.current) return;

    const now = Date.now();
    const diff = now - beatTimeRef.current;

    if (Math.abs(diff) <= TIMING_WINDOW) {
      setFeedback("✅ Good rhythm");
    } else if (diff < -TIMING_WINDOW) {
      setFeedback("⬆️ Too fast");
    } else {
      setFeedback("⬇️ Too slow");
    }
  };

  /* ================= CLEANUP ================= */

  useEffect(() => {
    return () => {
      stopMetronome();
    };
  }, []);

  /* ================= UI ================= */

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CPR Training Mode</Text>

      <Text style={styles.subtitle}>
        Practice chest compressions by tapping with the beat.
      </Text>

      <TouchableOpacity
        style={[styles.tapButton, !running && styles.tapButtonDisabled]}
        onPress={handleTap}
        activeOpacity={0.8}
        disabled={!running}
      >
        <Text style={styles.tapText}>TAP</Text>
      </TouchableOpacity>

      <Text style={styles.feedback}>{feedback}</Text>

      <TouchableOpacity
        style={[styles.controlButton, running && styles.stopButton]}
        onPress={running ? stopMetronome : startMetronome}
      >
        <Text style={styles.controlText}>
          {running ? "Stop Training" : "Start Training"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Training only. Not for real emergencies.
      </Text>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },

  subtitle: {
    textAlign: "center",
    color: "#555",
    marginBottom: 30,
  },

  tapButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#2fa94e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  tapButtonDisabled: {
    backgroundColor: "#adb5bd",
  },

  tapText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },

  feedback: {
    fontSize: 16,
    marginBottom: 30,
  },

  controlButton: {
    backgroundColor: "#e5383b",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 20,
  },

  stopButton: {
    backgroundColor: "#6c757d",
  },

  controlText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  disclaimer: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: "center",
  },
});
