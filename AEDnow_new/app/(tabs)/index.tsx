import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { View, Alert, StyleSheet, ActivityIndicator, Button, Text, TouchableOpacity} from "react-native";
import { Image } from 'react-native';
import {useRef} from 'react';



const AED_SAMPLE_LOCATIONS = [
  { id: 2, name: 'Dunnes Stores', latitude: 53.3478, longitude: -6.2590, status : "Open", Address: "123 O\'Connell St, Dublin" },
  { id: 3, name: 'EuroGiant', latitude: 53.3505, longitude: -6.2620,  status: "Closed", Address: "456 O\'Connell St Dublin" },
];
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

const API_BASE_URL = 'http://10.0.2.2:3000/api'; // Android emulator special address for localhost



function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const toRad = (v: number) => v * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}



const findNearestAED = (userLocation: { latitude: number; longitude: number }) => {
  let nearestAED = null;
  let closestDistance = Infinity;

  for (const aed of AED_SAMPLE_LOCATIONS) {

    if (aed.status !== "Open") continue;

const findNearestAED = (userLocation: { latitude: number; longitude: number }, aedLocations: AEDLocation[]) => {
  let nearestAED = null;
  let closestDistance = Infinity;

  for (const aed of aedLocations) {
    const distance = getDistance(
      userLocation.latitude,
      userLocation.longitude,
      aed.latitude,
      aed.longitude
    );

    if (distance < closestDistance) {
      closestDistance = distance;
      nearestAED = aed;
    }
  }

  return nearestAED;
};



export default function HomeScreen() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView>(null);
  const [nearestAED, setNearestAED] = useState<any>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [aedLocations, setAedLocations] = useState<AEDLocation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch AED locations from backend
  useEffect(() => {
    const fetchAEDLocations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/aedlocations`);
        const data = await response.json();
        
        if (data.success) {
          setAedLocations(data.data);
        } else {
          Alert.alert('Error', 'Failed to fetch AED locations');
        }
      } catch (error) {
        console.error('Error fetching AED locations:', error);
        Alert.alert('Error', 'Could not connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchAEDLocations();
  }, []);

useEffect(() => {
  (async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert("Permission denied", "We need your location to find nearby AEDs.");
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
          console.log("LIVE LOCATION:", location);
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );

      
      return () => subscription.remove();

    } catch (err) {
      console.log("LOCATION ERROR:", err);
      Alert.alert("Location Error", JSON.stringify(err, null, 2));
    }
  })();
}, []);




useEffect(() => {
  if (userLocation) {
    const nearest = findNearestAED(userLocation);
    setNearestAED(nearest);
  }
}, [userLocation]);


  // Optional: 
  // useEffect(() => {
  //   const subscription = Location.watchPositionAsync(
  //     { accuracy: Location.Accuracy.Highest, distanceInterval: 2 },
  //     (location) => {
  //       console.log("LIVE LOCATION:", location);
  //       setUserLocation({
  //         latitude: location.coords.latitude,
  //         longitude: location.coords.longitude,
  //       });
  //     }
  //   );
  //   return () => subscription && subscription.remove();
  // }, []);

  const handleFindNearestAED = () => {
    if (!userLocation) return;

    const nearest = findNearestAED(userLocation);
    if (!nearest) return;

    setNearestAED(nearest);

    mapRef.current?.animateToRegion(
      {
        latitude: nearest.latitude,
        longitude: nearest.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      1000
    );
  }



  if (!userLocation) {
  if (!userLocation || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }


  
  const nearestAED = findNearestAED(userLocation, aedLocations);

  return (
    <View style={styles.container}>
      <View style = {styles.header}>
        <Text style={styles.headerTitle}>Nearby AEDs</Text>
        <Text style={styles.headerSubtitle}>Live defibrillator locations near you</Text>
      </View>

      {nearestAED && (
        <TouchableOpacity 
          style={styles.aedInfoContainer}
          onPress={() => setShowSheet(true)}
          activeOpacity={0.8}
        >
          <View style={styles.aedInfoBox}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: nearestAED.status === "Open" ? "green" : "red",
                  marginRight: 8,
                }}
              />
              <Text style={styles.aedName}>{nearestAED.name}</Text>
            </View>
            <Text style={styles.aedStatus}>
              {nearestAED.status === "Open" ? "Open" : "Closed"}
            </Text>
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

        
        {AED_SAMPLE_LOCATIONS.map((aed) => (
        <Marker
          key={aed.id}
          coordinate={{ latitude: aed.latitude, longitude: aed.longitude }}
          title={aed.name}
        >
          <View style={{ width: 35, height: 35 }}>
            <Image
              source={
                aed.status === "Open"
                  ? require("../../assets/images/markers/green_marker.png")
                  : require("../../assets/images/markers/red_map_marker_icon.png")
              }
              style={{ width: "100%", height: "100%", resizeMode: "contain" }}
            />
          </View>
        </Marker>
      ))}
        {aedLocations.map((aed) => (
          <Marker
            key={aed.id}
            coordinate={{ latitude: aed.latitude, longitude: aed.longitude }}
            title={aed.name}
            description={aed.address}
          />
        ))}

       
        {nearestAED && (
          <MapViewDirections
            origin={userLocation}
            destination={{
              latitude: nearestAED.latitude,
              longitude: nearestAED.longitude,
            }}
            apikey="AIzaSyAsbwoWpdZ61S0x870J_S0E9NPNMx2IvuE"
            strokeWidth={4}
            strokeColor="#2ecc71"
          />
        )}


      </MapView>
      <View style={styles.buttonContainer}>
            <Button title="Find Nearest AED" onPress={handleFindNearestAED} color="#069864" />
      </View>

        {showSheet && nearestAED && (
          <View style={styles.bottomSheet}>
            <Text style={styles.aedName}>{nearestAED.name}</Text>
            <Text>Status: {nearestAED.status}</Text>
            <Text>Latitude: {nearestAED.latitude}</Text>
            <Text>Longitude: {nearestAED.longitude}</Text>

            <View style={{ marginTop: 20 }}>
              <Button title="Close" onPress={() => setShowSheet(false)} color="#e5383b" />
            </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    
  },


  header: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,

  backgroundColor: "#e5383b",
  paddingTop: 60,
  paddingBottom: 20,        // 👈 makes it “come down”
  borderBottomLeftRadius: 32,
  borderBottomRightRadius: 32,

  zIndex: 5,                // 👈 below AED box
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


   aedInfoContainer: {
    position: "absolute",
    top: 150,
    left: 20,
    right: 20,
    zIndex: 10,
  },

  aedInfoBox: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  aedName: {
    fontSize: 16,
    fontWeight: "bold",
  },

  aedStatus: {
    marginTop: 4,
    fontSize: 14,
    opacity: 0.7,
  },

  bottomSheet: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "40%",   
  backgroundColor: "#fff",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: 20,
  elevation: 10,
  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 5,
}

});
