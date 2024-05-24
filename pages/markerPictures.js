import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { database } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function MarkerPictures ({route}) {
    const { marker } = route.params;
    const [markerData, setMarkerData] = useState(null);

    useEffect(() => {
        async function fetchMarkerData() {
            const markerRef = doc(database, "markers", marker.key);
            const markerSnap = await getDoc(markerRef);
            setMarkerData(markerSnap.data());
        }
        fetchMarkerData();
    }, []);

    console.log("Marker in MarkerPictures:", markerData);
    return (
      <View style={styles.container}>
        <Image source={{ uri: markerData?.imageURL }} style={{ width: 300, height: 500 }} />
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
  });