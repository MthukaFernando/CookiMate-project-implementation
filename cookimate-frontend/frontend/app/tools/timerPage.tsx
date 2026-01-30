import { View, Text } from 'react-native';
import { useState } from 'react';

export default function TimerPage() {
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [timeText, setTimeText] = useState("00:00:00");

  return(
    <View>
      <Text></Text>
    </View>
  );

}