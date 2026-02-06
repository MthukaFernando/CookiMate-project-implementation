import { Image, View, StyleSheet, Modal, Text, TouchableOpacity, Dimensions, FlatList } from 'react-native'; 
import React, { useState, useRef, useEffect } from 'react'; 
import { Calendar } from 'react-native-calendars';
import { Dropdown } from 'react-native-element-dropdown';
import { globalStyle } from './globalStyleSheet.style';

const { width } = Dimensions.get('window');

const mealOptions = [
  { label: 'Breakfast 🍳', value: 'breakfast' },
  { label: 'Lunch 🍛', value: 'lunch' },
  { label: 'Dinner 🥡', value: 'dinner' },
  { label: 'Snack 🥨', value: 'snack' },
];

// Circular arrayof images for the scrolling animation
const carouselImages = [
  require('../assets/images/planner_img1.png'),
  require('../assets/images/planner_img2.png'),
  require('../assets/images/planner_img3.png'),
  require('../assets/images/planner_img1.png'), 
];

const Page = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [mealType, setMealType] = useState(null);
  
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 1. Auto scroll timer
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = currentIndex + 1;

      if (nextIndex < carouselImages.length) {
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        setCurrentIndex(nextIndex);
      }
    }, 4000); //The time duration per image

    return () => clearInterval(timer);
  }, [currentIndex]);

  
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    
    const scrollValue = contentOffsetX / width;
    
    
    if (scrollValue >= carouselImages.length - 1) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      setCurrentIndex(0);
    }
  };

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
                onChange={item => setMealType(item.value)}
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

      <View style={styles.carouselWrapper}>
        <FlatList
          ref={flatListRef}
          data={carouselImages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScrollToIndexFailed={() => {}} 
          keyExtractor={(_, index) => index.toString()}
          onScroll={handleScroll}
          scrollEventThrottle={16} 
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
            if (newIndex < carouselImages.length - 1) {
              setCurrentIndex(newIndex);
            }
          }}
          renderItem={({ item }) => (
            <Image source={item} style={styles.festivalsImage} />
          )}
        />
      </View>
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
  carouselWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '54%', 
  },
  festivalsImage: {
    width: width,
    height: '100%',
    resizeMode: 'cover',
  },
});

export default Page;