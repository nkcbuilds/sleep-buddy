import { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import Colors from "@/constants/colors";

const ONBOARDING_KEY = "sleep_buddy_onboarded";

export default function IndexRedirect() {
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(ONBOARDING_KEY).then((val) => {
        if (val === "true") {
          router.replace("/(tabs)");
        } else {
          router.replace("/onboarding");
        }
      }).catch(() => {
        router.replace("/onboarding");
      });
    }, [])
  );

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
