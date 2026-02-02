import { Image, View, StyleSheet, Modal, Text, Button, TouchableOpacity } from 'react-native'; 
import React, { useState } from 'react'; 
import { Calendar } from 'react-native-calendars';
import { Dropdown } from 'react-native-element-dropdown';
import { globalStyle } from './globalStyleSheet.style';

const mealOptions = [
  { label: 'Breakfast 🍳', value: 'breakfast' },
  { label: 'Lunch 🍛', value: 'lunch' },
  { label: 'Dinner 🥡', value: 'dinner' },
  { label: 'Snack 🥨', value: 'snack' },
];

const Page = () => {

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [mealType, setMealType] = useState(null);

  return (
    <View style={globalStyle.container}>
      <Calendar
        theme={calendarStyles}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          setIsModalVisible(true);
        }}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>🍽️ Plan Meal for {selectedDate}</Text>
            <View style={{ marginVertical: 20 }}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={mealOptions}
                labelField="label"
                valueField="value"
                placeholder="Select meal type 🍔"
                value={mealType}
                onChange={item => {
                  setMealType(item.value);
                }}
              />
            </View>

            <TouchableOpacity style={styles.selectMenuButton}>
              <Text style={styles.selectedButtonText}>Select a recipe 📖</Text>
            </TouchableOpacity>
           
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.styledButton}
                onPress={() => setIsModalVisible(false)} 
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
        
              <TouchableOpacity
              style={styles.styledButton}
              onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.buttonText}>Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Image
        source={require('../assets/images/festivals.png')}
        style={styles.festivalsImage}>
      </Image>
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

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '80%',
    backgroundColor: '#f2ece2',
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    borderColor: '#522F2F',
    borderWidth: 1.5,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  dropdown: {
    height: 50,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#8a6666',
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    borderRadius: 25,
  },
  styledButton: {
    backgroundColor: '#522F2F', 
    paddingVertical: 12,
    borderRadius: 25,          
    minWidth: 100,
    alignItems: 'center',      
    justifyContent: 'center',  
  },
  buttonText: {
    color: '#f2ece2',          
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectMenuButton: {
    backgroundColor: '#c6a484', 
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: -20,
    minHeight: 50,
    marginBottom: 40,
    borderRadius: 10,
  },
  selectedButtonText: {
    color: '#f2ece2',          
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  festivalsImage: {
  width: '100%',  
  height: '50%', 
  position: 'absolute', 
  bottom: 0,  
  },
});



export default Page;