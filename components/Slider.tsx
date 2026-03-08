import { useState, useRef } from "react";
import { StyleSheet, View, PanResponder, LayoutChangeEvent } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

interface SliderProps {
  value: number;
  onValueChange: (val: number) => void;
  minimumValue?: number;
  maximumValue?: number;
}

export default function Slider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 1,
}: SliderProps) {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);

  const clamp = (v: number) => Math.min(maximumValue, Math.max(minimumValue, v));
  const fraction = (value - minimumValue) / (maximumValue - minimumValue);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const val = clamp(minimumValue + (x / widthRef.current) * (maximumValue - minimumValue));
        onValueChange(val);
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const val = clamp(minimumValue + (x / widthRef.current) * (maximumValue - minimumValue));
        onValueChange(val);
      },
    })
  ).current;

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWidth(w);
    widthRef.current = w;
  };

  return (
    <View
      style={styles.container}
      onLayout={handleLayout}
      {...panResponder.panHandlers}
    >
      <View style={styles.track}>
        <LinearGradient
          colors={[Colors.primary, "#818CF8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${fraction * 100}%` }]}
        />
      </View>
      <View
        style={[
          styles.thumb,
          { left: Math.max(0, fraction * width - 11) },
        ]}
      >
        <View style={styles.thumbInner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 36,
    justifyContent: "center",
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
  thumb: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
    top: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});
