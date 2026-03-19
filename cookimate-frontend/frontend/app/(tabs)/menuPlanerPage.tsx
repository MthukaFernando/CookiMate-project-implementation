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
  Alert,
  Platform,
  StatusBar
} from "react-native";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Calendar } from "react-native-calendars";
import Constants from "expo-constants";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { auth } from "../../config/firebase";

const { width, height } = Dimensions.get("window");
const CAROUSEL_WIDTH = width * 0.9;

const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const API_URL = `http://${address}:5000`;

const mealCategories = [
  { label: "Breakfast     🍳🥞", color: "#ceb604" },
  { label: "Lunch     🥗🌮", color: "#ceb604" },
  { label: "Dinner     🥡🍕", color: "#ceb604" },
  { label: "Appetizer     🫒🥟", color: "#ceb604" },
  { label: "Dessert     🍰🥮", color: "#ceb604"},
  { label: "Drink     🥤☕️", color: "#ceb604" },
  { label: "Snack     🍿🥨", color: "#ceb604" },
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
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  
  const [plannedRecipes, setPlannedRecipes] = useState<any[]>([]);
  
  const [carouselImages, setCarouselImages] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  
  const {
    openModalWithDate,
    newRecipeId,
    newRecipeName,
    newRecipeImage,
    newRecipeCategory,
  } = useLocalSearchParams();

  // Load the meal plan whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadMealPlan();
    }, [])
  );

  const loadMealPlan = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      
      const response = await axios.get(`${API_URL}/api/users/${uid}`);
      if (response.data.mealPlan) {
        // Map database recipeId to frontend id for consistency
        const formattedPlan = response.data.mealPlan.map((m: any) => ({
          ...m,
          id: m.recipeId,
        }));
        setPlannedRecipes(formattedPlan);
      }
    } catch (error) {
      console.error("Error loading meal plan from DB:", error);
    }
  };

  const markedDates = useMemo(() => {
    const marks: any = {};
    plannedRecipes.forEach((recipe) => {
      marks[recipe.date] = { marked: true };
    });
    return marks;
  }, [plannedRecipes]);

  // Handle adding a new recipe passed from MyRecipesPage
  useEffect(() => {
    const saveNewRecipe = async () => {
      const uid = auth.currentUser?.uid;
      if (newRecipeId && uid) {
        const recipeToAdd = {
          uniqueId: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          id: newRecipeId,
          name: newRecipeName,
          image: newRecipeImage,
          category: newRecipeCategory,
          date: openModalWithDate,
        };

        try {
          await axios.post(`${API_URL}/api/users/meal-plan/${uid}`, recipeToAdd);
          setPlannedRecipes((prev) => [...prev, recipeToAdd]);
          setSelectedDate(openModalWithDate as string);
          setIsAddingMeal(false);
          setIsModalVisible(true);

          // Clear params
          router.setParams({
            newRecipeId: undefined,
            newRecipeName: undefined,
            newRecipeImage: undefined,
            newRecipeCategory: undefined,
            openModalWithDate: undefined,
          });
        } catch (error) {
          console.error("Error saving meal:", error);
          Alert.alert("Error", "Could not save to your planner.");
        }
      } else if (openModalWithDate) {
        setSelectedDate(openModalWithDate as string);
        setIsAddingMeal(false);
        setIsModalVisible(true);
        router.setParams({ openModalWithDate: undefined });
      }
    };

    saveNewRecipe();
  }, [newRecipeId, openModalWithDate]);

  useEffect(() => {
    const fetchSeasonalContent = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/recipes/seasonal`);
        const data = response.data;
        if (data && data.length > 0) {
          setIsSeasonal(true);
          const remoteImages = data.map((recipe: any) => ({
            uri: recipe.image,
            id: recipe.id,
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
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [currentIndex, carouselImages.length]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const manualIndex = Math.round(contentOffsetX / CAROUSEL_WIDTH);
    if (manualIndex !== currentIndex && manualIndex < carouselImages.length) {
      setCurrentIndex(manualIndex);
    }
    if (contentOffsetX >= (carouselImages.length - 1) * CAROUSEL_WIDTH) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      setCurrentIndex(0);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setIsAddingMeal(false);
  };

  const handleDeleteRecipe = (uniqueId: string) => {
    const uid = auth.currentUser?.uid;
    Alert.alert(
      "Remove Recipe",
      "Are you sure you want to delete this recipe from your planner :3?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.put(`${API_URL}/api/users/meal-plan/remove/${uid}`, { uniqueId });
              setPlannedRecipes((prev) =>
                prev.filter((r) => r.uniqueId !== uniqueId),
              );
            } catch (error) {
              console.error("Error removing meal:", error);
              Alert.alert("Error", "Could not remove from database.");
            }
          },
        },
      ],
    );
  };

  const getCategoryColor = (catName: string) => {
    const found = mealCategories.find((c) => c.label.includes(catName));
    return found ? found.color : "#ceb604";
  };

  const renderItem = ({ item }: { item: any }) => (
    <Image
      source={item.uri ? { uri: item.uri } : item}
      style={styles.festivalsImage}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          <View style={styles.calendarContainer}>
            <Calendar
              theme={calendarStyles}
              markedDates={markedDates}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setIsAddingMeal(false);
                setIsModalVisible(true);
              }}
              dayComponent={({ date, state, marking }: any) => {
                const isToday = state === "today";
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedDate(date.dateString);
                      setIsAddingMeal(false);
                      setIsModalVisible(true);
                    }}
                    style={styles.dayComponent}
                  >
                    <View style={[styles.dayTextContainer, isToday && styles.todayCircle]}>
                      <Text style={[styles.dayText, state === "disabled" ? { color: "#4d4d4d" } : { color: isToday ? "white" : "#cecece" }]}>
                        {date.day}
                      </Text>
                    </View>
                    {marking?.marked && (
                      <View style={styles.plannedIndicator}>
                        <Text style={styles.plannedIndicatorText}>PLANNED</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
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
                renderItem={renderItem}
              />
            </View>
            {isSeasonal && (
              <TouchableOpacity
                style={styles.seasonalButton}
                onPress={() => {
                  const currentRecipe = carouselImages[currentIndex];
                  if (currentRecipe && currentRecipe.id) {
                    router.push(`/recipe/${currentRecipe.id}` as any);
                  }
                }}
              >
                <Text style={styles.seasonalButtonText}>View Recipe</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleCloseModal}>
          <TouchableOpacity activeOpacity={1} style={styles.formContainer}>
            {!isAddingMeal ? (
              <View style={styles.initialContent}>
                <TouchableOpacity style={styles.addButton} onPress={() => setIsAddingMeal(true)}>
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
                <View style={styles.dateContainer}>
                  <Text style={styles.popupBoxDate}>{selectedDate}</Text>
                </View>
                <ScrollView style={{ marginTop: 20 }} showsVerticalScrollIndicator={false}>
                  {(() => {
                    const dailyRecipes = plannedRecipes.filter((r) => r.date === selectedDate);
                    if (dailyRecipes.length === 0) {
                      return (
                        <View style={styles.emptyStateContainer}>
                          <Ionicons name="restaurant-outline" size={40} color="#ffff" style={{ opacity: 0.3 }} />
                          <Text style={styles.emptyStateText}>You have no meals planned on this date</Text>
                        </View>
                      );
                    }
                    return dailyRecipes.map((recipe) => (
                      <TouchableOpacity
                        key={recipe.uniqueId}
                        activeOpacity={0.8}
                        onPress={() => {
                          setIsModalVisible(false);
                          router.push(`/recipe/${recipe.id}` as any);
                        }}
                        style={[styles.plannedCard, { backgroundColor: getCategoryColor(recipe.category) }]}
                      >
                        <Image source={{ uri: recipe.image }} style={styles.plannedImage} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.plannedCategoryText}>{recipe.category}</Text>
                          <Text style={styles.plannedRecipeName} numberOfLines={1}>{recipe.name}</Text>
                        </View>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteRecipe(recipe.uniqueId)}>
                          <Ionicons name="trash-outline" size={22} color="#522F2F" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ));
                  })()}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.addMealContainer}>
                <Text style={styles.addMealHeader}>Select Category</Text>
                <ScrollView style={styles.categoryScrollView} showsVerticalScrollIndicator={false}>
                  {mealCategories.map((item) => (
                    <TouchableOpacity
                      key={item.label}
                      style={[styles.categoryButton, { backgroundColor: item.color }]}
                      onPress={() => {
                        setIsModalVisible(false);
                        const categoryType = item.label.split(" ")[0].trim();
                        router.push({
                          pathname: "/details/myRecipes",
                          params: { selectedCategory: categoryType, selectedDate: selectedDate },
                        });
                      }}
                    >
                      <Text style={styles.categoryButtonText}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

// Styles remain the same
export const calendarStyles: any = {
  calendarBackground: "#1A1A1A",
  dayTextColor: "white",
  textDayFontWeight: "bold",
  textMonthFontWeight: "bold",
  monthTextColor: "white",
  textSectionTitleColor: "white",
  todayBackgroundColor: "transparent",
  todayTextColor: "#c6a484",
  arrowColor: "#ffcc00",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0A0A", 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 150,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
  },
  calendarContainer: { 
    marginTop: Platform.OS === 'ios' ? 20 : 10,
    backgroundColor: "#1A1A1A", 
    borderRadius: 25,
    overflow: "hidden",
    paddingVertical: 20,
    width: CAROUSEL_WIDTH,
  },
  dayComponent: {
    alignItems: "center",
    justifyContent: "center",
    width: 45,
    height: 60,
  },
  dayTextContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  todayCircle: {
    backgroundColor: "#f5a30a",
    borderRadius: 16,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  plannedIndicator: {
    position: "absolute", 
    bottom: 0,
    backgroundColor: "#FF4D4D",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  plannedIndicatorText: {
    color: "white",
    fontSize: 6,
    fontWeight: "900",
  },
  carouselShadowContainer: {
    width: CAROUSEL_WIDTH,
    height: 260,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
    marginTop: 20,
  },
  carouselWrapper: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: "#0A0A0A",
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
    justifyContent: "flex-end",
  },
  formContainer: {
    width: "100%",
    height: height * 0.6,
    backgroundColor: "#0A0A0A",
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1.5,
    borderColor: "#ffb0053c",
    elevation: 20,
  },
  initialContent: { flex: 1, position: "relative" },
  dateContainer: { width: "100%", alignItems: "center", marginTop: 10 },
  addButton: {
    position: "absolute",
    top: 5,
    left: 5,
    backgroundColor: "#ffc403",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  addButtonText: {
    color: "#f2ece2",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 28,
  },
  popupBoxDate: { fontSize: 22, fontWeight: "bold", color: "#ffffff" },
  addMealContainer: { flex: 1, width: "100%", marginTop: 5 },
  addMealHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 15,
  },
  categoryScrollView: { flex: 1 },
  categoryButton: {
    minHeight: 70,
    marginTop: 23,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(0,0,0,0.05)",
    elevation: 3,
  },
  categoryButtonText: { fontSize: 16, fontWeight: "bold", color: "#000" },
  plannedCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 18,
    marginBottom: 12,
    marginTop: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  plannedImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  plannedCategoryText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    opacity: 0.5,
    marginBottom: 2,
  },
  plannedRecipeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c1a1a",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 130,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    marginTop: 10,
    opacity: 0.6,
    fontWeight: "500",
  },
  seasonalButton: {
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
    backgroundColor: "#D4AF37",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderColor: "#ffd176",
    borderWidth: 1,
  },
  seasonalButtonText: { color: "#f2ece2", fontSize: 14, fontWeight: "bold" },
});

export default Page;