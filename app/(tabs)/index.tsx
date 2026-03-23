import * as Device from "expo-device";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

const greenMarker = require("../../assets/images/markers/green_marker.png");

interface AEDLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  operator?: string;
  indoor?: boolean;
  access?: string;
  description?: string;
  openingHours?: string;
  lastCheckedAt?: string;
}

const API_BASE_URL = "https://api.aednow.online/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const toRad = (v: number) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const findNearestAED = (
  userLocation: { latitude: number; longitude: number },
  aedLocations: AEDLocation[],
) => {
  let nearestAED = null;
  let closestDistance = Infinity;

  for (const aed of aedLocations) {
    const distance = getDistance(
      userLocation.latitude,
      userLocation.longitude,
      aed.latitude,
      aed.longitude,
    );

    if (distance < closestDistance) {
      closestDistance = distance;
      nearestAED = aed;
    }
  }

  return nearestAED;
};

function formatAddress(address?: string): string {
  if (!address) return "Address unavailable";
  const parts = address.split(",");
  if (parts.length >= 2) {
    return `${parts[0].trim()}, ${parts[1].trim()}`;
  }
  return parts[0].trim();
}

export default function HomeScreen() {
  const [eta, setEta] = useState<number | null>(null);
  const [distance, setDistanceKm] = useState<number | null>(null);
  const [travelMode, setTravelMode] = useState<"DRIVING" | "WALKING">(
    "DRIVING",
  );

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const mapRef = useRef<MapView>(null);
  const [nearestAED, setNearestAED] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [showSheet, setShowSheet] = useState(false);
  const [aedLocations, setAedLocations] = useState<AEDLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const [notificationSent, setNotificationSent] = useState(false);

  const sendAEDNotification = async (count: number) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "AED Coverage Nearby",
        body: `There are ${count} AEDs within 5km of your location.`,
      },
      trigger: null,
    });
  };

  const countNearbyAEDs = () => {
    if (!userLocation) return 0;

    const radius = 5000;

    const nearby = aedLocations.filter((aed) => {
      const distance = getDistance(
        userLocation.latitude,
        userLocation.longitude,
        aed.latitude,
        aed.longitude,
      );

      return distance <= radius;
    });

    return nearby.length;
  };

  const fetchRouteSteps = async (
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
  ) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=${travelMode.toLowerCase()}&key=AIzaSyAsbwoWpdZ61S0x870J_S0E9NPNMx2IvuE`,
      );

      const data = await res.json();

      if (!data.routes?.length) return;

      const routeSteps = data.routes[0].legs[0].steps.map((step: any) => ({
        instruction: step.html_instructions
          .replace(/<[^>]+>/g, "")
          .replace(/Destination will be on the right/gi, "")
          .trim(),
        distance: step.distance.text,
        duration: step.duration.text,
        location: step.end_location,
      }));

      setSteps(routeSteps);

      console.log("ROUTE STEPS:", routeSteps);
    } catch (err) {
      console.error("Error fetching directions:", err);
    }
  };

  // Fetch AED locations
  useEffect(() => {
    const fetchAEDLocations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/aedlocations`);
        const data = await response.json();

        if (data.success) {
          setAedLocations(data.data);
        } else {
          Alert.alert("Error", "Failed to fetch AED locations");
        }
      } catch (error) {
        console.error("Error fetching AED locations:", error);
        Alert.alert("Error", "Could not connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchAEDLocations();
  }, []);

  // In this section I'm requesting notification permission from the user
  useEffect(() => {
    async function registerNotifications() {
      if (!Device.isDevice) return;

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission required",
          "Enable notifications for AED alerts.",
        );
      }
    }

    registerNotifications();
  }, []);

  // Here I'm getting the user location based on the permissions
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "We need your location to find nearby AEDs.",
        );
        return;
      }

      try {
        await Location.enableNetworkProviderAsync();

        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (location) => {
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          },
        );

        return () => subscription.remove();
      } catch (err) {
        Alert.alert("Location Error", JSON.stringify(err, null, 2));
      }
    })();
  }, []);

  // here I'm displaying the notification when the user is near an AED or within 5km of multiple AEDs

  useEffect(() => {
    if (userLocation && aedLocations.length > 0) {
      const nearest = findNearestAED(userLocation, aedLocations);
      setNearestAED(nearest);

      if (!notificationSent && nearest) {
        const distance = getDistance(
          userLocation.latitude,
          userLocation.longitude,
          nearest.latitude,
          nearest.longitude,
        );

        const km = (distance / 1000).toFixed(1);

        const count = countNearbyAEDs();

        if (count > 0) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: "AED Coverage Nearby",
              body: `There are ${count} AEDs within 5km of your location.`,
            },
            trigger: null,
          });
        } else {
          Notifications.scheduleNotificationAsync({
            content: {
              title: "Nearest AED",
              body: `The closest AED is ${km} km away.`,
            },
            trigger: null,
          });
        }

        setNotificationSent(true);
      }
    }
  }, [userLocation, aedLocations]);

  const handleFindNearestAED = () => {
    if (!userLocation || aedLocations.length === 0) return;

    const nearest = findNearestAED(userLocation, aedLocations);
    if (!nearest) return;

    setNearestAED(nearest);

    mapRef.current?.animateToRegion(
      {
        latitude: nearest.latitude,
        longitude: nearest.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      1000,
    );
  };

  if (!userLocation || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby AEDs</Text>
        <Text style={styles.headerSubtitle}>
          Live defibrillator locations near you
        </Text>
      </View>

      {nearestAED && (
        <TouchableOpacity
          style={styles.aedCardContainer}
          onPress={() => setShowSheet(true)}
          activeOpacity={0.85}
        >
          {/* Left red accent bar */}
          <View style={styles.aedCardAccent} />

          <View style={styles.aedCardContent}>
            <View style={styles.aedCardTop}>
              <View style={styles.aedLiveBadge}>
                <View style={styles.aedLiveDot} />
                <Text style={styles.aedLiveText}>NEAREST</Text>
              </View>
              <Text style={styles.aedCardArrow}>›</Text>
            </View>

            <Text style={styles.aedCardName} numberOfLines={1}>
              {nearestAED.name}
            </Text>

            <View style={styles.aedCardBottom}>
              <Text style={styles.aedCardAddress} numberOfLines={1}>
                📍 {formatAddress(nearestAED.address)}
              </Text>
              {distance && (
                <View style={styles.aedDistanceBadge}>
                  <Text style={styles.aedDistanceText}>
                    {distance.toFixed(1)} km
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      )}

      <MapView
        ref={mapRef}
        provider="google"
        style={styles.map}
        showsUserLocation={true}
        followsUserLocation={true}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={userLocation} title="You are here" />

        {aedLocations.map((aed) => (
          <Marker
            key={aed.id}
            coordinate={{ latitude: aed.latitude, longitude: aed.longitude }}
            title={aed.name}
            description={aed.address}
          >
            <Image
              source={greenMarker}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Marker>
        ))}

        {nearestAED && userLocation && (
          <MapViewDirections
            origin={userLocation}
            destination={{
              latitude: nearestAED.latitude,
              longitude: nearestAED.longitude,
            }}
            apikey="AIzaSyAsbwoWpdZ61S0x870J_S0E9NPNMx2IvuE"
            strokeWidth={4}
            strokeColor="#2ecc71"
            mode={travelMode}
            onReady={(result) => {
              setEta(result.duration);
              setDistanceKm(result.distance);

              if (userLocation && nearestAED) {
                fetchRouteSteps(userLocation, {
                  latitude: nearestAED.latitude,
                  longitude: nearestAED.longitude,
                });
              }
            }}
          />
        )}
      </MapView>

      {steps.length > 0 && (
        <View
          style={{
            position: "absolute",
            top: 200,
            left: 20,
            right: 20,
            backgroundColor: "white",
            padding: 12,
            borderRadius: 10,
            zIndex: 999,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Next Step:</Text>
          <Text>{steps[0]?.instruction}</Text>
        </View>
      )}

      {eta && (
        <View style={styles.etaContainer}>
          <Text style={styles.etaText}>
            {Math.round(eta)} min • {distance?.toFixed(2)} km
          </Text>
        </View>
      )}

      <View style={styles.segmentedContainer}>
        <TouchableOpacity
          style={[
            styles.segment,
            travelMode === "WALKING" && styles.activeSegment,
          ]}
          onPress={() => setTravelMode("WALKING")}
        >
          <Text
            style={[
              styles.segmentText,
              travelMode === "WALKING" && styles.activeSegmentText,
            ]}
          >
            Walk
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segment,
            travelMode === "DRIVING" && styles.activeSegment,
          ]}
          onPress={() => setTravelMode("DRIVING")}
        >
          <Text
            style={[
              styles.segmentText,
              travelMode === "DRIVING" && styles.activeSegmentText,
            ]}
          >
            Drive
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.roundedButtonWrapper}>
          <Button
            title="Find Nearest AED"
            onPress={handleFindNearestAED}
            color="#069864"
          />
        </View>
      </View>

      {showSheet && nearestAED && (
        <View style={styles.bottomSheet}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowSheet(false)}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.openBadgeContainer}>
            <View style={styles.openBadge}>
              <Text style={styles.openText}>Open</Text>
            </View>
          </View>

          <Text style={styles.sheetTitle}>{nearestAED.name}</Text>

          <View style={styles.travelRow}>
            <Text style={styles.travelItem}>
              📍 {distance?.toFixed(1)} km away
            </Text>
            <Text style={styles.travelItem}>
              🚶 {Math.round((eta || 0) * 1.5)} min
            </Text>
            <Text style={styles.travelItem}>🚗 {Math.round(eta || 0)} min</Text>
          </View>

          <View style={styles.divider} />

          {nearestAED.address && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Address</Text>
              <Text style={styles.sectionText}>{nearestAED.address}</Text>
            </View>
          )}

          <View style={styles.divider} />

          {nearestAED.openingHours && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Access Hours</Text>
              <Text style={styles.sectionText}>{nearestAED.openingHours}</Text>
            </View>
          )}

          <View style={styles.divider} />

          {nearestAED.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location Details</Text>
              <Text style={styles.sectionText}>{nearestAED.description}</Text>
            </View>
          )}

          <View style={styles.divider} />

          {nearestAED.operator && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact</Text>
              <Text style={styles.sectionText}>{nearestAED.operator}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.navButton}>
            <Text style={styles.navButtonText}>Start Navigation</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
  },

  roundedButtonWrapper: {
    borderRadius: 30,
    overflow: "hidden",
  },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#e5383b",
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
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

  segmentedContainer: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 25,
    padding: 4,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  segment: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },

  activeSegment: {
    backgroundColor: "#069864",
  },

  segmentText: {
    fontWeight: "600",
    color: "#555",
  },

  activeSegmentText: {
    color: "#fff",
  },

  etaText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#222",
  },

  etaContainer: {
    position: "absolute",
    bottom: 165,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },

  closeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 10,
  },

  closeText: {
    fontSize: 18,
    color: "#333",
  },

  travelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },

  travelItem: {
    color: "#6B7280",
    fontSize: 14,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },

  section: {
    marginBottom: 2,
  },

  sectionTitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },

  sectionText: {
    fontSize: 15,
    color: "#111",
  },

  navButton: {
    backgroundColor: "#2E8B57",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },

  navButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  openBadgeContainer: {
    alignItems: "center",
    marginBottom: 6,
  },

  openBadge: {
    backgroundColor: "#DFF5E4",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },

  openText: {
    color: "#1C7C54",
    fontWeight: "600",
    fontSize: 13,
  },

  sheetTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },

  aedCardContainer: {
    position: "absolute",
    top: 155,
    left: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },

  aedCardAccent: {
    width: 5,
    backgroundColor: "#e5383b",
  },

  aedCardContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  aedCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  aedLiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff0f0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },

  aedLiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#e5383b",
    marginRight: 5,
  },

  aedLiveText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#e5383b",
    letterSpacing: 0.8,
  },

  aedCardArrow: {
    fontSize: 22,
    color: "#9ca3af",
    lineHeight: 22,
  },

  aedCardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  aedCardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  aedCardAddress: {
    fontSize: 12,
    color: "#6b7280",
    flex: 1,
    marginRight: 8,
  },

  aedDistanceBadge: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },

  aedDistanceText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#069864",
  },
});
