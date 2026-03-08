import { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useSleep, SOUNDS, TimerOption } from "@/contexts/SleepContext";

const TIMER_OPTIONS: { label: string; value: TimerOption }[] = [
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
  { label: "Until wake", value: null },
];

function SoundIcon({ icon, iconFamily, color, size }: { icon: string; iconFamily: string; color: string; size: number }) {
  if (iconFamily === "Ionicons") return <Ionicons name={icon as any} size={size} color={color} />;
  if (iconFamily === "MaterialCommunityIcons") return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
  return <Feather name={icon as any} size={size} color={color} />;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function SnoreEventItem({ event }: { event: { time: Date; intensity: number } }) {
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 500 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: interpolate(fadeIn.value, [0, 1], [10, 0]) }],
  }));

  return (
    <Animated.View style={[styles.snoreEvent, animStyle]}>
      <MaterialCommunityIcons name="waveform" size={14} color={Colors.primary} />
      <Text style={styles.snoreEventText}>
        Snore detected ({event.intensity} dB)
      </Text>
    </Animated.View>
  );
}

function StarDots() {
  const stars = [
    { top: 45, left: 30, size: 2, opacity: 0.4 },
    { top: 25, left: 120, size: 1.5, opacity: 0.3 },
    { top: 80, left: 200, size: 2.5, opacity: 0.25 },
    { top: 15, left: 280, size: 1.5, opacity: 0.35 },
    { top: 60, left: 340, size: 2, opacity: 0.2 },
    { top: 100, left: 90, size: 1, opacity: 0.3 },
    { top: 35, left: 360, size: 2, opacity: 0.15 },
  ];
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
      {stars.map((s, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            borderRadius: s.size / 2,
            backgroundColor: "#fff",
            opacity: s.opacity,
          }}
        />
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    isSleeping,
    selectedSound,
    setSelectedSound,
    timerOption,
    setTimerOption,
    remainingSeconds,
    snoreEvents,
    startSleep,
    stopSleep,
  } = useSleep();

  const glowAnim = useSharedValue(0);
  const breatheAnim = useSharedValue(0);
  const pulseRingAnim = useSharedValue(1);
  const ring2Anim = useSharedValue(1);

  useEffect(() => {
    if (isSleeping) {
      pulseRingAnim.value = withTiming(1, { duration: 300 });
      ring2Anim.value = withTiming(1, { duration: 300 });
      glowAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.2, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      breatheAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulseRingAnim.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      ring2Anim.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      glowAnim.value = withTiming(0, { duration: 300 });
      breatheAnim.value = withTiming(0, { duration: 300 });
    }
  }, [isSleeping]);

  const pulseRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseRingAnim.value }],
    opacity: interpolate(pulseRingAnim.value, [1, 1.08], [0.25, 0.08]),
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Anim.value }],
    opacity: interpolate(ring2Anim.value, [1, 1.12], [0.15, 0.05]),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowAnim.value,
    transform: [{ scale: interpolate(glowAnim.value, [0.2, 1], [0.95, 1.15]) }],
  }));

  const breatheStyle = useAnimatedStyle(() => ({
    opacity: interpolate(breatheAnim.value, [0, 1], [0.2, 0.6]),
    transform: [{ scale: interpolate(breatheAnim.value, [0, 1], [1, 1.08]) }],
  }));

  const handleToggleSleep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (isSleeping) {
      stopSleep();
    } else {
      startSleep();
    }
  };

  const handleSelectSound = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSound(id);
  };

  const handleSelectTimer = (val: TimerOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimerOption(val);
  };

  const recentSnores = snoreEvents.slice(-3).reverse();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const selectedSoundData = SOUNDS.find((s) => s.id === selectedSound);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, "#0E1330", "#101538"]}
        style={StyleSheet.absoluteFill}
      />
      <StarDots />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 20 + webTopInset,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good evening</Text>
            <Text style={styles.title}>Sleep Buddy</Text>
          </View>
          <View style={styles.moonWrap}>
            <Ionicons name="moon" size={22} color={Colors.secondary} />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {isSleeping && (
            <Animated.View style={[styles.glowRing, glowStyle]} />
          )}
          {isSleeping && (
            <Animated.View style={[styles.outerRing, breatheStyle]} />
          )}
          {!isSleeping && (
            <>
              <Animated.View style={[styles.ring2, ring2Style]} />
              <Animated.View style={[styles.pulseRing, pulseRingStyle]} />
            </>
          )}
          <Pressable
            onPress={handleToggleSleep}
            style={({ pressed }) => [
              styles.sleepButton,
              pressed && { opacity: 0.85 },
            ]}
            testID="sleep-button"
          >
            <LinearGradient
              colors={isSleeping
                ? ["#FB7185", "#E11D48"]
                : [Colors.primary, "#5046E5"]}
              style={styles.sleepButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name={isSleeping ? "stop" : "moon"}
                size={30}
                color="#fff"
              />
              <Text style={styles.sleepButtonText}>
                {isSleeping ? "Stop Sleep" : "Start Sleep"}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {isSleeping && timerOption && remainingSeconds > 0 && (
          <View style={styles.timerDisplay}>
            <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
            <Text style={styles.timerLabel}>remaining</Text>
          </View>
        )}

        {isSleeping && (
          <View style={styles.statusContainer}>
            <LinearGradient
              colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
            <View style={styles.statusHeader}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Listening for snores...</Text>
            </View>
            {selectedSoundData && (
              <View style={styles.nowPlaying}>
                <SoundIcon
                  icon={selectedSoundData.icon}
                  iconFamily={selectedSoundData.iconFamily}
                  color={selectedSoundData.color}
                  size={16}
                />
                <Text style={styles.nowPlayingText}>
                  Now playing: {selectedSoundData.name}
                </Text>
              </View>
            )}
            {recentSnores.map((event, i) => (
              <SnoreEventItem key={`${event.time.getTime()}-${i}`} event={event} />
            ))}
          </View>
        )}

        {!isSleeping && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Choose a Sound</Text>
            </View>
            <View style={styles.soundGrid}>
              {SOUNDS.map((sound) => {
                const isSelected = selectedSound === sound.id;
                return (
                  <Pressable
                    key={sound.id}
                    onPress={() => handleSelectSound(sound.id)}
                    style={({ pressed }) => [
                      styles.soundCard,
                      isSelected && { borderColor: sound.color },
                      pressed && { opacity: 0.8 },
                    ]}
                    testID={`sound-${sound.id}`}
                  >
                    <LinearGradient
                      colors={isSelected
                        ? [sound.bgColor, "rgba(255,255,255,0.02)"]
                        : ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.01)"]}
                      style={[StyleSheet.absoluteFill, { borderRadius: 18 }]}
                    />
                    <View style={[styles.soundIconWrap, { backgroundColor: sound.bgColor }]}>
                      <SoundIcon
                        icon={sound.icon}
                        iconFamily={sound.iconFamily}
                        color={isSelected ? sound.color : Colors.textSecondary}
                        size={22}
                      />
                    </View>
                    <Text
                      style={[
                        styles.soundLabel,
                        isSelected && { color: sound.color },
                      ]}
                      numberOfLines={1}
                    >
                      {sound.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Set a Timer</Text>
            </View>
            <View style={styles.timerRow}>
              {TIMER_OPTIONS.map((opt) => {
                const isSelected = timerOption === opt.value;
                return (
                  <Pressable
                    key={opt.label}
                    onPress={() => handleSelectTimer(opt.value)}
                    style={({ pressed }) => [
                      styles.timerChip,
                      isSelected && styles.timerChipSelected,
                      pressed && { opacity: 0.8 },
                    ]}
                    testID={`timer-${opt.label}`}
                  >
                    {isSelected && (
                      <LinearGradient
                        colors={["rgba(108,99,255,0.15)", "rgba(108,99,255,0.05)"]}
                        style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                      />
                    )}
                    <Text
                      style={[
                        styles.timerChipText,
                        isSelected && styles.timerChipTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.tipCard}>
              <LinearGradient
                colors={["rgba(251,191,36,0.08)", "rgba(251,191,36,0.02)"]}
                style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
              />
              <View style={styles.tipIconWrap}>
                <Ionicons name="bulb" size={18} color={Colors.secondary} />
              </View>
              <Text style={styles.tipText}>
                Consistent sleep times improve your sleep quality by up to 30%
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  moonWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.15)",
    backgroundColor: "rgba(251, 191, 36, 0.06)",
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 36,
    marginBottom: 32,
    height: 220,
  },
  glowRing: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(108, 99, 255, 0.12)",
  },
  outerRing: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: "rgba(108, 99, 255, 0.2)",
  },
  pulseRing: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1.5,
    borderColor: "rgba(108, 99, 255, 0.3)",
  },
  ring2: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: "rgba(108, 99, 255, 0.12)",
  },
  sleepButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: "hidden",
  },
  sleepButtonGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sleepButtonText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
    letterSpacing: 0.3,
  },
  timerDisplay: {
    alignItems: "center",
    marginBottom: 24,
  },
  timerText: {
    fontSize: 48,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    letterSpacing: 4,
  },
  timerLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    marginTop: 4,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  statusContainer: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  statusText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.text,
  },
  nowPlaying: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 18,
  },
  nowPlayingText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  snoreEvent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 18,
  },
  snoreEventText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  sectionHeader: {
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  soundGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  soundCard: {
    width: "31%" as any,
    flexBasis: "31%",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  soundIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  soundLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  timerRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  timerChip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  timerChipSelected: {
    borderColor: "rgba(108, 99, 255, 0.3)",
  },
  timerChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  timerChipTextSelected: {
    color: Colors.primary,
    fontFamily: "Inter_600SemiBold",
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.1)",
    overflow: "hidden",
  },
  tipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  tipText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textWarm,
    flex: 1,
    lineHeight: 20,
  },
});
