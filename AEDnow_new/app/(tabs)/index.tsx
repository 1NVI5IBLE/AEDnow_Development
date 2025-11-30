import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { View, Alert, StyleSheet, ActivityIndicator } from 'react-native';

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


  // Optional: enable continuous tracking
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
      <MapView
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
            strokeColor="red"
          />
        )}
      </MapView>
    </View>
  );
}

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
});
