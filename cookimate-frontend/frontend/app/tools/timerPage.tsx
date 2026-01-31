import { View, Text, StyleSheet } from 'react-native';
import { useState, useRef } from 'react';

export default function TimerPage() {
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [timeText, setTimeText] = useState("00:00:00");

  const stopRef = useRef(null);

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
  }

  return(
    <View style = {styles.container}>
      <Text style={styles.title}>Timer</Text>
    </View>
  );
}
  
const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    justifyContent: "center",
  },

  title: {
    fontSize: 20,
    textAlign: "center",
  }
  
});

