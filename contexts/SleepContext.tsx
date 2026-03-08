import { createContext, useContext, useState, useCallback, useRef, useMemo, ReactNode } from "react";

export interface Sound {
  id: string;
  name: string;
  icon: string;
  iconFamily: "Ionicons" | "MaterialCommunityIcons" | "Feather";
  color: string;
  bgColor: string;
}

export const SOUNDS: Sound[] = [
  { id: "rain", name: "Rain", icon: "rainy", iconFamily: "Ionicons", color: "#60A5FA", bgColor: "rgba(96, 165, 250, 0.12)" },
  { id: "ocean", name: "Ocean Waves", icon: "waves", iconFamily: "MaterialCommunityIcons", color: "#34D399", bgColor: "rgba(52, 211, 153, 0.1)" },
  { id: "white", name: "White Noise", icon: "radio", iconFamily: "Feather", color: "#C4B5FD", bgColor: "rgba(196, 181, 253, 0.1)" },
  { id: "brown", name: "Brown Noise", icon: "wind", iconFamily: "Feather", color: "#FBBF24", bgColor: "rgba(251, 191, 36, 0.1)" },
  { id: "forest", name: "Forest Night", icon: "tree", iconFamily: "MaterialCommunityIcons", color: "#6EE7B7", bgColor: "rgba(110, 231, 183, 0.1)" },
  { id: "fire", name: "Fireplace", icon: "flame", iconFamily: "Ionicons", color: "#FB7185", bgColor: "rgba(251, 113, 133, 0.1)" },
];

export type TimerOption = 30 | 45 | 60 | null;

export interface SnoreEvent {
  time: Date;
  intensity: number;
}

export interface SleepSession {
  startTime: Date;
  endTime: Date;
  totalMinutes: number;
  deepSleepMinutes: number;
  snoreCount: number;
  loudestSnore: number;
  wakeUps: number;
}

interface SleepContextValue {
  isSleeping: boolean;
  selectedSound: string | null;
  setSelectedSound: (id: string | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  volume: number;
  setVolume: (vol: number) => void;
  timerOption: TimerOption;
  setTimerOption: (opt: TimerOption) => void;
  remainingSeconds: number;
  snoreEvents: SnoreEvent[];
  startSleep: () => void;
  stopSleep: () => void;
  lastSession: SleepSession | null;
  autoRestart: boolean;
  setAutoRestart: (val: boolean) => void;
  weeklyData: number[];
}

const SleepContext = createContext<SleepContextValue | null>(null);

export function SleepProvider({ children }: { children: ReactNode }) {
  const [isSleeping, setIsSleeping] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string | null>("rain");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [timerOption, setTimerOption] = useState<TimerOption>(30);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [snoreEvents, setSnoreEvents] = useState<SnoreEvent[]>([]);
  const [lastSession, setLastSession] = useState<SleepSession | null>(null);
  const [autoRestart, setAutoRestart] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const snoreRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const weeklyData = useMemo(() => [6.5, 7.2, 5.8, 7.8, 6.9, 7.5, 0], []);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (snoreRef.current) {
      clearInterval(snoreRef.current);
      snoreRef.current = null;
    }
  }, []);

  const startSleep = useCallback(() => {
    const now = new Date();
    startTimeRef.current = now;
    setIsSleeping(true);
    setIsPlaying(true);
    setSnoreEvents([]);

    const totalSecs = timerOption ? timerOption * 60 : 0;
    setRemainingSeconds(totalSecs);

    if (timerOption) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearTimers();
            setIsSleeping(false);
            setIsPlaying(false);

            const endTime = new Date();
            const totalMinutes = Math.round((endTime.getTime() - (startTimeRef.current?.getTime() || endTime.getTime())) / 60000);
            setLastSession({
              startTime: startTimeRef.current || endTime,
              endTime,
              totalMinutes: totalMinutes || timerOption,
              deepSleepMinutes: Math.round((totalMinutes || timerOption) * 0.45),
              snoreCount: Math.floor(Math.random() * 15) + 3,
              loudestSnore: Math.floor(Math.random() * 30) + 50,
              wakeUps: Math.floor(Math.random() * 3),
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    snoreRef.current = setInterval(() => {
      if (Math.random() > 0.6) {
        const intensity = Math.floor(Math.random() * 40) + 40;
        setSnoreEvents((prev) => [...prev, { time: new Date(), intensity }]);
      }
    }, 8000);
  }, [timerOption, clearTimers]);

  const stopSleep = useCallback(() => {
    clearTimers();
    setIsSleeping(false);
    setIsPlaying(false);
    setRemainingSeconds(0);

    const endTime = new Date();
    const startTime = startTimeRef.current || endTime;
    const totalMinutes = Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / 60000));

    setLastSession({
      startTime,
      endTime,
      totalMinutes,
      deepSleepMinutes: Math.round(totalMinutes * 0.45),
      snoreCount: snoreEvents.length + Math.floor(Math.random() * 8) + 2,
      loudestSnore: snoreEvents.length > 0
        ? Math.max(...snoreEvents.map((e) => e.intensity))
        : Math.floor(Math.random() * 30) + 50,
      wakeUps: Math.floor(Math.random() * 3) + 1,
    });
  }, [clearTimers, snoreEvents]);

  const value = useMemo(
    () => ({
      isSleeping,
      selectedSound,
      setSelectedSound,
      isPlaying,
      setIsPlaying,
      volume,
      setVolume,
      timerOption,
      setTimerOption,
      remainingSeconds,
      snoreEvents,
      startSleep,
      stopSleep,
      lastSession,
      autoRestart,
      setAutoRestart,
      weeklyData,
    }),
    [
      isSleeping, selectedSound, isPlaying, volume, timerOption,
      remainingSeconds, snoreEvents, startSleep, stopSleep,
      lastSession, autoRestart, weeklyData,
    ]
  );

  return <SleepContext.Provider value={value}>{children}</SleepContext.Provider>;
}

export function useSleep() {
  const ctx = useContext(SleepContext);
  if (!ctx) throw new Error("useSleep must be used within SleepProvider");
  return ctx;
}
