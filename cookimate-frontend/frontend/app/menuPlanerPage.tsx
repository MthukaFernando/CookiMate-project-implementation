import { View, StyleSheet } from 'react-native';
import React from 'react';
import { Calendar } from 'react-native-calendars';

import { globalStyle } from './globalStyleSheet.style';

const Page = () => {
  return (
    <View style={globalStyle.container}>
      <Calendar
        theme={calendarStyles}
        onDayPress={(day) => {
          alert("let's plan a meal suckerzzzzz"); 
        }}
      />
    </View>
  );
};

export const calendarStyles: any = {
    calendarBackground: '#f2ece2',
    dayTextColor: 'black',
    textDayFontWeight: 'bold',
    textMonthFontWeight: 'bold',
    monthTextColor: 'black',
    textSectionTitleColor: 'black',
    todayBackgroundColor: '#c6a484',
    todayTextColor: 'white',
    arrowColor: '#8a6666',
}

export default Page;