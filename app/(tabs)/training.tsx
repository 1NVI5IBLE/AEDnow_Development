import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

const TARGET_BPM = 110;
const MIN_BPM = 100;
const MAX_BPM = 120;

const BPM_INTERVAL = 60000 / TARGET_BPM;
const MAX_SAMPLES = 5; // taps to average

export default function TrainingScreen() {
  const beepSound = useRef<Audio.Sound | null>(null);
  const intervalRef = useRef<number | null>(null);

  const lastTapRef = useRef<number | null>(null);
  const tapBpmsRef = useRef<number[]>([]);
  const goodStreakRef = useRef(0);

  const [feedback, setFeedback] = useState("Tap with the beat");
  const [running, setRunning] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const pulseOnce = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: BPM_INTERVAL / 2,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: BPM_INTERVAL / 2,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startMetronome = async () => {
    if (intervalRef.current !== null) return;

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
    });

    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/images/sounds/beep.mp3"),
      { shouldPlay: false },
    );

    await sound.setVolumeAsync(1.0);
    beepSound.current = sound;

    intervalRef.current = setInterval(() => {
      beepSound.current?.replayAsync().catch(() => {});
      Vibration.vibrate(40);
      pulseOnce();
    }, BPM_INTERVAL);

    lastTapRef.current = null;
    tapBpmsRef.current = [];
    goodStreakRef.current = 0;

    setRunning(true);
  };

  const stopMetronome = async () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (beepSound.current) {
      try {
        await beepSound.current.stopAsync();
        await beepSound.current.unloadAsync();
      } catch {}
      beepSound.current = null;
    }

    lastTapRef.current = null;
    tapBpmsRef.current = [];
    goodStreakRef.current = 0;

    setRunning(false);
    setFeedback("Tap with the beat");
  };

  const handleTap = () => {
    const now = Date.now();

    if (lastTapRef.current) {
      const interval = now - lastTapRef.current;

      if (interval < 250 || interval > 1000) {
        lastTapRef.current = now;
        return;
      }

      const bpm = 60000 / interval;
      tapBpmsRef.current.push(bpm);

      if (tapBpmsRef.current.length > MAX_SAMPLES) {
        tapBpmsRef.current.shift();
      }

      const avgBpm =
        tapBpmsRef.current.reduce((a, b) => a + b, 0) /
        tapBpmsRef.current.length;

      if (avgBpm >= MIN_BPM && avgBpm <= MAX_BPM) {
        goodStreakRef.current += 1;

        if (goodStreakRef.current >= 4) {
          setFeedback(`🔥 Rhythm locked in (${Math.round(avgBpm)} BPM)`);
        } else {
          setFeedback(`✅ Good rhythm (${Math.round(avgBpm)} BPM)`);
        }
      } else {
        goodStreakRef.current = 0;

        if (avgBpm > MAX_BPM) {
          setFeedback(`⬆️ A bit fast (${Math.round(avgBpm)} BPM)`);
        } else {
          setFeedback(`⬇️ A bit slow (${Math.round(avgBpm)} BPM)`);
        }
      }
    }

    lastTapRef.current = now;
  };

  useEffect(() => {
    return () => {
      stopMetronome();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CPR Training Mode</Text>
      <Text style={styles.subtitle}>
        Practice chest compressions by tapping with the beat.
      </Text>

      <View style={styles.bodyContainer}>
        <View style={styles.chestWrapper}>
          <Image
            source={require("../../assets/images/6800891.png")}
            style={styles.chestImage}
            resizeMode="contain"
          />
          <Animated.View
            style={[styles.tapOverlay, { transform: [{ scale: pulseAnim }] }]}
          >
            <TouchableOpacity
              style={[styles.tapButton, !running && styles.tapButtonDisabled]}
              onPress={handleTap}
              activeOpacity={0.85}
              disabled={!running}
            >
              <Text style={styles.tapText}>TAP</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

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

  bodyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  chestWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  chestImage: {
    width: 350,
    height: 350,
  },

  tapOverlay: {
    position: "absolute",
    top: "50%", // tweak this to match center of chest
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  tapButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2fa94e",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  tapButtonDisabled: {
    backgroundColor: "#e5383b",
  },

  tapText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },

  feedback: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
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
