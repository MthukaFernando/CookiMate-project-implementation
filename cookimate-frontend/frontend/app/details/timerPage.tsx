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
  Modal,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Audio } from "expo-av";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useFocusEffect } from "expo-router";

type Duration = { hours?: number; minutes?: number; seconds?: number };
const { width } = Dimensions.get("window");

const alarms = [
  { name: "Classic", file: require("../../assets/sounds/classic.wav"), fileName: "classic.wav" },
  { name: "Beep", file: require("../../assets/sounds/beep.wav"), fileName: "beep.wav" },
  { name: "Chime", file: require("../../assets/sounds/chime.wav"), fileName: "chime.wav" },
  { name: "Buzz", file: require("../../assets/sounds/buzz.wav"), fileName: "buzz.wav" },
  { name: "Melody", file: require("../../assets/sounds/melody.wav"), fileName: "melody.wav" },
  { name: "Tune", file: require("../../assets/sounds/tune.wav"), fileName: "tune.wav" },
];

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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Custom Alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    icon?: string;
    buttons: {
      text: string;
      style?: "default" | "cancel" | "destructive";
      onPress?: () => void;
    }[];
  }>({ visible: false, title: "", message: "", buttons: [] });

  const showAlert = (
    title: string,
    message: string,
    buttons: {
      text: string;
      style?: "default" | "cancel" | "destructive";
      onPress?: () => void;
    }[] = [{ text: "OK" }],
    icon?: string,
  ) => setAlertConfig({ visible: true, title, message, buttons, icon });

  const hideAlert = () =>
    setAlertConfig((prev) => ({ ...prev, visible: false }));

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishTimeRef = useRef<number | null>(null);
  const alarmPlayedRef = useRef<boolean>(false);
  const secondsLeftRef = useRef(initialSeconds);

  const [open, setOpen] = useState(false);
  const [selectedAlarmValue, setSelectedAlarmValue] = useState<string | null>("0");
  const selectedAlarm = selectedAlarmValue !== null ? alarms[parseInt(selectedAlarmValue)] : null;
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const loadNotificationSetting = useCallback(async () => {
    try {
      const setting = await AsyncStorage.getItem('settings_notifications');
      setNotificationsEnabled(setting !== 'false');
    } catch (error) {
      console.log("Error:", error);
    }
  }, []);

  useEffect(() => {
    loadNotificationSetting();
    Notifications.requestPermissionsAsync();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotificationSetting();
    }, [])
  );

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
      console.log("🔊 Alarm playing");
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
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, [stopTimer, stopAlarm]);

  const onTimerComplete = useCallback(async () => {
    console.log("⏰ Timer complete!");
    stopTimer();
    setRunning(false);
    setSecondsLeft(0);
    finishTimeRef.current = null;
    await playAlarm();
    showAlert("⏰ Timer Finished!", "Your countdown has completed.", [{ text: "OK" }], "timer-outline");
  }, [stopTimer, playAlarm]);

  // Timer interval
  useEffect(() => {
    if (running && secondsLeftRef.current > 0) {
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
      }
    };
  }, [running, onTimerComplete]);

  const saveTimerState = useCallback(async () => {
    try {
      if (running && finishTimeRef.current) {
        await AsyncStorage.setItem('timer_finish_time', finishTimeRef.current.toString());
        await AsyncStorage.setItem('timer_total_seconds', totalSeconds.toString());
        await AsyncStorage.setItem('timer_selected_alarm', selectedAlarmValue || '0');
      }
    } catch (error) {
      console.log("Error:", error);
    }
  }, [running, totalSeconds, selectedAlarmValue]);

  const checkAndCompleteTimer = useCallback(async () => {
    const savedFinishTime = await AsyncStorage.getItem('timer_finish_time');
    const savedTotalSeconds = await AsyncStorage.getItem('timer_total_seconds');
    const savedAlarm = await AsyncStorage.getItem('timer_selected_alarm');
    
    if (savedFinishTime && savedTotalSeconds) {
      const finishTime = parseInt(savedFinishTime);
      const now = Date.now();
      
      if (now >= finishTime) {
        console.log("⏰ Timer completed while app was closed!");
        setTotalSeconds(parseInt(savedTotalSeconds));
        setSecondsLeft(0);
        if (savedAlarm) setSelectedAlarmValue(savedAlarm);
        setRunning(false);
        finishTimeRef.current = null;
        
        await AsyncStorage.multiRemove(['timer_finish_time', 'timer_total_seconds', 'timer_selected_alarm']);
        
        setTimeout(() => {
          playAlarm();
          showAlert("⏰ Timer Finished!", "Your countdown has completed.", [{ text: "OK" }], "timer-outline");
        }, 500);
        
        return true;
      } else {
        const remainingSeconds = Math.max(0, Math.floor((finishTime - now) / 1000));
        setTotalSeconds(parseInt(savedTotalSeconds));
        setSecondsLeft(remainingSeconds);
        if (savedAlarm) setSelectedAlarmValue(savedAlarm);
        finishTimeRef.current = finishTime;
        setRunning(true);
        return false;
      }
    }
    return false;
  }, [playAlarm]);

  // Setup audio with expo-av
  useEffect(() => {
    const setup = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    };
    setup();
    
    return () => {
      stopAlarm();
      stopTimer();
    };
  }, []);

  // App state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'background') {
        saveTimerState();
      } else if (nextAppState === 'active') {
        const completed = await checkAndCompleteTimer();
        if (!completed) {
          const savedFinishTime = await AsyncStorage.getItem('timer_finish_time');
          const savedTotalSeconds = await AsyncStorage.getItem('timer_total_seconds');
          const savedAlarm = await AsyncStorage.getItem('timer_selected_alarm');
          
          if (savedFinishTime && savedTotalSeconds && !completed) {
            const finishTime = parseInt(savedFinishTime);
            const now = Date.now();
            const remainingSeconds = Math.max(0, Math.floor((finishTime - now) / 1000));
            
            if (remainingSeconds > 0) {
              setTotalSeconds(parseInt(savedTotalSeconds));
              setSecondsLeft(remainingSeconds);
              if (savedAlarm) setSelectedAlarmValue(savedAlarm);
              finishTimeRef.current = finishTime;
              setRunning(true);
            }
          }
        }
      }
    });
    return () => subscription.remove();
  }, [saveTimerState, checkAndCompleteTimer]);

  const startTimer = async () => {
    if (secondsLeft <= 0) return;
    
    setRunning(true);
    alarmPlayedRef.current = false;
    finishTimeRef.current = Date.now() + (secondsLeft * 1000);
    await saveTimerState();
    
    if (notificationsEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ Timer Finished!",
          body: `Your ${formatDisplay(totalSeconds)} timer is complete`,
          sound: selectedAlarm?.fileName || "classic.wav",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsLeft,
        },
      });
      console.log("✅ Notification scheduled for", secondsLeft, "seconds");
    }
  };

  const pauseTimer = async () => {
    setRunning(false);
    finishTimeRef.current = null;
    await saveTimerState();
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const resetTimer = async () => {
    await resetTimerState();
    setSecondsLeft(initialSeconds);
    setTotalSeconds(initialSeconds);
  };

  // Handle notification click
  useEffect(() => {
    const handleNotificationResponse = async () => {
      console.log("🔔 Notification tapped");
      await stopAlarm();
      if (onClose) onClose();
    };
    
    const checkInitialNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response) {
        await stopAlarm();
      }
    };
    
    checkInitialNotification();
    const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    
    return () => subscription.remove();
  }, [stopAlarm, onClose]);

  const items = alarms.map((alarm, index) => ({ label: `🔔 ${alarm.name}`, value: index.toString() }));

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
          await Notifications.cancelAllScheduledNotificationsAsync();
        }}
        styles={{ theme: "dark", backgroundColor: UI_COLORS.surface }}
      />

      {/* Custom Alert Modal - Styled like recipe complete alert */}
      <Modal
        transparent
        visible={alertConfig.visible}
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            {alertConfig.icon && (
              <View
                style={[
                  styles.alertIconWrapper,
                  {
                    borderColor: "#D4AF37",
                  },
                ]}
              >
                <Ionicons
                  name={alertConfig.icon as any}
                  size={30}
                  color="#D4AF37"
                />
              </View>
            )}
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <View
              style={[
                styles.alertButtonRow,
                alertConfig.buttons.length === 1 && {
                  justifyContent: "center",
                },
              ]}
            >
              {alertConfig.buttons.map((btn, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.alertButton,
                    btn.style === "destructive"
                      ? styles.alertButtonDestructive
                      : btn.style === "cancel"
                        ? styles.alertButtonCancel
                        : styles.alertButtonDefault,
                  ]}
                  onPress={() => {
                    hideAlert();
                    btn.onPress?.();
                  }}
                >
                  <Text
                    style={[
                      styles.alertButtonText,
                      btn.style === "destructive"
                        ? styles.alertBtnTextDestructive
                        : btn.style === "cancel"
                          ? styles.alertBtnTextCancel
                          : styles.alertBtnTextDefault,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
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
  // Custom Alert Styles (matching recipe complete alert)
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  alertBox: {
    backgroundColor: "#121212",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  alertIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1.5,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  alertMessage: {
    fontSize: 14,
    color: "#AAAAAA",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  alertButtonRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  alertButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  alertButtonDefault: { backgroundColor: "#D4AF37" },
  alertButtonDestructive: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FF5252",
  },
  alertButtonCancel: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333333",
  },
  alertButtonText: { fontSize: 14, fontWeight: "700" },
  alertBtnTextDefault: { color: "#000000" },
  alertBtnTextDestructive: { color: "#FF5252" },
  alertBtnTextCancel: { color: "#AAAAAA" },
});