import { View, Text, StyleSheet, TouchableOpacity, TextInput, Touchable } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';

export default function TimerPage() {
  const [running, setRunning] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [timeText, setTimeText] = useState<string>("00:00:00");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const alarms = [
    {name: "🛎️  Classic", file: require('../../assets/sounds/classic.mp3')},
    {name: "🔊  Beep", file: require('../../assets/sounds/beep.mp3')},
    {name: "⏰  Chime", file: require('../../assets/sounds/chime.mp3')},
    {name: "📳  Buzz", file: require('../../assets/sounds/buzz.mp3')},
    {name: "🎵  Melody", file: require('../../assets/sounds/melody.mp3')},
    {name: "🎹  Tune", file: require('../../assets/sounds/tune.mp3')},
  ];

  const [selectedAlarm, setSelectedAlarm] = useState<{name: string, file: any} | null>(null);

  const [showDropdown, setShowDropdown] = useState(false);

  const alarmPlayer = useAudioPlayer(selectedAlarm ? selectedAlarm.file : null);


  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const parseTimeText = () => {
    const parts = timeText.split(":");
    if (parts.length !== 3) return 0;

    const h = parseInt(parts[0]) || 0;
    const m = parseInt(parts[1]) || 0;
    const s = parseInt(parts[2]) || 0;

    return h * 3600 + m * 60 + s;
  };

  const startTimer = (): void => {
    if (running) return;

    const totalSeconds = parseTimeText();
    if (totalSeconds <= 0) return;

    setSecondsLeft(totalSeconds);
    setRunning(true);
    setEditMode(false);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev: number) => {
        if (prev <= 1) {
          if (intervalRef.current != null) {
            clearInterval(intervalRef.current);
          }

          setRunning(false);
          setTimeText("00:00:00");

          playAlarm();

          return 0;
        }

        const newVal = prev - 1;
        return newVal;
      });
    }, 1000);
  };

  useEffect(() => {
    if (running) {
      setTimeText(formatTime(secondsLeft));
    }
  }, [secondsLeft, running]);

  const stopTimer = (): void => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopAlarm();
    setRunning(false);
  };

  const resetTimer = (): void => {
    stopTimer();
    setSecondsLeft(0);
    setTimeText("00:00:00");
  };

  const playAlarm = () => {
    alarmPlayer.seekTo(0);
    alarmPlayer.play();
  };

  const stopAlarm = () => {
    alarmPlayer.pause();
  };

  return(
    <View style = {styles.container}>
      <View style={styles.timerLabelContainer}>
        <Text style={styles.timerLabel}>hr</Text>
        <Text style={styles.timerLabel}>min</Text>
        <Text style={styles.timerLabel}>sec</Text>
      </View>
      

      {editMode ? (
        <TextInput 
          style={styles.timerInput}
          value={timeText}
          onChangeText={setTimeText}
          placeholder='HH:MM:SS'
          autoFocus
          onBlur={() => setEditMode(false)}
        />  
      ) : (
        <Text style={styles.timerInput} onPress={() => !running && setEditMode(true)}>{timeText}</Text>
      )}

      <View style={{ alignItems: "center"}}>
        <Text 
          onPress={() => setShowDropdown(prev => !prev)}
          style={styles.alarmSoundText}
        >
          {selectedAlarm ? selectedAlarm.name : "🔔 Alarm sounds"}
        </Text>

        {showDropdown && (
          <View>
            {alarms
              .filter(alarm => alarm !== selectedAlarm)
              .map(alarm => (
                <TouchableOpacity 
                  key={alarm.name}
                  onPress={() => {
                    setSelectedAlarm(alarm);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.alarmNames}>{alarm.name}</Text>
                </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity onPress={startTimer}>
          <Text style={styles.btn}>Start</Text>
        </TouchableOpacity>
          
        <TouchableOpacity onPress={stopTimer}>
          <Text style={styles.btn}>Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={resetTimer}>
          <Text style={styles.btn}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignSelf: "center",
    padding: 30,
  },

  timerLabelContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30
  },

  timerLabel: {
    fontSize: 18,
    paddingLeft: 8,
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 40
  },

  btn: {
    borderWidth: 1,
    padding: 12,
    marginLeft: 10,
    borderRadius: 5,
    fontWeight: "bold",
    textTransform: "uppercase"
  },

  timerInput: {
    textAlign: "center",
    fontSize: 50
  },

  alarmSoundText: {
    borderWidth: 2,
    marginTop: 20,
    textAlign: "center",
    fontSize: 15,
    width: 150,
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 7,
    paddingBottom: 7,
    borderRadius: 20
  },

  alarmNames: {
    padding: 5,
    borderWidth: 1,
    marginTop: 8
  }
  
});

