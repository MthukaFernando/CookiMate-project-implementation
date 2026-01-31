import { View, StyleSheet } from 'react-native';
import React from 'react';
import { Calendar } from 'react-native-calendars';

import { containerStyles, calendarStyles } from './menuPlannerPage.style';

const Page = () => {
  return (
    <View style={containerStyles.container}>
      <Calendar
        theme={calendarStyles}
        onDayPress={(day) => {
          alert("let's plan a meal suckerzzzzz"); 
        }}
      />
    </View>
  );
};

export default Page;