import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Dropdown } from "react-native-element-dropdown";
import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width * 0.28;

const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const API_URL = `http://${address}:5000`;

const cuisineOptions = [
  { label: "All Cuisines", value: "All" },
  { label: "American 🍔", value: "American" },
  { label: "Italian 🍝", value: "Italian" },
  { label: "Mexican 🌮", value: "Mexican" },
  { label: "Indian 🍛", value: "Indian" },
  { label: "Japanese 🍣", value: "Japanese" },
  { label: "Chinese 🥡", value: "Chinese" },
  { label: "French 🥖", value: "French" },
  { label: "Mediterranean 🫒", value: "Mediterranean" },
  { label: "Caribbean 🌴", value: "Caribbean" },
  { label: "Sri Lankan 🥥", value: "Sri Lankan" },
  { label: "Moroccan 🐪", value: "Moroccan" },
  { label: "Korean 🇰🇷", value: "Korean" },
  { label: "British 🇬🇧", value: "British" },
  { label: "Swiss 🧀", value: "Swiss" },
  { label: "Algerian", value: "Algerian" },
  { label: "Texan 🤠", value: "Texan" },
  { label: "Cajun/Creole ⚜️", value: "Louisiana" },
];

const mealOptions = [
  { label: "All Meals", value: "All" },
  { label: "Breakfast", value: "breakfast" },
  { label: "Lunch", value: "lunch" },
  { label: "Dinner", value: "dinner" },
  { label: "Snacks 🍿", value: "snack" },
  { label: "Appetizer 🥗", value: "appetizer" },
  { label: "Dessert 🍰", value: "dessert" },
  { label: "Drinks 🍹", value: "drink" },
];

const timeOptions = [
  { label: "Any Time", value: "All" },
  { label: "Under 15 min", value: "15" },
  { label: "15-30 min", value: "30" },
  { label: "30-60 min", value: "60" },
];

const dietOptions = [
  { label: "All Diets", value: "All" },
  { label: "Vegetarian 🌱", value: "vegetarian" },
  { label: "Vegan 🌿", value: "vegan" },
  { label: "Gluten-Free 🌾", value: "gluten-free" },
  { label: "Low-Carb 🥩", value: "low-carb" },
  { label: "Low-Calorie 🔥", value: "low-calorie" },
  { label: "Low-Fat 💪", value: "low-fat" },
  { label: "Low-Sodium 🧂", value: "low-sodium" },
  { label: "Diabetic-Friendly 💉", value: "diabetic" },
  { label: "Healthy 🥗", value: "healthy" },
];

const MyRecipesPage = () => {
  const router = useRouter();
  const { selectedCategory, selectedDate } = useLocalSearchParams();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [meal, setMeal] = useState((selectedCategory as string) || "All");
  const [cuisine, setCuisine] = useState("All");
  const [diet, setDiet] = useState("All");
  const [time, setTime] = useState("All");
  const [favorites, setFavorites] = useState<string[]>([]);

useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  useEffect(() => {
    if (selectedCategory) {
      setMeal(selectedCategory as string);
    } else {
      setMeal("All");
    }
  }, [selectedCategory]);

  useEffect(() => {
    return () => {
      router.setParams({
        selectedCategory: undefined,
        selectedDate: undefined,
      });
    };
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavs = await AsyncStorage.getItem("userFavorites");
      if (storedFavs) setFavorites(JSON.parse(storedFavs));
    } catch (error) {
      console.log("Error loading favorites", error);
    }
  };

  const toggleFavorite = async (id: string) => {
    let newFavorites;
    if (favorites.includes(id)) {
      newFavorites = favorites.filter((favId) => favId !== id);
    } else {
      newFavorites = [...favorites, id];
    }
    setFavorites(newFavorites);
    await AsyncStorage.setItem("userFavorites", JSON.stringify(newFavorites));
  };

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/recipes`, {
        params: {
          searchQuery: searchQuery,
          meal: meal !== "All" ? meal : undefined,
          diet: diet !== "All" ? diet : undefined,
          cuisine: cuisine !== "All" ? cuisine : undefined,
        },
      });
      setRecipes(response.data);
    } catch (error) {
      console.error("Backend error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [searchQuery, meal, diet, cuisine, time]);

  const handleBackToPlanner = () => {
    const dateToPass = selectedDate;
    setSelectedRecipeId(null);
    router.setParams({ selectedCategory: undefined, selectedDate: undefined });
    router.push({
      pathname: "/menuPlanerPage",
      params: { openModalWithDate: dateToPass },
    });
  };

  const renderRecipeItem = ({ item }: { item: any }) => {
    const isFavorite = favorites.includes(item.id);
    const isSelected = selectedRecipeId === item.id;

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={styles.recipeTitle} numberOfLines={2}>
              {item.name}
            </Text>
            <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "#e74c3c" : "#5F4436"}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.recipeDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => router.push(`/recipe/${item.id}` as any)}
          >
            <Text style={styles.viewButtonText}>View Recipe</Text>
          </TouchableOpacity>
        </View>
        {selectedCategory && (
          <TouchableOpacity
            style={styles.checkContainer}
            onPress={() => setSelectedRecipeId(item.id)}
          >
            <View
              style={[
                styles.outerCircle,
                isSelected && styles.outerCircleSelected,
              ]}
            >
              {isSelected && <View style={styles.innerCircle} />}
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        {selectedCategory && (
          <TouchableOpacity
            style={styles.backCircle}
            onPress={handleBackToPlanner}
          >
            <Ionicons name="arrow-back" size={20} color="#5F4436" />
          </TouchableOpacity>
        )}

        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes"
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={20} color="#8a6666" />
        </View>
        {selectedCategory && (
          <TouchableOpacity style={styles.addButton} onPress={() => {}}>
            <Text style={styles.addLetters}>Add</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Dropdown
            style={[styles.dropdown, selectedCategory && { opacity: 0.6 }]}
            placeholderStyle={styles.dropText}
            selectedTextStyle={styles.dropText}
            data={mealOptions}
            labelField="label"
            valueField="value"
            value={meal}
            disable={!!selectedCategory}
            onChange={(item) => setMeal(item.value)}
          />
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropText}
            selectedTextStyle={styles.dropText}
            data={cuisineOptions}
            labelField="label"
            valueField="value"
            value={cuisine}
            onChange={(item) => setCuisine(item.value)}
          />
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropText}
            selectedTextStyle={styles.dropText}
            data={timeOptions}
            labelField="label"
            valueField="value"
            value={time}
            onChange={(item) => setTime(item.value)}
          />
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropText}
            selectedTextStyle={styles.dropText}
            data={dietOptions}
            labelField="label"
            valueField="value"
            value={diet}
            onChange={(item) => setDiet(item.value)}
          />
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#5F4436"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={renderRecipeItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2ece2" },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    marginBottom: 10,
    gap: 12,
  },
  backCircle: {
    width: 40,
    height: 40,
    backgroundColor: "#ebe8e4",
    elevation: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ddd1cb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addButton: {
    width: 70,
    height: 40,
    backgroundColor: "#ebe8e4",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    borderWidth: 1,
    borderColor: "#ddd1cb",
  },
  addLetters: {
    letterSpacing: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  checkContainer: {
    paddingLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  outerCircle: {
    width: 22,
    height: 22,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(95, 68, 54, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  outerCircleSelected: {
    borderColor: "#63aaf1",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  innerCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#63aaf1",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    height: 48,
    paddingHorizontal: 18,
    elevation: 2,
    flex: 1,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#5F4436" },
  filterWrapper: { height: 50, marginBottom: 10 },
  scrollContent: { paddingHorizontal: 15, alignItems: "center" },
  dropdown: {
    width: 120,
    height: 36,
    backgroundColor: "#c6a484",
    borderRadius: 18,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  dropText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 18,
    padding: 15,
    alignItems: "center",
    elevation: 3,
  },
  cardImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    marginRight: 15,
  },
  cardContent: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5F4436",
    flex: 1,
    marginRight: 8,
  },
  recipeDescription: {
    fontSize: 13,
    color: "#555",
    marginBottom: 10,
    lineHeight: 18,
  },
  viewButton: {
    backgroundColor: "#4E342E",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  viewButtonText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
});

export default MyRecipesPage;
