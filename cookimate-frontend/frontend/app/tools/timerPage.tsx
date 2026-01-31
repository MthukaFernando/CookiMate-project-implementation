import { View, Text, StyleSheet, Button, TextInput } from 'react-native';
import { useState, useRef, useEffect } from 'react';

export default function TimerPage() {
  const [running, setRunning] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [timeText, setTimeText] = useState<string>("00:00:00");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
          return 0;
        }

        const newVal = prev - 1;
        setTimeText(formatTime(newVal));
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
    setRunning(false);
  };

  const resetTimer = (): void => {
    stopTimer();
    setSecondsLeft(0);
    setTimeText("00:00:00");
  };

  return(
    <View style = {styles.container}>

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

      <View style={styles.buttons}>
        <Button title="Start" onPress={startTimer}></Button>
        <Button title="Stop" onPress={stopTimer}></Button>
        <Button title="Reset" onPress={resetTimer}></Button>
      </View>
    </View>
  );
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    justifyContent: "center",
    alignSelf: "center",
    padding: 30,
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 40,
  },

  timerInput: {
    textAlign: "center",
    fontSize: 50,
  }
  
});

