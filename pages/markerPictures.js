import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { database } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';

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

    console.log("Marker:", markerData);
    return (
      <GestureHandlerRootView style={styles.rootView}>
        <PictureBox image={markerData?.imageURL} />
      </GestureHandlerRootView>
    );
};

const PictureBox = ({ image }) => {
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

 const panGesture = Gesture.Pan()
    .onBegin(() => {
    })
    .onChange((event) => {
      translateX.value = event.translationX;
      //translateY.value = event.translationY;
      rotate.value = (translateX.value / 250) * -10
    })
    .onFinalize(() => {
      if (translateX.value > 150) {
        translateX.value = withSpring(500)
      }
      else {
        translateX.value = withSpring(0);
        //translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

 const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate.value}deg` },
      ],
    };
 });

 return (
  <GestureDetector gesture={panGesture}>
    <Animated.View style={[styles.container, animatedStyle]}>
      <Image source={{uri: image}} style={styles.imgStyle} />
    </Animated.View>
  </GestureDetector>
  )
}

const styles = StyleSheet.create({
  imgStyle: {
    width: 250,
    height: 400,
  },
  rootView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
 },
 container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
 },
  });