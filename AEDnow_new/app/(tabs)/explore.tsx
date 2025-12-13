import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { useEffect, useRef } from "react";
import { Vibration } from "react-native"; 


type CPRStep = {
  id: number;
  title: string;
  subtitle: string;
  time: string;
  bullets: string[];
};

type CPRType = "adult" | "child" | "baby";



export default function CPRGuide() {
  const [cprType, setCprType] = useState<CPRType>("adult")
  const [openStep, setOpenStep] = useState<number | null>(1);
  const beepSound = useRef<Audio.Sound | null>(null);
  const beepInterval = useRef<number | null>(null);
  const vibration_Duration = 60;

  

  const speakFullStep = (step: CPRStep) => {
    const text = `${step.title}. ${step.subtitle}. ${step.bullets.join(". ")}`;
    Speech.speak(text);
  };




  const startCPRBeep = async () => {
    if (beepInterval.current !== null) return;

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });

    const { sound } = await Audio.Sound.createAsync(
    require("../../assets/images/sounds/beep.mp3")
  );

  beepSound.current = sound;

  // 600 ms
  // 110 BPM ≈ 545–600 ms (600 ms is fine and slightly calmer)
  beepInterval.current = setInterval(() => {
    beepSound.current?.replayAsync().catch(() => {});
    Vibration.vibrate(vibration_Duration);
  }, 600);
};


const stopCPRBeep = async () => {
  if (beepInterval.current !== null) {
    clearInterval(beepInterval.current);
    beepInterval.current = null;
  }

  Vibration.cancel();

  if (beepSound.current) {
    await beepSound.current.stopAsync();
    await beepSound.current.unloadAsync();
    beepSound.current = null;
  }
};


useEffect(() => {
  if (openStep == 5) {
    startCPRBeep();
  }else{
    stopCPRBeep();
  }

  return () => {
    stopCPRBeep();
  };
}, [openStep])




  const CPR_DATA: Record<CPRType, CPRStep[]> = {
  adult: [
    {
      id: 1,
      title: "Check Safety & Responsiveness",
      subtitle: "Ensure scene is safe, check if person responds and look for normal breathing.",
      time: "5–10 seconds",
      bullets: [
        "Look for hazards.",
        "Tap the patient and shout, “Can you hear me?”.",
        "Check for normal breathing.",
        "If unresponsive, go to Step 2."
      ],
    },
    {
      id: 2,
      title: "Call Emergency Services",
      subtitle: "Call 999 — put on speaker if alone - do NOT delay CPR.",
      time: "10–20 seconds",
      bullets: [
        "Dial 999 immediately.",
        "Put phone on speaker.",
        "State location clearly.",
        "Begin CPR as soon as the call is made.",
        "Send someone to get an AED."
      ],
    },
    {
      id: 3,
      title: "Locate & Prepare the AED",
      subtitle: "Retrieve the nearest AED and prepare pads.",
      time: "20–30 seconds",
      bullets: [
        "Turn AED on.",
        "Expose chest.",
        "Attach pads as shown."
      ],
    },
    {
      id: 4,
      title: "Deliver Shock if Advised",
      subtitle: "Stand clear during analysis.",
      time: "10–20 seconds",
      bullets: [
        "Ensure no one is touching patient.",
        "Press shock if advised.",
        "Resume CPR immediately."
      ],
    },
    {
      id: 5,
      title: "Continue CPR",
      subtitle: "Push hard and fast.",
      time: "2 minutes per cycle",
      bullets: [
        "100–120 compressions per minute.",
        "Depth at least 5 cm.",
        "Allow full recoil."
      ],
    },
],

  child: [
    {
      id: 1,
      title: "Check Safety & Responsiveness",
      subtitle: "Check if the child responds and is breathing.",
      time: "5–10 seconds",
      bullets: [
        "Tap and shout gently.",
        "Put one hand on their forehead.",
        "Tilt their head back.",
        "Lift their chin.",
        "Check for breathing.",
        "If you can see an object in their mouth or nose, try to remove it."
      ],
    },
    {
      id: 2,
      title: "Call Emergency Services",
      subtitle: "Call 999 — put on speaker if alone.",
      time: "10–20 seconds",
      bullets: [
        "Dial 999 immediately.",
        "Put phone on speaker.",
        "State location clearly.",
        "Send someone to get an AED."

      ],
    },
    {
      id: 3,
      title: "Locate & Prepare the AED",
      subtitle: "Retrieve the nearest AED and prepare pads.",
      time: "20–30 seconds",
      bullets: [
        "Turn AED on.",
        "Expose chest.",
        "Attach pads as shown."
      ],
    },

  ],

  baby: [
    {
      id: 1,
      title: "Check Responsiveness",
      subtitle: "Check if the baby responds and is breathing.",
      time: "5–10 seconds",
      bullets: [
        "Tap foot gently.",
        "Look for breathing.",
      ],
    },
    {
      id: 2,
      title: "Call Emergency Services",
      subtitle: "Call 999 immediately.",
      time: "10–20 seconds",
      bullets: [
        "Put phone on speaker.",
      ],
    },
    {
      id: 3,
      title: "Start CPR",
      subtitle: "Use two fingers in the centre of the chest.",
      time: "2 minutes per cycle",
      bullets: [
        "Press about 4 cm deep.",
        "Allow full recoil.",
      ],
    },
  ],
};


  const toggleStep = (id: number) => {
    setOpenStep(prev => (prev === id ? null : id));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      {/* 🔴 DROPPED HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CPR & Emergency Guide</Text>
        <Text style={styles.headerSubtitle}>
          Step-by-step instructions to conduct CPR
        </Text>
      </View>

      {/* CONTENT FLOATS INTO HEADER */}
      <View style={styles.content}>

        {/* 🚨 EMERGENCY BOX */}
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>
            In case of emergency, call immediately!
          </Text>

          <TouchableOpacity
            style={styles.callButton}
            onPress={() => Linking.openURL("tel:999")}
          >
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.callButtonText}>Call 999</Text>
          </TouchableOpacity>
        </View>


      <View style={styles.tabsRow}>
       {[
        { key: "adult", label: "Adult" },
        { key: "child", label: "Child" },
        { key: "baby", label: "Baby" },
  ].map(tab => (
    <TouchableOpacity
      key={tab.key}
      onPress={() => {
        setCprType(tab.key as CPRType);
        setOpenStep(null);
      }}
      style={styles.tabButton}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.tabText,
          cprType === tab.key && styles.tabTextActive,
        ]}
      >
        {tab.label}
      </Text>

      {cprType === tab.key && <View style={styles.tabUnderline} />}
    </TouchableOpacity>
  ))}
</View>



        {/* CPR STEPS */}
        {CPR_DATA[cprType].map(step => {
          const isOpen = openStep === step.id;

          return (
            <TouchableOpacity
              key={step.id}
              style={[styles.stepCard, isOpen && styles.stepCardOpen]}
              onPress={() => toggleStep(step.id)}
              activeOpacity={0.9}
            >
              <View style={styles.stepHeader}>
                <View style={[styles.stepNumberCircle, isOpen && styles.stepNumberCircleActive,]}> 
                  <Text style={[styles.stepNumber, isOpen && styles.stepNumberActive,]}>{step.id}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepSubtitle}>{step.subtitle}</Text>

                  <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={16} color="#555" />
                    <Text style={styles.timeText}>{step.time}</Text>
                  </View>
                </View>

                <Ionicons
                  name={isOpen ? "chevron-up" : "chevron-forward"}
                  size={20}
                  color="#444"
                />
              </View>

              {isOpen && (
                <>
                  <TouchableOpacity
                    style={styles.speakButton}
                    onPress={() => speakFullStep(step)}
                  >
                    <Ionicons name="volume-high" size={18} color="#fff" />
                    <Text style={styles.speakButtonText}>
                      Play Instructions
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.bulletSection}>
                    {step.bullets.map((b, i) => (
                      <View key={i} style={styles.bulletRow}>
                        <View style={styles.bulletDot} />
                        <Text style={styles.bulletText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
  },

  /* 🔴 HEADER THAT COMES DOWN */
  header: {
    backgroundColor: "#e5383b",
    paddingTop: 60,
    paddingBottom: 80,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginHorizontal: -16,
    marginBottom: -70,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },

  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },

  headerSubtitle: {
    color: "#ffecec",
    textAlign: "center",
    marginTop: 6,
  },

  /* CONTENT FLOAT */
  content: {
    paddingTop: 40,
  },

  alertBox: {
    backgroundColor: "#ffffffff",
    borderWidth: 2,
    borderColor: "#ffb3b5",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },

  alertText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: "#b30000",
    marginBottom: 12,
  },

  callButton: {
    backgroundColor: "#e5383b",
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  callButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  stepCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 2,
  },

  stepCardOpen: {
    borderColor: "#2fa94e",
    elevation: 4,
  },

  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  stepNumberCircle: {
    backgroundColor: "#dee2e6",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  stepNumberCircleActive: {
    backgroundColor: "#2fa94e",
  },

  stepNumber: {
    color: "#495057",
    fontSize: 18,
    fontWeight: "bold",
  },

  stepNumberActive: {
    color: "white"
  },

  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  stepSubtitle: {
    fontSize: 13,
    color: "#444",
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },

  timeText: {
    fontSize: 13,
    color: "#555",
  },

  speakButton: {
    backgroundColor: "#e5383b",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },

  speakButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  bulletSection: {
    marginTop: 14,
  },

  bulletRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },

  bulletDot: {
    width: 8,
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
    marginTop: 6,
  },

  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

tabsRow: {
  flexDirection: "row",
  justifyContent: "space-around",
  marginBottom: 24,
},

tabButton: {
  alignItems: "center",
  paddingVertical: 6,
},

tabText: {
  fontSize: 15,
  fontWeight: "600",
  color: "#6c757d",
},

tabTextActive: {
  color: "#e5383b",
},

tabUnderline: {
  marginTop: 6,
  height: 3,
  width: 30,
  borderRadius: 2,
  backgroundColor: "#e5383b",
},


});
