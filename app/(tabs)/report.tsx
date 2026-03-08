import { StyleSheet, Text, View, Pressable, ScrollView, Platform, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useSleep } from "@/contexts/SleepContext";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_HOURS = 10;
const BAR_COLORS = [Colors.accent, Colors.sky, Colors.primary, "#6EE7B7", Colors.secondary, Colors.purple, Colors.coral];

function StatCard({ icon, iconColor, bgColor, label, value }: {
  icon: string; iconColor: string; bgColor: string; label: string; value: string
}) {
  return (
    <View style={styles.statCard}>
      <LinearGradient
        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.01)"]}
        style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
      />
      <View style={[styles.statIconWrap, { backgroundColor: bgColor }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const { lastSession, weeklyData } = useSleep();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const session = lastSession || {
    totalMinutes: 432,
    deepSleepMinutes: 194,
    snoreCount: 12,
    loudestSnore: 68,
    wakeUps: 2,
    startTime: new Date(Date.now() - 7 * 3600000),
    endTime: new Date(),
  };

  const totalHours = Math.floor(session.totalMinutes / 60);
  const totalMins = session.totalMinutes % 60;
  const deepHours = Math.floor(session.deepSleepMinutes / 60);
  const deepMins = session.deepSleepMinutes % 60;
  const progressPercent = Math.min(100, (session.totalMinutes / 480) * 100);

  const handleExport = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Export Ready", "Your sleep report has been prepared for export.");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, "#0E1330", "#101538"]}
        style={StyleSheet.absoluteFill}
      />
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
        <Text style={styles.title}>Morning Report</Text>
        <Text style={styles.subtitle}>
          {lastSession ? "Here's how you slept" : "Sample sleep data"}
        </Text>

        <View style={styles.heroCard}>
          <LinearGradient
            colors={["rgba(108,99,255,0.12)", "rgba(80,70,229,0.04)"]}
            style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
          />
          <View style={styles.heroIconWrap}>
            <Ionicons name="moon" size={22} color={Colors.secondary} />
          </View>
          <Text style={styles.heroValue}>
            {totalHours}h {totalMins}m
          </Text>
          <Text style={styles.heroLabel}>Total Sleep Time</Text>
          <View style={styles.heroBar}>
            <LinearGradient
              colors={[Colors.primary, "#818CF8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.heroBarFill, { width: `${progressPercent}%` }]}
            />
          </View>
          <Text style={styles.heroTarget}>Goal: 8h</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon="sleep"
            iconColor={Colors.purple}
            bgColor={Colors.purpleFaint}
            label="Deep Sleep"
            value={`${deepHours}h ${deepMins}m`}
          />
          <StatCard
            icon="waveform"
            iconColor={Colors.primary}
            bgColor={Colors.primaryFaint}
            label="Snore Count"
            value={`${session.snoreCount}`}
          />
          <StatCard
            icon="volume-high"
            iconColor={Colors.secondary}
            bgColor={Colors.secondaryFaint}
            label="Loudest"
            value={`${session.loudestSnore} dB`}
          />
          <StatCard
            icon="eye-outline"
            iconColor={Colors.coral}
            bgColor={Colors.coralFaint}
            label="Wake-ups"
            value={`${session.wakeUps}`}
          />
        </View>

        <View style={styles.chartSection}>
          <LinearGradient
            colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.01)"]}
            style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
          />
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>7-Day Trend</Text>
            <Text style={styles.chartAvg}>
              Avg: {(weeklyData.filter((h) => h > 0).length > 0 ? (weeklyData.filter((h) => h > 0).reduce((a, b) => a + b, 0) / weeklyData.filter((h) => h > 0).length) : 0).toFixed(1)}h
            </Text>
          </View>
          <View style={styles.chartContainer}>
            {weeklyData.map((hours, i) => {
              const barHeight = (hours / MAX_HOURS) * 110;
              const isToday = i === DAY_LABELS.length - 1;
              return (
                <View key={DAY_LABELS[i]} style={styles.barColumn}>
                  <Text style={styles.barValue}>{hours > 0 ? `${hours}` : "-"}</Text>
                  <View style={styles.barTrack}>
                    <LinearGradient
                      colors={[BAR_COLORS[i], `${BAR_COLORS[i]}88`]}
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          opacity: isToday ? 0.35 : 0.85,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barDay, isToday && styles.barDayToday]}>{DAY_LABELS[i]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.insightCard}>
          <LinearGradient
            colors={["rgba(52,211,153,0.08)", "rgba(52,211,153,0.02)"]}
            style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
          />
          <View style={styles.insightIconWrap}>
            <Ionicons name="trending-up" size={20} color={Colors.accent} />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Great progress!</Text>
            <Text style={styles.insightText}>
              Your snoring improved 20% this week. Keep it up!
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleExport}
          style={({ pressed }) => [
            styles.exportButton,
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
          testID="export-button"
        >
          <LinearGradient
            colors={[Colors.primary, "#5046E5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.exportGradient}
          >
            <Ionicons name="share-outline" size={18} color="#fff" />
            <Text style={styles.exportText}>Export Report</Text>
          </LinearGradient>
        </Pressable>
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
    marginBottom: 24,
  },
  heroCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(108, 99, 255, 0.1)",
    overflow: "hidden",
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 44,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    letterSpacing: 1,
  },
  heroLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  heroBar: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  heroBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  heroTarget: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    marginTop: 8,
    alignSelf: "flex-end",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: "48%" as any,
    flexBasis: "48%",
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  chartSection: {
    borderRadius: 22,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  chartTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  chartAvg: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 150,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  barValue: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textTertiary,
  },
  barTrack: {
    flex: 1,
    width: 24,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 12,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    borderRadius: 12,
  },
  barDay: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  barDayToday: {
    color: Colors.primary,
    fontFamily: "Inter_600SemiBold",
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.08)",
    overflow: "hidden",
  },
  insightIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(52, 211, 153, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.accent,
    marginBottom: 3,
  },
  insightText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  exportButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  exportGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  exportText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
