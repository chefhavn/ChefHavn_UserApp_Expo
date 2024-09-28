import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { Button, TextInput } from "react-native-paper";
import { Modalize } from "react-native-modalize";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import "react-native-gesture-handler";

const { height } = Dimensions.get("window");

const Stack = createStackNavigator();

function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [option, setOption] = useState(null);
  const [locationDetails, setLocationDetails] = useState("");
  const [addressName, setAddressName] = useState("");
  const [area, setArea] = useState("");
  const modalizeRef = useRef(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      console.log("Current location set:", loc);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  const renderContent = () => (
    <View style={styles.modalContent}>
      <Button
        mode="contained"
        onPress={() => setOption("home")}
        style={styles.button}
      >
        Home
      </Button>
      <Button
        mode="contained"
        onPress={() => setOption("other")}
        style={styles.button}
      >
        Other
      </Button>

      <TextInput
        label="Location Details"
        value={locationDetails}
        onChangeText={setLocationDetails}
        style={styles.input}
      />
      <TextInput
        label="Address Name"
        value={addressName}
        onChangeText={setAddressName}
        style={styles.input}
      />
      <TextInput
        label="Nearby Landmark"
        value={area}
        onChangeText={setArea}
        style={styles.input}
      />

      <Button mode="contained" onPress={saveDetails} style={styles.saveButton}>
        Save Address
      </Button>
    </View>
  );

  const saveDetails = () => {
    console.log("Save button pressed");
    if (location) {
      console.log(
        `Longitude: ${location.longitude}, Latitude: ${location.latitude}`
      );
    } else {
      console.log("Location is not available");
    }
    console.log(`Location Details: ${locationDetails}`);
    console.log(`Address Name: ${addressName}`);
    console.log(`Nearby Landmark: ${area}`);

    navigation.navigate("SavedScreen", {
      location,
      locationDetails,
      addressName,
      area,
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <GooglePlacesAutocomplete
          placeholder="Search"
          onPress={(data, details = null) => {
            if (details) {
              const loc = details.geometry.location;
              setLocation({
                latitude: loc.lat,
                longitude: loc.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });

              console.log("Location from Google Places set:", loc);
            }
          }}
          query={{
            key: "AIzaSyD0Svh7_EkCQypWAEn8aT6aWrYmwetPqgA", // Use your valid API key
            language: "en",
          }}
          fetchDetails={true}
          styles={{
            container: {
              position: "absolute",
              top: 100,
              width: "100%",
              zIndex: 1,
            },
            listView: { backgroundColor: "white" },
          }}
        />
        {location && (
          <MapView
            style={styles.map}
            region={location}
            showsUserLocation={true}
          >
            <Marker
              coordinate={location}
              draggable
              onDragEnd={(e) => {
                const newLoc = e.nativeEvent.coordinate;
                setLocation({
                  latitude: newLoc.latitude,
                  longitude: newLoc.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                });
                console.log("Marker moved to:", newLoc);
              }}
            />
          </MapView>
        )}
        <Button
          mode="contained"
          onPress={() => modalizeRef.current?.open()}
          style={styles.addButton}
        >
          Add More Details
        </Button>
        <Modalize ref={modalizeRef} snapPoint={300}>
          {renderContent()}
        </Modalize>
      </View>
    </GestureHandlerRootView>
  );
}

function SavedScreen({ route, navigation }) {
  const { location, locationDetails, addressName, area } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Saved Address Details</Text>
      <Text>Longitude: {location?.longitude}</Text>
      <Text>Latitude: {location?.latitude}</Text>
      <Text>Location Details: {locationDetails}</Text>
      <Text>Address Name: {addressName}</Text>
      <Text>Nearby Landmark: {area}</Text>
      <Button
        mode="contained"
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        Go Back to Map
      </Button>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MapScreen">
        <Stack.Screen name="MapScreen" component={MapScreen} />
        <Stack.Screen name="SavedScreen" component={SavedScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  addButton: {
    margin: 20,
  },
  modalContent: {
    padding: 20,
  },
  button: {
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
    marginTop: 10,
  },
  saveButton: {
    marginTop: 10,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 20,
    marginBottom: 20,
  },
  backButton: {
    marginTop: 20,
  },
});
