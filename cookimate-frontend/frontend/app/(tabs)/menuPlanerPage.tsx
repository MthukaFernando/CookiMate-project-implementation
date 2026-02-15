import {
  Image,
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { Calendar } from "react-native-calendars";
import { Dropdown } from "react-native-element-dropdown";
import Constants from "expo-constants";
import { globalStyle } from "../globalStyleSheet.style";

const { width } = Dimensions.get("window");
const CAROUSEL_WIDTH = width * 0.9;

const mealOptions = [
  { label: "Breakfast 🍳", value: "breakfast" },
  { label: "Lunch 🍛", value: "lunch" },
  { label: "Dinner 🥡", value: "dinner" },
  { label: "Snack 🥨", value: "snack" },
];

const defaultImages = [
  require("../../assets/images/planner_img1.png"),
  require("../../assets/images/planner_img2.png"),
  require("../../assets/images/planner_img3.png"),
];

const Page = () => {
  const [isSeasonal, setIsSeasonal] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [mealType, setMealType] = useState<string | null>(null);

  const [carouselImages, setCarouselImages] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchSeasonalContent = async () => {
      try {
        const debuggerHost = Constants.expoConfig?.hostUri;
        const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
        const baseUrl = `http://${address}:5000/api`;

        const response = await fetch(`${baseUrl}/recipes/seasonal`);
        const data = await response.json();

        if (data && data.length > 0) {
          setIsSeasonal(true);
          const remoteImages = data.map((recipe: any) => ({
            uri: recipe.image,
          }));
          setCarouselImages([...remoteImages, remoteImages[0]]);
        } else {
          setIsSeasonal(false);
          setCarouselImages([...defaultImages, defaultImages[0]]);
        }
      } catch (error) {
        setIsSeasonal(false);
        setCarouselImages([...defaultImages, defaultImages[0]]);
      }
    };
    fetchSeasonalContent();
  }, []);

  useEffect(() => {
    if (carouselImages.length === 0) return;
    const timer = setInterval(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < carouselImages.length) {
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        setCurrentIndex(nextIndex);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [currentIndex, carouselImages]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const scrollValue = contentOffsetX / CAROUSEL_WIDTH;
    if (scrollValue >= carouselImages.length - 1) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      setCurrentIndex(0);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <Image
      source={item.uri ? { uri: item.uri } : item}
      style={styles.festivalsImage}
    />
  );

  return (
    <SafeAreaView style={[globalStyle.container, { flex: 1 }]}>
      <View style={styles.mainContent}>
        <View style={styles.calendarContainer}>
          <Calendar
            theme={calendarStyles}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setIsModalVisible(true);
            }}
          />
        </View>
        <View style={styles.carouselShadowContainer}>
          <View style={styles.carouselWrapper}>
            <FlatList
              ref={flatListRef}
              data={carouselImages}
              horizontal
              pagingEnabled
              snapToInterval={CAROUSEL_WIDTH}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => index.toString()}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(
                  event.nativeEvent.contentOffset.x / CAROUSEL_WIDTH,
                );
                if (newIndex < carouselImages.length - 1)
                  setCurrentIndex(newIndex);
              }}
              renderItem={renderItem}
            />
          </View>
          {isSeasonal && (
            <TouchableOpacity
              style={styles.seasonalButton}
              onPress={() => console.log("View Recipe Pressed")}
            >
              <Text style={styles.seasonalButtonText}>
                View Recipe
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal animationType="fade" transparent={true} visible={isModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              🍽️ Plan Meal for {selectedDate}
            </Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={mealOptions}
              labelField="label"
              valueField="value"
              placeholder="Select meal type 🍔"
              value={mealType}
              onChange={(item) => setMealType(item.value)}
            />
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
    </SafeAreaView>
  );
};

export const calendarStyles: any = {
  calendarBackground: "#f2ece2",
  dayTextColor: "black",
  textDayFontWeight: "bold",
  textMonthFontWeight: "bold",
  monthTextColor: "black",
  textSectionTitleColor: "black",
  todayBackgroundColor: "#c6a484",
  todayTextColor: "white",
  arrowColor: "#8a6666",
};

export const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    justifyContent: "space-between", // Pushes calendar to top, carousel to bottom
    paddingBottom: 20,
  },
  calendarContainer: {
    marginTop: 10,
  },
  carouselShadowContainer: {
    alignSelf: "center",
    width: CAROUSEL_WIDTH,
    height: "40%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
  },
  carouselWrapper: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  festivalsImage: {
    width: CAROUSEL_WIDTH,
    height: "100%",
    resizeMode: "cover",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: "80%",
    backgroundColor: "#f2ece2",
    padding: 20,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: "#522F2F",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  dropdown: {
    height: 50,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  placeholderStyle: { fontSize: 16, color: "#8a6666" },
  selectedTextStyle: { fontSize: 16 },
  buttonContainer: { flexDirection: "row", justifyContent: "center", gap: 15 },
  styledButton: {
    backgroundColor: "#522F2F",
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
    alignItems: "center",
  },
  buttonText: { color: "#f2ece2", fontSize: 16, fontWeight: "bold" },
  selectMenuButton: {
    backgroundColor: "#c6a484",
    minHeight: 50,
    marginBottom: 40,
    borderRadius: 10,
    justifyContent: "center",
  },
  selectedButtonText: {
    color: "#f2ece2",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  seasonalButton: {
    position: 'absolute',
    bottom: 15,          
    alignSelf: 'center', 
    backgroundColor: "#522F2F", 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f2ece2',
  },
  seasonalButtonText: {
    color: '#f2ece2',
    fontSize: 14,
    fontWeight: 'bold',
  }
});

export default Page;
