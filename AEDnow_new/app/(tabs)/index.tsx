import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { View, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { Button } from 'react-native';
import {useRef} from 'react';

const AED_SAMPLE_LOCATIONS = [
  { id: 1, name: 'AED 1', latitude: 53.3498, longitude: -6.2603 },
  { id: 2, name: 'AED 2', latitude: 53.3478, longitude: -6.2590 },
  { id: 3, name: 'AED 3', latitude: 53.3505, longitude: -6.2620 },
];

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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  

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

        
        {AED_SAMPLE_LOCATIONS.map((aed) => (
          <Marker
            key={aed.id}
            coordinate={{ latitude: aed.latitude, longitude: aed.longitude }}
            title={aed.name}
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
