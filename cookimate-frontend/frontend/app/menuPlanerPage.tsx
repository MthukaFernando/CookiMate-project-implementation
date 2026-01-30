import { View, StyleSheet } from 'react-native';
import React from 'react';
import { Calendar } from 'react-native-calendars';

const Page = () => {
  return (
    <View style={styles.container}>
      <Calendar
        // Props go inside the opening tag
        onDayPress={(day) => {
          alert(day.dateString); // Matches the 'day' argument
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, // Added padding so it doesn't hit the status bar
    backgroundColor: '#fff',
  },
});

export default Page;