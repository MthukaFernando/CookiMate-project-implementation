import { TimerPickerModal } from "react-native-timer-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  AppState,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Audio } from "expo-av";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { useFocusEffect } from "expo-router";

type Duration = { hours?: number; minutes?: number; seconds?: number };
const { width } = Dimensions.get("window");

const BACKGROUND_FETCH_TASK = "background-timer-task";

const alarms = [
  { name: "🛎️    Classic", file: require("../../assets/sounds/classic.wav"), fileName: "classic.wav" },
  { name: "🔊    Beep", file: require("../../assets/sounds/beep.wav"), fileName: "beep.wav" },
  { name: "⏰    Chime", file: require("../../assets/sounds/chime.wav"), fileName: "chime.wav" },
  { name: "📳    Buzz", file: require("../../assets/sounds/buzz.wav"), fileName: "buzz.wav" },
  { name: "🎵    Melody", file: require("../../assets/sounds/melody.wav"), fileName: "melody.wav" },
  { name: "🎹    Tune", file: require("../../assets/sounds/tune.wav"), fileName: "tune.wav" },
];

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const notificationsEnabled = await AsyncStorage.getItem('settings_notifications');
    if (notificationsEnabled === 'false') {
      console.log("🔕 Notifications disabled, skipping background task");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    
    const savedFinishTime = await AsyncStorage.getItem('timer_finish_time');
    if (savedFinishTime) {
      const finishTime = parseInt(savedFinishTime);
      const now = Date.now();
      if (now >= finishTime) {
        console.log("⏰ Background task: Timer finished!");
        await AsyncStorage.removeItem('timer_finish_time');
        await AsyncStorage.removeItem('timer_total_seconds');
        
        const savedAlarm = await AsyncStorage.getItem('timer_selected_alarm');
        if (savedAlarm) {
          const alarmIndex = parseInt(savedAlarm);
          const alarm = alarms[alarmIndex];
          if (alarm) {
            const { sound } = await Audio.Sound.createAsync(alarm.file);
            await sound.playAsync();
          }
        }
        return BackgroundFetch.BackgroundFetchResult.NewData;
      }
    }
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.log("Background task error:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

const UI_COLORS = {
  background: "#0A0A0A",
  primaryGold: "#D4AF37",
  surface: "#1A1A1A",
  textLight: "#FFFFFF",
  textMuted: "#A6A6A6",
  border: "#2A2A2A",
  accentRed: "#FF4444",
};

export default function Timer({ initialSeconds = 0, onClose }: { initialSeconds?: number; onClose?: () => void }) {
  const [showPicker, setShowPicker] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const notificationIdRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishTimeRef = useRef<number | null>(null);
  const alarmPlayedRef = useRef<boolean>(false);
  const secondsLeftRef = useRef(initialSeconds);

  const [open, setOpen] = useState(false);
  const [selectedAlarmValue, setSelectedAlarmValue] = useState<string | null>("0");
  const selectedAlarm = selectedAlarmValue !== null ? alarms[parseInt(selectedAlarmValue)] : null;
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Load notification setting from AsyncStorage - runs when screen focuses
  const loadNotificationSetting = useCallback(async () => {
    try {
      const setting = await AsyncStorage.getItem('settings_notifications');
      const isEnabled = setting === null ? true : JSON.parse(setting);
      setNotificationsEnabled(isEnabled);
      console.log("📱 Notification setting loaded:", isEnabled);
    } catch (error) {
      console.log("Error loading notification setting:", error);
    }
  }, []);

  // Load setting when component mounts
  useEffect(() => {
    loadNotificationSetting();
  }, [loadNotificationSetting]);

  // Reload setting when screen comes into focus (after returning from Settings)
  useFocusEffect(
    useCallback(() => {
      loadNotificationSetting();
    }, [loadNotificationSetting])
  );

  // Update notification handler based on app state AND user preference
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: notificationsEnabled,
        shouldPlaySound: notificationsEnabled && appState !== 'active',
        shouldSetBadge: false,
        shouldShowBanner: notificationsEnabled,
        shouldShowList: notificationsEnabled,
        priority: Notifications.AndroidNotificationPriority?.MAX || 2,
      }),
    });
  }, [appState, notificationsEnabled]);

  // Keep ref in sync with state
  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

  const formatDisplay = (totalSecs: number): string => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const playAlarm = useCallback(async () => {
    console.log("🔊 playAlarm called, secondsLeft:", secondsLeftRef.current);
    if (alarmPlayedRef.current || !selectedAlarm) return;
    alarmPlayedRef.current = true;

    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(selectedAlarm.file);
      setSound(newSound);
      await newSound.playAsync();
      console.log("✅ Alarm playing successfully");
    } catch (error) {
      console.log("Error playing alarm:", error);
    }
  }, [selectedAlarm, sound]);

  const stopAlarm = useCallback(async () => {
    alarmPlayedRef.current = false;
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
  }, [sound]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetTimerState = useCallback(async () => {
    stopTimer();
    setRunning(false);
    setSecondsLeft(0);
    setTotalSeconds(0);
    finishTimeRef.current = null;
    alarmPlayedRef.current = false;
    await stopAlarm();
    await AsyncStorage.multiRemove(['timer_finish_time', 'timer_total_seconds', 'timer_selected_alarm']);
    
    if (notificationIdRef.current) {
      await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
      notificationIdRef.current = null;
    }
  }, [stopTimer, stopAlarm]);

  const onTimerComplete = useCallback(async () => {
    console.log("⏰ Timer complete!");
    stopTimer();
    setRunning(false);
    setSecondsLeft(0);
    finishTimeRef.current = null;
    
    if (notificationIdRef.current) {
      await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
      notificationIdRef.current = null;
      console.log("🔕 Cancelled scheduled notification");
    }
    
    await playAlarm();
  }, [stopTimer, playAlarm]);

  // Timer interval logic
  useEffect(() => {
    if (running && secondsLeftRef.current > 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        if (secondsLeftRef.current <= 1) {
          onTimerComplete();
        } else {
          setSecondsLeft(prev => prev - 1);
        }
      }, 1000);
    } else if (!running && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, onTimerComplete]);

  const saveTimerState = useCallback(async () => {
    try {
      if (running && finishTimeRef.current) {
        await AsyncStorage.setItem('timer_finish_time', finishTimeRef.current.toString());
        await AsyncStorage.setItem('timer_total_seconds', totalSeconds.toString());
        await AsyncStorage.setItem('timer_selected_alarm', selectedAlarmValue || '0');
      } else {
        await AsyncStorage.multiRemove(['timer_finish_time', 'timer_total_seconds', 'timer_selected_alarm']);
      }
    } catch (error) {
      console.log("Error saving timer state:", error);
    }
  }, [running, totalSeconds, selectedAlarmValue]);

  const restoreTimerState = useCallback(async () => {
    try {
      const [savedFinishTime, savedTotalSeconds, savedAlarm] = await AsyncStorage.multiGet([
        'timer_finish_time', 'timer_total_seconds', 'timer_selected_alarm'
      ]);
      
      if (savedFinishTime[1] && savedTotalSeconds[1]) {
        const finishTime = parseInt(savedFinishTime[1]);
        const now = Date.now();
        const remainingSeconds = Math.max(0, Math.floor((finishTime - now) / 1000));
        
        setTotalSeconds(parseInt(savedTotalSeconds[1]));
        setSecondsLeft(remainingSeconds);
        
        if (savedAlarm[1]) {
          setSelectedAlarmValue(savedAlarm[1]);
        }
        
        if (remainingSeconds > 0) {
          finishTimeRef.current = finishTime;
          setRunning(true);
        } else {
          setRunning(false);
          setSecondsLeft(0);
          finishTimeRef.current = null;
        }
        
        await AsyncStorage.multiRemove(['timer_finish_time', 'timer_total_seconds', 'timer_selected_alarm']);
      }
    } catch (error) {
      console.log("Error restoring timer state:", error);
    }
  }, []);

  // Setup notifications, audio, and background fetch
  useEffect(() => {
    const setup = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      if (Platform.OS === 'android') {
        for (const alarm of alarms) {
          await Notifications.setNotificationChannelAsync(`timer-alerts-${alarm.fileName}`, {
            name: `Timer Alerts (${alarm.name.trim()})`,
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#D4AF37",
            sound: alarm.fileName,
          });
        }
      }
      
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 15,
        stopOnTerminate: false,
        startOnBoot: true,
      });
    };
    setup();
    
    return () => {
      stopAlarm();
      stopTimer();
      BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    };
  }, []);

  // App state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
      
      if (nextAppState === 'background') {
        saveTimerState();
      } else if (nextAppState === 'active') {
        restoreTimerState();
      }
    });
    return () => subscription.remove();
  }, [saveTimerState, restoreTimerState]);

  const startTimer = async () => {
    console.log("▶️ START pressed, secondsLeft:", secondsLeft, "notificationsEnabled:", notificationsEnabled);
    if (secondsLeft <= 0) return;
    
    setRunning(true);
    alarmPlayedRef.current = false;
    finishTimeRef.current = Date.now() + (secondsLeft * 1000);
    await saveTimerState();
    
    if (notificationsEnabled) {
      const soundFile = selectedAlarm?.fileName || "classic.wav";
      const channelId = `timer-alerts-${soundFile}`;
      
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Timer Finished! ⏰",
          body: "Your countdown has completed.",
          sound: soundFile,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsLeft,
          channelId: channelId,
        } as Notifications.TimeIntervalTriggerInput,
      });
      notificationIdRef.current = id;
      console.log("📢 Notification scheduled for", secondsLeft, "seconds (notifications ENABLED)");
    } else {
      console.log("🔕 Notifications DISABLED, skipping notification schedule");
    }
  };

  const pauseTimer = async () => {
    console.log("⏸️ Pause pressed");
    setRunning(false);
    finishTimeRef.current = null;
    await saveTimerState();
    
    if (notificationIdRef.current) {
      await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
      notificationIdRef.current = null;
    }
  };

  const resetTimer = async () => {
    console.log("🔄 Reset pressed");
    await resetTimerState();
    setSecondsLeft(initialSeconds);
    setTotalSeconds(initialSeconds);
  };

  // Handle notification click
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      console.log("🔔 Notification clicked - stopping alarm and resetting timer");
      await stopAlarm();
      await resetTimerState();
      if (onClose) {
        onClose();
      }
    });
    return () => subscription.remove();
  }, [stopAlarm, resetTimerState, onClose]);

  const items = alarms.map((alarm, index) => ({ label: alarm.name, value: index.toString() }));

  return (
    <View style={styles.timerContainer}>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
          <Ionicons name="chevron-back" size={28} color={UI_COLORS.primaryGold} />
        </TouchableOpacity>
      )}

      <View style={styles.centeringWrapper}>
        <View style={styles.progressWrapper}>
          <AnimatedCircularProgress
            size={width * 0.65}
            width={10}
            fill={totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0}
            tintColor={UI_COLORS.primaryGold}
            backgroundColor={UI_COLORS.border}
            rotation={0}
            lineCap="round"
          >
            {() => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={running ? pauseTimer : startTimer}
                style={styles.innerCircle}
              >
                <Text style={styles.timerText}>{formatDisplay(secondsLeft)}</Text>
                <View style={[styles.badge, { backgroundColor: running ? "#332B14" : "#222" }]}>
                  <Text style={[styles.statusText, { color: running ? UI_COLORS.primaryGold : "#31db2e" }]}>
                    {running ? "PAUSE" : "START"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </AnimatedCircularProgress>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.mainButton}>
            <Text style={styles.buttonText}>Edit Timer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={resetTimer} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dropdownContainerWrapper}>
          <Text style={styles.label}>TIMER TONE</Text>
          <DropDownPicker
            open={open}
            value={selectedAlarmValue}
            items={items}
            setOpen={setOpen}
            setValue={(callback) => {
              const value = typeof callback === "function" ? callback(selectedAlarmValue) : callback;
              setSelectedAlarmValue(value);
            }}
            placeholder="Select Tone"
            placeholderStyle={{ color: UI_COLORS.textMuted }}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownList}
            textStyle={styles.dropdownText}
            listMode="SCROLLVIEW"
            dropDownDirection="TOP"
            maxHeight={260}
            disabled={running}
            ArrowUpIconComponent={() => <Ionicons name="chevron-up" size={20} color={UI_COLORS.primaryGold} />}
            ArrowDownIconComponent={() => <Ionicons name="chevron-down" size={20} color={UI_COLORS.primaryGold} />}
            TickIconComponent={() => <Ionicons name="checkmark" size={20} color={UI_COLORS.primaryGold} />}
          />
        </View>
      </View>

      <TimerPickerModal
        LinearGradient={LinearGradient}
        visible={showPicker}
        setIsVisible={setShowPicker}
        onConfirm={async (picked: Duration) => {
          stopTimer();
          setRunning(false);
          finishTimeRef.current = null;
          alarmPlayedRef.current = false;
          await stopAlarm();

          const total = (picked.hours || 0) * 3600 + (picked.minutes || 0) * 60 + (picked.seconds || 0);
          setSecondsLeft(total);
          setTotalSeconds(total);
          setShowPicker(false);
          
          await AsyncStorage.multiRemove(['timer_finish_time', 'timer_total_seconds', 'timer_selected_alarm']);
          
          if (notificationIdRef.current) {
            await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
            notificationIdRef.current = null;
          }
        }}
        styles={{ theme: "dark", backgroundColor: UI_COLORS.surface }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  timerContainer: { flex: 1, backgroundColor: UI_COLORS.background },
  centeringWrapper: {
    position: "absolute",
    top: 0,
    bottom: 50,
    left: 24,
    right: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 30,
    left: 20,
    zIndex: 10,
  },
  progressWrapper: {
    padding: 12,
    backgroundColor: UI_COLORS.surface,
    borderRadius: width,
    borderWidth: 1,
    borderColor: "#42391b",
    ...Platform.select({
      ios: {
        shadowColor: UI_COLORS.primaryGold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: { elevation: 8 },
    }),
  },
  innerCircle: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  timerText: {
    fontSize: 44,
    fontWeight: "300",
    color: UI_COLORS.textLight,
    fontVariant: ["tabular-nums"],
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#332B14",
  },
  statusText: { fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  controlsRow: { flexDirection: "row", gap: 20, marginTop: 30 },
  mainButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: UI_COLORS.surface,
    alignItems: "center",
    borderWidth: 1,
    borderColor: UI_COLORS.border,
  },
  buttonText: { fontSize: 16, fontWeight: "700", color: UI_COLORS.primaryGold },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: UI_COLORS.accentRed,
  },
  dropdownContainerWrapper: {
    marginTop: 30,
    width: "100%",
    zIndex: 9999,
    elevation: 9999,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    color: UI_COLORS.textMuted,
    marginBottom: 5,
    marginLeft: 4,
    letterSpacing: 1,
  },
  dropdown: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    height: 55,
  },
  dropdownList: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
  },
  dropdownText: { fontSize: 15, color: UI_COLORS.textLight, fontWeight: "500" },
});