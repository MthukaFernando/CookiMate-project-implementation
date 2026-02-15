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
  ScrollView,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { Calendar } from "react-native-calendars";
import Constants from "expo-constants";
import { globalStyle } from "../globalStyleSheet.style";

const { width } = Dimensions.get("window");
const CAROUSEL_WIDTH = width * 0.9;

//category array for planning menus
const mealCategories = [
  { label: "Breakfast     🍳🥞", color: "#f8e5ba" },
  { label: "Lunch     🥗🌮", color: "#c3d7ae" },
  { label: "Dinner     🥡🍕", color: "#ceb6b0" },
  { label: "Appetizer     🫒🥟", color: "#c3d8ce" },
  { label: "Dessert     🍰🥮", color: "#e5d1bb" },
  { label: "Drink     🥤☕️", color: "#d7f2fa" },
  { label: "Snack     🍿🥨", color: "#ffe3e0" },
];

//default image array when no seasons are there
const defaultImages = [
  require("../../assets/images/planner_img1.png"),
  require("../../assets/images/planner_img2.png"),
  require("../../assets/images/planner_img3.png"),
];

const Page = () => {
  const [isSeasonal, setIsSeasonal] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [isAddingMeal, setIsAddingMeal] = useState(false);

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
              <Text style={styles.seasonalButtonText}>View Recipe</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal animationType="fade" transparent={true} visible={isModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.formContainer}>
            {!isAddingMeal ? (
              <>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setIsAddingMeal(true)}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
                <Text style={styles.popupBoxDate}>{selectedDate}</Text>
              </>
            ) : (
              <View style={styles.addMealContainer}>
                <Text style={styles.addMealHeader}>Select Category</Text>
                <ScrollView
                  style={styles.categoryScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {mealCategories.map((item) => (
                    <TouchableOpacity
                      key={item.label}
                      style={[
                        styles.categoryButton,
                        { backgroundColor: item.color },
                      ]}
                      onPress={() => console.log(`${item.label} selected`)}
                    >
                      <Text style={styles.categoryButtonText}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.styledButton}
                onPress={() => {
                  setIsModalVisible(false);
                  setIsAddingMeal(false);
                }}
              >
                <Text style={styles.buttonText}>Close</Text>
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
    justifyContent: "space-between",
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
    width: "90%",
    minHeight: 400,
    backgroundColor: "#f2ece2",
    padding: 20,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: "#522F2F",
    justifyContent: "flex-end",
  },
  addButton: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "#522F2F",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  addButtonText: {
    color: "#f2ece2",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 28,
  },
  popupBoxDate: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
  },
  addMealContainer: {
    flex: 1,
    width: "100%",
    marginTop: 10,
    marginBottom: 20,
  },
  addMealHeader: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#522F2F",
  },
  categoryScrollView: {
    flex: 1,
  },
  categoryButton: {
    marginTop: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "flex-start",
    borderWidth: 3,
    borderColor: "rgba(0,0,0,0.1)",
    elevation: 5,
    minHeight: 20,
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    textTransform: "capitalize",
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  styledButton: {
    backgroundColor: "#522F2F",
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
    alignItems: "center",
  },
  buttonText: { color: "#f2ece2", fontSize: 16, fontWeight: "bold" },
  seasonalButton: {
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
    backgroundColor: "#522F2F",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f2ece2",
  },
  seasonalButtonText: {
    color: "#f2ece2",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default Page;
