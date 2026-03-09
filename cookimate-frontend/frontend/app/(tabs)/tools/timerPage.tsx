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
          <Ionicons name="close-circle" size={36} color="#5F4436" />
        </TouchableOpacity>
      )}

      <View style={styles.progressWrapper}>
        <AnimatedCircularProgress
          size={width * 0.65}
          width={12}
          fill={
            totalSeconds > 0
              ? (secondsLeft / totalSeconds) * 100
              : 0
          }
          tintColor="#88653d"
          backgroundColor="#E0C2A0"
          rotation={0}
          lineCap="round"
        >
          {() => (
            <TouchableOpacity
              onPress={() => secondsLeft > 0 && setRunning(!running)}
              style={styles.innerCircle}
            >
              <Text style={styles.timerText}>
                {formatDisplay(secondsLeft)}
              </Text>
              <Text style={styles.statusText}>
                {running ? "PAUSE" : "START"}
              </Text>
            </TouchableOpacity>
          )}
        </AnimatedCircularProgress>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={styles.mainButton}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={resetTimer}
          style={[styles.mainButton, { borderColor: "#d9534f" }]}
        >
          <Text style={[styles.buttonText, { color: "#d9534f" }]}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>

      {/* SOUND DROPDOWN */}
      <View
        style={{
          marginTop: 25,
          width: 240,
          zIndex: 1000,
          ...(Platform.OS === "android" && { elevation: 1000 }),
        }}
      >
        <DropDownPicker
          open={open}
          value={selectedAlarmValue}
          items={items}
          setOpen={setOpen}
          setValue={(callback) => {
            const value =
              typeof callback === "function"
                ? callback(selectedAlarmValue)
                : callback;
            setSelectedAlarmValue(value);
          }}
          setItems={setItems}
          placeholder="🔔 Timer Sounds"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          listMode="SCROLLVIEW"
          maxHeight={300}  
          disabled={running}
        />
      </View>

      <TimerPickerModal
        LinearGradient={LinearGradient}
        visible={showPicker}
        setIsVisible={setShowPicker}
        onConfirm={(picked: Duration) => {
          const total =
            (picked.hours || 0) * 3600 +
            (picked.minutes || 0) * 60 +
            (picked.seconds || 0);

          setSecondsLeft(total);
          setTotalSeconds(total);
          setShowPicker(false);
        }}
        styles={{
          theme: "light",
          backgroundColor: "#F2ECE2",
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
    backgroundColor: "#F2ECE2",
    padding: 20,
  },
  closeIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
  },
  progressWrapper: { marginBottom: 20 },
  innerCircle: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  timerText: {
    fontSize: 40,
    fontWeight: "300",
    color: "#202020",
  },
  statusText: {
    fontSize: 14,
    color: "#9e784d",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  controlsRow: {
    flexDirection: "row",
    gap: 15,
  },
  mainButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: "#767676",
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  dropdown: {
    backgroundColor: "transparent",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#767676",
  },
  dropdownContainer: {
    backgroundColor: "#F2ECE2",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#767676",
  },
});