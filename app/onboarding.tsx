import { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
  FlatList,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ONBOARDING_KEY = "sleep_buddy_onboarded";

interface OnboardingSlide {
  id: string;
  icon: string;
  iconFamily: "Ionicons" | "MaterialCommunityIcons";
  iconColor: string;
  ringColor: string;
  title: string;
  subtitle: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: "1",
    icon: "moon",
    iconFamily: "Ionicons",
    iconColor: Colors.secondary,
    ringColor: "rgba(251, 191, 36, 0.12)",
    title: "Sleep Better\nTonight",
    subtitle: "Fall asleep faster with calming sounds and guided relaxation designed for deep, restful sleep.",
  },
  {
    id: "2",
    icon: "waveform",
    iconFamily: "MaterialCommunityIcons",
    iconColor: Colors.accent,
    ringColor: "rgba(52, 211, 153, 0.1)",
    title: "Soothing\nSoundscapes",
    subtitle: "Rain, ocean waves, forest nights — choose from a library of ambient sounds that help you drift off.",
  },
  {
    id: "3",
    icon: "analytics",
    iconFamily: "Ionicons",
    iconColor: Colors.sky,
    ringColor: "rgba(96, 165, 250, 0.1)",
    title: "Track Your\nSleep Quality",
    subtitle: "Wake up to insights about your sleep patterns, snoring trends, and progress over time.",
  },
  {
    id: "4",
    icon: "heart",
    iconFamily: "Ionicons",
    iconColor: Colors.coral,
    ringColor: "rgba(251, 113, 133, 0.1)",
    title: "Your Sleep,\nYour Way",
    subtitle: "Set timers, customize sounds, and let Sleep Buddy do the rest. All processing stays on your device.",
  },
];

function AnimatedSlide({ item }: { item: OnboardingSlide }) {
  const iconScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    iconScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));
    textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
  }, []);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconScale.value,
  }));

  const textAnimStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: interpolate(textOpacity.value, [0, 1], [20, 0]) }],
  }));

  const IconComponent = item.iconFamily === "Ionicons" ? Ionicons : MaterialCommunityIcons;

  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <Animated.View style={iconAnimStyle}>
        <View style={[styles.iconRingOuter, { borderColor: item.ringColor }]}>
          <View style={[styles.iconContainer, { backgroundColor: item.ringColor }]}>
            <IconComponent name={item.icon as any} size={52} color={item.iconColor} />
          </View>
        </View>
      </Animated.View>
      <Animated.View style={[styles.textBlock, textAnimStyle]}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
      </Animated.View>
    </View>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const fadeIn = useSharedValue(0);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 500 });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const isLast = currentIndex === SLIDES.length - 1;

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) {
      handleGetStarted();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleGetStarted = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(tabs)");
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(tabs)");
  };

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <LinearGradient
        colors={[Colors.background, "#0E1330", "#131842"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.header, { paddingTop: insets.top + 12 + webTopInset }]}>
        {currentIndex < SLIDES.length - 1 ? (
          <Pressable onPress={handleSkip} hitSlop={12}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : (
          <View />
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={({ item }) => <AnimatedSlide item={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(idx);
        }}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 + (Platform.OS === "web" ? 34 : 0) }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {isLast ? (
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.getStartedButton,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <LinearGradient
              colors={[Colors.primary, "#5046E5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.getStartedGradient}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.nextButton,
              pressed && { opacity: 0.85, transform: [{ scale: 0.95 }] },
            ]}
          >
            <LinearGradient
              colors={[Colors.primary, "#5046E5"]}
              style={styles.nextButtonGradient}
            >
              <Ionicons name="arrow-forward" size={22} color="#fff" />
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  skipText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 40,
  },
  iconRingOuter: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    alignItems: "center",
  },
  slideTitle: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    textAlign: "center",
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  footer: {
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 28,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: "rgba(241, 240, 255, 0.12)",
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
  },
  nextButtonGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  getStartedButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
  },
  getStartedGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  getStartedText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
