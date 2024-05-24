import { StatusBar } from "expo-status-bar";
import { Alert, StyleSheet, Text, View, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useState, useRef, useEffect, useContext } from "react";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { app, database, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  addDoc,
  collection,
  onSnapshot,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { StatusContext } from "./mycontext";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export default function Map({ navigation }) {
    const [markers, setMarkers] = useState([]);
    const [region, setRegion] = useState({
    latitude: 40,
    longitude: -73,
    latitudeDelta: 20, // hvor meget af kortet der vises
    longitudeDelta: 20,
  });

  const statusContext = useContext(StatusContext);

  const mapView = useRef(null); // useRef minder om useState, men forårsager ikke en re-rendering
  const locationSubscription = useRef(null);

  useEffect(() => {
    // get data from database
    async function fetchMarkers() {
      const markerCollection = collection(database, "markers");
      const markerQuery = query(markerCollection, where("userId", "==", statusContext.currentUser.uid));
      const markerSnapshot = await getDocs(markerQuery);
      const fetchedMarkers = [];
      markerSnapshot.forEach((doc) => {
        fetchedMarkers.push({
          key: doc.id,
          coordinate: {
            latitude: doc.data().latitude,
            longitude: doc.data().longitude,
          },
          title: doc.data().title,
          imageURL: doc.data().imageURL,
        });
      });
      setMarkers(fetchedMarkers);
    }
    fetchMarkers();

    // start en listener
    async function startListener() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }
      locationSubscription.current = await Location.watchPositionAsync(
        {
          distanceInterval: 100,
          accuracy: Location.Accuracy.High,
        },
        (location) => {
          const newRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 2,
            longitudeDelta: 2,
          };
          setRegion(newRegion);
        }
      );
    }

    startListener();
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove(); // sluk for listeneren, når komponenten fjernes
      }
    };
  }, []); // et tomt array kører kun én gang

  async function addMarker(data, title) {
    const { latitude, longitude } = data.nativeEvent.coordinate;
    const newMarker = {
      coordinate: { latitude, longitude },
      key: data.timeStamp,
      title: title || "New Marker",
    };
    setMarkers([...markers, newMarker]);

    // Save to database
    try {
      await addDoc(collection(database, "markers"), {
        latitude,
        longitude,
        title: title || "New Marker",
        key: data.timeStamp,
        userId: statusContext.currentUser.uid,
      });
    } catch (error) {
        console.error("Error adding marker: ", error);
    }
    console.log("Added marker to database")
  }

  const [imagePath, setImagePath] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  function onMarkerPress(marker) {
    setSelectedMarker(marker);
    Alert.alert(
      marker.title,
      "Choose an option",
      [
        { text: "Camera Roll", onPress: () => openCameraRoll() },
        { text: "Open Camera", onPress: () => launchCamera() },
        { text: "Show pictures", onPress: () => onSeeMarkerPictures(marker) },
        {
          text: "Cancel",
          onPress: () => console.log("Cancel pressed"),
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  }

  async function launchCamera(){
    const result = await ImagePicker.requestCameraPermissionsAsync()
    if (result.granted === false){
      constole.log("Permission to access camera was denied")
    } else {
      ImagePicker.launchCameraAsync({
        quality: 1, // fra 0.0 til 1.0
      })
      .then((result) => {
        console.log("Got picture: " + result)
        setImagePath(result.assets[0].uri)
        saveImage(result.assets[0].uri, selectedMarker)
      })
    }
  }

  async function openCameraRoll() {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      console.log("Got picture: " + result.assets[0].uri);
      setImagePath(result.assets[0].uri);
      saveImage(result.assets[0].uri, selectedMarker);
    }
  }

  async function saveImage(imageUri, marker) {
    if (!marker || !marker.key) {
      console.error("Invalid marker:", marker);
      console.error("No marker key found");
      return;
    }

    try {
      if (imageUri && typeof imageUri === "string" && imageUri.trim() !== "") {
        new URL(imageUri);
        const res = await fetch(imageUri);
        const blob = await res.blob();
        const imageName = `${marker.key}.jpg`;

        // Upload to storage
        const imageRef = ref(storage, imageName);
        await uploadBytes(imageRef, blob).then(() => {
          console.log("Uploaded picture");
        });

        // Get download URL
        const url = await getDownloadURL(imageRef);
        console.log("Uploaded picture to: " + url);

        // Update the marker document in Firestore with the image URL
        console.log("Marker key: " + marker.key);
        const markerRef = doc(database, "markers", marker.key);
        console.log("Marker ref: " + markerRef);
        await updateDoc(markerRef, { imageURL: url });

        console.log("Saved image to database: " + url);
      } else {
        console.error("imageUri is null or undefined");
      }
    } catch (error) {
      console.error("Error saving image: ", error);
    }
  }

  function onSeeMarkerPictures(marker) {
    navigation.navigate("MarkerPictures", { marker });
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onLongPress={addMarker}
        ref={mapView}
      >
        {markers.map((marker) => (
          <Marker
            coordinate={marker.coordinate}
            key={marker.key}
            title={marker.title}
            onPress={() => onMarkerPress(marker)}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});