import { StyleSheet, Text, View, Pressable, ScrollView, Platform } from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Slider from "@/components/Slider";
import Colors from "@/constants/colors";
import { useSleep, SOUNDS } from "@/contexts/SleepContext";

function SoundIcon({ icon, iconFamily, color, size }: { icon: string; iconFamily: string; color: string; size: number }) {
  if (iconFamily === "Ionicons") return <Ionicons name={icon as any} size={size} color={color} />;
  if (iconFamily === "MaterialCommunityIcons") return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
  return <Feather name={icon as any} size={size} color={color} />;
}

export default function SoundsScreen() {
  const insets = useSafeAreaInsets();
  const { selectedSound, setSelectedSound, isPlaying, setIsPlaying, volume, setVolume } = useSleep();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const handleToggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedSound === id) {
      setIsPlaying(!isPlaying);
    } else {
      setSelectedSound(id);
      setIsPlaying(true);
    }
  };

  const currentSound = SOUNDS.find((s) => s.id === selectedSound);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, "#0E1330", "#101538"]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 20 + webTopInset,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Sounds</Text>
        <Text style={styles.subtitle}>Drift off with soothing ambience</Text>

        <View style={styles.grid}>
          {SOUNDS.map((sound) => {
            const isActive = selectedSound === sound.id;
            const showPlaying = isActive && isPlaying;

            return (
              <Pressable
                key={sound.id}
                onPress={() => handleToggle(sound.id)}
                style={({ pressed }) => [
                  styles.soundCard,
                  isActive && { borderColor: sound.color },
                  pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                ]}
                testID={`sounds-${sound.id}`}
              >
                <LinearGradient
                  colors={isActive
                    ? [sound.bgColor, "rgba(255,255,255,0.02)"]
                    : ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.01)"]}
                  style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
                />
                <View style={[styles.iconCircle, { backgroundColor: sound.bgColor }]}>
                  <SoundIcon
                    icon={sound.icon}
                    iconFamily={sound.iconFamily}
                    color={isActive ? sound.color : Colors.textSecondary}
                    size={28}
                  />
                </View>
                <Text style={[styles.soundName, isActive && { color: sound.color }]}>
                  {sound.name}
                </Text>
                <View style={[styles.playIndicator, showPlaying && { backgroundColor: sound.bgColor }]}>
                  <Ionicons
                    name={showPlaying ? "pause" : "play"}
                    size={16}
                    color={isActive ? sound.color : Colors.textTertiary}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>

        {currentSound && (
          <View style={styles.volumeSection}>
            <LinearGradient
              colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
              style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
            />
            <View style={styles.volumeLabelRow}>
              <Ionicons name="volume-low" size={18} color={Colors.textSecondary} />
              <Text style={styles.volumeLabel}>Volume</Text>
              <Text style={[styles.volumeValue, { color: currentSound.color }]}>
                {Math.round(volume * 100)}%
              </Text>
              <Ionicons name="volume-high" size={18} color={Colors.textSecondary} />
            </View>
            <Slider value={volume} onValueChange={setVolume} />
          </View>
        )}

        <View style={styles.infoCard}>
          <LinearGradient
            colors={["rgba(52,211,153,0.06)", "rgba(52,211,153,0.02)"]}
            style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
          />
          <View style={styles.infoIconWrap}>
            <Ionicons name="headset" size={16} color={Colors.accent} />
          </View>
          <Text style={styles.infoText}>
            Use headphones for the most immersive experience
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 28,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  soundCard: {
    width: "47%" as any,
    flexBasis: "47%",
    borderRadius: 22,
    padding: 20,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  soundName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
  },
  playIndicator: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  volumeSection: {
    borderRadius: 22,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    marginBottom: 16,
    overflow: "hidden",
  },
  volumeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  volumeLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.text,
    flex: 1,
  },
  volumeValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginRight: 6,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.08)",
    overflow: "hidden",
  },
  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(52, 211, 153, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 19,
  },
});
