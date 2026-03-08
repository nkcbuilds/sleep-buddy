import { StyleSheet, Text, View, Switch, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useSleep } from "@/contexts/SleepContext";

function SettingsRow({ icon, iconColor, bgColor, title, subtitle, right, onPress }: {
  icon: string; iconColor: string; bgColor: string;
  title: string; subtitle?: string; right?: React.ReactNode; onPress?: () => void
}) {
  const content = (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <View style={styles.rowTextContainer}>
          <Text style={styles.rowTitle}>{title}</Text>
          {subtitle && <Text style={styles.rowDesc}>{subtitle}</Text>}
        </View>
      </View>
      {right || (
        <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
      )}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { autoRestart, setAutoRestart } = useSleep();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const handleResetOnboarding = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.removeItem("sleep_buddy_onboarded");
    router.replace("/onboarding");
  };

  const handleAutoRestartChange = (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAutoRestart(val);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, "#0E1330", "#101538"]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 20 + webTopInset,
            paddingBottom: insets.bottom + 100,
          },
        ]}
      >
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your sleep experience</Text>

        <Text style={styles.sectionLabel}>Sleep</Text>
        <View style={styles.section}>
          <LinearGradient
            colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.01)"]}
            style={[StyleSheet.absoluteFill, { borderRadius: 18 }]}
          />
          <SettingsRow
            icon="reload"
            iconColor={Colors.primary}
            bgColor={Colors.primaryFaint}
            title="Auto-restart Sound"
            subtitle="Resume sounds if you wake up"
            right={
              <Switch
                value={autoRestart}
                onValueChange={handleAutoRestartChange}
                trackColor={{ false: "rgba(255,255,255,0.08)", true: Colors.primary }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        <Text style={styles.sectionLabel}>Privacy</Text>
        <View style={styles.section}>
          <LinearGradient
            colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.01)"]}
            style={[StyleSheet.absoluteFill, { borderRadius: 18 }]}
          />
          <SettingsRow
            icon="shield-checkmark"
            iconColor={Colors.accent}
            bgColor={Colors.accentFaint}
            title="On-device Processing"
            subtitle="All audio analysis stays on your device"
          />
        </View>

        <Text style={styles.sectionLabel}>App</Text>
        <View style={styles.section}>
          <LinearGradient
            colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.01)"]}
            style={[StyleSheet.absoluteFill, { borderRadius: 18 }]}
          />
          <SettingsRow
            icon="information-circle"
            iconColor={Colors.purple}
            bgColor={Colors.purpleFaint}
            title="About Sleep Buddy"
            subtitle="Version 1.0.0"
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="refresh"
            iconColor={Colors.secondary}
            bgColor={Colors.secondaryFaint}
            title="Show Onboarding"
            subtitle="View the intro screens again"
            onPress={handleResetOnboarding}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.footerIconWrap}>
            <LinearGradient
              colors={[Colors.primary, "#5046E5"]}
              style={[StyleSheet.absoluteFill, { borderRadius: 28 }]}
            />
            <Ionicons name="moon" size={26} color="#fff" />
          </View>
          <Text style={styles.footerText}>Sleep Buddy</Text>
          <Text style={styles.footerSub}>Better sleep, better you.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
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
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 8,
    paddingLeft: 4,
  },
  section: {
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTextContainer: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  rowDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    marginLeft: 70,
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
    gap: 8,
  },
  footerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    overflow: "hidden",
  },
  footerText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.textTertiary,
  },
  footerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
});
