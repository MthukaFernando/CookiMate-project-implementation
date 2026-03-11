import { TimerPickerModal } from "react-native-timer-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect, useRef } from "react";
import { TouchableOpacity, View, Text, StyleSheet, Dimensions, Platform } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Audio } from "expo-av";
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Ionicons } from "@expo/vector-icons";

type Duration = { hours?: number; minutes?: number; seconds?: number };
const { width } = Dimensions.get("window");

const UI_COLORS = {
  background: "#0A0A0A",
  primaryGold: "#FFB300",
  surface: "#1A1A1A",
  textLight: "#FFFFFF",
  textMuted: "#A6A6A6",
  border: "#2A2A2A",
  accentRed: "#FF4444",
};

export default function Timer({
  initialSeconds = 0,
  onClose,
}: {
  initialSeconds?: number;
  onClose?: () => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const alarms = [
    { name: "🛎️   Classic", file: require('../../../assets/sounds/classic.mp3') },
    { name: "🔊   Beep", file: require('../../../assets/sounds/beep.mp3') },
    { name: "⏰   Chime", file: require('../../../assets/sounds/chime.mp3') },
    { name: "📳   Buzz", file: require('../../../assets/sounds/buzz.mp3') },
    { name: "🎵   Melody", file: require('../../../assets/sounds/melody.mp3') },
    { name: "🎹   Tune", file: require('../../../assets/sounds/tune.mp3') },
  ];

  // Dropdown state
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(
    alarms.map((alarm, index) => ({
      label: alarm.name,
      value: index.toString(),
    }))
  );
  const [selectedAlarmValue, setSelectedAlarmValue] = useState<string | null>("0");
  const selectedAlarm =
    selectedAlarmValue !== null
      ? alarms[parseInt(selectedAlarmValue)]
      : null;

  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const formatDisplay = (totalSecs: number): string => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setRunning(false);
            playAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const playAlarm = async () => {
    if (!selectedAlarm) return;

    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      selectedAlarm.file
    );
    setSound(newSound);
    await newSound.playAsync();
  };

  const stopAlarm = async () => {
    if (sound) await sound.stopAsync();
  };

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsLeft(initialSeconds);
    setTotalSeconds(initialSeconds);
    stopAlarm();
  };

  return (
    <View style={styles.timerContainer}>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
          <Ionicons name="chevron-back" size={28} color={UI_COLORS.primaryGold} />
        </TouchableOpacity>
      )}

      <View style={styles.progressWrapper}>
        <AnimatedCircularProgress
          size={width * 0.7}
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
              onPress={() => secondsLeft > 0 && setRunning(!running)}
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
        <Text style={styles.label}>ALARM TONE</Text>
        <DropDownPicker
        open={open}
        value={selectedAlarmValue}
        items={items}
        setOpen={setOpen}
        setValue={(callback) => {
          const value = typeof callback === "function" ? callback(selectedAlarmValue) : callback;
          setSelectedAlarmValue(value);
        }}
        setItems={setItems}
        placeholder="Select Tone"
        placeholderStyle={{ color: UI_COLORS.textMuted }}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownList}
        textStyle={styles.dropdownText}
        listMode="SCROLLVIEW"
        maxHeight={300}
        disabled={running}
        
        // 1. Custom Arrow Icons
        ArrowUpIconComponent={() => (
          <Ionicons name="chevron-up" size={20} color={UI_COLORS.primaryGold} />
        )}
        ArrowDownIconComponent={() => (
          <Ionicons name="chevron-down" size={20} color={UI_COLORS.primaryGold} />
        )}
        
        // 2. Custom Tick Icon (shown when an item is selected)
        TickIconComponent={() => (
          <Ionicons name="checkmark" size={20} color={UI_COLORS.primaryGold} />
        )}
      />
      </View>

      <TimerPickerModal
        LinearGradient={LinearGradient}
        visible={showPicker}
        setIsVisible={setShowPicker}
        onConfirm={(picked: Duration) => {
          const total = (picked.hours || 0) * 3600 + (picked.minutes || 0) * 60 + (picked.seconds || 0);
          setSecondsLeft(total);
          setTotalSeconds(total);
          setShowPicker(false);
        }}
        styles={{
          theme: "dark",
          backgroundColor: UI_COLORS.surface,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  timerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: UI_COLORS.background,
    padding: 24,
  },
  closeIcon: {
    position: "absolute",
    top: Platform.OS === 'ios' ? 60 : 30,
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
      ios: { shadowColor: UI_COLORS.primaryGold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 8 }
    })
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
  statusText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  controlsRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 40,
  },
  mainButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: UI_COLORS.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: UI_COLORS.border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: UI_COLORS.primaryGold,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: UI_COLORS.accentRed,
  },
  dropdownContainerWrapper: {
    marginTop: 30,
    width: "100%",
    zIndex: 1000,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    color: UI_COLORS.textMuted,
    marginBottom: 10,
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
  dropdownText: {
    fontSize: 15,
    color: UI_COLORS.textLight,
    fontWeight: "500",
  },
});