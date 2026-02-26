import { TimerPickerModal } from "react-native-timer-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect, useRef } from "react";
import { TouchableOpacity, View, Text, StyleSheet, Dimensions } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Audio } from "expo-av";
import { AnimatedCircularProgress } from 'react-native-circular-progress';

type Duration = {
  hours?: number;
  minutes?: number;
  seconds?: number;
};

const { width } = Dimensions.get("window");

export default function Timer() {
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const alarms = [
    { name: "🛎️   Classic", file: require('../../../assets/sounds/classic.mp3') },
    { name: "🔊   Beep", file: require('../../../assets/sounds/beep.mp3') },
    { name: "⏰   Chime", file: require('../../../assets/sounds/chime.mp3') },
    { name: "📳   Buzz", file: require('../../../assets/sounds/buzz.mp3') },
    { name: "🎵   Melody", file: require('../../../assets/sounds/melody.mp3') },
    { name: "🎹   Tune", file: require('../../../assets/sounds/tune.mp3') },
  ];

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(
    alarms.map((alarm, index) => ({ label: alarm.name, value: index.toString() }))
  );
  const [selectedAlarmValue, setSelectedAlarmValue] = useState<string | null>(null);
  const selectedAlarm = selectedAlarmValue !== null ? alarms[parseInt(selectedAlarmValue)] : null;
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const formatDisplay = (totalSeconds: number): string => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
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
    const { sound: newSound } = await Audio.Sound.createAsync(selectedAlarm.file);
    setSound(newSound);
    await newSound.playAsync();
  };

  const stopAlarm = async () => {
    if (sound) await sound.stopAsync();
  };

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsLeft(0);
    setTotalSeconds(0);
    stopAlarm();
  };

  const addTime = (seconds: number) => {
    setSecondsLeft(prev => prev + seconds);
    setTotalSeconds(prev => prev + seconds);
  };

  return (
    <View style={styles.timerContainer}>
      <View style={styles.progressWrapper}>
        <AnimatedCircularProgress
          size={width * 0.7}
          width={15}
          fill={totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0}
          tintColor={running ? "#88653d" : "#98754f"}
          backgroundColor="#E0C2A0"
          rotation={0}
          lineCap="round"
        >
          {() => (
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={() => secondsLeft > 0 && setRunning(!running)}
              style={styles.innerCircle}
            >
              <Text style={styles.timerText}>{formatDisplay(secondsLeft)}</Text>
              <Text style={styles.statusText}>
                {running ? "PAUSE" : secondsLeft > 0 ? "START" : ""}
              </Text>
            </TouchableOpacity>
          )}
        </AnimatedCircularProgress>
      </View>

      {(running || secondsLeft > 0) && (
        <View style={styles.quickAddRow}>
          <TouchableOpacity style={styles.chip} onPress={() => addTime(5)}>
            <Text style={styles.chipText}>+5 secs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => addTime(60)}>
            <Text style={styles.chipText}>+1 min</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.controlsRow}>
        {!running && (
          <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.mainButton}>
            <Text style={styles.buttonText}>{secondsLeft > 0 ? "Edit" : "Set Timer ⏱️"} </Text>
          </TouchableOpacity>
        )}

        {totalSeconds > 0 && (
          <TouchableOpacity onPress={resetTimer} style={[styles.mainButton, { borderColor: '#d9534f' }]}>
            <Text style={[styles.buttonText, { color: '#d9534f' }]}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      <TimerPickerModal
        LinearGradient={LinearGradient}
        modalTitle="Set Timer"
        visible={showPicker}
        setIsVisible={setShowPicker}
        onConfirm={(picked: Duration) => {
          const total = (picked.hours || 0) * 3600 + (picked.minutes || 0) * 60 + (picked.seconds || 0);
          setSecondsLeft(total);
          setTotalSeconds(total);
          setShowPicker(false);
        }}
        styles={{
          theme: "light",
          backgroundColor: "#F2ECE2",
          confirmButton: styles.modalButton,
          cancelButton: styles.modalButton,
        }}
      />

      <View style={{ marginTop: 20, zIndex: 1000 }}>
        <DropDownPicker
          open={open}
          value={selectedAlarmValue}
          items={items}
          setOpen={setOpen}
          setValue={setSelectedAlarmValue}
          setItems={setItems}
          placeholder="🔔 Timer Sounds"
          containerStyle={{ width: 220, alignSelf: 'center' }}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          placeholderStyle={{ textAlign: 'center' }}
          labelStyle={{ textAlign: 'center' }}
          disabled={running}
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  timerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#F2ECE2'
  },

  progressWrapper: {
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  innerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },

  timerText: {
    fontSize: 44,
    fontWeight: '300',
    color: "#202020",
    fontFamily: 'System',
  },

  statusText: {
    fontSize: 14,
    color: "#9e784d",
    fontWeight: "bold",
    marginTop: 5,
    letterSpacing: 1,
  },

  quickAddRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  chip: {
    backgroundColor: '#E0C2A0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
  },

  chipText: {
    fontWeight: '600',
    color: '#4A3721',
  },

  dropdown: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1,
  },

  dropdownContainer: {
    backgroundColor: '#F2ECE2',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#000000',
    maxHeight: 250,
  },

  controlsRow: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 15,
  },

  mainButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: '#767676',
    borderRadius: 25,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: 'uppercase'
  },

  modalButton: {
    backgroundColor: "#9e784d",
    paddingVertical: 10,
    borderRadius: 12,
    color: "#FFFFFF",
  }
});